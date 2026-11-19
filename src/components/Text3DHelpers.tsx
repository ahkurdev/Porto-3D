import { useMemo } from "react";
import { Text3D, Center, Float } from "@react-three/drei";
import * as THREE from "three";
import { config } from "../config";
import { ObsidianEnergyFloor } from "./AtmosphericEffects";

const BOLD_FONT = "/fonts/helvetiker_bold.typeface.json";

const PLATINUM_MAT = new THREE.MeshPhysicalMaterial({
  color: "#f8fafc",
  roughness: 0.2,
  metalness: 0.52,
  clearcoat: 0.65,
  clearcoatRoughness: 0.16,
});

const SILVER_MAT = new THREE.MeshStandardMaterial({
  color: "#cbd5e1",
  roughness: 0.28,
  metalness: 0.72,
});

const PILLAR_BODY_MAT = new THREE.MeshStandardMaterial({
  color: "#111116",
  roughness: 0.74,
  metalness: 0.28,
});

const PILLAR_CAP_MAT = new THREE.MeshStandardMaterial({
  color: "#3f3f48",
  roughness: 0.26,
  metalness: 0.84,
});

const PILLAR_TRIM_MAT = new THREE.MeshStandardMaterial({
  color: "#ffffff",
  emissive: "#dbeafe",
  emissiveIntensity: 1.05,
  roughness: 0.18,
});

/** Monumental 3D obsidian/platinum wordmark framed cleanly above the Hero GLB Core */
export const HomeText = ({ isMobile }: { isMobile: boolean }) => {
  const s = isMobile ? 0.52 : 0.86;
  return (
    <group scale={s} position={[0, isMobile ? 0.88 : 1.04, 0]}>
      <Float floatIntensity={0.18} speed={1.25}>
        <Center disableY disableZ position={[0, 2.22, -2.1]}>
          <Text3D
            font={BOLD_FONT}
            size={0.56}
            height={0.15}
            bevelEnabled
            bevelThickness={0.022}
            bevelSize={0.014}
            castShadow
            material={PLATINUM_MAT}
          >
            {config.home.title}
          </Text3D>
        </Center>
        <Center disableY disableZ position={[0, 1.52, -2.1]}>
          <Text3D
            font={BOLD_FONT}
            size={0.52}
            height={0.15}
            bevelEnabled
            bevelThickness={0.022}
            bevelSize={0.014}
            castShadow
            material={PLATINUM_MAT}
          >
            {config.home.titleSecondLine}
          </Text3D>
        </Center>
      </Float>
      <Center disableY disableZ position={[0, 0.98, -2.1]}>
        <Text3D
          font={BOLD_FONT}
          size={0.175}
          height={0.055}
          bevelEnabled
          bevelThickness={0.011}
          bevelSize={0.008}
          castShadow
          material={SILVER_MAT}
        >
          {config.home.subtitle}
        </Text3D>
      </Center>
    </group>
  );
};

/** 3D Architectural Station Header floating above each sculpture */
export const StationText = ({
  text,
  position,
  scale = 1,
}: {
  text: string;
  position: [number, number, number];
  scale?: number;
}) => (
  <Center disableY disableZ position={position} scale={scale}>
    <Text3D
      font={BOLD_FONT}
      size={0.34}
      height={0.1}
      bevelEnabled
      bevelThickness={0.016}
      bevelSize={0.01}
      castShadow
      material={PLATINUM_MAT}
    >
      {text}
    </Text3D>
  </Center>
);

/** Architectural Obsidian GLSL Energy Floor + physical brushed corridor rails */
export const Ground = () => {
  return (
    <group>
      <ObsidianEnergyFloor />
      {/* Precision brushed titanium runway rails */}
      <mesh position={[-4.2, -1.26, -30]} receiveShadow>
        <boxGeometry args={[0.08, 0.05, 110]} />
        <meshStandardMaterial color="#3f3f48" roughness={0.32} metalness={0.82} />
      </mesh>
      <mesh position={[4.2, -1.26, -30]} receiveShadow>
        <boxGeometry args={[0.08, 0.05, 110]} />
        <meshStandardMaterial color="#3f3f48" roughness={0.32} metalness={0.82} />
      </mesh>
    </group>
  );
};

/** Architectural monolith pylons with luminous vertical light slits lining the corridor */
export const CorridorPillars = ({ isMobile }: { isMobile: boolean }) => {
  const positions = useMemo(() => {
    const arr: { pos: [number, number, number]; inwardX: number }[] = [];
    const step = isMobile ? 10 : 7.5;
    for (let z = 2; z >= -72; z -= step) {
      arr.push({ pos: [-5.1, -1.3, z], inwardX: 0.125 });
      arr.push({ pos: [5.1, -1.3, z - step * 0.5], inwardX: -0.125 });
    }
    return arr;
  }, [isMobile]);

  return (
    <group>
      {positions.map((item, i) => (
        <group key={i} position={item.pos}>
          {/* Stepped base plinth */}
          <mesh position={[0, 0.12, 0]} material={PILLAR_CAP_MAT} castShadow receiveShadow>
            <boxGeometry args={[0.44, 0.24, 0.44]} />
          </mesh>
          {/* Main architectural shaft */}
          <mesh position={[0, 1.38, 0]} material={PILLAR_BODY_MAT} castShadow>
            <boxGeometry args={[0.24, 2.3, 0.24]} />
          </mesh>
          {/* Inward-facing luminous telemetry strip */}
          <mesh position={[item.inwardX, 1.45, 0]} material={PILLAR_TRIM_MAT}>
            <boxGeometry args={[0.022, 1.85, 0.036]} />
          </mesh>
          {/* Crown light cap */}
          <mesh position={[0, 2.56, 0]} material={PILLAR_TRIM_MAT}>
            <boxGeometry args={[0.28, 0.055, 0.28]} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
