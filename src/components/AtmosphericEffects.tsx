import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ============================================================================
// 1. Custom GLSL Obsidian Energy Floor (Dual-Scale Grid + Scanwave + Station Pools)
// ============================================================================
const FLOOR_VERTEX = `
  varying vec3 vWorldPos;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const FLOOR_FRAGMENT = `
  uniform float uTime;
  uniform vec3 uCamPos;
  varying vec3 vWorldPos;

  float gridLine(vec2 coord, float scale, float width) {
    vec2 g = abs(fract(coord / scale - 0.5) - 0.5) / (width / scale);
    float l = min(g.x, g.y);
    return 1.0 - min(l, 1.0);
  }

  void main() {
    vec2 p = vWorldPos.xz;
    float distFromCam = length(vWorldPos - uCamPos);
    float fade = exp(-distFromCam * 0.042);

    // Base deep obsidian tone
    vec3 baseCol = vec3(0.024, 0.026, 0.032);

    // Dual-scale architectural grid (1.5m minor + 6m major structural bays)
    float minorG = gridLine(p, 1.5, 0.022) * 0.22;
    float majorG = gridLine(p, 6.0, 0.045) * 0.52;

    // Travelling telemetry scan wave moving down the -Z corridor
    float waveZ = -mod(uTime * 11.5, 86.0) + 10.0;
    float scanBand = exp(-pow((vWorldPos.z - waveZ) * 0.45, 2.0));
    float scanLine = scanBand * (0.28 + majorG * 1.4 + minorG * 0.9);

    // Twin luminous runway energy rails at x = +-4.2
    float railDist = min(abs(vWorldPos.x - 4.2), abs(vWorldPos.x + 4.2));
    float railGlow = exp(-railDist * 7.0) * 0.55;
    float railPulse = 0.65 + 0.35 * sin(vWorldPos.z * 0.45 + uTime * 3.2);

    // Station radial floor light pools
    float pool = 0.0;
    pool += exp(-dot(p - vec2(0.0, -5.2), p - vec2(0.0, -5.2)) * 0.085);
    pool += exp(-dot(p - vec2(-2.05, -15.0), p - vec2(-2.05, -15.0)) * 0.11);
    pool += exp(-dot(p - vec2(-2.05, -30.0), p - vec2(-2.05, -30.0)) * 0.11);
    pool += exp(-dot(p - vec2(-2.05, -45.0), p - vec2(-2.05, -45.0)) * 0.11);
    pool += exp(-dot(p - vec2(-2.05, -60.0), p - vec2(-2.05, -60.0)) * 0.11);

    vec3 gridColor = vec3(0.62, 0.72, 0.88);
    vec3 iceColor = vec3(0.75, 0.88, 1.0);

    vec3 col = baseCol;
    col += gridColor * (minorG + majorG) * fade * 0.65;
    col += iceColor * scanLine * fade * 0.75;
    col += iceColor * railGlow * railPulse * fade;
    col += vec3(0.18, 0.22, 0.30) * pool * 0.65;

    // Subtle specular corridor sheen down center axis
    float centerSheen = exp(-abs(vWorldPos.x) * 0.22) * 0.045 * fade;
    col += vec3(0.7, 0.8, 0.95) * centerSheen;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const ObsidianEnergyFloor = () => {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCamPos: { value: new THREE.Vector3(0, 1.5, 6) },
    }),
    [],
  );

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      matRef.current.uniforms.uCamPos.value.copy(state.camera.position);
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.29, -30]} receiveShadow>
      <planeGeometry args={[180, 180]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={FLOOR_VERTEX}
        fragmentShader={FLOOR_FRAGMENT}
        uniforms={uniforms}
      />
    </mesh>
  );
};

// ============================================================================
// 2. Custom GLSL Atmospheric Sky Dome (Subtle Obsidian-Silver Aurora + Starfield)
// ============================================================================
const SKY_VERTEX = `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SKY_FRAGMENT = `
  uniform float uTime;
  varying vec3 vDir;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 d = normalize(vDir);
    float h = clamp(d.y * 0.5 + 0.5, 0.0, 1.0);

    // Deep obsidian zenith to cold slate-indigo horizon mist
    vec3 zenith = vec3(0.014, 0.016, 0.022);
    vec3 horizon = vec3(0.055, 0.072, 0.105);
    vec3 col = mix(horizon, zenith, smoothstep(0.42, 0.85, h));

    // Subtle slow-drifting architectural aurora curtain above horizon
    vec2 uv = vec2(atan(d.x, -d.z) * 1.4, d.y * 3.8);
    float band = smoothstep(0.0, 0.25, d.y) * smoothstep(0.68, 0.15, d.y);
    float n1 = fbm(uv * vec2(1.2, 1.8) + vec2(uTime * 0.035, -uTime * 0.02));
    float n2 = fbm(uv * vec2(2.4, 1.2) - vec2(uTime * 0.025, uTime * 0.015));
    float veil = pow(clamp(n1 * n2 * 2.1, 0.0, 1.0), 1.8) * band;
    col += vec3(0.32, 0.44, 0.64) * veil * 0.42;

    // Fine distant starfield pinpoints in upper hemisphere
    if (d.y > 0.02) {
      vec2 starCoord = vec2(atan(d.x, d.z) * 34.0, d.y * 46.0);
      vec2 cell = floor(starCoord);
      vec2 gv = fract(starCoord) - 0.5;
      float s = hash(cell);
      if (s > 0.92) {
        vec2 jitter = vec2(hash(cell + 17.3) - 0.5, hash(cell + 43.1) - 0.5) * 0.65;
        float dist = length(gv - jitter);
        float pinpoint = smoothstep(0.055, 0.008, dist);
        float twinkle = 0.55 + 0.45 * sin(uTime * 2.2 + s * 120.0);
        col += vec3(0.86, 0.92, 1.0) * pinpoint * twinkle * smoothstep(0.02, 0.2, d.y) * 0.72;
      }
    }

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const SkyAtmosphere = () => {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    if (meshRef.current) {
      // Keep sky dome centered on camera so fog never clips it
      meshRef.current.position.copy(state.camera.position);
    }
  });

  return (
    <mesh ref={meshRef} frustumCulled={false}>
      <sphereGeometry args={[90, 32, 24]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={SKY_VERTEX}
        fragmentShader={SKY_FRAGMENT}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  );
};

// ============================================================================
// 3. Soft Volumetric Cathedral Light Beam (GLSL Fresnel + Vertical Falloff)
// ============================================================================
const BEAM_VERTEX = `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const BEAM_FRAGMENT = `
  uniform float uTime;
  uniform float uPhase;
  uniform vec3 uColor;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vViewDir;

  void main() {
    float facing = pow(abs(dot(vNormalW, vViewDir)), 1.65);
    float verticalFade = smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.15, vUv.y);
    float shimmer = 0.85 + 0.15 * sin(uTime * 1.4 + uPhase + vUv.y * 5.0);
    float alpha = facing * verticalFade * shimmer * 0.16;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

export const VolumetricBeam = ({
  position,
  radiusTop = 0.55,
  radiusBottom = 2.4,
  height = 8.5,
  phase = 0,
}: {
  position: [number, number, number];
  radiusTop?: number;
  radiusBottom?: number;
  height?: number;
  phase?: number;
}) => {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPhase: { value: phase },
      uColor: { value: new THREE.Color("#dbeafe") },
    }),
    [phase],
  );

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh position={[position[0], -1.3 + height * 0.5, position[2]]}>
      <cylinderGeometry args={[radiusTop, radiusBottom, height, 28, 1, true]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={BEAM_VERTEX}
        fragmentShader={BEAM_FRAGMENT}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

// ============================================================================
// 4. Expanding GLSL Telemetry Pulse Rings with Precision Dial Ticks
// ============================================================================
const PULSE_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const PULSE_FRAGMENT = `
  uniform float uTime;
  uniform float uPhase;
  varying vec2 vUv;
  void main() {
    vec2 centered = vUv - 0.5;
    float r = length(centered) * 2.0;
    if (r > 1.0) discard;

    float ang = atan(centered.y, centered.x);
    float ticks = smoothstep(0.85, 0.96, cos(ang * 24.0)) * smoothstep(0.86, 0.9, r) * smoothstep(0.98, 0.93, r);

    float wave = fract(uTime * 0.36 + uPhase);
    float ring1 = smoothstep(0.042, 0.0, abs(r - wave)) * (1.0 - wave);
    float ring2 = smoothstep(0.032, 0.0, abs(r - fract(wave + 0.5))) * (1.0 - fract(wave + 0.5));
    float border = smoothstep(0.016, 0.0, abs(r - 0.95)) * 0.32;
    float innerHalo = exp(-abs(r - 0.56) * 24.0) * 0.22;

    float alpha = (ring1 + ring2) * 0.65 + border + ticks * 0.45 + innerHalo;
    vec3 col = mix(vec3(0.86, 0.92, 1.0), vec3(0.98, 0.98, 1.0), ring1);
    gl_FragColor = vec4(col, alpha * smoothstep(1.0, 0.86, r));
  }
`;

export const StationPulseRing = ({
  position,
  phase = 0,
}: {
  position: [number, number, number];
  phase?: number;
}) => {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPhase: { value: phase },
    }),
    [phase],
  );

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh position={[position[0], -1.255, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[4.8, 4.8]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={PULSE_VERTEX}
        fragmentShader={PULSE_FRAGMENT}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

// ============================================================================
// 5. Scroll-Reactive Luminous Corridor Data Streams (InstancedMesh)
// ============================================================================
export const CorridorDataStreams = ({
  count = 48,
  scrollSpeedRef,
}: {
  count?: number;
  scrollSpeedRef: React.MutableRefObject<number>;
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const travelOffset = useRef(0);

  const streaks = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        const lane = (i % 3) * 0.45;
        return {
          x: side * (4.15 + lane),
          y: -1.18 + ((i * 19) % 10) * 0.56,
          zBase: -((i / count) * 82) + 8,
          speed: 3.5 + ((i * 7) % 9) * 0.55,
          len: 0.7 + ((i * 11) % 6) * 0.35,
        };
      }),
    [count],
  );

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dt = Math.min(delta, 0.08);
    const boost = 1 + Math.min(scrollSpeedRef.current * 42, 7.5);
    travelOffset.current += dt * boost;

    for (let i = 0; i < streaks.length; i++) {
      const s = streaks[i];
      const rawZ = s.zBase - travelOffset.current * s.speed;
      const wrappedZ = 10 - (((10 - rawZ) % 84 + 84) % 84);
      dummy.position.set(s.x, s.y, wrappedZ);
      dummy.scale.set(0.024, 0.024, s.len * (1 + Math.min(scrollSpeedRef.current * 24, 2.8)));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        color="#dbeafe"
        transparent
        opacity={0.72}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
};

// ============================================================================
// 6. Architectural Obsidian Portal Arches with Dual Luminous Trims & Gussets
// ============================================================================
const PORTAL_MAT_DARK = new THREE.MeshStandardMaterial({
  color: "#111116",
  roughness: 0.72,
  metalness: 0.38,
});

const PORTAL_MAT_METAL = new THREE.MeshStandardMaterial({
  color: "#3f3f48",
  roughness: 0.28,
  metalness: 0.85,
});

const PORTAL_MAT_TRIM = new THREE.MeshStandardMaterial({
  color: "#f8fafc",
  emissive: "#dbeafe",
  emissiveIntensity: 1.25,
  roughness: 0.18,
});

export const CorridorPortals = () => {
  const zPositions = useMemo(() => [-8.5, -22.5, -37.5, -52.5], []);

  return (
    <group>
      {zPositions.map((z, idx) => (
        <group key={idx} position={[0, -1.3, z]}>
          {/* Left & Right structural columns */}
          <mesh position={[-4.55, 2.65, 0]} material={PORTAL_MAT_DARK} castShadow>
            <boxGeometry args={[0.3, 5.3, 0.36]} />
          </mesh>
          <mesh position={[4.55, 2.65, 0]} material={PORTAL_MAT_DARK} castShadow>
            <boxGeometry args={[0.3, 5.3, 0.36]} />
          </mesh>
          {/* Column base collars */}
          <mesh position={[-4.55, 0.12, 0]} material={PORTAL_MAT_METAL}>
            <boxGeometry args={[0.48, 0.24, 0.52]} />
          </mesh>
          <mesh position={[4.55, 0.12, 0]} material={PORTAL_MAT_METAL}>
            <boxGeometry args={[0.48, 0.24, 0.52]} />
          </mesh>
          {/* Overhead lintel + crown beam */}
          <mesh position={[0, 5.36, 0]} material={PORTAL_MAT_DARK} castShadow>
            <boxGeometry args={[9.44, 0.28, 0.4]} />
          </mesh>
          <mesh position={[0, 5.54, 0]} material={PORTAL_MAT_METAL}>
            <boxGeometry args={[7.2, 0.08, 0.22]} />
          </mesh>
          {/* Corner architectural gussets */}
          <mesh position={[-4.15, 4.96, 0]} rotation={[0, 0, Math.PI / 4]} material={PORTAL_MAT_METAL}>
            <boxGeometry args={[0.62, 0.14, 0.24]} />
          </mesh>
          <mesh position={[4.15, 4.96, 0]} rotation={[0, 0, -Math.PI / 4]} material={PORTAL_MAT_METAL}>
            <boxGeometry args={[0.62, 0.14, 0.24]} />
          </mesh>
          {/* Glowing platinum-ice hairline trims on inner arch */}
          <mesh position={[-4.39, 2.65, 0]} material={PORTAL_MAT_TRIM}>
            <boxGeometry args={[0.028, 5.1, 0.045]} />
          </mesh>
          <mesh position={[4.39, 2.65, 0]} material={PORTAL_MAT_TRIM}>
            <boxGeometry args={[0.028, 5.1, 0.045]} />
          </mesh>
          <mesh position={[0, 5.21, 0]} material={PORTAL_MAT_TRIM}>
            <boxGeometry args={[8.8, 0.03, 0.045]} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
