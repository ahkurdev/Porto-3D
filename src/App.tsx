import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import Scene from "./Scene";
import Loader from "./components/Loader";
import Hud from "./components/Hud";
import Panels from "./components/Panels";
import { useMobile } from "./hooks/useMobile";
import { detectSoftwareWebGL } from "./utils/webgl";
import { config } from "./config";
import {
  STATIONS,
  clampProgress,
  getAboutTabIndexFromProgress,
  getProgressForAboutTab,
  getProgressForStackCategory,
  getProgressForStation,
  getProgressForWorkProject,
  getStackCategoryIndexFromProgress,
  getStationIndexFromProgress,
  getWorkProjectIndexFromProgress,
} from "./lib/stations";
import lenis from "./lib/lenis";

const ReactivePostProcessing = ({
  scrollSpeedRef,
}: {
  scrollSpeedRef: React.MutableRefObject<number>;
}) => {
  const chromaOffset = useMemo(() => new THREE.Vector2(0.0003, 0.0002), []);

  useFrame(() => {
    const warp = Math.min(scrollSpeedRef.current * 0.012, 0.0038);
    chromaOffset.set(0.00025 + warp, 0.00018 + warp * 0.6);
  });

  return (
    <EffectComposer>
      <Bloom mipmapBlur luminanceThreshold={0.76} intensity={0.62} />
      <ChromaticAberration offset={chromaOffset} radialModulation modulationOffset={0.35} />
      <Vignette darkness={0.46} offset={0.2} />
    </EffectComposer>
  );
};

const App = () => {
  const { isMobile } = useMobile();
  const isSoftwareGl = useMemo(() => detectSoftwareWebGL(), []);
  const [entered, setEntered] = useState(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("autostart") === "1";
  });
  const [activeStation, setActiveStation] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [contextLost, setContextLost] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef(0);
  const scrollSpeedRef = useRef(0);

  const activeWorkProject = useMemo(
    () => getWorkProjectIndexFromProgress(scrollProgress, config.projects.length),
    [scrollProgress],
  );
  const activeAboutTab = useMemo(
    () => getAboutTabIndexFromProgress(scrollProgress, 2),
    [scrollProgress],
  );
  const activeStackCategory = useMemo(
    () => getStackCategoryIndexFromProgress(scrollProgress, config.techCategories.length),
    [scrollProgress],
  );

  const syncScrollProgress = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const total = Math.max(1, el.scrollHeight - window.innerHeight);
    const p = clampProgress(window.scrollY / total);
    scrollProgressRef.current = p;
    setScrollProgress(p);
    if (isSoftwareGl) {
      setActiveStation(getStationIndexFromProgress(p));
    }
  }, [isSoftwareGl]);

  useEffect(() => {
    if (entered) {
      lenis.start();
    } else {
      lenis.stop();
    }
  }, [entered]);

  useEffect(() => {
    syncScrollProgress();
    const unsubLenis = lenis.on("scroll", syncScrollProgress);
    window.addEventListener("scroll", syncScrollProgress, { passive: true });
    window.addEventListener("resize", syncScrollProgress, { passive: true });
    return () => {
      unsubLenis();
      window.removeEventListener("scroll", syncScrollProgress);
      window.removeEventListener("resize", syncScrollProgress);
    };
  }, [syncScrollProgress]);

  const scrollToProgress = useCallback(
    (targetProgress: number, nextStation?: number) => {
      const el = containerRef.current;
      if (!el) return;
      const total = Math.max(1, el.scrollHeight - window.innerHeight);
      const targetY = targetProgress * total;

      if (isSoftwareGl) {
        lenis.scrollTo(targetY, { immediate: true });
        scrollProgressRef.current = targetProgress;
        setScrollProgress(targetProgress);
        if (typeof nextStation === "number") {
          setActiveStation(nextStation);
        }
      } else {
        lenis.scrollTo(targetY, { duration: 0.75 });
      }
    },
    [isSoftwareGl],
  );

  const jumpToStation = useCallback(
    (index: number) => {
      scrollToProgress(getProgressForStation(index), index);
    },
    [scrollToProgress],
  );

  const jumpToWorkProject = useCallback(
    (projectIndex: number) => {
      scrollToProgress(getProgressForWorkProject(projectIndex, config.projects.length), 1);
    },
    [scrollToProgress],
  );

  const jumpToAboutTab = useCallback(
    (tabIndex: number) => {
      scrollToProgress(getProgressForAboutTab(tabIndex, 2), 2);
    },
    [scrollToProgress],
  );

  const jumpToStackCategory = useCallback(
    (catIndex: number) => {
      scrollToProgress(getProgressForStackCategory(catIndex, config.techCategories.length), 3);
    },
    [scrollToProgress],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!entered) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        if (activeStation === 1 && activeWorkProject < config.projects.length - 1) {
          jumpToWorkProject(activeWorkProject + 1);
        } else if (activeStation === 2 && activeAboutTab < 1) {
          jumpToAboutTab(activeAboutTab + 1);
        } else if (activeStation === 3 && activeStackCategory < config.techCategories.length - 1) {
          jumpToStackCategory(activeStackCategory + 1);
        } else {
          jumpToStation(Math.min(STATIONS.length - 1, activeStation + 1));
        }
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        if (activeStation === 1 && activeWorkProject > 0) {
          jumpToWorkProject(activeWorkProject - 1);
        } else if (activeStation === 2 && activeAboutTab > 0) {
          jumpToAboutTab(activeAboutTab - 1);
        } else if (activeStation === 3 && activeStackCategory > 0) {
          jumpToStackCategory(activeStackCategory - 1);
        } else {
          jumpToStation(Math.max(0, activeStation - 1));
        }
      } else if (e.key >= "1" && e.key <= "5") {
        jumpToStation(Number(e.key) - 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    activeStation,
    activeWorkProject,
    activeAboutTab,
    activeStackCategory,
    entered,
    jumpToStation,
    jumpToWorkProject,
    jumpToAboutTab,
    jumpToStackCategory,
  ]);

  return (
    <div
      data-station={STATIONS[activeStation]?.id ?? "home"}
      data-work-project={activeWorkProject}
      data-about-tab={activeAboutTab}
      data-stack-category={activeStackCategory}
      data-entered={entered ? "true" : "false"}
    >
      <Loader onDone={() => setEntered(true)} />
      <Hud
        activeStation={activeStation}
        scrollProgress={scrollProgress}
        onSelectStation={jumpToStation}
      />
      <Panels
        activeStation={activeStation}
        activeWorkProject={activeWorkProject}
        activeAboutTab={activeAboutTab}
        activeStackCategory={activeStackCategory}
        onSelectStation={jumpToStation}
        onSelectWorkProject={jumpToWorkProject}
        onSelectAboutTab={jumpToAboutTab}
        onSelectStackCategory={jumpToStackCategory}
      />

      <div id="scroll-parent" ref={containerRef} style={{ height: "1100vh", width: "100%" }}>
        <div className="canvas-sticky" data-testid="three-viewport">
          {contextLost ? (
            <div className="webgl-fallback">
              <p>3D viewport paused due to WebGL context loss.</p>
            </div>
          ) : (
            <Canvas
              frameloop={isSoftwareGl ? "demand" : "always"}
              shadows={!isMobile && !isSoftwareGl}
              dpr={isSoftwareGl ? 1 : isMobile ? [1, 1.25] : [1, 1.75]}
              camera={{ position: [0, 1.55, 6.2], fov: isMobile ? 60 : 52 }}
              performance={{ min: 0.5 }}
              gl={{
                antialias: !isMobile && !isSoftwareGl,
                alpha: false,
                powerPreference: "high-performance",
                stencil: false,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.12,
              }}
              onCreated={({ gl }) => {
                gl.outputColorSpace = THREE.SRGBColorSpace;
                const canvas = gl.domElement;
                canvas.addEventListener("webglcontextlost", (ev) => {
                  ev.preventDefault();
                  setContextLost(true);
                });
                canvas.addEventListener("webglcontextrestored", () => {
                  setContextLost(false);
                });
              }}
            >
              <Scene
                isMobile={isMobile}
                isSoftwareGl={isSoftwareGl}
                activeWorkProject={activeWorkProject}
                activeAboutTab={activeAboutTab}
                activeStackCategory={activeStackCategory}
                scrollProgressRef={scrollProgressRef}
                scrollSpeedRef={scrollSpeedRef}
                onActiveStationChange={setActiveStation}
              />
              {!isMobile && !isSoftwareGl && (
                <ReactivePostProcessing scrollSpeedRef={scrollSpeedRef} />
              )}
            </Canvas>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
