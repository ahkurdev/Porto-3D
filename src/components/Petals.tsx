import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Ambient platinum dust motes / geometric micro-shards drifting through the obsidian corridor.
 * Uses a single InstancedMesh with zero per-frame allocations.
 */
const Petals = ({ count }: { count: number }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const motes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (Math.sin(i * 12.9898) * 0.5) * 24,
        y: ((i * 0.618) % 1) * 7 - 0.8,
        z: -((i / count) * 76) + 8,
        drift: 0.15 + ((i * 7) % 10) * 0.025,
        sway: 0.35 + ((i * 3) % 10) * 0.06,
        phase: (i * 1.37) % (Math.PI * 2),
        spin: (((i % 5) - 2) * 0.35) || 0.25,
        scale: 0.025 + ((i * 11) % 10) * 0.004,
      })),
    [count],
  );

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < motes.length; i++) {
      const m = motes[i];
      const y = -0.8 + (((m.y + t * m.drift) % 7.2) + 7.2) % 7.2;
      dummy.position.set(m.x + Math.sin(t * m.sway + m.phase) * 0.6, y, m.z);
      dummy.rotation.set(t * m.spin + m.phase, t * m.spin * 0.6, m.phase);
      dummy.scale.setScalar(m.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#e4e4e7"
        emissive="#a1a1aa"
        emissiveIntensity={0.35}
        roughness={0.25}
        metalness={0.8}
      />
    </instancedMesh>
  );
};

export default Petals;
