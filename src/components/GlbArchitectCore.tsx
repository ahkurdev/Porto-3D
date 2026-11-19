import { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const GLB_URL = "/models/architect_core.glb";

const FRESNEL_VERTEX = `
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vLocalPos;
  void main() {
    vLocalPos = position;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const FRESNEL_FRAGMENT = `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vLocalPos;
  void main() {
    float fresnel = pow(1.0 - max(dot(vNormalW, vViewDir), 0.0), 2.5);
    float scan = 0.65 + 0.35 * sin(vLocalPos.y * 18.0 - uTime * 3.4);
    float pulse = 0.8 + 0.2 * sin(uTime * 2.1);
    gl_FragColor = vec4(uColor * fresnel * scan * pulse, fresnel * 0.52);
  }
`;

const HOLO_RING_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const HOLO_RING_FRAGMENT = `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv - 0.5;
    float r = length(p) * 2.0;
    float a = atan(p.y, p.x);
    float ring = smoothstep(0.035, 0.0, abs(r - 0.88));
    float dashes = smoothstep(0.15, 0.45, sin(a * 16.0 - uTime * 1.4));
    float arc = smoothstep(0.02, 0.0, abs(r - 0.72)) * smoothstep(-0.2, 0.4, sin(a * 3.0 + uTime * 0.9));
    float alpha = (ring * (0.4 + 0.6 * dashes) + arc * 0.75) * 0.65;
    gl_FragColor = vec4(vec3(0.84, 0.92, 1.0), alpha);
  }
`;

const LoadedGlbModel = () => {
  const gltf = useGLTF(GLB_URL);
  const auraRef = useRef<THREE.ShaderMaterial>(null);
  const ringRef = useRef<THREE.ShaderMaterial>(null);

  const clonedScene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    return clone;
  }, [gltf.scene]);

  const parts = useMemo(() => {
    return {
      outer: clonedScene.getObjectByName("OuterRing"),
      mid: clonedScene.getObjectByName("MidRing"),
      inner: clonedScene.getObjectByName("InnerRing"),
      knot: clonedScene.getObjectByName("CoreKnot"),
      core: clonedScene.getObjectByName("CentralCore"),
      satellites: clonedScene.getObjectByName("SatelliteRing"),
    };
  }, [clonedScene]);

  const auraUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("#dbeafe") },
    }),
    [],
  );

  const ringUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (parts.outer) {
      parts.outer.rotation.y = t * 0.24;
      parts.outer.rotation.x = Math.sin(t * 0.35) * 0.16;
    }
    if (parts.mid) {
      parts.mid.rotation.x = 0.55 + t * 0.38;
      parts.mid.rotation.z = t * 0.18;
    }
    if (parts.inner) {
      parts.inner.rotation.y = -t * 0.48;
      parts.inner.rotation.z = 0.3 + Math.cos(t * 0.42) * 0.22;
    }
    if (parts.knot) {
      parts.knot.rotation.x = t * 0.32;
      parts.knot.rotation.y = t * 0.44;
    }
    if (parts.core) {
      parts.core.rotation.y = -t * 0.7;
      parts.core.rotation.x = t * 0.25;
      const pulse = 1 + Math.sin(t * 2.2) * 0.06;
      parts.core.scale.setScalar(pulse);
    }
    if (parts.satellites) {
      parts.satellites.rotation.y = -t * 0.32;
      parts.satellites.rotation.z = Math.sin(t * 0.4) * 0.12;
    }
    if (auraRef.current) {
      auraRef.current.uniforms.uTime.value = t;
    }
    if (ringRef.current) {
      ringRef.current.uniforms.uTime.value = t;
    }
  });

  return (
    <group position={[0, 0.72, 0]} scale={0.94}>
      <primitive object={clonedScene} />
      {/* Dual-layer GLSL Fresnel holographic energy shell */}
      <mesh>
        <icosahedronGeometry args={[0.78, 3]} />
        <shaderMaterial
          ref={auraRef}
          vertexShader={FRESNEL_VERTEX}
          fragmentShader={FRESNEL_FRAGMENT}
          uniforms={auraUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Floating horizontal holographic telemetry dial */}
      <mesh position={[0, -0.82, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.4, 3.4]} />
        <shaderMaterial
          ref={ringRef}
          vertexShader={HOLO_RING_VERTEX}
          fragmentShader={HOLO_RING_FRAGMENT}
          uniforms={ringUniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

const ProceduralFallback = () => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.3;
  });
  return (
    <group position={[0, 0.92, 0]}>
      <mesh ref={ref}>
        <torusKnotGeometry args={[0.9, 0.04, 80, 16]} />
        <meshStandardMaterial color="#d4d4d8" roughness={0.2} metalness={0.9} />
      </mesh>
    </group>
  );
};

export const GlbArchitectCore = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      {/* Grounded obsidian plinth + brushed collar + emissive telemetry ring */}
      <group position={[0, -1.3, 0]}>
        <mesh position={[0, 0.07, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[1.72, 1.88, 0.14, 48]} />
          <meshStandardMaterial color="#121216" roughness={0.78} metalness={0.18} />
        </mesh>
        <mesh position={[0, 0.17, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[1.44, 1.54, 0.075, 48]} />
          <meshStandardMaterial color="#27272e" roughness={0.42} metalness={0.58} />
        </mesh>
        <mesh position={[0, 0.215, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.32, 1.38, 64]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#dbeafe"
            emissiveIntensity={1.25}
            roughness={0.18}
            metalness={0.85}
          />
        </mesh>
        <mesh position={[0, 0.56, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.28, 0.72, 24]} />
          <meshStandardMaterial color="#141418" roughness={0.72} metalness={0.32} />
        </mesh>
        <mesh position={[0, 0.92, 0]}>
          <cylinderGeometry args={[0.24, 0.16, 0.06, 24]} />
          <meshStandardMaterial color="#d4d4dc" roughness={0.2} metalness={0.92} />
        </mesh>
      </group>

      <Suspense fallback={<ProceduralFallback />}>
        <LoadedGlbModel />
      </Suspense>
    </group>
  );
};

useGLTF.preload(GLB_URL);
