// src/data/planetVisuals.ts
//
// RENDERING configuration for each body (textures, materials, atmosphere look, tilt, spin).
// This file contains no information that is displayed to the user as data.
//
// Physical values used for realism (axial tilt / sidereal rotation period) come from the
// NASA Planetary Fact Sheet: https://nssdc.gsfc.nasa.gov/planetary/factsheet/
//
// Texture maps: Solar System Scope (https://www.solarsystemscope.com/textures/), CC BY 4.0,
// based on NASA mission imagery & elevation data. Earth normal/specular maps from the
// three.js examples repository (MIT).

export type TextureTier = { low: string; high?: string };

export interface AtmosphereLook {
  /** linear RGB 0..1 */
  color: [number, number, number];
  /** halo shell scale relative to planet radius */
  scale: number;
  /** brightness of the outer halo */
  intensity: number;
  /** brightness of the scattering rim drawn on the planet disc itself */
  rim: number;
  /** falloff exponent of the halo */
  power: number;
}

export interface BodyVisual {
  map: TextureTier;
  /** Earth only */
  nightMap?: TextureTier;
  normalMap?: TextureTier;
  specularMap?: TextureTier;
  /** cloud layer (alpha mask for Earth, opaque cloud deck for Venus) */
  clouds?: TextureTier & { opaque?: boolean; altitude: number; speed: number };
  ring?: {
    map?: TextureTier;
    /** procedural narrow rings (Uranus): radii in planet radii */
    bands?: number[];
    inner: number;
    outer: number;
    opacity: number;
  };
  atmosphere?: AtmosphereLook;
  /** procedural close-range surface detail (rocky bodies) */
  detail?: { strength: number; albedo: number };
  /** subtle latitude-stretched turbulence for gas giants at close range */
  bands?: { albedo: number };
  /** use the colour map luminance as a bump map (cratered bodies) */
  selfBump?: number;
  roughness: number;
  /** axial tilt (obliquity to orbit) in degrees, NASA fact sheet */
  axialTiltDeg: number;
  /** sidereal rotation period in hours (absolute value), NASA fact sheet */
  rotationHours: number;
  /** keep the same face toward the parent (Moon) */
  tidallyLocked?: boolean;
}

const T = (name: string, high?: string): TextureTier => ({
  low: `/textures/2k/${name}`,
  high: high ? `/textures/8k/${high}` : undefined,
});

export const bodyVisuals: Record<string, BodyVisual> = {
  sun: {
    map: T('2k_sun.jpg', '8k_sun.jpg'),
    roughness: 1,
    axialTiltDeg: 7.25,
    rotationHours: 609.12,
  },
  mercury: {
    map: T('2k_mercury.jpg', '8k_mercury.jpg'),
    detail: { strength: 1.0, albedo: 0.1 },
    selfBump: 1.4,
    roughness: 0.95,
    axialTiltDeg: 0.034,
    rotationHours: 1407.6,
  },
  venus: {
    map: T('2k_venus_surface.jpg'),
    clouds: { ...T('2k_venus_atmosphere.jpg', '4k_venus_atmosphere.jpg'), opaque: true, altitude: 1.012, speed: 4 },
    atmosphere: { color: [1.0, 0.82, 0.52], scale: 1.06, intensity: 1.15, rim: 0.55, power: 2.2 },
    detail: { strength: 0.8, albedo: 0.08 },
    roughness: 0.9,
    axialTiltDeg: 177.4,
    rotationHours: 5832.5,
  },
  earth: {
    map: T('2k_earth_daymap.jpg', '8k_earth_daymap.jpg'),
    nightMap: T('2k_earth_nightmap.jpg', '8k_earth_nightmap.jpg'),
    normalMap: T('earth_normal_2048.jpg'),
    specularMap: T('earth_specular_2048.jpg'),
    clouds: { ...T('2k_earth_clouds.jpg', '8k_earth_clouds.jpg'), altitude: 1.008, speed: 1.15 },
    atmosphere: { color: [0.28, 0.55, 1.0], scale: 1.045, intensity: 1.35, rim: 0.75, power: 2.6 },
    detail: { strength: 0.35, albedo: 0.05 },
    roughness: 0.85,
    axialTiltDeg: 23.44,
    rotationHours: 23.93,
  },
  moon: {
    map: T('2k_moon.jpg', '8k_moon.jpg'),
    detail: { strength: 1.0, albedo: 0.1 },
    selfBump: 1.6,
    roughness: 0.97,
    axialTiltDeg: 6.68,
    rotationHours: 655.7,
    tidallyLocked: true,
  },
  mars: {
    map: T('2k_mars.jpg', '8k_mars.jpg'),
    atmosphere: { color: [0.95, 0.55, 0.32], scale: 1.025, intensity: 0.55, rim: 0.35, power: 3.0 },
    detail: { strength: 0.9, albedo: 0.09 },
    selfBump: 1.0,
    roughness: 0.93,
    axialTiltDeg: 25.19,
    rotationHours: 24.62,
  },
  jupiter: {
    map: T('2k_jupiter.jpg', '8k_jupiter.jpg'),
    atmosphere: { color: [0.92, 0.8, 0.62], scale: 1.03, intensity: 0.45, rim: 0.3, power: 3.0 },
    bands: { albedo: 0.05 },
    roughness: 0.85,
    axialTiltDeg: 3.13,
    rotationHours: 9.93,
  },
  saturn: {
    map: T('2k_saturn.jpg', '8k_saturn.jpg'),
    ring: { map: T('2k_saturn_ring_alpha.png', '8k_saturn_ring_alpha.png'), inner: 1.24, outer: 2.27, opacity: 1 },
    atmosphere: { color: [0.95, 0.85, 0.65], scale: 1.03, intensity: 0.4, rim: 0.3, power: 3.0 },
    bands: { albedo: 0.04 },
    roughness: 0.85,
    axialTiltDeg: 26.73,
    rotationHours: 10.66,
  },
  uranus: {
    map: T('2k_uranus.jpg'),
    // Main ring radii (6,5,4,α,β,η,γ,δ,λ,ε) in Uranus radii (25,559 km), NASA Uranian Rings Fact Sheet
    ring: { bands: [1.637, 1.652, 1.666, 1.750, 1.786, 1.846, 1.863, 1.890, 1.957, 2.001], inner: 1.6, outer: 2.05, opacity: 0.55 },
    atmosphere: { color: [0.55, 0.88, 0.95], scale: 1.04, intensity: 0.75, rim: 0.5, power: 2.6 },
    bands: { albedo: 0.02 },
    roughness: 0.8,
    axialTiltDeg: 97.77,
    rotationHours: 17.24,
  },
  neptune: {
    map: T('2k_neptune.jpg'),
    atmosphere: { color: [0.3, 0.52, 1.0], scale: 1.04, intensity: 0.8, rim: 0.5, power: 2.6 },
    bands: { albedo: 0.03 },
    roughness: 0.8,
    axialTiltDeg: 28.32,
    rotationHours: 16.11,
  },
};

/** Visual spin (rad/s): Earth turns at 0.25 rad/s, the others keep their real ratio to Earth. */
export function visualSpinRate(v: BodyVisual): number {
  const rate = 0.25 * (23.93 / v.rotationHours);
  return Math.max(0.004, Math.min(0.6, rate));
}
