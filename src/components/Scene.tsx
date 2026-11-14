// src/components/Scene.tsx
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { Suspense, memo, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import CelestialBody from './CelestialBody';
import CameraController from './CameraController';
import Skybox from './space/Skybox';
import { celestialBodies } from '../data/planets';
import type { CinematicTimeline } from '../lib/CinematicTimeline';
import type { HologramDisplayMode } from '../lib/hologramShader';
import { useLanguage } from '../i18n/LanguageContext';

interface SceneProps {
  selectedBodyId: string | null;
  inspectedLandmarkId?: string | null;
  activeLandmarkId: string | null;
  hologramDisplayMode?: HologramDisplayMode;
  rescanKey?: number;
  timeline: CinematicTimeline;
  onBodyClick: (id: string, position: THREE.Vector3) => void;
  onLandmarkClick: (landmarkId: string) => void;
}

const sun = celestialBodies['sun'];
const planets = Object.values(celestialBodies).filter((b) => b.type === 'planet');
const moon = celestialBodies['moon'];

const Scene = memo(function Scene({
  selectedBodyId,
  inspectedLandmarkId = null,
  activeLandmarkId,
  hologramDisplayMode = 'hologram',
  rescanKey = 0,
  timeline,
  onBodyClick,
  onLandmarkClick,
}: SceneProps) {
  const { lang } = useLanguage();
  const [isTabVisible, setIsTabVisible] = useState(() =>
    typeof document !== 'undefined' ? !document.hidden : true
  );

  // Pause the WebGL render loop automatically when the browser tab is hidden/minimized
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const shared = useMemo(
    () => ({
      lang,
      onClick: onBodyClick,
      selectedBodyId,
      inspectedLandmarkId,
      activeLandmarkId,
      hologramDisplayMode,
      rescanKey,
      onLandmarkClick,
    }),
    [
      lang,
      onBodyClick,
      selectedBodyId,
      inspectedLandmarkId,
      activeLandmarkId,
      hologramDisplayMode,
      rescanKey,
      onLandmarkClick,
    ]
  );

  return (
    <div className="scene-canvas">
      <Canvas
        frameloop={isTabVisible ? 'always' : 'never'}
        dpr={[1, 1.75]}
        camera={{ position: [0, 20, 50], fov: 45, near: 0.001, far: 10000 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          reversedDepthBuffer: true,
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <color attach="background" args={['#000004']} />

        {/* faint fill so night sides are not pure black; the Sun is the key light */}
        <ambientLight intensity={0.14} />
        <hemisphereLight args={['#b8c8ff', '#1e293b', 0.08]} />
        <pointLight position={[0, 0, 0]} intensity={3.8} distance={0} decay={0} color="#fff6e8" />

        <Stars radius={180} depth={80} count={2800} factor={3} saturation={0} fade speed={0.5} />

        {/*
          Order inside Suspense matters for useFrame execution order:
           1. CelestialBody updates planet & moon positions for the current frame.
           2. CameraController reads those updated positions and moves the camera with zero lag.
           3. Skybox locks onto the updated camera position.
        */}
        <Suspense fallback={null}>
          <CelestialBody data={sun} {...shared} />

          {planets.map((planet) => (
            <CelestialBody key={planet.id} data={planet} {...shared}>
              {/* Moon is a child of Earth so it orbits Earth (and carries the Apollo 11 landmark) */}
              {planet.id === 'earth' && <CelestialBody data={moon} {...shared} />}
            </CelestialBody>
          ))}

          <CameraController
            selectedBodyId={selectedBodyId}
            inspectedLandmarkId={inspectedLandmarkId}
            activeLandmarkId={activeLandmarkId}
            timeline={timeline}
          />

          <Skybox />
        </Suspense>
      </Canvas>
    </div>
  );
});

export default Scene;
