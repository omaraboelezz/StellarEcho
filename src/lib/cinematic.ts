// src/lib/cinematic.ts
import * as THREE from 'three';
import type { Shot } from '../data/landmarks';

/**
 * Shared simulation state. CelestialBody multiplies its orbit + spin by `timeScale`,
 * CameraController eases it to 0 during a cinematic so the site holds still.
 */
export const sim = { timeScale: 1, targetTimeScale: 1 };

/** Converts latitude/longitude to a point on a three.js SphereGeometry (matches its UV layout). */
export function latLonToVector3(
  lat: number,
  lon: number,
  radius: number,
  out = new THREE.Vector3()
) {
  const phi = THREE.MathUtils.degToRad(lon + 180);
  const theta = THREE.MathUtils.degToRad(90 - lat);
  return out.set(
    -radius * Math.cos(phi) * Math.sin(theta),
    radius * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

const catmull = (p0: number, p1: number, p2: number, p3: number, u: number) =>
  0.5 *
  (2 * p1 +
    (-p0 + p2) * u +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u +
    (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);

export interface CamParams {
  dist: number;
  el: number;
  az: number;
  lift: number;
  fov: number;
}

/** Samples the keyframes with a Catmull-Rom spline, so the camera never stops dead between shots. */
export function sampleShots(shots: Shot[], p: number, out: CamParams): CamParams {
  const n = shots.length;
  let i = 0;
  while (i < n - 2 && p >= shots[i + 1].at) i++;
  const a = shots[i];
  const b = shots[i + 1];
  const s0 = shots[Math.max(0, i - 1)];
  const s3 = shots[Math.min(n - 1, i + 2)];
  const u = THREE.MathUtils.clamp((p - a.at) / Math.max(1e-6, b.at - a.at), 0, 1);

  const lin = (k: 'el' | 'az' | 'lift' | 'fov') => catmull(s0[k], a[k], b[k], s3[k], u);
  // distance is interpolated in log space so zooming feels even
  const dist = Math.exp(
    catmull(Math.log(s0.dist), Math.log(a.dist), Math.log(b.dist), Math.log(s3.dist), u)
  );

  out.dist = Math.max(0.03, dist);
  out.el = THREE.MathUtils.clamp(lin('el'), 0, 88);
  out.az = lin('az');
  out.lift = Math.max(0, lin('lift'));
  out.fov = THREE.MathUtils.clamp(lin('fov'), 20, 70);
  return out;
}

export const smootherstep = (x: number) => {
  const k = THREE.MathUtils.clamp(x, 0, 1);
  return k * k * k * (k * (k * 6 - 15) + 10);
};