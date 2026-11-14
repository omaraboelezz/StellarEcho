// src/components/EquipmentSite.tsx
// Renders the 3D space equipment (.glb model from /public/models/) on the celestial body's
// surface at its historical (lat, lon) coordinates, and smoothly transforms it into an
// interactive NASA Holographic Projection when selected.
//
// Performance Optimizations:
//  - On-demand lazy GLTF loading per selected planet (eliminates 121.68 MB startup preload).
//  - O(1) analytic bounding-sphere raycasting (eliminates 1.68M-triangle CPU raycast on mousemove).
//  - Single-pass derivative wireframe + Fresnel shader (eliminates 1.5M-line duplicate wireframe pass).
//  - Cached GLB bounding-box normalization per URL (eliminates repeated 500k-vertex Box3 scans).
//  - Back-hemisphere horizon occlusion culling (skips rendering models on the far side of a planet).
//  - Zero scene PointLights (prevents planet MeshStandardMaterial shader recompilations).

import { Suspense, useMemo, useState, useEffect, useRef, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { getLandmarksForBody, type Landmark } from '../data/landmarks';
import { latLonToVector3 } from '../lib/cinematic';
import {
  createHologramBodyMaterial,
  createHologramPedestalMaterial,
  createHologramScanPlaneMaterial,
  createVolumetricConeMaterial,
  type HologramDisplayMode,
} from '../lib/hologramShader';

interface EquipmentSiteProps {
  landmark: Landmark;
  radius: number;
  isCinematic?: boolean;
  isInspected?: boolean;
  displayMode?: HologramDisplayMode;
  rescanKey?: number;
  onSelect?: (id: string) => void;
}

interface CachedGLBMeta {
  offset: THREE.Vector3;
  minY: number;
  maxY: number;
  horizRadius: number;
}

const glbMetaCache = new Map<string, CachedGLBMeta>();
const preloadedUrls = new Set<string>();

/**
 * Lazily preloads only the 3D equipment models belonging to a specific celestial body
 * (e.g. when the user hovers or selects that planet), avoiding a 121 MB startup download.
 */
export function preloadModelsForBody(bodyId: string) {
  const list = getLandmarksForBody(bodyId);
  for (let i = 0; i < list.length; i++) {
    const url = list[i].modelUrl;
    if (url && !preloadedUrls.has(url)) {
      preloadedUrls.add(url);
      useGLTF.preload(url);
    }
  }
}

// Shared static geometries for pedestals, scan discs, and volumetric cones (0 per-mount allocations)
const SHARED_UNIT_PLANE = new THREE.PlaneGeometry(1, 1);
const SHARED_VOLUMETRIC_CONE = new THREE.CylinderGeometry(0.96, 0.34, 0.9, 36, 1, true);
const SHARED_FALLBACK_OCTA = new THREE.OctahedronGeometry(0.32, 1);

// O(1) Analytic Sphere Raycast for equipment hit-testing (replaces 500,000-triangle mesh raycast!)
const _hitSphere = new THREE.Sphere();
const _hitPoint = new THREE.Vector3();
const _worldScale = new THREE.Vector3();

function equipmentSphereRaycast(
  this: THREE.Mesh,
  raycaster: THREE.Raycaster,
  intersects: THREE.Intersection[]
) {
  this.getWorldPosition(_hitSphere.center);
  this.getWorldScale(_worldScale);
  _hitSphere.radius = Math.max(_worldScale.x, _worldScale.y, _worldScale.z) * 0.65;
  if (!raycaster.ray.intersectSphere(_hitSphere, _hitPoint)) return;
  const distance = raycaster.ray.origin.distanceTo(_hitPoint);
  if (distance < raycaster.near || distance > raycaster.far) return;
  intersects.push({ distance, point: _hitPoint.clone(), object: this });
}

interface HolographicGLBProps {
  url: string;
  isHoloActive: boolean;
  displayMode: HologramDisplayMode;
  rescanKey: number;
}

function HolographicGLBModel({
  url,
  isHoloActive,
  displayMode,
  rescanKey,
}: HolographicGLBProps) {
  const { scene } = useGLTF(url);
  const scanPlaneRef = useRef<THREE.Mesh>(null);
  const scanProgressRef = useRef(0);
  const holoMixRef = useRef(0);
  const prevHoloActive = useRef(false);
  const prevRescanKey = useRef(rescanKey);

  const { rootGroup, bodyMaterials, scanPlaneMaterial, modelHeight, modelRadius } = useMemo(() => {
    // Compute & cache bounding-box normalization once per GLTF URL
    let meta = glbMetaCache.get(url);
    if (!meta) {
      scene.updateMatrixWorld(true);
      const rawBox = new THREE.Box3().setFromObject(scene);
      const center = new THREE.Vector3();
      const sizeVec = new THREE.Vector3(1, 1, 1);
      if (!rawBox.isEmpty()) {
        rawBox.getCenter(center);
        rawBox.getSize(sizeVec);
      }
      const offset = new THREE.Vector3(-center.x, -(rawBox.isEmpty() ? 0 : rawBox.min.y), -center.z);
      const height = Math.max(sizeVec.y, 0.15);
      meta = {
        offset,
        minY: 0,
        maxY: height,
        horizRadius: Math.max(sizeVec.x, sizeVec.z, 0.5) * 0.62,
      };
      glbMetaCache.set(url, meta);
    }

    const root = scene.clone(true);
    root.position.copy(meta.offset);
    root.updateMatrixWorld(true);

    const bMats: THREE.ShaderMaterial[] = [];

    root.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        // Disable expensive 500,000-triangle CPU raycasting on the high-poly GLB mesh;
        // hit-testing is handled by the O(1) analytic bounding-sphere proxy mesh.
        mesh.raycast = () => null;

        const origMat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
        let map: THREE.Texture | null = null;
        let baseColor = new THREE.Color('#d8e6f5');

        if (origMat && (origMat as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
          const std = origMat as THREE.MeshStandardMaterial;
          map = std.map ?? null;
          if (std.color) baseColor = std.color.clone();
        }

        const meshToRoot = mesh.matrixWorld.clone();
        const bodyMat = createHologramBodyMaterial(
          map,
          baseColor,
          meta!.minY,
          meta!.maxY,
          meshToRoot
        );
        mesh.material = bodyMat;
        mesh.renderOrder = 2;
        bMats.push(bodyMat);
      }
    });

    const sPlaneMat = createHologramScanPlaneMaterial();

    return {
      rootGroup: root,
      bodyMaterials: bMats,
      scanPlaneMaterial: sPlaneMat,
      modelHeight: meta.maxY - meta.minY,
      modelRadius: meta.horizRadius,
    };
  }, [scene, url]);

  // Dispose custom shader materials on unmount
  useEffect(() => {
    return () => {
      bodyMaterials.forEach((m) => m.dispose());
      scanPlaneMaterial.dispose();
    };
  }, [bodyMaterials, scanPlaneMaterial]);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const elapsed = state.clock.elapsedTime;

    if (
      (isHoloActive && !prevHoloActive.current) ||
      (isHoloActive && rescanKey !== prevRescanKey.current)
    ) {
      scanProgressRef.current = 0.0;
    }
    prevHoloActive.current = isHoloActive;
    prevRescanKey.current = rescanKey;

    const targetHoloMix = !isHoloActive ? 0.0 : displayMode === 'physical' ? 0.0 : 1.0;
    const targetWireBoost =
      displayMode === 'hologram' ? 1.05 : displayMode === 'hybrid' ? 0.48 : 0.0;

    // Skip uniform updates completely when idle in physical state on the surface
    if (!isHoloActive && holoMixRef.current <= 0.002) {
      if (holoMixRef.current !== 0) {
        holoMixRef.current = 0;
        for (let i = 0; i < bodyMaterials.length; i++) {
          bodyMaterials[i].uniforms.uHoloMix.value = 0;
        }
        if (scanPlaneRef.current) scanPlaneRef.current.visible = false;
      }
      return;
    }

    holoMixRef.current = THREE.MathUtils.damp(holoMixRef.current, targetHoloMix, 6.5, dt);

    if (isHoloActive && scanProgressRef.current < 1.35) {
      scanProgressRef.current = Math.min(1.35, scanProgressRef.current + dt * 0.92);
    } else if (!isHoloActive) {
      scanProgressRef.current = THREE.MathUtils.damp(scanProgressRef.current, 0.0, 5.0, dt);
    }

    for (let i = 0; i < bodyMaterials.length; i++) {
      const bm = bodyMaterials[i];
      bm.uniforms.uTime.value = elapsed;
      bm.uniforms.uHoloMix.value = holoMixRef.current;
      bm.uniforms.uScanProgress.value = scanProgressRef.current;
      bm.uniforms.uWireframeBoost.value = targetWireBoost;
    }

    if (scanPlaneRef.current) {
      scanPlaneMaterial.uniforms.uTime.value = elapsed;
      const isInitialScan = scanProgressRef.current < 1.12;
      const sweepNormY = isInitialScan
        ? Math.min(1.0, scanProgressRef.current)
        : (elapsed * 0.28) % 1.0;

      scanPlaneRef.current.position.y = sweepNormY * modelHeight;
      const edgeFade = Math.sin(sweepNormY * Math.PI);
      const planeAlpha = holoMixRef.current * (isInitialScan ? 0.92 : 0.42 * edgeFade);
      scanPlaneMaterial.uniforms.uOpacity.value = planeAlpha;
      scanPlaneRef.current.visible = planeAlpha > 0.02;
    }
  });

  const scanDiameter = modelRadius * 2.35;

  return (
    <group>
      <primitive object={rootGroup} />

      {/* Horizontal Laser Scan Disc sweeping vertically through the 3D model */}
      <mesh
        ref={scanPlaneRef}
        geometry={SHARED_UNIT_PLANE}
        scale={[scanDiameter, scanDiameter, 1]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        material={scanPlaneMaterial}
        renderOrder={4}
        visible={false}
        raycast={() => null}
      />
    </group>
  );
}

/**
 * Lightweight animated holographic wireframe beacon displayed while the high-res .glb model
 * streams in asynchronously on demand.
 */
function FallbackEquipment() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 1.8;
    }
  });
  return (
    <mesh
      ref={ref}
      geometry={SHARED_FALLBACK_OCTA}
      position={[0, 0.38, 0]}
      raycast={() => null}
    >
      <meshBasicMaterial
        color="#00f0ff"
        wireframe
        transparent
        opacity={0.78}
        toneMapped={false}
      />
    </mesh>
  );
}

const _worldPos = new THREE.Vector3();
const _worldQuat = new THREE.Quaternion();
const _siteNormal = new THREE.Vector3();
const _toCam = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);

const EquipmentSite = memo(function EquipmentSite({
  landmark,
  radius,
  isCinematic = false,
  isInspected = false,
  displayMode = 'hologram',
  rescanKey = 0,
  onSelect,
}: EquipmentSiteProps) {
  const [hovered, setHovered] = useState(false);
  const anchorRef = useRef<THREE.Group>(null);
  const contentGroupRef = useRef<THREE.Group>(null);
  const modelGroupRef = useRef<THREE.Group>(null);
  const coneMeshRef = useRef<THREE.Mesh>(null);

  const { position, quaternion } = useMemo(() => {
    const p = latLonToVector3(landmark.lat, landmark.lon, radius);
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      p.clone().normalize()
    );
    return { position: p, quaternion: q };
  }, [landmark.lat, landmark.lon, radius]);

  const coneMaterial = useMemo(() => createVolumetricConeMaterial(), []);
  const pedestalMaterial = useMemo(() => createHologramPedestalMaterial(), []);

  useEffect(() => {
    return () => {
      coneMaterial.dispose();
      pedestalMaterial.dispose();
      document.body.style.cursor = 'auto';
    };
  }, [coneMaterial, pedestalMaterial]);

  const baseScale = radius * landmark.modelScale * (isCinematic ? 1.0 : 2.15);
  const surfaceSink = -radius * (isCinematic ? 0.0018 : 0.0035);
  const isHoloActive = isInspected && !isCinematic;
  const hoverMixRef = useRef(0);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const elapsed = state.clock.elapsedTime;

    // Back-hemisphere horizon occlusion culling:
    // If this equipment site is rotated onto the far side of the planet sphere away from the camera,
    // skip rendering its 250k-500k triangle mesh completely!
    if (anchorRef.current && contentGroupRef.current) {
      if (isInspected || isCinematic) {
        contentGroupRef.current.visible = true;
      } else {
        anchorRef.current.getWorldPosition(_worldPos);
        anchorRef.current.getWorldQuaternion(_worldQuat);
        _siteNormal.copy(_up).applyQuaternion(_worldQuat);
        _toCam.copy(state.camera.position).sub(_worldPos).normalize();
        const facingDot = _siteNormal.dot(_toCam);
        contentGroupRef.current.visible = facingDot > -0.16;
        if (!contentGroupRef.current.visible) return;
      }
    }

    const targetActive = isHoloActive ? 1.0 : hovered && !isCinematic ? 0.42 : 0.16;
    hoverMixRef.current = THREE.MathUtils.damp(hoverMixRef.current, targetActive, 6.0, dt);

    pedestalMaterial.uniforms.uTime.value = elapsed;
    pedestalMaterial.uniforms.uIntensity.value = hoverMixRef.current;

    const coneIntensity = isHoloActive && displayMode !== 'physical' ? hoverMixRef.current : 0.0;
    if (coneIntensity > 0.01) {
      coneMaterial.uniforms.uTime.value = elapsed;
      coneMaterial.uniforms.uIntensity.value = coneIntensity;
    }
    if (coneMeshRef.current) {
      coneMeshRef.current.visible = coneIntensity > 0.02;
    }

    if (modelGroupRef.current) {
      const targetScale = isHoloActive ? baseScale * 1.18 : baseScale;
      const curScale = THREE.MathUtils.damp(modelGroupRef.current.scale.x, targetScale, 6.0, dt);
      modelGroupRef.current.scale.setScalar(curScale);

      const hoverFloat =
        isHoloActive && displayMode !== 'physical'
          ? baseScale * 0.065 + Math.sin(elapsed * 2.1) * baseScale * 0.015
          : 0;
      const targetY = surfaceSink + hoverFloat;
      modelGroupRef.current.position.y = THREE.MathUtils.damp(
        modelGroupRef.current.position.y,
        targetY,
        6.0,
        dt
      );
    }
  });

  const pedestalSize = baseScale * 2.5;

  return (
    <group
      ref={anchorRef}
      name={`anchor-${landmark.id}`}
      position={position}
      quaternion={quaternion}
    >
      <group ref={contentGroupRef}>
        {/* O(1) Analytic Bounding-Sphere Hit Proxy (replaces 500,000-triangle GLB raycasting) */}
        {!isCinematic && onSelect && (
          <mesh
            position={[0, baseScale * 0.4, 0]}
            scale={baseScale}
            raycast={equipmentSphereRaycast}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(landmark.id);
            }}
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
            <planeGeometry args={[0.001, 0.001]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        )}

        {/* Holographic Projector Pedestal & Dark Contrast Well on the planetary surface */}
        {!isCinematic && (
          <mesh
            geometry={SHARED_UNIT_PLANE}
            scale={[pedestalSize, pedestalSize, 1]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, radius * 0.0012, 0]}
            material={pedestalMaterial}
            renderOrder={1}
            raycast={() => null}
          />
        )}

        {/* Soft Volumetric Upward Light Cone underneath the hologram */}
        {!isCinematic && (
          <mesh
            ref={coneMeshRef}
            geometry={SHARED_VOLUMETRIC_CONE}
            scale={[baseScale, baseScale, baseScale]}
            position={[0, baseScale * 0.44, 0]}
            material={coneMaterial}
            renderOrder={1}
            visible={false}
            raycast={() => null}
          />
        )}

        {/* 3D Equipment Model with Single-Pass Physical -> Holographic Shader */}
        <group ref={modelGroupRef} scale={baseScale} position={[0, surfaceSink, 0]}>
          {landmark.modelUrl ? (
            <Suspense fallback={<FallbackEquipment />}>
              <HolographicGLBModel
                url={landmark.modelUrl}
                isHoloActive={isHoloActive}
                displayMode={displayMode}
                rescanKey={rescanKey}
              />
            </Suspense>
          ) : (
            <FallbackEquipment />
          )}
        </group>

        {/* Floating cyan holographic energy particles when inspected */}
        {isHoloActive && displayMode !== 'physical' && (
          <Sparkles
            count={28}
            scale={[baseScale * 1.8, baseScale * 1.4, baseScale * 1.8]}
            position={[0, baseScale * 0.65, 0]}
            size={2.1}
            speed={0.42}
            opacity={0.82}
            color="#00f5ff"
          />
        )}

        {/* Atmospheric dust motes during cinematic close-up */}
        {isCinematic && (
          <Sparkles
            count={32}
            scale={[baseScale * 8, baseScale * 2.5, baseScale * 8]}
            position={[0, baseScale * 1.2, 0]}
            size={2}
            speed={0.25}
            opacity={0.6}
            color="#ffd9a8"
          />
        )}
      </group>
    </group>
  );
});

export default EquipmentSite;
