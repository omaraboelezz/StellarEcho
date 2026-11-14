// src/components/space/Atmosphere.tsx
// Additive back-face shell around a planet that approximates atmospheric scattering.
// Uses a shared unit sphere geometry scaled to [radius * look.scale] so zero per-planet
// sphere geometry buffers are allocated.
import { useMemo, useEffect, memo } from 'react';
import * as THREE from 'three';
import type { AtmosphereLook } from '../../data/planetVisuals';

const SHARED_ATMO_GEO = new THREE.SphereGeometry(1, 64, 32);

const vertexShader = /* glsl */ `
varying vec3 vNormalW;
varying vec3 vPosW;
varying vec3 vCenter;
void main() {
  vCenter = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vPosW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const fragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uIntensity;
uniform float uPower;
uniform float uLimb;
uniform float uScale;
uniform float uRadius;
varying vec3 vNormalW;
varying vec3 vPosW;
varying vec3 vCenter;
void main() {
  vec3 center = vCenter;
  vec3 V = normalize(cameraPosition - vPosW);
  vec3 N = normalize(vNormalW);
  float d = dot(N, -V);
  float x = clamp(d / uLimb, 0.0, 1.0);
  float glow = pow(x, uPower);

  vec3 L = normalize(-vPosW);                 // Sun sits at the origin
  float sunF = smoothstep(-0.35, 0.5, dot(N, L));
  float fwd = pow(max(dot(-V, L), 0.0), 8.0) * 0.8;

  float camAlt = length(cameraPosition - center) / (uRadius * uScale);
  float inside = smoothstep(1.0, 1.25, camAlt);

  vec3 col = uColor * glow * (sunF + fwd) * uIntensity * inside;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;

const Atmosphere = memo(function Atmosphere({
  radius,
  look,
}: {
  radius: number;
  look: AtmosphereLook;
}) {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uColor: { value: new THREE.Color().setRGB(...look.color) },
        uIntensity: { value: look.intensity },
        uPower: { value: look.power },
        uLimb: { value: Math.sqrt(1 - 1 / (look.scale * look.scale)) },
        uScale: { value: look.scale },
        uRadius: { value: radius },
      },
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [look, radius]);

  useEffect(() => () => material.dispose(), [material]);

  const shellRadius = radius * look.scale;

  return (
    <mesh
      geometry={SHARED_ATMO_GEO}
      scale={shellRadius}
      material={material}
      raycast={() => null}
      renderOrder={2}
    />
  );
});

export default Atmosphere;
