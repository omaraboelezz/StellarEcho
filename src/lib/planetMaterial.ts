// src/lib/planetMaterial.ts
//
// Builds a MeshStandardMaterial (physically based) per body and extends it with small,
// optional shader features:
//
//  PLANET_DETAIL      procedural multi-octave surface relief + albedo variation that fades in
//                     progressively as the camera approaches (a "detail texture" LOD), so rocky
//                     surfaces stay sharp far beyond the resolution of any texture map.
//  PLANET_BANDS       fine latitude-stretched turbulence for gas giants at close range.
//  PLANET_ATMO        atmospheric scattering rim on the lit limb of the disc.
//  PLANET_NIGHT       Earth city lights that only appear on the night side.
//  PLANET_OCEAN       specular map -> glossy oceans, rough continents (sun glint).
//  PLANET_RING_SHADOW Saturn's rings casting their shadow on the planet.
import * as THREE from 'three';
import type { BodyVisual } from '../data/planetVisuals';
import { SIMPLEX_NOISE_GLSL } from './shaders/noise';

export interface PlanetUniforms {
  uRadius: { value: number };
  uDetailStrength: { value: number };
  uDetailAlbedo: { value: number };
  uBandsAlbedo: { value: number };
  uAtmColor: { value: THREE.Color };
  uAtmRim: { value: number };
  uRingMap: { value: THREE.Texture | null };
  uRingInner: { value: number };
  uRingOuter: { value: number };
  uRingNormal: { value: THREE.Vector3 };
  uPlanetCenter: { value: THREE.Vector3 };
}

const DECLARATIONS = /* glsl */ `
varying vec3 vPObjPos;
varying vec3 vPWorldPos;
varying vec3 vPTanView1;
varying vec3 vPTanView2;
uniform float uRadius;
uniform float uDetailStrength;
uniform float uDetailAlbedo;
uniform float uBandsAlbedo;
uniform vec3 uAtmColor;
uniform float uAtmRim;
uniform sampler2D uRingMap;
uniform float uRingInner;
uniform float uRingOuter;
uniform vec3 uRingNormal;
uniform vec3 uPlanetCenter;

${SIMPLEX_NOISE_GLSL}

// direction to the Sun (at the world origin) in view space
vec3 pSunDirView() {
  vec3 s = (viewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  return normalize(s + vViewPosition);
}

// Smooth multi-octave surface detail. Only fades in when the camera is close to the surface,
// so distant / overview views have zero noise evaluation cost and zero aliasing.
float pDetailSample(vec3 p, float closeFactor) {
  if (closeFactor <= 0.001) return 0.0;
  float n1 = pn_snoise(p * 32.0);
  float n2 = pn_snoise(p * 96.0 + 17.3) * 0.5;
  float n3 = pn_snoise(p * 256.0 + 41.7) * 0.25 * smoothstep(0.35, 1.0, closeFactor);
  return (n1 + n2 + n3) * closeFactor;
}
`;

export function createPlanetMaterial(visual: BodyVisual, radius: number) {
  const uniforms: PlanetUniforms = {
    uRadius: { value: radius },
    uDetailStrength: { value: (visual.detail?.strength ?? 0) * 0.12 },
    uDetailAlbedo: { value: visual.detail?.albedo ?? 0 },
    uBandsAlbedo: { value: visual.bands?.albedo ?? 0 },
    uAtmColor: { value: new THREE.Color().setRGB(...(visual.atmosphere?.color ?? [0, 0, 0])) },
    uAtmRim: { value: visual.atmosphere?.rim ?? 0 },
    uRingMap: { value: null },
    uRingInner: { value: visual.ring?.inner ?? 0 },
    uRingOuter: { value: visual.ring?.outer ?? 0 },
    uRingNormal: { value: new THREE.Vector3(0, 1, 0) },
    uPlanetCenter: { value: new THREE.Vector3() },
  };

  const material = new THREE.MeshStandardMaterial({
    roughness: visual.roughness,
    metalness: 0,
  });

  const defines: Record<string, string> = {};
  if (visual.detail) defines.PLANET_DETAIL = '';
  if (visual.bands) defines.PLANET_BANDS = '';
  if (visual.atmosphere) defines.PLANET_ATMO = '';
  if (visual.nightMap) defines.PLANET_NIGHT = '';
  if (visual.specularMap) defines.PLANET_OCEAN = '';
  if (visual.ring?.map) defines.PLANET_RING_SHADOW = '';
  material.defines = defines;

  if (visual.nightMap) {
    material.emissive = new THREE.Color(1.0, 0.86, 0.62);
    material.emissiveIntensity = 1.6;
  }
  if (visual.normalMap) material.normalScale = new THREE.Vector2(0.85, 0.85);

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vPObjPos;\nvarying vec3 vPWorldPos;\nvarying vec3 vPTanView1;\nvarying vec3 vPTanView2;'
      )
      .replace(
        '#include <project_vertex>',
        /* glsl */ `#include <project_vertex>
        vPObjPos = transformed;
        vPWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
        vec3 pUnitV = normalize(transformed);
        vec3 upRefV = abs(pUnitV.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
        vec3 t1V = normalize(cross(upRefV, pUnitV));
        vec3 t2V = cross(pUnitV, t1V);
        vPTanView1 = normalize(normalMatrix * t1V);
        vPTanView2 = normalize(normalMatrix * t2V);`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace('#include <clipping_planes_pars_fragment>', '#include <clipping_planes_pars_fragment>\n' + DECLARATIONS)
      .replace(
        '#include <map_fragment>',
        /* glsl */ `#include <map_fragment>
        float pCloseFactor = clamp(1.8 - length(vViewPosition) / (uRadius * 2.4), 0.0, 1.0);
        #ifdef PLANET_DETAIL
        if (pCloseFactor > 0.001) {
          vec3 pUnit = normalize(vPObjPos);
          float dVal = pDetailSample(pUnit, pCloseFactor);
          diffuseColor.rgb *= clamp(1.0 + dVal * uDetailAlbedo * 0.9, 0.78, 1.22);
        }
        #endif
        #ifdef PLANET_BANDS
        if (pCloseFactor > 0.001) {
          vec3 bp = normalize(vPObjPos);
          float bn = pn_snoise(bp * vec3(28.0, 160.0, 28.0)) * pCloseFactor;
          diffuseColor.rgb *= 1.0 + bn * uBandsAlbedo * 1.4;
        }
        #endif`
      )
      .replace(
        '#include <normal_fragment_maps>',
        /* glsl */ `#include <normal_fragment_maps>
        #ifdef PLANET_DETAIL
        if (pCloseFactor > 0.001 && uDetailStrength > 0.0) {
          // Analytic object-space tangent finite difference using vertex-interpolated view tangents
          vec3 pUnit = normalize(vPObjPos);
          vec3 upRef = abs(pUnit.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
          vec3 t1 = normalize(cross(upRef, pUnit));
          vec3 t2 = cross(pUnit, t1);
          float eps = 0.0025;
          float h0 = pDetailSample(pUnit, pCloseFactor);
          float h1 = pDetailSample(normalize(pUnit + t1 * eps), pCloseFactor);
          float h2 = pDetailSample(normalize(pUnit + t2 * eps), pCloseFactor);
          normal = normalize(normal - (normalize(vPTanView1) * (h1 - h0) + normalize(vPTanView2) * (h2 - h0)) * uDetailStrength * 18.0);
        }
        #endif`
      )
      .replace(
        '#include <roughnessmap_fragment>',
        /* glsl */ `float roughnessFactor = roughness;
        #ifdef USE_ROUGHNESSMAP
          vec4 texelRoughness = texture2D(roughnessMap, vRoughnessMapUv);
          #ifdef PLANET_OCEAN
            roughnessFactor = mix(roughness, 0.3, texelRoughness.g);
          #else
            roughnessFactor *= texelRoughness.g;
          #endif
        #endif`
      )
      .replace(
        '#include <emissivemap_fragment>',
        /* glsl */ `#include <emissivemap_fragment>
        #ifdef PLANET_NIGHT
        {
          float ndl = dot(normalize(vNormal), pSunDirView());
          totalEmissiveRadiance *= 1.0 - smoothstep(-0.12, 0.2, ndl);
        }
        #endif`
      )
      .replace(
        '#include <opaque_fragment>',
        /* glsl */ `
        #ifdef PLANET_RING_SHADOW
        {
          vec3 P = vPWorldPos;
          vec3 d = normalize(-P);
          float denom = dot(d, uRingNormal);
          if (abs(denom) > 1e-4) {
            float t = dot(uPlanetCenter - P, uRingNormal) / denom;
            if (t > 0.0) {
              float r = length(P + d * t - uPlanetCenter) / uRadius;
              float u = (r - uRingInner) / (uRingOuter - uRingInner);
              if (u > 0.0 && u < 1.0) {
                float a = texture2D(uRingMap, vec2(u, 0.5)).a;
                outgoingLight *= 1.0 - a * 0.75;
              }
            }
          }
        }
        #endif
        #ifdef PLANET_ATMO
        {
          vec3 Nv = normalize(vNormal);
          vec3 Vv = normalize(vViewPosition);
          float fres = pow(1.0 - clamp(dot(Nv, Vv), 0.0, 1.0), 3.0);
          float day = smoothstep(-0.25, 0.6, dot(Nv, pSunDirView()));
          outgoingLight += uAtmColor * fres * day * uAtmRim;
        }
        #endif
        #include <opaque_fragment>`
      );
  };

  return { material, uniforms };
}
