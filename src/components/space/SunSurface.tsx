// src/components/space/SunSurface.tsx
// The Sun: photosphere texture + animated granulation + limb darkening (emissive, not lit),
// surrounded by additive corona glow sprites.
//
// Performance Optimization:
//  - Distance-gates high-frequency 3D Simplex noise octaves (g2, g3) so distant views of the Sun
//    skip 66% of fragment shader ALU noise evaluations.

import { useEffect, useMemo, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SIMPLEX_NOISE_GLSL } from '../../lib/shaders/noise';

const vertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vObj;
varying vec3 vNormalW;
varying vec3 vPosW;
void main() {
  vUv = uv;
  vObj = position;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vPosW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const fragmentShader = /* glsl */ `
uniform sampler2D uMap;
uniform float uTime;
uniform float uRadius;
varying vec2 vUv;
varying vec3 vObj;
varying vec3 vNormalW;
varying vec3 vPosW;
${SIMPLEX_NOISE_GLSL}
void main() {
  vec3 p = vObj / uRadius;
  vec3 base = texture2D(uMap, vUv).rgb;
  float camDist = length(cameraPosition - vPosW);

  float g1 = pn_snoise(p * 18.0 + vec3(0.0, uTime * 0.03, 0.0));
  float gran = g1 * 0.55;

  // Only evaluate medium & fine 3D Simplex noise octaves when the camera is reasonably close
  float medFactor = clamp(2.4 - camDist / (uRadius * 7.5), 0.0, 1.0);
  if (medFactor > 0.01) {
    float g2 = pn_snoise(p * 60.0 - vec3(uTime * 0.05));
    gran += g2 * 0.3 * medFactor;

    float closeFactor = clamp(2.0 - camDist / (uRadius * 4.0), 0.0, 1.0);
    if (closeFactor > 0.01) {
      float g3 = pn_snoise(p * 200.0 + vec3(uTime * 0.08));
      gran += g3 * 0.2 * closeFactor;
    }
  }

  vec3 col = base * (1.0 + gran * 0.22);

  vec3 V = normalize(cameraPosition - vPosW);
  float mu = clamp(dot(normalize(vNormalW), V), 0.0, 1.0);
  float limb = 0.35 + 0.65 * pow(mu, 0.45);
  col *= limb * vec3(1.7, 1.45, 1.15);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;

function makeGlowTexture(inner: string, mid: string) {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, inner);
  g.addColorStop(0.18, inner);
  g.addColorStop(0.32, mid);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSunMaterial(map: THREE.Texture, radius: number) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: { uMap: { value: map }, uTime: { value: 0 }, uRadius: { value: radius } },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [radius]
  );
  material.uniforms.uMap.value = map;
  useEffect(() => () => material.dispose(), [material]);
  useFrame((_s, dt) => {
    material.uniforms.uTime.value += Math.min(dt, 0.05);
  });
  return material;
}

export const SunCorona = memo(function SunCorona({ radius }: { radius: number }) {
  const { inner, outer } = useMemo(
    () => ({
      inner: makeGlowTexture('rgba(255,236,190,0.85)', 'rgba(255,170,60,0.28)'),
      outer: makeGlowTexture('rgba(255,200,120,0.35)', 'rgba(255,120,30,0.08)'),
    }),
    []
  );
  useEffect(
    () => () => {
      inner.dispose();
      outer.dispose();
    },
    [inner, outer]
  );

  return (
    <group>
      <sprite scale={radius * 4.2} raycast={() => null} renderOrder={3}>
        <spriteMaterial
          map={inner}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          transparent
          toneMapped={false}
        />
      </sprite>
      <sprite scale={radius * 11} raycast={() => null} renderOrder={3}>
        <spriteMaterial
          map={outer}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          transparent
          toneMapped={false}
        />
      </sprite>
    </group>
  );
});
