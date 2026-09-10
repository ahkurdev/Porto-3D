import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { EffectComposer, Vignette } from "@react-three/postprocessing";
import Scene from "./Scene";
import Loader from "./components/Loader";
import Hud from "./components/Hud";
import { useMobile } from "./hooks/useMobile";
import lenis from "./lib/lenis";

const ORBIT_TARGET: [number, number, number] = [0, 1.1, -40];

const App = () => {
  const { isMobile } = useMobile();
  const [entered, setEntered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // lock scroll selama loader; unlock + refresh trigger setelah masuk
  useEffect(() => {
    if (entered) {
      lenis.start();
      // ScrollTrigger butuh refresh setelah layout settle
      const t = window.setTimeout(() => window.dispatchEvent(new Event("resize")), 300);
      return () => window.clearTimeout(t);
    }
    lenis.stop();
  }, [entered]);

  return (
    <>
      <Loader onDone={() => setEntered(true)} />
      <Hud containerRef={containerRef} />
      <div id="scroll-parent" ref={containerRef} style={{ height: "700vh", width: "100%" }}>
        <div style={{ height: "100vh", width: "100%", position: "sticky", top: 0 }}>
          <Canvas
            shadows={!isMobile}
            dpr={isMobile ? [0.7, 1] : [1, 1.75]}
            camera={{ position: [0, 1.4, 5], fov: 62 }}
            performance={{ min: 0.5 }}
            gl={{
              antialias: !isMobile,
              alpha: false,
              powerPreference: "high-performance",
              stencil: false,
            }}
          >
            <Environment preset="city" resolution={isMobile ? 64 : 128} />
            <Scene isMobile={isMobile} />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              enableDamping
              dampingFactor={0.08}
              target={ORBIT_TARGET}
              onStart={() => {
                /* user drag overrides parallax lookAt next frame */
              }}
            />
            {!isMobile && (
              <EffectComposer>
                <Vignette darkness={0.35} offset={0.25} />
              </EffectComposer>
            )}
          </Canvas>
        </div>
      </div>
    </>
  );
};

export default App;
