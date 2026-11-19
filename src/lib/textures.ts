// src/lib/textures.ts
//
// Texture quality management.
//
//  * LOW tier (2K) textures are loaded up-front through useLoader (Suspense) so the whole
//    system appears at once.
//  * HIGH tier (8K) textures are streamed only for the body the user is focused on. They are
//    decoded off the main thread (ImageBitmap), uploaded to the GPU once the camera fly-in
//    settles (so the camera transition never stutters on a 134MB GPU upload), shared between
//    consumers, and disposed a while after nobody needs them anymore.
//
// Every texture gets full mip-mapping + the maximum anisotropic filtering the GPU supports,
// which is what keeps surfaces crisp at grazing angles and while zooming.
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { getDeviceQualityProfile } from './deviceQuality';

const HIGH_RES_DISPOSE_DELAY_MS = 30000;
const HIGH_RES_SETTLE_DELAY_MS = 1850; // wait for the 1.8s camera fly-in to finish before GPU upload

export function configureTexture(tex: THREE.Texture, gl: THREE.WebGLRenderer, isColor: boolean) {
  const colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  const quality = getDeviceQualityProfile();
  const anisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), quality.maxAnisotropy);
  if (tex.colorSpace === colorSpace && tex.anisotropy === anisotropy) return tex;
  tex.colorSpace = colorSpace;
  tex.anisotropy = anisotropy;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  // longitude wraps around the sphere, so repeat horizontally to avoid a seam at the mip edges
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

export function supportsHighRes(gl: THREE.WebGLRenderer) {
  const quality = getDeviceQualityProfile();
  if (!quality.allowHighResTextures) return false;
  if (typeof window !== 'undefined' && window.innerWidth <= 820) return false;
  return gl.capabilities.maxTextureSize >= 8192;
}

interface Entry {
  promise: Promise<THREE.Texture>;
  texture: THREE.Texture | null;
  refs: number;
  timer: ReturnType<typeof setTimeout> | null;
}

const cache = new Map<string, Entry>();

let bitmapLoader: THREE.ImageBitmapLoader | null = null;
function getBitmapLoader() {
  if (!bitmapLoader) {
    bitmapLoader = new THREE.ImageBitmapLoader();
    bitmapLoader.setOptions({ imageOrientation: 'flipY', premultiplyAlpha: 'none' });
  }
  return bitmapLoader;
}

function loadHighRes(url: string, gl: THREE.WebGLRenderer, isColor: boolean): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    const onBitmap = (image: ImageBitmap | HTMLImageElement) => {
      const tex = new THREE.Texture(image as unknown as HTMLImageElement);
      // an ImageBitmap is already flipped by the loader options
      tex.flipY = !(typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap);
      configureTexture(tex, gl, isColor);
      tex.needsUpdate = true;
      gl.initTexture(tex);
      resolve(tex);
    };
    if (typeof createImageBitmap !== 'undefined') {
      getBitmapLoader().load(url, onBitmap, undefined, reject);
    } else {
      new THREE.ImageLoader().load(url, onBitmap, undefined, reject);
    }
  });
}

function acquire(url: string, gl: THREE.WebGLRenderer, isColor: boolean) {
  let e = cache.get(url);
  if (!e) {
    const entry: Entry = { promise: null!, texture: null, refs: 0, timer: null };
    entry.promise = loadHighRes(url, gl, isColor).then((t) => {
      entry.texture = t;
      return t;
    });
    entry.promise.catch(() => cache.delete(url));
    cache.set(url, entry);
    e = entry;
  }
  e.refs++;
  if (e.timer) {
    clearTimeout(e.timer);
    e.timer = null;
  }
  return e.promise;
}

function release(url: string) {
  const e = cache.get(url);
  if (!e) return;
  e.refs = Math.max(0, e.refs - 1);
  if (e.refs === 0 && !e.timer) {
    e.timer = setTimeout(() => {
      if (e.refs > 0) return;
      cache.delete(url);
      if (e.texture) {
        const img = e.texture.image as unknown;
        e.texture.dispose();
        if (typeof ImageBitmap !== 'undefined' && img instanceof ImageBitmap) img.close();
      }
    }, HIGH_RES_DISPOSE_DELAY_MS);
  }
}

/**
 * Streams a high-resolution texture while `enabled` is true. If not already cached on the GPU,
 * waits for the camera fly-to animation to finish before uploading to the GPU so the transition
 * never drops a frame.
 */
export function useHighResTexture(url: string | undefined, enabled: boolean, isColor = true) {
  const gl = useThree((s) => s.gl);
  const [tex, setTex] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!enabled || !url || !supportsHighRes(gl)) return;
    let alive = true;
    let acquired = false;

    const existing = cache.get(url);
    const delay = existing?.texture ? 0 : HIGH_RES_SETTLE_DELAY_MS;

    const timer = setTimeout(() => {
      if (!alive) return;
      acquired = true;
      acquire(url, gl, isColor)
        .then((t) => alive && setTex(t))
        .catch((err) => console.warn('[textures] high-res load failed:', url, err));
    }, delay);

    return () => {
      alive = false;
      clearTimeout(timer);
      setTex(null);
      if (acquired) release(url);
    };
  }, [url, enabled, gl, isColor]);

  return tex;
}
