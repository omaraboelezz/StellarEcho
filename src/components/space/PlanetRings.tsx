// src/components/space/PlanetRings.tsx
// Planetary rings rendered with a radial texture lookup.
import { useEffect, useMemo, memo } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { BodyVisual } from '../../data/planetVisuals';
import { configureTexture, useHighResTexture } from '../../lib/textures';
import { getDeviceQualityProfile } from '../../lib/deviceQuality';

const vertexShader = /* glsl */ `
uniform float uRadius;
varying float vR;
varying vec3 vPosW;
varying vec3 vCenter;
varying vec3 vNormalW;
void main() {
  vR = length(position.xy) / uRadius;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vPosW = wp.xyz;
  vCenter = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  vNormalW = normalize(mat3(modelMatrix) * vec3(0.0, 0.0, 1.0));
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const fragmentShader = /* glsl */ `
uniform sampler2D uMap;
uniform float uInner;
uniform float uOuter;
uniform float uRadius;
uniform float uOpacity;
varying float vR;
varying vec3 vPosW;
varying vec3 vCenter;
varying vec3 vNormalW;
void main() {
  float u = (vR - uInner) / (uOuter - uInner);
  if (u < 0.0 || u > 1.0) discard;
  vec4 tex = texture2D(uMap, vec2(u, 0.5));

  vec3 L = normalize(-vPosW);
  vec3 V = normalize(cameraPosition - vPosW);
  vec3 N = normalize(vNormalW);
  float nl = dot(N, L);
  float sameSide = step(0.0, nl * dot(N, V));
  float bright = mix(0.4, 1.0, sameSide) * (0.35 + 0.65 * pow(abs(nl), 0.25));

  // planet shadow (ray from the fragment toward the Sun vs. the planet sphere)
  vec3 oc = vPosW - vCenter;
  float b = dot(oc, L);
  float R2 = uRadius * uRadius;
  float h = b * b - (dot(oc, oc) - R2);
  float shadow = b < 0.0 ? smoothstep(-0.03 * R2, 0.03 * R2, h) : 0.0;

  vec3 col = tex.rgb * bright * (1.0 - 0.93 * shadow);
  gl_FragColor = vec4(col, tex.a * uOpacity);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/** Narrow, dark rings (Uranus) drawn into a 1D texture from real ring radii. */
function createBandTexture(bands: number[], inner: number, outer: number) {
  const W = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = 4;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, W, 4);
  bands.forEach((r, i) => {
    const x = ((r - inner) / (outer - inner)) * W;
    const isEpsilon = i === bands.length - 1;
    const w = isEpsilon ? 5 : 2;
    const g = ctx.createLinearGradient(x - w, 0, x + w, 0);
    const a = isEpsilon ? 0.95 : 0.6;
    g.addColorStop(0, 'rgba(180,190,200,0)');
    g.addColorStop(0.5, `rgba(180,190,200,${a})`);
    g.addColorStop(1, 'rgba(180,190,200,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - w, 0, w * 2, 4);
  });
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  return tex;
}

function useRingTexture(visual: BodyVisual, highRes: boolean) {
  const gl = useThree((s) => s.gl);
  const ring = visual.ring!;
  const low = useLoader(
    THREE.TextureLoader,
    ring.map?.low ?? '/textures/2k/2k_saturn_ring_alpha.png'
  );
  const high = useHighResTexture(ring.map?.high, highRes);
  const bands = useMemo(
    () => (ring.bands ? createBandTexture(ring.bands, ring.inner, ring.outer) : null),
    [ring.bands, ring.inner, ring.outer]
  );
  useEffect(() => () => bands?.dispose(), [bands]);

  const tex = bands ?? high ?? low;

  useEffect(() => {
    configureTexture(tex, gl, true);
    tex.wrapS = THREE.ClampToEdgeWrapping;
  }, [tex, gl]);

  return tex;
}

const PlanetRings = memo(function PlanetRings({
  visual,
  radius,
  highRes,
  onTexture,
}: {
  visual: BodyVisual;
  radius: number;
  highRes: boolean;
  onTexture?: (tex: THREE.Texture) => void;
}) {
  const ring = visual.ring!;
  const tex = useRingTexture(visual, highRes);

  const ringSegments = getDeviceQualityProfile().ringSegments;
  const geometry = useMemo(
    () => new THREE.RingGeometry(radius * ring.inner, radius * ring.outer, ringSegments, 2),
    [radius, ring.inner, ring.outer, ringSegments]
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uMap: { value: null },
          uInner: { value: ring.inner },
          uOuter: { value: ring.outer },
          uRadius: { value: radius },
          uOpacity: { value: ring.opacity },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [ring.inner, ring.outer, ring.opacity, radius]
  );
  useEffect(() => () => material.dispose(), [material]);

  material.uniforms.uMap.value = tex;
  useEffect(() => onTexture?.(tex), [tex, onTexture]);

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      material={material}
      raycast={() => null}
      renderOrder={1}
    />
  );
});

export default PlanetRings;
