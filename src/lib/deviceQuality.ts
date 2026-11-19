// src/lib/deviceQuality.ts
// Adaptive rendering quality profile based on device hardware, viewport, network, and motion preferences.

export type QualityTier = 'low' | 'medium' | 'high';

export interface DeviceQualityProfile {
  tier: QualityTier;
  isMobile: boolean;
  isTouchDevice: boolean;
  prefersReducedMotion: boolean;
  saveData: boolean;
  dpr: [number, number];
  antialias: boolean;
  maxAnisotropy: number;
  starCount: number;
  planetSegments: [number, number];
  sunSegments: [number, number];
  cloudSegments: [number, number];
  ringSegments: number;
  orbitPoints: { planet: number; moon: number };
  sparkleCount: { holo: number; cinematic: number };
  skyboxMaxWidth: number;
  allowHighResTextures: boolean;
  allowHoverPreload: boolean;
}

interface NavigatorWithHints extends Navigator {
  deviceMemory?: number;
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
}

let cachedProfile: DeviceQualityProfile | null = null;

export function detectWebGLSupport(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: false }) ||
      canvas.getContext('webgl', { failIfMajorPerformanceCaveat: false }) ||
      canvas.getContext('experimental-webgl');
    return Boolean(gl);
  } catch {
    return false;
  }
}

export function getDeviceQualityProfile(): DeviceQualityProfile {
  if (cachedProfile) return cachedProfile;

  if (typeof window === 'undefined') {
    cachedProfile = buildProfile('high', false, false, false, false);
    return cachedProfile;
  }

  const nav = navigator as NavigatorWithHints;
  const width = window.innerWidth;
  const isTouchDevice =
    window.matchMedia?.('(pointer: coarse)').matches ||
    'ontouchstart' in window ||
    (nav.maxTouchPoints ?? 0) > 0;
  const isMobile = width <= 820 || (isTouchDevice && width <= 1024);
  const prefersReducedMotion = Boolean(
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );

  const conn = nav.connection;
  const saveData = Boolean(
    conn?.saveData || conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g'
  );

  const cores = nav.hardwareConcurrency ?? 4;
  const memoryGb = nav.deviceMemory ?? 4;

  let tier: QualityTier = 'high';
  if (saveData || cores <= 2 || memoryGb <= 2 || (isMobile && (cores <= 4 || memoryGb <= 3))) {
    tier = 'low';
  } else if (isMobile || cores <= 4 || memoryGb <= 4 || prefersReducedMotion) {
    tier = 'medium';
  }

  cachedProfile = buildProfile(tier, isMobile, isTouchDevice, prefersReducedMotion, saveData);
  return cachedProfile;
}

function buildProfile(
  tier: QualityTier,
  isMobile: boolean,
  isTouchDevice: boolean,
  prefersReducedMotion: boolean,
  saveData: boolean
): DeviceQualityProfile {
  if (tier === 'low') {
    return {
      tier,
      isMobile,
      isTouchDevice,
      prefersReducedMotion,
      saveData,
      dpr: [1, 1],
      antialias: false,
      maxAnisotropy: 2,
      starCount: 900,
      planetSegments: [48, 24],
      sunSegments: [40, 20],
      cloudSegments: [32, 16],
      ringSegments: 64,
      orbitPoints: { planet: 160, moon: 96 },
      sparkleCount: { holo: 10, cinematic: 12 },
      skyboxMaxWidth: 1024,
      allowHighResTextures: false,
      allowHoverPreload: false,
    };
  }

  if (tier === 'medium') {
    return {
      tier,
      isMobile,
      isTouchDevice,
      prefersReducedMotion,
      saveData,
      dpr: [1, 1.35],
      antialias: true,
      maxAnisotropy: 4,
      starCount: 1500,
      planetSegments: [64, 32],
      sunSegments: [56, 28],
      cloudSegments: [48, 24],
      ringSegments: 88,
      orbitPoints: { planet: 256, moon: 128 },
      sparkleCount: { holo: 18, cinematic: 20 },
      skyboxMaxWidth: 2048,
      allowHighResTextures: !isMobile && !saveData,
      allowHoverPreload: !isMobile && !isTouchDevice && !saveData,
    };
  }

  return {
    tier,
    isMobile,
    isTouchDevice,
    prefersReducedMotion,
    saveData,
    dpr: [1, 1.75],
    antialias: true,
    maxAnisotropy: 16,
    starCount: 2800,
    planetSegments: [96, 48],
    sunSegments: [80, 40],
    cloudSegments: [64, 32],
    ringSegments: 128,
    orbitPoints: { planet: 512, moon: 192 },
    sparkleCount: { holo: 28, cinematic: 32 },
    skyboxMaxWidth: 0,
    allowHighResTextures: true,
    allowHoverPreload: true,
  };
}
