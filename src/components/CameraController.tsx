// src/components/CameraController.tsx
//
// Four seamless camera modes:
//  1. overview  - nothing selected. Camera flies to a wide shot, then the user is free.
//  2. body      - a planet is selected. Camera flies to a sun-lit three-quarter angle in the
//                 planet's moving reference frame (zero orbital lag).
//  3. hologram  - an equipment item (inspectedLandmarkId) is selected. Camera flies smoothly
//                 down to a prominent hero close-up of the 3D holographic equipment on the
//                 surface, aligns camera.up with the local surface normal, centers OrbitControls
//                 on the 3D hologram (with frustum view-offset so it sits beside the Hologram
//                 Info Panel), and enables smooth 360° rotation and zoom inspection.
//  4. cinematic - a landmark story timeline is playing. Camera is driven by keyframed shots +
//                 narration progress.

import { useEffect, useRef, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';
import { celestialBodies } from '../data/planets';
import { getLandmark, DEFAULT_SHOTS } from '../data/landmarks';
import { sim, sampleShots, smootherstep, type CamParams } from '../lib/cinematic';
import type { CinematicTimeline } from '../lib/CinematicTimeline';

interface CameraControllerProps {
  selectedBodyId: string | null;
  inspectedLandmarkId?: string | null;
  activeLandmarkId: string | null;
  timeline: CinematicTimeline;
}

const UP = new THREE.Vector3(0, 1, 0);
const OVERVIEW_OFFSET = new THREE.Vector3(0, 38, 78);
const FLY_SECONDS = 1.45;
const DEFAULT_FOV = 45;
const DEFAULT_NEAR = 0.001;

/**
 * Synchronizes OrbitControls' internal spherical-axis quaternion with the current camera.up
 * vector so orbiting around a tilted planetary surface normal is 100% smooth and jump-free.
 */
function syncControlsUpAxis(controls: OrbitControls, upVec: THREE.Vector3) {
  const internal = controls as unknown as {
    _quat?: THREE.Quaternion;
    _quatInverse?: THREE.Quaternion;
  };
  if (internal._quat && internal._quatInverse) {
    internal._quat.setFromUnitVectors(upVec, UP);
    internal._quatInverse.copy(internal._quat).invert();
  }
}

export default function CameraController({
  selectedBodyId,
  inspectedLandmarkId = null,
  activeLandmarkId,
  timeline,
}: CameraControllerProps) {
  const { camera, gl, scene, size: viewportSize } = useThree();
  const controlsRef = useRef<OrbitControls | null>(null);

  // flight progress 0..1 (1 = flight finished, user is in free control)
  const flight = useRef(0);
  const flightNeedsInit = useRef(true);
  const blend = useRef(1); // 0..1 blend from the free camera into the first cinematic shot
  const viewOffsetX = useRef(0);
  const viewOffsetY = useRef(0);

  const prev = useRef<{ body: string | null; inspected: string | null; landmark: string | null }>({
    body: selectedBodyId,
    inspected: inspectedLandmarkId,
    landmark: activeLandmarkId,
  });

  // Instantiate OrbitControls directly so controls.update() runs once per frame AFTER planets
  // and camera offsets have updated.
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.maxDistance = 320;
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };

    const onStart = () => {
      // As soon as the user grabs the camera manually, end the automatic fly-to cleanly
      if (flight.current < 1) {
        flight.current = 1;
        syncControlsUpAxis(controls, camera.up);
      }
    };
    controls.addEventListener('start', onStart);
    controlsRef.current = controls;

    return () => {
      controls.removeEventListener('start', onStart);
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl.domElement]);

  const t = useMemo(
    () => ({
      focus: new THREE.Vector3(),
      lastFocus: new THREE.Vector3(),
      startCamOffset: new THREE.Vector3(0, 20, 50),
      startTargetOffset: new THREE.Vector3(),
      startUp: new THREE.Vector3(0, 1, 0),
      desiredUp: new THREE.Vector3(0, 1, 0),
      desiredOffset: new THREE.Vector3().copy(OVERVIEW_OFFSET),
      curCamOffset: new THREE.Vector3(),
      sunDir: new THREE.Vector3(),
      sideDir: new THREE.Vector3(),
      move: new THREE.Vector3(),
      startPos: new THREE.Vector3(),
      startTarget: new THREE.Vector3(),
      site: new THREE.Vector3(),
      normal: new THREE.Vector3(),
      look: new THREE.Vector3(),
      offset: new THREE.Vector3(),
      localHeroOffset: new THREE.Vector3(),
      q: new THREE.Quaternion(),
      params: { dist: 1, el: 0, az: 0, lift: 0, fov: DEFAULT_FOV } as CamParams,
    }),
    []
  );

  useFrame((_state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const controls = controlsRef.current;
    const pc = camera as THREE.PerspectiveCamera;
    const landmark = activeLandmarkId ? getLandmark(activeLandmarkId) : undefined;
    const inspectedLandmark =
      inspectedLandmarkId && !activeLandmarkId ? getLandmark(inspectedLandmarkId) : undefined;

    // ---- detect state transitions (done here so there is never a 1-frame jump) ----
    if (prev.current.body !== selectedBodyId) {
      prev.current.body = selectedBodyId;
      prev.current.inspected = inspectedLandmarkId;
      flight.current = 0;
      flightNeedsInit.current = true;
    } else if (prev.current.inspected !== inspectedLandmarkId) {
      prev.current.inspected = inspectedLandmarkId;
      if (!activeLandmarkId) {
        flight.current = 0;
        flightNeedsInit.current = true;
      }
    }

    if (prev.current.landmark !== activeLandmarkId) {
      prev.current.landmark = activeLandmarkId;
      if (activeLandmarkId) {
        // entering a cinematic
        blend.current = 0;
        t.startPos.copy(camera.position);
        if (controls) t.startTarget.copy(controls.target);
        else t.startTarget.set(0, 0, 0);
        if (controls) {
          controls.enabled = false;
          controls.autoRotate = false;
        }
      } else {
        // leaving a cinematic: transition smoothly back to current selection
        pc.fov = DEFAULT_FOV;
        pc.near = DEFAULT_NEAR;
        pc.updateProjectionMatrix();
        if (controls) controls.enabled = true;
        flight.current = 0;
        flightNeedsInit.current = true;
      }
    }

    // ---- Smoothly update frustum viewOffset so the 3D hologram sits in a prominent position
    //      beside the Holographic Information Panel without affecting 360° OrbitControls pivot ----
    const isDesktop = viewportSize.width > 900;
    const targetOffsetX = inspectedLandmark
      ? isDesktop
        ? viewportSize.width * 0.145
        : 0
      : 0;
    const targetOffsetY = inspectedLandmark
      ? !isDesktop
        ? viewportSize.height * 0.11
        : 0
      : 0;

    viewOffsetX.current = THREE.MathUtils.damp(viewOffsetX.current, targetOffsetX, 7.5, dt);
    viewOffsetY.current = THREE.MathUtils.damp(viewOffsetY.current, targetOffsetY, 7.5, dt);

    if (Math.abs(viewOffsetX.current) > 0.4 || Math.abs(viewOffsetY.current) > 0.4) {
      pc.setViewOffset(
        viewportSize.width,
        viewportSize.height,
        viewOffsetX.current,
        viewOffsetY.current,
        viewportSize.width,
        viewportSize.height
      );
    } else if (pc.view && pc.view.enabled) {
      pc.clearViewOffset();
    }

    // ---- simulation clock: freeze during cinematic, slow down gently during hologram inspection ----
    const targetSimSpeed = landmark ? 0 : inspectedLandmark ? sim.targetTimeScale * 0.25 : sim.targetTimeScale;
    sim.timeScale = THREE.MathUtils.damp(sim.timeScale, targetSimSpeed, 3.5, dt);
    if (landmark && sim.timeScale < 0.002) sim.timeScale = 0;

    // drives narration progress (0..1)
    timeline.update(dt);

    // =====================  1. CINEMATIC TIMELINE MODE  =====================
    if (landmark) {
      const anchor = scene.getObjectByName(`anchor-${landmark.id}`);
      if (!anchor) return;

      anchor.updateWorldMatrix(true, false);
      const R = celestialBodies[landmark.bodyId]?.size ?? 1;

      anchor.getWorldPosition(t.site);
      anchor.getWorldQuaternion(t.q);
      t.normal.copy(UP).applyQuaternion(t.q);

      sampleShots(landmark.shots ?? DEFAULT_SHOTS, timeline.progress, t.params);
      const p = t.params;

      const el = THREE.MathUtils.degToRad(Math.max(p.el, 3));
      const az = THREE.MathUtils.degToRad(p.az);
      const d = p.dist * R;
      const h = d * Math.sin(el);

      t.look.copy(t.site).addScaledVector(t.normal, p.lift * R);
      t.offset.set(Math.sin(az) * h, Math.cos(el) * d, Math.cos(az) * h).applyQuaternion(t.q);
      t.curCamOffset.copy(t.look).add(t.offset);

      blend.current = Math.min(1, blend.current + dt / 1.6);
      const w = smootherstep(blend.current);

      if (w < 1) {
        camera.position.lerpVectors(t.startPos, t.curCamOffset, w);
        t.look.lerpVectors(t.startTarget, t.look, w);
        camera.up.copy(UP).lerp(t.normal, w).normalize();
      } else {
        camera.position.copy(t.curCamOffset);
        camera.up.copy(t.normal);
      }

      pc.fov = THREE.MathUtils.lerp(DEFAULT_FOV, p.fov, w);
      pc.near = Math.max(0.0005, R * 0.0015);
      pc.updateProjectionMatrix();
      camera.lookAt(t.look);

      if (controls) controls.target.copy(t.look);
      t.lastFocus.copy(t.look);
      return;
    }

    // =====================  2. HOLOGRAM INSPECTION / PLANET / OVERVIEW  =====================
    const body = selectedBodyId ? celestialBodies[selectedBodyId] : null;
    const size = body?.size ?? 1;

    // Resolve the current 3D focus point:
    // - If inspecting a piece of equipment (`inspectedLandmark`), focus directly on the 3D hologram center!
    // - Otherwise, if a planet is selected, focus on the planet center.
    // - Otherwise, focus on the Solar System origin (0, 0, 0).
    let inspectedAnchor: THREE.Object3D | null = null;
    let holoScale = size * 0.1;

    if (inspectedLandmark) {
      inspectedAnchor = scene.getObjectByName(`anchor-${inspectedLandmark.id}`) ?? null;
      holoScale = size * inspectedLandmark.modelScale * 2.54;
    }

    if (inspectedAnchor && inspectedLandmark) {
      inspectedAnchor.updateWorldMatrix(true, false);
      inspectedAnchor.getWorldPosition(t.site);
      inspectedAnchor.getWorldQuaternion(t.q);
      t.normal.copy(UP).applyQuaternion(t.q).normalize();
      // Target the vertical center of the levitating 3D holographic model
      t.focus.copy(t.site).addScaledVector(t.normal, holoScale * 0.44);
    } else if (selectedBodyId) {
      const obj = scene.getObjectByName(selectedBodyId);
      if (obj) {
        obj.updateWorldMatrix(true, false);
        obj.getWorldPosition(t.focus);
      }
    } else {
      t.focus.set(0, 0, 0);
    }

    // Capture start and destination offsets in the target's local frame on the first frame of flight
    if (flightNeedsInit.current) {
      flightNeedsInit.current = false;
      t.startCamOffset.copy(camera.position).sub(t.focus);
      t.startUp.copy(camera.up);

      if (controls) {
        t.startTargetOffset.copy(controls.target).sub(t.focus);
      } else {
        t.startTargetOffset.set(0, 0, 0);
      }

      if (inspectedAnchor && inspectedLandmark) {
        // Prominent close-up three-quarter hero shot of the 3D holographic equipment
        t.desiredUp.copy(t.normal);
        const heroDist = holoScale * (isDesktop ? 2.25 : 2.55);
        const elevRad = THREE.MathUtils.degToRad(24);
        const azimRad = THREE.MathUtils.degToRad(32);
        const horiz = heroDist * Math.cos(elevRad);

        t.localHeroOffset
          .set(Math.sin(azimRad) * horiz, heroDist * Math.sin(elevRad), Math.cos(azimRad) * horiz)
          .applyQuaternion(t.q);

        t.desiredOffset.copy(t.localHeroOffset);
      } else if (selectedBodyId) {
        t.desiredUp.copy(UP);
        const aspectScale =
          viewportSize.width < viewportSize.height
            ? THREE.MathUtils.clamp(viewportSize.height / Math.max(1, viewportSize.width) * 0.72, 1, 1.35)
            : 1;
        const distance = size * 3.4 * aspectScale;
        if (t.focus.lengthSq() > 0.01) {
          t.sunDir.copy(t.focus).negate().normalize();
          t.sideDir.crossVectors(UP, t.sunDir).normalize();
          t.desiredOffset
            .set(0, 0, 0)
            .addScaledVector(t.sunDir, distance * 0.68)
            .addScaledVector(t.sideDir, distance * 0.68)
            .addScaledVector(UP, distance * 0.25);
        } else {
          t.desiredOffset.set(0, distance * 0.28, distance);
        }
      } else {
        t.desiredUp.copy(UP);
        const portraitBoost =
          viewportSize.width < viewportSize.height
            ? THREE.MathUtils.clamp((viewportSize.height / Math.max(1, viewportSize.width)) * 0.78, 1, 1.45)
            : 1;
        t.desiredOffset.copy(OVERVIEW_OFFSET).multiplyScalar(portraitBoost);
      }

      if (pc.near !== DEFAULT_NEAR) {
        pc.near = DEFAULT_NEAR;
        pc.updateProjectionMatrix();
      }
    }

    if (flight.current < 1) {
      flight.current = Math.min(1, flight.current + dt / FLY_SECONDS);
      const w = smootherstep(flight.current);

      // Interpolate camera position, target, and up-vector smoothly in the moving target's frame
      t.curCamOffset.lerpVectors(t.startCamOffset, t.desiredOffset, w);
      camera.position.copy(t.focus).add(t.curCamOffset);

      t.look.copy(t.focus).addScaledVector(t.startTargetOffset, 1 - w);
      camera.up.lerpVectors(t.startUp, t.desiredUp, w).normalize();
      camera.lookAt(t.look);

      if (controls) {
        controls.enableDamping = false;
        controls.autoRotate = false;
        controls.minDistance = 0.001;
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = Math.PI;
        controls.target.copy(t.look);

        if (flight.current >= 1) {
          camera.up.copy(t.desiredUp);
          syncControlsUpAxis(controls, camera.up);

          if (inspectedLandmark) {
            controls.minDistance = holoScale * 0.72;
            controls.maxDistance = size * 4.5;
            controls.minPolarAngle = 0.1;
            controls.maxPolarAngle = Math.PI * 0.465; // prevent clipping below planet surface
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.75;
          } else {
            controls.minDistance = selectedBodyId ? size * 1.04 : 1.5;
            controls.maxDistance = 320;
            controls.minPolarAngle = 0;
            controls.maxPolarAngle = Math.PI;
            controls.autoRotate = false;
          }
          controls.enableDamping = true;
          controls.update();
        }
      }
    } else if (controls) {
      controls.enableDamping = true;

      // Carry both camera and target by the target's exact frame displacement -> zero orbital lag
      t.move.copy(t.focus).sub(t.lastFocus);
      camera.position.add(t.move);
      controls.target.add(t.move);

      if (inspectedLandmark && inspectedAnchor) {
        // Keep up-axis synced with the local surface normal
        camera.up.copy(t.normal);
        syncControlsUpAxis(controls, camera.up);
        controls.minDistance = holoScale * 0.72;
        controls.maxDistance = size * 4.5;
        controls.minPolarAngle = 0.1;
        controls.maxPolarAngle = Math.PI * 0.465;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.75;
        controls.zoomSpeed = 0.75;
        controls.rotateSpeed = 0.65;
      } else {
        controls.minDistance = selectedBodyId ? size * 1.04 : 1.5;
        controls.maxDistance = 320;
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = Math.PI;
        controls.autoRotate = false;
        const distToCenter = camera.position.distanceTo(t.focus);
        const altitudeRatio = selectedBodyId
          ? Math.max(0.08, (distToCenter - size) / (size * 2.5))
          : 1;
        controls.zoomSpeed = THREE.MathUtils.clamp(altitudeRatio, 0.18, 1.1);
        controls.rotateSpeed = THREE.MathUtils.clamp(altitudeRatio * 0.9, 0.2, 0.85);
      }

      controls.update();
    }

    t.lastFocus.copy(t.focus);
  }, -1);

  return null;
}
