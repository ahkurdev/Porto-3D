import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Petals instanced: satu InstancedMesh, animasi murni di useFrame.
 * Count di-cap untuk low-end (hardwareConcurrency <= 4).
 */
const Petals = ({ count }: { count: number }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const petals = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 26,
        y: Math.random() * 12 - 2,
        z: (Math.random() - 0.5) * 16 - 4,
        fall: 0.35 + Math.random() * 0.55,
        sway: 0.6 + Math.random() * 1.2,
        phase: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 2,
        scale: 0.05 + Math.random() * 0.06,
      })),
    [count],
  );

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < petals.length; i++) {
      const p = petals[i];
      const y = 6.5 - (((t * p.fall + p.phase) % 9) + 9) % 9;
      dummy.position.set(p.x + Math.sin(t * p.sway + p.phase) * 1.4, y, p.z);
      dummy.rotation.set(t * p.spin + p.phase, p.phase, t * p.spin * 0.7);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <planeGeometry args={[1, 0.7]} />
      <meshStandardMaterial color="#d98ba0" side={THREE.DoubleSide} roughness={0.9} />
    </instancedMesh>
  );
};

export default Petals;
