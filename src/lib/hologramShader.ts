// src/lib/hologramShader.ts
//
// High-performance, single-pass custom GLSL shaders for the Futuristic NASA Holographic
// Equipment Visualization:
//  1. HologramBodyMaterial       - Single-pass physical-to-hologram shader combining Fresnel
//                                  rim lighting, preserved texture luminance, screen-space
//                                  derivative geometric edge + 3D wireframe lattice (zero extra
//                                  wireframe geometry or second draw call!), and vertical scanlines.
//  2. VolumetricConeMaterial     - Soft volumetric upward light cone underneath the hologram.
//  3. HologramPedestalMaterial   - High-contrast emitter base with rotating telemetry rings.
//  4. HologramScanPlaneMaterial  - Glowing horizontal laser scan plane that sweeps vertically
//                                  through the 3D equipment model during materialization & scans.

import * as THREE from 'three';

export type HologramDisplayMode = 'hologram' | 'hybrid' | 'physical';

export interface HologramUniforms {
  uTime: { value: number };
  uHoloMix: { value: number }; // 0 = physical model, 1 = hologram active
  uScanProgress: { value: number }; // 0..1.35 vertical materialization laser sweep
  uWireframeBoost: { value: number }; // 1.0 default, 0.45 in hybrid mode
  uMap: { value: THREE.Texture | null };
  uHasMap: { value: number };
  uBaseColor: { value: THREE.Color };
  uMinY: { value: number };
  uMaxY: { value: number };
  uMeshToRoot: { value: THREE.Matrix4 };
  uCyanPrimary: { value: THREE.Color };
  uBlueDeep: { value: THREE.Color };
  uWhiteCore: { value: THREE.Color };
}

const HOLO_BODY_VERTEX = /* glsl */ `
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;
  varying float vNormY;
  varying vec3 vRootPos;

  uniform float uTime;
  uniform float uHoloMix;
  uniform float uScanProgress;
  uniform float uMinY;
  uniform float uMaxY;
  uniform mat4 uMeshToRoot;

  void main() {
    vUv = uv;

    // Transform vertex into unified equipment root space so y is strictly vertical [uMinY..uMaxY]
    vec4 rootSpace = uMeshToRoot * vec4(position, 1.0);
    float span = max(0.001, uMaxY - uMinY);
    vNormY = clamp((rootSpace.y - uMinY) / span, 0.0, 1.0);
    vRootPos = rootSpace.xyz / span;

    // Subtle energy pulse along surface normal right as the materialization laser crosses
    float laserDist = abs(vNormY - uScanProgress);
    float scanPulse = smoothstep(0.085, 0.0, laserDist) * step(uScanProgress, 1.15) * uHoloMix;
    vec3 displaced = position + normal * (scanPulse * 0.01);

    vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - worldPosition.xyz);

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const HOLO_BODY_FRAGMENT = /* glsl */ `
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;
  varying float vNormY;
  varying vec3 vRootPos;

  uniform float uTime;
  uniform float uHoloMix;
  uniform float uScanProgress;
  uniform float uWireframeBoost;
  uniform sampler2D uMap;
  uniform float uHasMap;
  uniform vec3 uBaseColor;
  uniform vec3 uCyanPrimary;
  uniform vec3 uBlueDeep;
  uniform vec3 uWhiteCore;

  void main() {
    vec3 N = normalize(vWorldNormal);
    if (!gl_FrontFacing) N = -N;
    vec3 V = normalize(vViewDir);

    // 1. Sample original model diffuse texture & compute physical shading
    vec3 texRgb = uBaseColor;
    if (uHasMap > 0.5) {
      vec4 sampled = texture2D(uMap, vUv);
      texRgb = sampled.rgb * uBaseColor;
    }

    vec3 keyLightDir = normalize(vec3(0.55, 0.78, 0.42));
    vec3 fillLightDir = normalize(vec3(-0.6, 0.35, -0.5));
    float diffKey = max(dot(N, keyLightDir), 0.0);
    float diffFill = max(dot(N, fillLightDir), 0.0) * 0.35;
    float ndotv = abs(dot(N, V));
    vec3 physicalCol = texRgb * (0.36 + diffKey * 0.78 + diffFill);

    // Fast path when in physical mode (unselected on planet surface or Original 3D mode)
    if (uHoloMix <= 0.001) {
      gl_FragColor = vec4(physicalCol, 1.0);
      return;
    }

    // 2. Preserve recognizable surface details (luminance + normal contour)
    float texLum = dot(texRgb, vec3(0.299, 0.587, 0.114));
    float detailSignal = clamp(texLum * 0.85 + (1.0 - ndotv) * 0.38, 0.14, 1.0);

    // 3. Fresnel rim lighting (signature cyan-blue holographic silhouette glow)
    float fresnel = pow(1.0 - ndotv, 1.75);
    float outerRim = pow(1.0 - ndotv, 3.2);

    // 4. Single-pass Anti-Aliased Holographic Wireframe Lattice & Geometric Crease Detection
    //    Uses screen-space derivatives (fwidth) so even 500k-triangle models render crisp
    //    1px wireframe mesh lines & feature edges in ONE draw call with zero extra vertices!
    vec3 latticeCoord = vRootPos * 36.0;
    vec3 dLattice = max(fwidth(latticeCoord), vec3(0.0001));
    vec3 latticeDist = abs(fract(latticeCoord - 0.5) - 0.5) / dLattice;
    float minLattice = min(latticeDist.x, min(latticeDist.y, latticeDist.z));
    float wireLattice = 1.0 - smoothstep(0.0, 1.35, minLattice);

    // Geometric feature edges from surface normal curvature derivatives
    float normalCrease = clamp(length(fwidth(N)) * 2.2, 0.0, 1.0);
    float wireSignal = clamp(wireLattice * 0.58 + normalCrease * 0.82, 0.0, 1.0) * uWireframeBoost;

    // 5. Multi-frequency vertical scanning lines moving upward across the equipment
    float fineScan = sin(vNormY * 160.0 - uTime * 5.8) * 0.5 + 0.5;
    fineScan = smoothstep(0.22, 0.92, fineScan);

    float bandScan = sin(vNormY * 22.0 - uTime * 2.35) * 0.5 + 0.5;

    // Periodic deep-scan laser sheet sweeping from bottom (0) to top (1)
    float sweepPos = fract(uTime * 0.28);
    float sweepBeam = smoothstep(0.085, 0.0, abs(vNormY - sweepPos));
    float sweepTrail = smoothstep(0.22, 0.0, sweepPos - vNormY) * step(vNormY, sweepPos) * 0.36;

    // 6. Subtle, organic holographic energy flicker
    float flicker = 0.94 + 0.06 * sin(uTime * 16.0 + sin(uTime * 6.3) * 2.5);

    // 7. Compose holographic color + wireframe overlay
    vec3 holoCore = mix(uBlueDeep, uCyanPrimary, clamp(detailSignal * 0.72 + bandScan * 0.28, 0.0, 1.0));
    vec3 holoCol = holoCore * (0.5 + detailSignal * 0.65);

    // Layer in fine raster scanlines, wireframe lattice, Fresnel rim, and traveling deep-scan beam
    holoCol += uCyanPrimary * (fresnel * 1.3 + fineScan * 0.24 + wireSignal * 0.88 + sweepTrail);
    holoCol += uWhiteCore * (outerRim * 0.72 + sweepBeam * 0.96 + wireSignal * sweepBeam * 0.75);
    holoCol *= flicker;

    // In Hybrid mode (uWireframeBoost < 0.6), blend 38% of original physical color into hologram
    if (uWireframeBoost < 0.6) {
      holoCol = mix(holoCol, physicalCol * 0.82 + uCyanPrimary * 0.35, 0.38);
    }

    // 8. Activation Materialization Scan Wave (sweeps bottom-to-top when selected)
    float scanFront = smoothstep(uScanProgress - 0.05, uScanProgress + 0.02, vNormY);
    float laserLine = smoothstep(0.068, 0.0, abs(vNormY - uScanProgress)) * step(uScanProgress, 1.18);

    // Hologram opacity: semi-transparent interior (~0.48), strong glowing edges, wireframe & scanbeams (~0.96)
    float holoAlpha = clamp(
      0.44 + fresnel * 0.44 + wireSignal * 0.32 + fineScan * 0.08 + sweepBeam * 0.34 + laserLine * 0.55,
      0.38,
      0.96
    );

    // Blend between physical model (before scan wave passes) and materialized hologram (after scan wave passes)
    float effectiveHolo = uHoloMix * (1.0 - scanFront * 0.88);
    vec3 finalCol = mix(physicalCol, holoCol, effectiveHolo);
    finalCol += (uCyanPrimary * 0.95 + uWhiteCore * 1.2) * laserLine * uHoloMix;

    float finalAlpha = mix(1.0, holoAlpha, effectiveHolo);

    gl_FragColor = vec4(finalCol, finalAlpha);
  }
`;

export function createHologramBodyMaterial(
  map: THREE.Texture | null,
  baseColor: THREE.Color,
  minY: number,
  maxY: number,
  meshToRoot: THREE.Matrix4
): THREE.ShaderMaterial {
  const uniforms: HologramUniforms = {
    uTime: { value: 0 },
    uHoloMix: { value: 0 },
    uScanProgress: { value: 0 },
    uWireframeBoost: { value: 1.0 },
    uMap: { value: map },
    uHasMap: { value: map ? 1.0 : 0.0 },
    uBaseColor: { value: baseColor.clone() },
    uMinY: { value: minY },
    uMaxY: { value: maxY },
    uMeshToRoot: { value: meshToRoot.clone() },
    uCyanPrimary: { value: new THREE.Color('#00f0ff') },
    uBlueDeep: { value: new THREE.Color('#0058d6') },
    uWhiteCore: { value: new THREE.Color('#dffbff') },
  };

  return new THREE.ShaderMaterial({
    uniforms: uniforms as unknown as Record<string, THREE.IUniform>,
    vertexShader: HOLO_BODY_VERTEX,
    fragmentShader: HOLO_BODY_FRAGMENT,
    transparent: true,
    depthWrite: true,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
}

// ---------------------------------------------------------------------------------------------
// Horizontal Laser Scan Plane Disc Shader (glides vertically across the 3D model during scans)
// ---------------------------------------------------------------------------------------------
const SCAN_PLANE_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SCAN_PLANE_FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uColorCyan;

  void main() {
    if (uOpacity <= 0.01) discard;
    float r = length(vUv);
    if (r > 1.0) discard;

    // Fine holographic Cartesian grid inside the scan disc
    vec2 grid = abs(fract(vUv * 12.0 - 0.5) - 0.5) / 0.06;
    float gridLine = 1.0 - min(min(grid.x, grid.y), 1.0);

    float outerRing = smoothstep(0.04, 0.0, abs(r - 0.92));
    float innerRing = smoothstep(0.025, 0.0, abs(r - 0.55));
    float radialFade = smoothstep(1.0, 0.2, r);

    float pattern = outerRing * 0.95 + innerRing * 0.55 + gridLine * radialFade * 0.45 + radialFade * 0.18;
    vec3 col = mix(uColorCyan, vec3(0.9, 1.0, 1.0), outerRing * 0.7 + gridLine * 0.3);

    gl_FragColor = vec4(col, clamp(pattern * uOpacity, 0.0, 0.85));
  }
`;

export function createHologramScanPlaneMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uColorCyan: { value: new THREE.Color('#00f5ff') },
    },
    vertexShader: SCAN_PLANE_VERTEX,
    fragmentShader: SCAN_PLANE_FRAGMENT,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
}

// ---------------------------------------------------------------------------------------------
// Volumetric Upward Projection Cone Shader (underneath the hologram)
// ---------------------------------------------------------------------------------------------
const VOLUMETRIC_CONE_VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalView;
  varying vec3 vViewPosition;

  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    vNormalView = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const VOLUMETRIC_CONE_FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalView;
  varying vec3 vViewPosition;

  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uColorCyan;
  uniform vec3 uColorBlue;

  void main() {
    if (uIntensity <= 0.01) discard;

    // Soft radial edge feathering so the cone looks like a soft volumetric light beam
    vec3 V = normalize(vViewPosition);
    float edgeSoftness = pow(abs(dot(normalize(vNormalView), V)), 1.35);

    // Vertical falloff: brightest at the projector base (vUv.y = 0), fading softly upward (vUv.y = 1)
    float verticalFade = pow(1.0 - clamp(vUv.y, 0.0, 1.0), 1.55);

    // Animated upward-streaming projection rays & scan ripples
    float angle = vUv.x * 6.2831853;
    float rays = sin(angle * 14.0 + uTime * 1.4) * 0.5 + 0.5;
    float rays2 = sin(angle * 7.0 - uTime * 0.9) * 0.5 + 0.5;
    float upwardWave = sin(vUv.y * 28.0 - uTime * 4.5) * 0.5 + 0.5;

    float beamPattern = 0.58 + rays * 0.25 + rays2 * 0.12 + upwardWave * 0.14;
    vec3 col = mix(uColorBlue, uColorCyan, (1.0 - vUv.y) * 0.72 + upwardWave * 0.28);

    float alpha = verticalFade * (0.32 + edgeSoftness * 0.68) * beamPattern * 0.52 * uIntensity;
    gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.88));
  }
`;

export function createVolumetricConeMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uColorCyan: { value: new THREE.Color('#00f2ff') },
      uColorBlue: { value: new THREE.Color('#0062ff') },
    },
    vertexShader: VOLUMETRIC_CONE_VERTEX,
    fragmentShader: VOLUMETRIC_CONE_FRAGMENT,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
}

// ---------------------------------------------------------------------------------------------
// Holographic Emitter Pedestal Disc Shader (Concentric rings + telemetry ticks + dark contrast well)
// ---------------------------------------------------------------------------------------------
const PEDESTAL_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0; // -1..1
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const PEDESTAL_FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uColorCyan;
  uniform vec3 uColorBlue;

  void main() {
    float r = length(vUv);
    if (r > 1.0) discard;

    float angle = atan(vUv.y, vUv.x);

    // 1. Soft dark contrast well underneath the hologram so bright sunlit planetary surfaces
    //    never wash out the cyan holographic glow
    float darkWell = smoothstep(1.0, 0.16, r) * 0.82 * clamp(uIntensity, 0.25, 1.0);

    // 2. Central glowing emitter core lens
    float coreGlow = exp(-r * r * 13.0) * 0.98;

    // 3. Concentric holographic rings
    float ringInner = smoothstep(0.022, 0.0, abs(r - 0.28));
    float ringMid = smoothstep(0.018, 0.0, abs(r - 0.52));
    float ringOuter = smoothstep(0.016, 0.0, abs(r - 0.78));

    // 4. Rotating radar segments & degree ticks
    float seg1 = step(0.15, sin(angle * 8.0 + uTime * 1.4));
    float seg2 = step(0.0, sin(angle * 24.0 - uTime * 0.9));
    float tickBand = smoothstep(0.045, 0.0, abs(r - 0.65)) * step(0.65, sin(angle * 36.0 + uTime * 0.6));

    // Radial energy pulse expanding from center
    float pulseR = fract(uTime * 0.45) * 0.88;
    float pulseRing = smoothstep(0.04, 0.0, abs(r - pulseR)) * (1.0 - pulseR);

    float holoPattern =
      coreGlow +
      ringInner * 0.88 +
      ringMid * seg1 * 0.92 +
      ringOuter * seg2 * 0.78 +
      tickBand * 0.68 +
      pulseRing * 0.58;

    vec3 emitterCol = mix(uColorBlue, uColorCyan, clamp(coreGlow + ringInner + pulseRing, 0.0, 1.0));
    emitterCol += vec3(0.85, 0.98, 1.0) * (coreGlow * 0.68 + ringInner * 0.38);

    // Combine dark contrast well with bright cyan emitter pattern
    vec3 darkBg = vec3(0.006, 0.022, 0.058);
    float glowStrength = clamp(holoPattern * uIntensity, 0.0, 1.0);
    vec3 finalCol = mix(darkBg, emitterCol, glowStrength);
    float finalAlpha = clamp(max(darkWell, glowStrength * 0.96), 0.0, 0.96);

    gl_FragColor = vec4(finalCol, finalAlpha);
  }
`;

export function createHologramPedestalMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 0.35 },
      uColorCyan: { value: new THREE.Color('#00f2ff') },
      uColorBlue: { value: new THREE.Color('#0066ff') },
    },
    vertexShader: PEDESTAL_VERTEX,
    fragmentShader: PEDESTAL_FRAGMENT,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
}
