// src/components/Scene.tsx
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import {
  Component,
  Suspense,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ErrorInfo,
  type ReactNode,
} from 'react';
import * as THREE from 'three';
import CelestialBody from './CelestialBody';
import CameraController from './CameraController';
import Skybox from './space/Skybox';
import { celestialBodies } from '../data/planets';
import type { CinematicTimeline } from '../lib/CinematicTimeline';
import type { HologramDisplayMode } from '../lib/hologramShader';
import { useLanguage } from '../i18n/LanguageContext';
import { detectWebGLSupport, getDeviceQualityProfile } from '../lib/deviceQuality';

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

interface ErrorBoundaryState {
  hasError: boolean;
}

class SceneErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Scene] 3D render error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function WebGLFallback({ lang }: { lang: 'en' | 'ar' }) {
  return (
    <div className="webgl-fallback" role="alert">
      <div className="webgl-fallback-card glass-panel">
        <h2>{lang === 'ar' ? 'العرض ثلاثي الأبعاد غير متاح' : '3D View Unavailable'}</h2>
        <p>
          {lang === 'ar'
            ? 'لا يدعم هذا المتصفح أو الجهاز تسريع رسوميات WebGL حالياً. يمكنك استخدام أطلس الكواكب للتصفح.'
            : 'WebGL hardware acceleration is unavailable on this device or browser. You can still browse planetary data and missions from the interface.'}
        </p>
      </div>
    </div>
  );
}

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
  const { lang, arReady } = useLanguage();
  const quality = useMemo(() => getDeviceQualityProfile(), []);
  const [webglSupported] = useState(() => detectWebGLSupport());
  const [contextLost, setContextLost] = useState(false);
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

  const handleCreated = useCallback(
    ({ gl }: { gl: THREE.WebGLRenderer }) => {
      gl.toneMapping = THREE.ACESFilmicToneMapping;
      gl.toneMappingExposure = 1.05;

      const canvas = gl.domElement;
      const onContextLost = (e: Event) => {
        e.preventDefault();
        setContextLost(true);
      };
      const onContextRestored = () => {
        setContextLost(false);
      };
      canvas.addEventListener('webglcontextlost', onContextLost, false);
      canvas.addEventListener('webglcontextrestored', onContextRestored, false);
    },
    []
  );

  const shared = useMemo(
    () => ({
      lang,
      arReady,
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
      arReady,
      onBodyClick,
      selectedBodyId,
      inspectedLandmarkId,
      activeLandmarkId,
      hologramDisplayMode,
      rescanKey,
      onLandmarkClick,
    ]
  );

  if (!webglSupported) {
    return (
      <div className="scene-canvas">
        <WebGLFallback lang={lang} />
      </div>
    );
  }

  return (
    <div className="scene-canvas">
      <SceneErrorBoundary fallback={<WebGLFallback lang={lang} />}>
        <Canvas
          frameloop={isTabVisible && !contextLost ? 'always' : 'never'}
          dpr={quality.dpr}
          camera={{ position: [0, 20, 50], fov: 45, near: 0.001, far: 10000 }}
          gl={{
            antialias: quality.antialias,
            powerPreference: 'high-performance',
            reversedDepthBuffer: true,
          }}
          onCreated={handleCreated}
        >
          <color attach="background" args={['#000004']} />

          {/* faint fill so night sides are not pure black; the Sun is the key light */}
          <ambientLight intensity={0.14} />
          <hemisphereLight args={['#b8c8ff', '#1e293b', 0.08]} />
          <pointLight position={[0, 0, 0]} intensity={3.8} distance={0} decay={0} color="#fff6e8" />

          <Stars
            radius={180}
            depth={80}
            count={quality.starCount}
            factor={3}
            saturation={0}
            fade
            speed={quality.prefersReducedMotion ? 0 : 0.5}
          />

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
      </SceneErrorBoundary>
    </div>
  );
});

export default Scene;
