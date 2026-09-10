import { useMemo } from "react";
import { Text3D, Center, Float } from "@react-three/drei";
import * as THREE from "three";
import { config } from "../config";

const BOLD_FONT = "/fonts/helvetiker_bold.typeface.json";
const inkMat = <meshStandardMaterial color="#2a2d31" roughness={0.55} metalness={0.1} />;
const accentMat = <meshStandardMaterial color="#2f5d50" roughness={0.5} metalness={0.15} />;

/** Wordmark 3D besar — judul di atas, subtitle di bawah. */
export const HomeText = () => (
  <group>
    <Float floatIntensity={0.5} speed={1.6}>
      <Center disableY disableZ position={[0, 1.6, -2]}>
        <Text3D font={BOLD_FONT} size={0.72} height={0.22} bevelEnabled bevelThickness={0.03} bevelSize={0.02} castShadow>
          {config.home.title}
          {inkMat}
        </Text3D>
      </Center>
    </Float>
    <Center disableY disableZ position={[0, 0.55, -2]}>
      <Text3D font={BOLD_FONT} size={0.3} height={0.1} bevelEnabled bevelThickness={0.02} bevelSize={0.015} castShadow>
        {config.home.subtitle}
        {accentMat}
      </Text3D>
    </Center>
  </group>
);

/** Kicker teks kecil untuk tiap stasiun. */
export const StationText = ({ text, position, accent = false }: { text: string; position: [number, number, number]; accent?: boolean }) => (
  <Center disableY disableZ position={position}>
    <Text3D font={BOLD_FONT} size={0.42} height={0.12} bevelEnabled bevelThickness={0.02} bevelSize={0.015} castShadow>
      {text}
      {accent ? accentMat : inkMat}
    </Text3D>
  </Center>
);

/** Ground: plane besar + grid halus, warna kertas. */
export const Ground = () => {
  const grid = useMemo(() => {
    const g = new THREE.GridHelper(240, 120, 0xd9d9d2, 0xe4e4dd);
    g.position.y = -1.28;
    return g;
  }, []);
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={-1.3} receiveShadow>
        <planeGeometry args={[240, 240]} />
        <meshStandardMaterial color="#ececе6" roughness={1} />
      </mesh>
      <primitive object={grid} />
    </group>
  );
};
