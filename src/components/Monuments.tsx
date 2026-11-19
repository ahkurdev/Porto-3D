import { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const FLOOR_Y = -1.3;
const WORK_GLB_URL = "/models/workstation_monolith.glb";
const BEACON_GLB_URL = "/models/orbital_beacon.glb";

const MAT_OBSIDIAN = new THREE.MeshStandardMaterial({
  color: "#131318",
  roughness: 0.78,
  metalness: 0.18,
});

const MAT_GRAPHITE = new THREE.MeshStandardMaterial({
  color: "#27272e",
  roughness: 0.44,
  metalness: 0.56,
});

const MAT_TITANIUM = new THREE.MeshStandardMaterial({
  color: "#d4d4dc",
  roughness: 0.18,
  metalness: 0.92,
});

const MAT_PLATINUM = new THREE.MeshStandardMaterial({
  color: "#f4f4f8",
  roughness: 0.14,
  metalness: 0.95,
});

const MAT_EMISSIVE = new THREE.MeshStandardMaterial({
  color: "#ffffff",
  emissive: "#dbeafe",
  emissiveIntensity: 1.35,
  roughness: 0.16,
  metalness: 0.1,
});

const HOLO_WAVE_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const HOLO_WAVE_FRAGMENT = `
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv - 0.5;
    float r = length(p) * 2.0;
    if (r > 1.0) discard;
    float a = atan(p.y, p.x);
    float ring = smoothstep(0.05, 0.0, abs(r - 0.86));
    float sweep = 0.4 + 0.6 * smoothstep(0.0, 1.0, sin(a * 4.0 - uTime * 2.6));
    float inner = smoothstep(0.03, 0.0, abs(r - 0.64)) * 0.45;
    float alpha = (ring * sweep + inner) * uIntensity;
    gl_FragColor = vec4(vec3(0.82, 0.91, 1.0), alpha);
  }
`;

/** Shared architectural stepped plinth sitting flush on FLOOR_Y = -1.3 */
const Plinth = ({ radius = 1.28 }: { radius?: number }) => (
  <group position={[0, FLOOR_Y, 0]}>
    <mesh position={[0, 0.07, 0]} material={MAT_OBSIDIAN} receiveShadow castShadow>
      <cylinderGeometry args={[radius, radius * 1.1, 0.14, 40]} />
    </mesh>
    <mesh position={[0, 0.17, 0]} material={MAT_GRAPHITE} receiveShadow castShadow>
      <cylinderGeometry args={[radius * 0.85, radius * 0.92, 0.07, 40]} />
    </mesh>
    <mesh position={[0, 0.215, 0]} rotation={[-Math.PI / 2, 0, 0]} material={MAT_EMISSIVE}>
      <ringGeometry args={[radius * 0.78, radius * 0.82, 56]} />
    </mesh>
  </group>
);

/**
 * 01 / WORK: Real binary GLB multi-platform hardware rig (/models/workstation_monolith.glb).
 * Dynamically elevates, rotates, and highlights Web (0), Desktop (1), Mobile (2), or Sync (3).
 */
const LoadedWorkGlb = ({ activeWorkProject }: { activeWorkProject: number }) => {
  const gltf = useGLTF(WORK_GLB_URL);
  const rootRef = useRef<THREE.Group>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const holoMatRef = useRef<THREE.ShaderMaterial>(null);

  const cloned = useMemo(() => {
    const c = gltf.scene.clone(true);
    c.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    return c;
  }, [gltf.scene]);

  const parts = useMemo(
    () => ({
      web: cloned.getObjectByName("WebUnit"),
      desktop: cloned.getObjectByName("DesktopUnit"),
      mobile: cloned.getObjectByName("MobileUnit"),
      sync: cloned.getObjectByName("SyncCore"),
    }),
    [cloned],
  );

  const holoUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 0.65 },
    }),
    [],
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.08);
    const t = state.clock.elapsedTime;

    if (rootRef.current) {
      const targetYaw =
        activeWorkProject === 0
          ? -0.34
          : activeWorkProject === 1
            ? 0.14
            : activeWorkProject === 2
              ? 0.42
              : 0;
      rootRef.current.rotation.y = THREE.MathUtils.damp(
        rootRef.current.rotation.y,
        targetYaw + Math.sin(t * 0.55) * 0.11,
        4.5,
        dt,
      );
    }

    if (parts.web) {
      const active = activeWorkProject === 0 || activeWorkProject === 3;
      parts.web.position.y = THREE.MathUtils.damp(parts.web.position.y, active ? 0.24 : 0.06, 6, dt);
      parts.web.scale.setScalar(THREE.MathUtils.damp(parts.web.scale.x, active ? 1.12 : 0.94, 6, dt));
    }
    if (parts.desktop) {
      const active = activeWorkProject === 1 || activeWorkProject === 3;
      parts.desktop.position.y = THREE.MathUtils.damp(parts.desktop.position.y, active ? 0.62 : 0.48, 6, dt);
      parts.desktop.scale.setScalar(THREE.MathUtils.damp(parts.desktop.scale.x, active ? 1.1 : 0.94, 6, dt));
    }
    if (parts.mobile) {
      const active = activeWorkProject === 2 || activeWorkProject === 3;
      parts.mobile.position.y = THREE.MathUtils.damp(parts.mobile.position.y, active ? 0.22 : -0.02, 6, dt);
      parts.mobile.scale.setScalar(THREE.MathUtils.damp(parts.mobile.scale.x, active ? 1.18 : 0.94, 6, dt));
    }
    if (parts.sync) {
      const active = activeWorkProject === 3;
      parts.sync.rotation.y = t * (active ? 2.1 : 0.6);
      parts.sync.rotation.x = t * (active ? 1.3 : 0.3);
      parts.sync.scale.setScalar(THREE.MathUtils.damp(parts.sync.scale.x, active ? 1.38 : 0.72, 7, dt));
    }
    if (beamRef.current) {
      const showBeam = activeWorkProject === 3;
      beamRef.current.scale.x = THREE.MathUtils.damp(beamRef.current.scale.x, showBeam ? 1 : 0.001, 8, dt);
      beamRef.current.visible = beamRef.current.scale.x > 0.02;
    }
    if (holoMatRef.current) {
      holoMatRef.current.uniforms.uTime.value = t;
      holoMatRef.current.uniforms.uIntensity.value = activeWorkProject === 3 ? 0.9 : 0.55;
    }
  });

  return (
    <group ref={rootRef} position={[0, -0.35, 0]} scale={1.12}>
      <primitive object={cloned} />
      <mesh ref={beamRef} position={[-0.08, 0.22, 0.24]} material={MAT_EMISSIVE}>
        <boxGeometry args={[1.28, 0.03, 0.03]} />
      </mesh>
      <mesh position={[0, -0.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.3, 2.3]} />
        <shaderMaterial
          ref={holoMatRef}
          vertexShader={HOLO_WAVE_VERTEX}
          fragmentShader={HOLO_WAVE_FRAGMENT}
          uniforms={holoUniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

const WorkSculpture = ({ activeWorkProject }: { activeWorkProject: number }) => (
  <group>
    <Plinth radius={1.28} />
    <Suspense fallback={null}>
      <LoadedWorkGlb activeWorkProject={activeWorkProject} />
    </Suspense>
  </group>
);

/** 02 / ABOUT: Precision kinetic astrolabe + GLSL holographic ring reactive to Profile (0) vs Capabilities (1) */
const AboutSculpture = ({ activeAboutTab }: { activeAboutTab: number }) => {
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);
  const capRing = useRef<THREE.Group>(null);
  const holoMatRef = useRef<THREE.ShaderMaterial>(null);

  const holoUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 0.65 },
    }),
    [],
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.08);
    const t = state.clock.elapsedTime;
    const isCapabilities = activeAboutTab === 1;
    if (ringA.current) {
      ringA.current.rotation.y = t * (isCapabilities ? 0.9 : 0.45);
      ringA.current.rotation.z = THREE.MathUtils.damp(
        ringA.current.rotation.z,
        isCapabilities ? 0.35 : 0,
        5,
        dt,
      );
    }
    if (ringB.current) {
      ringB.current.rotation.x = t * (isCapabilities ? 0.78 : 0.38);
    }
    if (core.current) {
      core.current.rotation.y = -t * (isCapabilities ? 1.15 : 0.55);
      core.current.scale.setScalar(
        THREE.MathUtils.damp(core.current.scale.x, isCapabilities ? 1.24 : 1, 6, dt),
      );
    }
    if (capRing.current) {
      capRing.current.rotation.y = -t * 0.7;
      capRing.current.scale.setScalar(
        THREE.MathUtils.damp(capRing.current.scale.x, isCapabilities ? 1.12 : 0.84, 6, dt),
      );
    }
    if (holoMatRef.current) {
      holoMatRef.current.uniforms.uTime.value = t;
      holoMatRef.current.uniforms.uIntensity.value = isCapabilities ? 0.92 : 0.52;
    }
  });

  const isCapabilities = activeAboutTab === 1;

  return (
    <group>
      <Plinth radius={1.25} />
      <mesh position={[0, FLOOR_Y + 0.55, 0]} material={MAT_GRAPHITE} castShadow>
        <cylinderGeometry args={[0.16, 0.32, 0.72, 24]} />
      </mesh>
      <group position={[0, 0.32, 0]}>
        <mesh ref={ringA} material={isCapabilities ? MAT_PLATINUM : MAT_TITANIUM} castShadow>
          <torusGeometry args={[0.94, 0.042, 20, 72]} />
        </mesh>
        <mesh ref={ringB} rotation={[Math.PI / 2.4, 0.3, 0]} material={MAT_GRAPHITE} castShadow>
          <torusGeometry args={[0.74, 0.032, 18, 56]} />
        </mesh>
        <mesh rotation={[0.4, 0, Math.PI / 4]} material={MAT_OBSIDIAN}>
          <torusGeometry args={[0.54, 0.025, 16, 48]} />
        </mesh>
        <mesh ref={core} material={isCapabilities ? MAT_EMISSIVE : MAT_PLATINUM} castShadow>
          <icosahedronGeometry args={[0.28, 0]} />
        </mesh>
        <group ref={capRing}>
          {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, idx) => (
            <mesh
              key={idx}
              position={[Math.cos(ang) * 0.94, 0, Math.sin(ang) * 0.94]}
              material={isCapabilities ? MAT_EMISSIVE : MAT_TITANIUM}
            >
              <octahedronGeometry args={[isCapabilities ? 0.085 : 0.045, 0]} />
            </mesh>
          ))}
        </group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.78, 0]}>
          <planeGeometry args={[2.5, 2.5]} />
          <shaderMaterial
            ref={holoMatRef}
            vertexShader={HOLO_WAVE_VERTEX}
            fragmentShader={HOLO_WAVE_FRAGMENT}
            uniforms={holoUniforms}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </group>
  );
};

/** 03 / STACK: Stepped modular server monolith matrix + GLSL active-category halo (0..4) */
const StackSculpture = ({ activeStackCategory }: { activeStackCategory: number }) => {
  const group = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const holoMatRef = useRef<THREE.ShaderMaterial>(null);

  const towers = useMemo(
    () => [
      { x: -0.52, z: -0.32, h: 1.38, cat: 0 },
      { x: 0.0, z: -0.46, h: 1.88, cat: 1 },
      { x: 0.52, z: -0.28, h: 1.54, cat: 2 },
      { x: -0.34, z: 0.3, h: 1.66, cat: 3 },
      { x: 0.34, z: 0.3, h: 2.04, cat: 4 },
    ],
    [],
  );

  const holoUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 0.85 },
    }),
    [],
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.08);
    const t = state.clock.elapsedTime;
    if (group.current) {
      const targetYaw = (activeStackCategory - 2) * 0.34 + 0.25;
      group.current.rotation.y = THREE.MathUtils.damp(
        group.current.rotation.y,
        targetYaw + Math.sin(t * 0.35) * 0.14,
        4.5,
        dt,
      );
    }
    if (haloRef.current) {
      const target = towers[activeStackCategory] ?? towers[0];
      haloRef.current.position.x = THREE.MathUtils.damp(haloRef.current.position.x, target.x, 7, dt);
      haloRef.current.position.z = THREE.MathUtils.damp(haloRef.current.position.z, target.z, 7, dt);
      haloRef.current.position.y = THREE.MathUtils.damp(
        haloRef.current.position.y,
        FLOOR_Y + 0.22 + target.h + 0.36 + Math.sin(t * 2.5) * 0.05,
        7,
        dt,
      );
    }
    if (holoMatRef.current) {
      holoMatRef.current.uniforms.uTime.value = t;
    }
  });

  return (
    <group>
      <Plinth radius={1.28} />
      <group ref={group}>
        {towers.map((t, idx) => {
          const isActive = t.cat === activeStackCategory;
          const height = isActive ? t.h + 0.24 : t.h;
          const colMat = isActive ? MAT_PLATINUM : idx % 2 === 0 ? MAT_GRAPHITE : MAT_OBSIDIAN;
          return (
            <group key={idx} position={[t.x, FLOOR_Y + 0.22, t.z]}>
              <mesh position={[0, height / 2, 0]} material={colMat} castShadow receiveShadow>
                <boxGeometry args={[0.31, height, 0.31]} />
              </mesh>
              {/* Machined mid-collar heat sink rib */}
              <mesh position={[0, height * 0.55, 0]} material={MAT_TITANIUM}>
                <boxGeometry args={[0.35, 0.04, 0.35]} />
              </mesh>
              {/* Vertical emissive telemetry slit */}
              <mesh
                position={[0, height * 0.5, 0.16]}
                material={isActive ? MAT_EMISSIVE : MAT_TITANIUM}
              >
                <boxGeometry args={[0.025, height * 0.72, 0.015]} />
              </mesh>
              {/* Crown emitter cap */}
              <mesh
                position={[0, height + 0.032, 0]}
                material={isActive ? MAT_EMISSIVE : MAT_TITANIUM}
              >
                <boxGeometry
                  args={[
                    isActive ? 0.3 : 0.22,
                    isActive ? 0.055 : 0.025,
                    isActive ? 0.3 : 0.22,
                  ]}
                />
              </mesh>
            </group>
          );
        })}

        {/* Hovering GLSL holographic ring gliding over active category tower */}
        <mesh ref={haloRef} rotation={[-Math.PI / 2, 0, 0]} position={[-0.52, 0.4, -0.32]}>
          <planeGeometry args={[0.92, 0.92]} />
          <shaderMaterial
            ref={holoMatRef}
            vertexShader={HOLO_WAVE_VERTEX}
            fragmentShader={HOLO_WAVE_FRAGMENT}
            uniforms={holoUniforms}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </group>
  );
};

/** 04 / CONTACT: Real binary GLB Deep-Space Parabolic Relay (/models/orbital_beacon.glb) + Signal Waves */
const LoadedBeaconGlb = () => {
  const gltf = useGLTF(BEACON_GLB_URL);
  const pulseA = useRef<THREE.Mesh>(null);
  const pulseB = useRef<THREE.Mesh>(null);

  const cloned = useMemo(() => {
    const c = gltf.scene.clone(true);
    c.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        const m = o as THREE.Mesh;
        m.castShadow = true;
        m.receiveShadow = true;
        if (m.material && !Array.isArray(m.material)) {
          const mat = m.material.clone();
          mat.side = THREE.DoubleSide;
          m.material = mat;
        }
      }
    });
    return c;
  }, [gltf.scene]);

  const parts = useMemo(
    () => ({
      dish: cloned.getObjectByName("ParabolicDish"),
      emitter: cloned.getObjectByName("CoreEmitter"),
      halo: cloned.getObjectByName("SignalHalo"),
    }),
    [cloned],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (parts.dish) {
      parts.dish.rotation.y = Math.sin(t * 0.42) * 0.42;
      parts.dish.rotation.x = -0.18 + Math.cos(t * 0.3) * 0.08;
    }
    if (parts.emitter) {
      parts.emitter.rotation.z = t * 1.1;
    }
    if (parts.halo) {
      parts.halo.rotation.z = -t * 0.6;
    }
    if (pulseA.current) {
      const p = (t * 0.55) % 1;
      pulseA.current.position.z = 0.6 + p * 1.4;
      pulseA.current.scale.setScalar(0.5 + p * 1.35);
    }
    if (pulseB.current) {
      const p = ((t * 0.55) + 0.5) % 1;
      pulseB.current.position.z = 0.6 + p * 1.4;
      pulseB.current.scale.setScalar(0.5 + p * 1.35);
    }
  });

  return (
    <group position={[0, -0.08, 0]} scale={1.06}>
      <primitive object={cloned} />
      <mesh ref={pulseA} position={[0, 0.35, 0.7]} material={MAT_EMISSIVE}>
        <torusGeometry args={[0.32, 0.014, 12, 48]} />
      </mesh>
      <mesh ref={pulseB} position={[0, 0.35, 1.3]} material={MAT_TITANIUM}>
        <torusGeometry args={[0.32, 0.012, 12, 48]} />
      </mesh>
    </group>
  );
};

const ContactSculpture = () => (
  <group>
    <Plinth radius={1.25} />
    <Suspense fallback={null}>
      <LoadedBeaconGlb />
    </Suspense>
  </group>
);

export const StationMonument = ({
  stationId,
  position,
  activeWorkProject = 0,
  activeAboutTab = 0,
  activeStackCategory = 0,
}: {
  stationId: "work" | "about" | "stack" | "contact";
  position: [number, number, number];
  activeWorkProject?: number;
  activeAboutTab?: number;
  activeStackCategory?: number;
}) => {
  return (
    <group position={position}>
      {stationId === "work" && <WorkSculpture activeWorkProject={activeWorkProject} />}
      {stationId === "about" && <AboutSculpture activeAboutTab={activeAboutTab} />}
      {stationId === "stack" && <StackSculpture activeStackCategory={activeStackCategory} />}
      {stationId === "contact" && <ContactSculpture />}
    </group>
  );
};

useGLTF.preload(WORK_GLB_URL);
useGLTF.preload(BEACON_GLB_URL);
