// src/components/space/Skybox.tsx
// Milky Way panorama on a huge sphere that follows the camera (so it is always "at infinity").
// Streamed asynchronously off-Suspense so initial Solar System paint is never blocked, and
// adaptively downscaled via createImageBitmap on mobile / low-VRAM GPUs (8 MB instead of 178 MB VRAM).
import { useEffect, useMemo, useRef, useState, memo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { configureTexture } from '../../lib/textures';
import { getDeviceQualityProfile } from '../../lib/deviceQuality';

const SKYBOX_URL = '/textures/8k/8k_stars_milky_way.jpg';
const SHARED_SKYBOX_GEO = new THREE.SphereGeometry(4000, 36, 18);

const Skybox = memo(function Skybox() {
  const ref = useRef<THREE.Mesh>(null!);
  const gl = useThree((s) => s.gl);
  const [tex, setTex] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();
    const quality = getDeviceQualityProfile();
    const maxTexSize = gl.capabilities.maxTextureSize || 4096;
    const targetWidth =
      quality.skyboxMaxWidth > 0
        ? Math.min(quality.skyboxMaxWidth, maxTexSize)
        : maxTexSize < 8192
          ? Math.min(4096, maxTexSize)
          : 0;

    let createdTexture: THREE.Texture | null = null;
    let createdBitmap: ImageBitmap | null = null;

    async function loadSkybox() {
      try {
        if (typeof createImageBitmap !== 'undefined' && typeof fetch !== 'undefined') {
          const res = await fetch(SKYBOX_URL, { signal: controller.signal });
          if (!res.ok) return;
          const blob = await res.blob();
          if (!alive) return;

          const bitmapOptions: ImageBitmapOptions = {
            imageOrientation: 'flipY',
            premultiplyAlpha: 'none',
            ...(targetWidth > 0
              ? {
                  resizeWidth: targetWidth,
                  resizeHeight: Math.round(targetWidth / 2),
                  resizeQuality: 'medium',
                }
              : {}),
          };

          const bitmap = await createImageBitmap(blob, bitmapOptions);
          if (!alive) {
            bitmap.close();
            return;
          }
          createdBitmap = bitmap;
          const texture = new THREE.Texture(bitmap as unknown as HTMLImageElement);
          texture.flipY = false;
          configureTexture(texture, gl, true);
          texture.needsUpdate = true;
          gl.initTexture(texture);
          createdTexture = texture;
          setTex(texture);
        } else {
          new THREE.TextureLoader().load(SKYBOX_URL, (loaded) => {
            if (!alive) {
              loaded.dispose();
              return;
            }
            configureTexture(loaded, gl, true);
            createdTexture = loaded;
            setTex(loaded);
          });
        }
      } catch {
        // Ignore abort or network failures — procedural <Stars /> still provides a rich starfield
      }
    }

    // Defer slightly so critical 2K planet textures get first bandwidth priority
    const timer = setTimeout(() => {
      if (alive) void loadSkybox();
    }, 350);

    return () => {
      alive = false;
      clearTimeout(timer);
      controller.abort();
      if (createdTexture) createdTexture.dispose();
      if (createdBitmap) createdBitmap.close();
    };
  }, [gl]);

  const material = useMemo(() => {
    if (!tex) return null;
    return new THREE.MeshBasicMaterial({
      map: tex,
      side: THREE.BackSide,
      depthWrite: false,
      toneMapped: false,
      color: '#6f7480',
    });
  }, [tex]);

  useEffect(() => () => material?.dispose(), [material]);

  useFrame(({ camera }) => {
    if (ref.current) {
      ref.current.position.copy(camera.position);
    }
  });

  if (!material) return null;

  return (
    <mesh
      ref={ref}
      geometry={SHARED_SKYBOX_GEO}
      material={material}
      raycast={() => null}
      renderOrder={-10}
      rotation={[0, 0, THREE.MathUtils.degToRad(60)]}
    />
  );
});

export default Skybox;
