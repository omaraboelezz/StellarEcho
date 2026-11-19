// src/components/CelestialBody.tsx
import { useRef, useState, useMemo, useEffect, useCallback, memo } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';
import type { PlanetData } from '../data/planets';
import { bodyVisuals, visualSpinRate, type BodyVisual } from '../data/planetVisuals';
import { getLandmark, getLandmarksForBody } from '../data/landmarks';
import { sim } from '../lib/cinematic';
import { configureTexture, useHighResTexture } from '../lib/textures';
import { createPlanetMaterial } from '../lib/planetMaterial';
import LandmarkMarker from '../components/LandmarkMarker';
import EquipmentSite, { preloadModelsForBody } from './EquipmentSite';
import Atmosphere from './space/Atmosphere';
import PlanetRings from './space/PlanetRings';
import { useSunMaterial, SunCorona } from './space/SunSurface';
import Label3D from './space/Label3D';
import type { HologramDisplayMode } from '../lib/hologramShader';
import { getCachedArBodyName } from '../i18n/LanguageContext';
import { getDeviceQualityProfile } from '../lib/deviceQuality';
import type { Language } from '../i18n/types';

interface CelestialBodyProps {
  data: PlanetData;
  lang?: Language;
  arReady?: boolean;
  onClick: (id: string, position: THREE.Vector3) => void;
  /** which body the camera is focused on (markers only show on this one) */
  selectedBodyId?: string | null;
  /** the landmark currently inspected via marker click (shows hologram + info panel) */
  inspectedLandmarkId?: string | null;
  /** the landmark whose cinematic is playing right now (if any) */
  activeLandmarkId?: string | null;
  hologramDisplayMode?: HologramDisplayMode;
  rescanKey?: number;
  onLandmarkClick?: (landmarkId: string) => void;
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------------------------
// Analytic sphere picking: exact and O(1), so high-poly LOD geometry never slows down hovering.
// ---------------------------------------------------------------------------------------------
const _sphere = new THREE.Sphere();
const _hit = new THREE.Vector3();
const _clickWorldPos = new THREE.Vector3();
function makeSphereRaycast(radius: number) {
  return function (this: THREE.Mesh, raycaster: THREE.Raycaster, intersects: THREE.Intersection[]) {
    this.getWorldPosition(_sphere.center);
    _sphere.radius = radius;
    if (!raycaster.ray.intersectSphere(_sphere, _hit)) return;
    const distance = raycaster.ray.origin.distanceTo(_hit);
    if (distance < raycaster.near || distance > raycaster.far) return;
    intersects.push({ distance, point: _hit.clone(), object: this } as THREE.Intersection);
  };
}

// ---------------------------------------------------------------------------------------------
// Texture set per body: 2K maps are loaded up-front (Suspense), 8K maps are streamed on focus.
// ---------------------------------------------------------------------------------------------
type MapKey = 'map' | 'nightMap' | 'normalMap' | 'specularMap' | 'clouds';
const MAP_KEYS: MapKey[] = ['map', 'nightMap', 'normalMap', 'specularMap', 'clouds'];
const COLOR_KEYS: Record<MapKey, boolean> = {
  map: true,
  nightMap: true,
  normalMap: false,
  specularMap: false,
  clouds: true,
};

function useBodyTextures(visual: BodyVisual, highRes: boolean) {
  const gl = useThree((s) => s.gl);
  const keys = useMemo(() => MAP_KEYS.filter((k) => !!visual[k]), [visual]);
  const urls = useMemo(() => keys.map((k) => visual[k]!.low), [keys, visual]);
  const loaded = useLoader(THREE.TextureLoader, urls);

  const low = useMemo(() => {
    const out = {} as Partial<Record<MapKey, THREE.Texture>>;
    keys.forEach((k, i) => {
      const isColor = k === 'clouds' ? !!visual.clouds?.opaque : COLOR_KEYS[k];
      out[k] = configureTexture(loaded[i], gl, isColor);
    });
    return out;
  }, [keys, loaded, gl, visual]);

  const highMap = useHighResTexture(visual.map.high, highRes, true);
  const highNight = useHighResTexture(visual.nightMap?.high, highRes, true);
  const highClouds = useHighResTexture(visual.clouds?.high, highRes, !!visual.clouds?.opaque);

  return {
    map: highMap ?? low.map!,
    lowMap: low.map!,
    nightMap: highNight ?? low.nightMap,
    normalMap: low.normalMap,
    specularMap: low.specularMap,
    clouds: highClouds ?? low.clouds,
  };
}

// ---------------------------------------------------------------------------------------------

const CelestialBody = memo(function CelestialBody({
  data,
  lang = 'en',
  arReady = false,
  onClick,
  selectedBodyId = null,
  inspectedLandmarkId = null,
  activeLandmarkId = null,
  hologramDisplayMode = 'hologram',
  rescanKey = 0,
  onLandmarkClick,
  children,
}: CelestialBodyProps) {
  const quality = useMemo(() => getDeviceQualityProfile(), []);
  const visual = bodyVisuals[data.id];
  const isStar = data.type === 'star';

  const groupRef = useRef<THREE.Group>(null!);
  const tiltRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);
  const cloudRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const isSelected = selectedBodyId === data.id;
  const bodyLandmarks = useMemo(() => getLandmarksForBody(data.id), [data.id]);
  const isInspectingHere = useMemo(
    () =>
      isSelected &&
      !!inspectedLandmarkId &&
      bodyLandmarks.some((l) => l.id === inspectedLandmarkId),
    [isSelected, inspectedLandmarkId, bodyLandmarks]
  );
  const activeLandmark = activeLandmarkId ? getLandmark(activeLandmarkId) : undefined;
  const cinematicHere = !!activeLandmark && activeLandmark.bodyId === data.id;
  const showMarkers = isSelected && !activeLandmarkId && bodyLandmarks.length > 0;

  // stream the 8K maps only for the body the camera is focused on
  const highRes = isSelected || cinematicHere;
  const tex = useBodyTextures(visual, highRes);

  // ---- materials ------------------------------------------------------------------------
  const planet = useMemo(() => {
    if (isStar) return null;
    const { material, uniforms } = createPlanetMaterial(visual, data.size);
    material.map = tex.map;
    if (tex.nightMap) material.emissiveMap = tex.nightMap;
    if (tex.normalMap) material.normalMap = tex.normalMap;
    if (tex.specularMap) material.roughnessMap = tex.specularMap;
    if (visual.selfBump) {
      material.bumpMap = tex.lowMap;
      material.bumpScale = visual.selfBump;
    }
    return { material, uniforms };
    // built once; texture upgrades are applied below without recompiling
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visual, data.size, isStar]);

  if (planet) {
    planet.material.map = tex.map;
    if (tex.nightMap) planet.material.emissiveMap = tex.nightMap;
  }

  const sunMaterial = useSunMaterial(tex.map, data.size);

  const cloudMaterial = useMemo(() => {
    if (!visual.clouds || !tex.clouds) return null;
    return visual.clouds.opaque
      ? new THREE.MeshStandardMaterial({ map: tex.clouds, roughness: 1, metalness: 0, transparent: true })
      : new THREE.MeshStandardMaterial({
          color: '#ffffff',
          alphaMap: tex.clouds,
          transparent: true,
          depthWrite: false,
          roughness: 1,
          metalness: 0,
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visual]);
  if (cloudMaterial && tex.clouds) {
    if (visual.clouds?.opaque) cloudMaterial.map = tex.clouds;
    else cloudMaterial.alphaMap = tex.clouds;
  }

  useEffect(
    () => () => {
      planet?.material.dispose();
      cloudMaterial?.dispose();
    },
    [planet, cloudMaterial]
  );

  const onRingTexture = useCallback(
    (t: THREE.Texture) => {
      if (planet) planet.uniforms.uRingMap.value = t;
    },
    [planet]
  );

  // ---- picking --------------------------------------------------------------------------
  const sphereRaycast = useMemo(() => makeSphereRaycast(data.size), [data.size]);

  const handleLandmarkSelect = useCallback(
    (id: string) => {
      onLandmarkClick?.(id);
    },
    [onLandmarkClick]
  );

  // Lazily pre-warm only this planet's 3D equipment models when selected (or hovered on desktop)
  useEffect(() => {
    const shouldPreload = isSelected || (hovered && quality.allowHoverPreload);
    if (shouldPreload && bodyLandmarks.length > 0) {
      preloadModelsForBody(data.id);
    }
  }, [isSelected, hovered, quality.allowHoverPreload, bodyLandmarks.length, data.id]);

  // ---- geometry: adaptive tessellation based on device quality tier ----
  const segments: [number, number] = isStar ? quality.sunSegments : quality.planetSegments;
  const cloudSegments: [number, number] = quality.cloudSegments;

  // ---- orbit line (drawn around the parent, not around this body) -----------------------
  const orbitLine = useMemo(() => {
    if (data.orbitRadius <= 0) return null;
    const pts: THREE.Vector3[] = [];
    const N = data.type === 'moon' ? quality.orbitPoints.moon : quality.orbitPoints.planet;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * data.orbitRadius, 0, Math.sin(a) * data.orbitRadius));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color: data.type === 'moon' ? '#cbd5e1' : '#8fb3ff',
      transparent: true,
      opacity: data.type === 'moon' ? 0.25 : 0.16,
      depthWrite: false,
    });
    const line = new THREE.LineLoop(geo, mat);
    line.raycast = () => null;
    return line;
  }, [data.orbitRadius, data.type, quality.orbitPoints.moon, quality.orbitPoints.planet]);
  useEffect(
    () => () => {
      if (!orbitLine) return;
      orbitLine.geometry.dispose();
      (orbitLine.material as THREE.Material).dispose();
    },
    [orbitLine]
  );

  // ---- motion ---------------------------------------------------------------------------
  // Random starting angle for the orbit so they aren't all aligned
  const randomStartAngle = useMemo(() => Math.random() * Math.PI * 2, []);
  // Our own orbit clock. It advances by delta * sim.timeScale, so when a cinematic
  // eases timeScale to 0 the whole system (orbits + spin) freezes and the site holds still.
  const orbitTime = useRef(0);
  const spin = useMemo(() => visualSpinRate(visual), [visual]);
  const tilt = THREE.MathUtils.degToRad(visual.axialTiltDeg);
  const cloudFade = useRef(1);
  const tmpQ = useMemo(() => new THREE.Quaternion(), []);

  useFrame((_state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    orbitTime.current += delta * sim.timeScale;
    const t = orbitTime.current;

    // Orbital motion (around the parent/sun)
    let angle = randomStartAngle;
    if (groupRef.current && data.orbitSpeedScale > 0) {
      angle = randomStartAngle + t * data.orbitSpeedScale * 0.1;
      groupRef.current.position.x = Math.cos(angle) * data.orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * data.orbitRadius;
    } else if (groupRef.current && data.orbitRadius > 0) {
      groupRef.current.position.x = Math.cos(randomStartAngle) * data.orbitRadius;
      groupRef.current.position.z = Math.sin(randomStartAngle) * data.orbitRadius;
    }

    // Self rotation. Slower on the selected body so markers and 3D equipment models are easy to inspect.
    const spinFactor = isInspectingHere ? 0 : isSelected ? 0.18 : 1;
    if (meshRef.current) {
      if (visual.tidallyLocked) {
        // synchronous rotation: the near side (lon 0) always faces the parent
        meshRef.current.rotation.y = Math.PI - angle;
      } else {
        meshRef.current.rotation.y += delta * spin * spinFactor * sim.timeScale;
      }
    }
    if (cloudRef.current && visual.clouds) {
      cloudRef.current.rotation.y += delta * spin * visual.clouds.speed * spinFactor * sim.timeScale;
    }

    // Cloud deck fade: part clouds during close-up hologram inspection or surface cinematic so the
    // 3D hologram & terrain are never occluded by the atmospheric cloud shell.
    if (cloudMaterial && visual.clouds) {
      const targetCloudOpacity =
        cinematicHere || isInspectingHere ? 0 : visual.clouds.opaque ? (isSelected ? 0.22 : 1) : 1;
      cloudFade.current = THREE.MathUtils.damp(cloudFade.current, targetCloudOpacity, 3.5, delta);
      cloudMaterial.opacity = cloudFade.current;
      cloudMaterial.depthWrite = visual.clouds.opaque ? cloudFade.current > 0.99 : false;
      if (cloudRef.current) cloudRef.current.visible = cloudFade.current > 0.01;
    }

    // ring shadow on the planet needs the ring plane in world space
    if (planet && visual.ring?.map && meshRef.current && tiltRef.current) {
      meshRef.current.getWorldPosition(planet.uniforms.uPlanetCenter.value);
      tiltRef.current.getWorldQuaternion(tmpQ);
      planet.uniforms.uRingNormal.value.set(0, 1, 0).applyQuaternion(tmpQ);
    }

    if (orbitLine) {
      const m = orbitLine.material as THREE.LineBasicMaterial;
      m.opacity = THREE.MathUtils.damp(m.opacity, isSelected ? 0.4 : hovered ? 0.3 : 0.14, 6, delta);
    }
  }, -2);

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (activeLandmarkId) return; // ignore clicks while a cinematic is playing

    meshRef.current.getWorldPosition(_clickWorldPos);
    onClick(data.id, _clickWorldPos);
  };

  useEffect(() => () => void (document.body.style.cursor = 'auto'), []);

  const showLabel =
    !activeLandmarkId &&
    !isSelected &&
    (data.type !== 'moon' || selectedBodyId === 'earth' || hovered);

  return (
    <>
      {/* Orbit path (centred on the parent) */}
      {orbitLine && !activeLandmarkId && <primitive object={orbitLine} />}

      <group ref={groupRef}>
        <group ref={tiltRef} rotation={[0, 0, tilt]}>
          {/* The visible body */}
          <mesh
            ref={meshRef}
            name={data.id}
            raycast={sphereRaycast}
            material={isStar ? sunMaterial : planet!.material}
            onClick={handleClick}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(true);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHovered(false);
              document.body.style.cursor = 'auto';
            }}
          >
            <sphereGeometry args={[data.size, segments[0], segments[1]]} />

            {/*
              Landmarks & 3D equipment models live INSIDE the mesh on purpose: the mesh spins,
              so anything parented here rotates with the surface and stays glued to its latitude/longitude.
            */}
            {showMarkers &&
              bodyLandmarks.map((l) => (
                <group key={l.id}>
                  <EquipmentSite
                    landmark={l}
                    radius={data.size}
                    isCinematic={false}
                    isInspected={inspectedLandmarkId === l.id}
                    displayMode={hologramDisplayMode}
                    rescanKey={rescanKey}
                    onSelect={handleLandmarkSelect}
                  />
                  <LandmarkMarker
                    landmark={l}
                    lang={lang}
                    arReady={arReady}
                    radius={data.size}
                    isInspected={inspectedLandmarkId === l.id}
                    onSelect={handleLandmarkSelect}
                  />
                </group>
              ))}

            {cinematicHere && activeLandmark && (
              <EquipmentSite landmark={activeLandmark} radius={data.size} isCinematic />
            )}
          </mesh>

          {/* Cloud layer (Earth: translucent; Venus: the opaque sulfuric-acid cloud deck) */}
          {cloudMaterial && visual.clouds && (
            <mesh ref={cloudRef} material={cloudMaterial} raycast={() => null}>
              <sphereGeometry
                args={[data.size * visual.clouds.altitude, cloudSegments[0], cloudSegments[1]]}
              />
            </mesh>
          )}

          {visual.ring && (
            <PlanetRings visual={visual} radius={data.size} highRes={highRes} onTexture={onRingTexture} />
          )}

          {visual.atmosphere && <Atmosphere radius={data.size} look={visual.atmosphere} />}
        </group>

        {isStar && <SunCorona radius={data.size} />}

        {/* Hover reticle */}
        {hovered && !isSelected && !activeLandmarkId && (
          <Billboard>
            <mesh raycast={() => null}>
              <ringGeometry args={[data.size * 1.32, data.size * 1.32 + Math.max(0.03, data.size * 0.025), 96]} />
              <meshBasicMaterial color="#9cc4ff" transparent opacity={0.75} depthWrite={false} toneMapped={false} />
            </mesh>
          </Billboard>
        )}

        {/* Label (hidden for the focused body and while a cinematic is running) */}
        {showLabel && (
          <Billboard position={[0, data.size + (isStar ? 2.6 : data.type === 'moon' ? 0.55 : Math.max(0.9, data.size * 0.55)), 0]}>
            <Label3D
              text={
                lang === 'ar' && arReady
                  ? (getCachedArBodyName(data.id) ?? data.name)
                  : data.name.toUpperCase()
              }
              fontSize={isStar ? 1.3 : data.type === 'moon' ? 0.36 : Math.max(0.55, data.size * 0.36)}
              color={hovered ? '#7dd3fc' : isStar ? '#fde68a' : '#f8fafc'}
              opacity={hovered ? 1 : 0.95}
              letterSpacing={0.12}
            />
          </Billboard>
        )}

        {/* Child bodies (like moons) will be placed relative to this group */}
        {children}
      </group>
    </>
  );
});

export default CelestialBody;

