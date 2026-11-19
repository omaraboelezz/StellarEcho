// src/components/LandmarkMarker.tsx
// Interactive point-of-interest beacon positioned above each 3D equipment model on the planet surface.
// Rendered as a child of the planet MESH so it rotates synchronously with the surface.
//
// Performance Optimizations:
//  - Shared static unit geometries across all markers (zero per-marker geometry allocations).
//  - Back-hemisphere horizon occlusion culling (skips markers on the far side of the planet).
//  - Memoized with React.memo to avoid re-renders when unrelated UI state changes.

import { useEffect, useMemo, useRef, useState, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';
import type { Landmark } from '../data/landmarks';
import { latLonToVector3 } from '../lib/cinematic';
import Label3D from './space/Label3D';
import { getCachedArLandmarkName } from '../i18n/LanguageContext';
import type { Language } from '../i18n/types';

interface Props {
  landmark: Landmark;
  lang?: Language;
  arReady?: boolean;
  radius: number;
  isInspected?: boolean;
  onSelect: (id: string) => void;
}

const SHARED_STEM_CYLINDER = new THREE.CylinderGeometry(1, 1, 1, 8);
const SHARED_CORE_SPHERE = new THREE.SphereGeometry(1, 16, 16);
const SHARED_HALO_SPHERE = new THREE.SphereGeometry(1, 16, 16);

const _worldPos = new THREE.Vector3();
const _worldQuat = new THREE.Quaternion();
const _siteNormal = new THREE.Vector3();
const _toCam = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);

const LandmarkMarker = memo(function LandmarkMarker({
  landmark,
  lang = 'en',
  arReady = false,
  radius,
  isInspected = false,
  onSelect,
}: Props) {
  const rootRef = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  const { position, quaternion } = useMemo(() => {
    const p = latLonToVector3(landmark.lat, landmark.lon, radius);
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      p.clone().normalize()
    );
    return { position: p, quaternion: q };
  }, [landmark.lat, landmark.lon, radius]);

  const modelVisualSize = radius * landmark.modelScale * 2.15;
  const stemBottom = modelVisualSize * 0.75;
  const pinHeight = Math.max(radius * 0.085, modelVisualSize * 1.35);
  const stemLength = Math.max(0.001, pinHeight - stemBottom);
  const stemRadius = radius * 0.0022;
  const dot = radius * 0.026;

  useFrame((state) => {
    if (isInspected) return;
    if (rootRef.current) {
      rootRef.current.getWorldPosition(_worldPos);
      rootRef.current.getWorldQuaternion(_worldQuat);
      _siteNormal.copy(_up).applyQuaternion(_worldQuat);
      _toCam.copy(state.camera.position).sub(_worldPos).normalize();
      const visible = _siteNormal.dot(_toCam) > -0.14;
      rootRef.current.visible = visible;
      if (!visible) return;
    }
    if (halo.current) {
      const pulse = 1 + 0.35 * Math.sin(state.clock.elapsedTime * 4);
      halo.current.scale.setScalar(dot * 2.25 * pulse);
    }
  });

  useEffect(() => () => void (document.body.style.cursor = 'auto'), []);

  // When this equipment is actively inspected up close as a 3D hologram, hide the overhead beacon pin
  // so the holographic projection and volumetric light beam are completely unobstructed.
  if (isInspected) return null;

  const activeColor = hovered ? '#00f2ff' : '#ffcf5c';

  return (
    <group
      ref={rootRef}
      position={position}
      quaternion={quaternion}
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
      {/* Vertical tether stem connecting the marker pin to the 3D equipment below */}
      <mesh
        geometry={SHARED_STEM_CYLINDER}
        scale={[stemRadius, stemLength, stemRadius]}
        position={[0, (stemBottom + pinHeight) * 0.5, 0]}
        renderOrder={3}
        raycast={() => null}
      >
        <meshBasicMaterial
          color={activeColor}
          transparent
          opacity={hovered ? 0.9 : 0.55}
          toneMapped={false}
        />
      </mesh>

      {/* Beacon Pin Group above the 3D model */}
      <group position={[0, pinHeight, 0]}>
        {/* Core pin */}
        <mesh
          geometry={SHARED_CORE_SPHERE}
          scale={dot}
          renderOrder={4}
          raycast={() => null}
        >
          <meshBasicMaterial color={activeColor} toneMapped={false} />
        </mesh>

        {/* Pulsing halo (also provides a generous click/touch target) */}
        <mesh
          ref={halo}
          geometry={SHARED_HALO_SPHERE}
          scale={dot * 2.25}
          renderOrder={4}
        >
          <meshBasicMaterial
            color={hovered ? '#00f2ff' : '#ffcf5c'}
            transparent
            opacity={hovered ? 0.48 : 0.3}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>

        {/* Floating label when hovered */}
        {hovered && (
          <Billboard position={[0, dot * 3.6, 0]}>
            <Label3D
              text={
                lang === 'ar' && arReady
                  ? (getCachedArLandmarkName(landmark.id) ?? landmark.name)
                  : landmark.name
              }
              fontSize={radius * 0.085}
              color="#ffe58f"
              opacity={1}
              letterSpacing={0.04}
              depthTest={false}
            />
          </Billboard>
        )}
      </group>
    </group>
  );
});

export default LandmarkMarker;
