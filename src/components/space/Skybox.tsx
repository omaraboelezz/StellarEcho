// src/components/space/Skybox.tsx
// 8K Milky Way panorama on a huge sphere that follows the camera (so it is always "at infinity").
import { useEffect, useMemo, useRef, memo } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { configureTexture } from '../../lib/textures';

const SHARED_SKYBOX_GEO = new THREE.SphereGeometry(4000, 48, 24);

const Skybox = memo(function Skybox() {
  const ref = useRef<THREE.Mesh>(null!);
  const gl = useThree((s) => s.gl);
  const tex = useLoader(THREE.TextureLoader, '/textures/8k/8k_stars_milky_way.jpg');

  useEffect(() => {
    configureTexture(tex, gl, true);
  }, [tex, gl]);

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: tex,
        side: THREE.BackSide,
        depthWrite: false,
        toneMapped: false,
        color: '#6f7480',
      }),
    [tex]
  );

  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ camera }) => {
    ref.current?.position.copy(camera.position);
  });

  return (
    <mesh
      ref={ref}
      geometry={SHARED_SKYBOX_GEO}
      material={material}
      raycast={() => null}
      renderOrder={-10}
      rotation={[0, 0, THREE.MathUtils.degToRad(60)]}
    />
  );
});

export default Skybox;
