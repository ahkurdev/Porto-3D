import { useMemo, useRef } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { config } from "./config";
import { HomeText, StationText, Ground } from "./components/Text3DHelpers";
import { STATIONS, PANELS, PANEL_X } from "./components/Panels";
import Petals from "./components/Petals";

const SECTION_LEN = 14; // jarak antar stasiun di sumbu Z

/** Monumen geometris per stasiun — identitas visual tiap section. */
const Monument = ({ variant, position }: { variant: number; position: [number, number, number] }) => {
  const mat = <meshStandardMaterial color="#2f5d50" roughness={0.4} metalness={0.2} />;
  const stone = <meshStandardMaterial color="#dcdcd4" roughness={0.85} />;
  const shapes = [
    // about: torus knot
    <mesh key="k" position={position} castShadow>
      <torusKnotGeometry args={[0.62, 0.22, 128, 20]} />
      {mat}
    </mesh>,
    // skills: bar chart 3D
    <group key="b" position={position}>
      {config.skills.slice(0, 5).map((s, i) => (
        <mesh key={s.name} position={[(i - 2) * 0.42, (s.level / 100) * 0.9 - 0.45, 0]} castShadow>
          <boxGeometry args={[0.26, (s.level / 100) * 1.8, 0.26]} />
          {i === 0 ? mat : stone}
        </mesh>
      ))}
    </group>,
    // projects: kubus berlapis
    <group key="c" position={position}>
      <mesh castShadow>
        <boxGeometry args={[1.15, 1.15, 1.15]} />
        {mat}
      </mesh>
      <mesh rotation={[0.5, 0.6, 0.2]} castShadow>
        <boxGeometry args={[1.6, 0.16, 0.5]} />
        {stone}
      </mesh>
    </group>,
    // experience: pilar bertingkat
    <group key="p" position={position}>
      {[0.9, 0.65, 0.4].map((s, i) => (
        <mesh key={s} position={[0, -0.6 + i * 0.55, 0]} castShadow>
          <cylinderGeometry args={[s * 0.5, s * 0.62, 0.5, 6]} />
          {i === 2 ? mat : stone}
        </mesh>
      ))}
    </group>,
    // contact: cincin + inti
    <group key="r" position={position}>
      <mesh castShadow>
        <torusGeometry args={[0.75, 0.1, 24, 64]} />
        {mat}
      </mesh>
      <mesh castShadow>
        <icosahedronGeometry args={[0.3, 0]} />
        {stone}
      </mesh>
    </group>,
  ];
  return <>{shapes[variant % shapes.length]}</>;
};

/** Pohon low-poly baris jalan. */
const Tree = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh position-y={0.45} castShadow>
      <cylinderGeometry args={[0.06, 0.09, 0.9, 6]} />
      <meshStandardMaterial color="#7a6a55" roughness={1} />
    </mesh>
    <mesh position-y={1.25} castShadow>
      <coneGeometry args={[0.42, 1.1, 7]} />
      <meshStandardMaterial color="#8fae94" roughness={0.9} />
    </mesh>
    <mesh position-y={1.85} castShadow>
      <coneGeometry args={[0.28, 0.8, 7]} />
      <meshStandardMaterial color="#9dbca2" roughness={0.9} />
    </mesh>
  </group>
);

const Trees = ({ isMobile }: { isMobile: boolean }) => {
  const trees = useMemo(() => {
    const arr: [number, number, number][] = [];
    const step = isMobile ? 7 : 5;
    for (let z = 4; z > -84; z -= step) {
      arr.push([-4.6, -1.3, z]);
      arr.push([4.6, -1.3, z - step / 2]);
    }
    return arr;
  }, [isMobile]);
  return (
    <>
      {trees.map((p, i) => (
        <Tree key={i} position={p} />
      ))}
    </>
  );
};

const Scene = ({ isMobile }: { isMobile: boolean }) => {
  const camBase = useRef({ x: 0, y: 1.4, z: 5 });
  const parallax = useRef({ x: 0, y: 0 });

  // GSAP timeline: kamera terbang melewati stasiun (scrub).
  useGSAPScene(camBase);

  // Mouse parallax di frame loop — menumpuk di atas posisi GSAP.
  const wraps = useRef<HTMLElement[]>([]);

  useFrame((state) => {
    const cam = state.camera;
    const nx = state.pointer.x;
    const ny = state.pointer.y;
    parallax.current.x += (nx * 0.7 - parallax.current.x) * 0.05;
    parallax.current.y += (ny * 0.35 - parallax.current.y) * 0.05;
    cam.position.set(
      camBase.current.x + parallax.current.x,
      camBase.current.y + parallax.current.y,
      camBase.current.z,
    );
    cam.lookAt(camBase.current.x + parallax.current.x * 0.4, 1.1, camBase.current.z - 8);
    (window as unknown as Record<string, number>).__camZ = camBase.current.z;

    // Panel visibility per-frame dari posisi kamera live (DOM langsung).
    if (wraps.current.length === 0) {
      wraps.current = Array.from(document.querySelectorAll<HTMLElement>(".station-wrap"));
    }
    for (let i = 0; i < STATIONS.length; i++) {
      const el = wraps.current[i];
      if (!el) continue;
      // stasiun i dilihat pas kamera di z = -14*(i+1)+5; visible jika kamera dekat
      const dist = Math.abs(camBase.current.z - (-SECTION_LEN * (i + 1) + 5));
      const vis = dist < 7;
      el.style.visibility = vis ? "visible" : "hidden";
      el.style.opacity = vis ? "1" : "0";
    }
  });

  return (
    <>
      <fog attach="fog" args={["#f4f4f0", 12, 46]} />
      <color attach="background" args={["#f4f4f0"]} />
      <ambientLight intensity={0.85} />
      <directionalLight
        castShadow={!isMobile}
        position={[6, 12, 4]}
        intensity={1.15}
        shadow-mapSize-width={isMobile ? 512 : 2048}
        shadow-mapSize-height={isMobile ? 512 : 2048}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-bias={-0.0002}
      />
      <Ground />
      <Trees isMobile={isMobile} />
      <Petals count={isMobile ? 40 : 140} />

      <HomeText />

      {STATIONS.map((st, i) => {
        const Panel = PANELS[st.name];
        const z = -SECTION_LEN * (i + 1);
        return (
          <group key={st.name}>
            <Monument variant={i} position={[PANEL_X > 0 ? -PANEL_X : 2.6, 0.9, z]} />
            <StationText text={st.name.toUpperCase()} position={[-PANEL_X, 2.6, z]} accent={i % 2 === 1} />
            <group position={[PANEL_X, 1.55, z]}>
              <Html
                transform
                distanceFactor={6}
                pointerEvents="auto"
                zIndexRange={[3, 0]}
                wrapperClass="station-wrap"
              >
                <Panel />
              </Html>
            </group>
          </group>
        );
      })}
    </>
  );
};

/** Timeline scroll: kamera terbang melewati stasiun. */
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function useGSAPScene(camBase: React.RefObject<{ x: number; y: number; z: number }>) {
  useGSAP(() => {
    const total = STATIONS.length;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#scroll-parent",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
      },
      defaults: { ease: "none" },
    });

    // tiap section: maju satu stasiun + sedikit sway lateral bergantian
    for (let i = 0; i < total; i++) {
      const z = -SECTION_LEN * (i + 1) + 5;
      tl.to(camBase.current, {
        z,
        x: i % 2 === 0 ? -0.9 : 0.9,
        y: 1.4 + (i % 3) * 0.25,
        duration: 1,
      });
    }
  });
}

export default Scene;
