import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { HomeText, StationText, Ground, CorridorPillars } from "./components/Text3DHelpers";
import { StationMonument } from "./components/Monuments";
import { GlbArchitectCore } from "./components/GlbArchitectCore";
import {
  CorridorDataStreams,
  CorridorPortals,
  SkyAtmosphere,
  StationPulseRing,
  VolumetricBeam,
} from "./components/AtmosphericEffects";
import Petals from "./components/Petals";
import StudioEnvironment from "./components/StudioEnvironment";
import { STATIONS, getCameraPoseForProgress, getStationIndexFromProgress } from "./lib/stations";

const _lookVec = new THREE.Vector3();

interface SceneProps {
  isMobile: boolean;
  isSoftwareGl: boolean;
  activeWorkProject: number;
  activeAboutTab: number;
  activeStackCategory: number;
  scrollProgressRef: React.MutableRefObject<number>;
  scrollSpeedRef: React.MutableRefObject<number>;
  onActiveStationChange: (index: number) => void;
}

const Scene = ({
  isMobile,
  isSoftwareGl,
  activeWorkProject,
  activeAboutTab,
  activeStackCategory,
  scrollProgressRef,
  scrollSpeedRef,
  onActiveStationChange,
}: SceneProps) => {
  const { gl, invalidate } = useThree();
  const smoothProgress = useRef(0);
  const parallax = useRef({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const targetDrag = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const lastReportedStation = useRef(-1);
  const pacerBusy = useRef(false);
  const accentLightRef = useRef<THREE.PointLight>(null);

  // Software-WebGL frame pacing using WebGL fenceSync + cooldown
  useEffect(() => {
    if (!isSoftwareGl) return;
    let cancelled = false;
    let timerId = 0;

    const scheduleNext = () => {
      if (cancelled || pacerBusy.current) return;
      pacerBusy.current = true;
      const ctx = gl.getContext() as WebGL2RenderingContext;
      const sync =
        typeof ctx.fenceSync === "function"
          ? ctx.fenceSync(ctx.SYNC_GPU_COMMANDS_COMPLETE, 0)
          : null;
      ctx.flush();

      const poll = () => {
        if (cancelled) {
          if (sync) ctx.deleteSync(sync);
          return;
        }
        const status = sync ? ctx.getSyncParameter(sync, ctx.SYNC_STATUS) : ctx.SIGNALED;
        if (status === ctx.UNSIGNALED) {
          timerId = window.setTimeout(poll, 8);
        } else {
          if (sync) ctx.deleteSync(sync);
          timerId = window.setTimeout(() => {
            pacerBusy.current = false;
            if (!cancelled) invalidate();
          }, 95);
        }
      };
      timerId = window.setTimeout(poll, 8);
    };

    const onScrollOrResize = () => {
      if (!cancelled) invalidate();
    };

    invalidate();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    const kick = window.setInterval(() => {
      if (!pacerBusy.current && !cancelled) {
        scheduleNext();
      }
    }, 110);

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
      window.clearInterval(kick);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [gl, invalidate, isSoftwareGl]);

  // Pointer drag-to-look without fighting scroll camera travel
  useEffect(() => {
    const dom = gl.domElement;
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      isDragging.current = true;
      lastPointer.current = { x: e.clientX, y: e.clientY };
    };
    const onMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const dx = (e.clientX - lastPointer.current.x) / Math.max(window.innerWidth, 1);
      const dy = (e.clientY - lastPointer.current.y) / Math.max(window.innerHeight, 1);
      lastPointer.current = { x: e.clientX, y: e.clientY };
      targetDrag.current.x = THREE.MathUtils.clamp(targetDrag.current.x - dx * 2.2, -1.4, 1.4);
      targetDrag.current.y = THREE.MathUtils.clamp(targetDrag.current.y + dy * 1.2, -0.55, 0.75);
      if (isSoftwareGl) invalidate();
    };
    const onUp = () => {
      isDragging.current = false;
    };

    dom.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      dom.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [gl, invalidate, isSoftwareGl]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, isSoftwareGl ? 0.14 : 0.08);
    const prevSmooth = smoothProgress.current;

    if (isSoftwareGl && Math.abs(smoothProgress.current - scrollProgressRef.current) > 0.02) {
      smoothProgress.current = THREE.MathUtils.lerp(
        smoothProgress.current,
        scrollProgressRef.current,
        0.72,
      );
    } else {
      smoothProgress.current = THREE.MathUtils.damp(
        smoothProgress.current,
        scrollProgressRef.current,
        isSoftwareGl ? 22 : 8,
        dt,
      );
    }

    // Track scroll velocity for kinetic corridor streaks & subtle camera FOV breath
    const instantSpeed = dt > 0.0001 ? Math.abs(smoothProgress.current - prevSmooth) / dt : 0;
    scrollSpeedRef.current = THREE.MathUtils.damp(scrollSpeedRef.current, instantSpeed, 6, dt);

    const activeIdx = getStationIndexFromProgress(
      isSoftwareGl ? scrollProgressRef.current : smoothProgress.current,
    );
    if (activeIdx !== lastReportedStation.current) {
      lastReportedStation.current = activeIdx;
      onActiveStationChange(activeIdx);
    }

    if (!isDragging.current) {
      targetDrag.current.x = THREE.MathUtils.damp(targetDrag.current.x, 0, 2.2, dt);
      targetDrag.current.y = THREE.MathUtils.damp(targetDrag.current.y, 0, 2.2, dt);
    }
    dragOffset.current.x = THREE.MathUtils.damp(dragOffset.current.x, targetDrag.current.x, 8, dt);
    dragOffset.current.y = THREE.MathUtils.damp(dragOffset.current.y, targetDrag.current.y, 8, dt);

    parallax.current.x = THREE.MathUtils.damp(parallax.current.x, state.pointer.x * 0.42, 4.5, dt);
    parallax.current.y = THREE.MathUtils.damp(parallax.current.y, state.pointer.y * 0.22, 4.5, dt);

    const pose = getCameraPoseForProgress(smoothProgress.current);
    const mobileActive = isMobile && activeIdx > 0;
    const mobileXOffset = isMobile ? -pose.x : 0;
    const mobileLookXOffset = isMobile ? -pose.lookX : 0;
    const mobileZPull = mobileActive ? 2.1 : isMobile ? 1.4 : 0;
    const mobileYShift = mobileActive ? -0.35 : 0;
    const mobileLookYShift = mobileActive ? -0.95 : 0;

    state.camera.position.set(
      pose.x + mobileXOffset + parallax.current.x + dragOffset.current.x,
      pose.y + mobileYShift + parallax.current.y + dragOffset.current.y,
      pose.z + mobileZPull,
    );

    _lookVec.set(
      pose.lookX + mobileLookXOffset + parallax.current.x * 0.24,
      pose.lookY + mobileLookYShift,
      pose.lookZ,
    );
    state.camera.lookAt(_lookVec);

    // Subtle interactive metallic glint light tracking camera + pointer
    if (accentLightRef.current) {
      accentLightRef.current.position.set(
        pose.lookX + parallax.current.x * 4.5,
        2.4 + parallax.current.y * 2.2,
        pose.z - 2.4,
      );
    }
  });

  const monumentX = isMobile ? 0 : -2.05;

  return (
    <>
      <color attach="background" args={["#050608"]} />
      <fog attach="fog" args={["#050608", 12, 42]} />

      <SkyAtmosphere />
      <StudioEnvironment />

      {/* Warm/cool architectural 3-point studio rig + interactive glint point light */}
      <hemisphereLight args={["#dbeafe", "#09090d", 0.78]} />
      <directionalLight
        castShadow={!isMobile && !isSoftwareGl}
        position={[7, 12, 6]}
        intensity={1.9}
        color="#fff7ed"
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={55}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-7, 5, -9]} intensity={1.05} color="#bfdbfe" />
      <pointLight ref={accentLightRef} intensity={4.5} distance={14} decay={2} color="#e0f2fe" />

      <Ground />
      <CorridorPillars isMobile={isMobile} />
      <CorridorPortals />
      <CorridorDataStreams count={isMobile ? 24 : 56} scrollSpeedRef={scrollSpeedRef} />
      <Petals count={isMobile ? 44 : 120} />

      {/* Station 0: Hero GLB Kinetic Core + Volumetric Beam + Telemetry Pulse Floor */}
      <GlbArchitectCore position={[0, -0.05, -4.8]} />
      <VolumetricBeam position={[0, 0, -4.8]} radiusTop={0.8} radiusBottom={2.9} height={9.2} phase={0} />
      <StationPulseRing position={[0, 0, -4.8]} phase={0} />
      <HomeText isMobile={isMobile} />

      {/* Stations 1..4: Multi-GLB & Reactive Sculptures + Volumetric Beams + GLSL Pulse Rings */}
      {STATIONS.slice(1).map((st, idx) => {
        const stationKey = st.id as "work" | "about" | "stack" | "contact";
        return (
          <group key={st.id}>
            <StationMonument
              stationId={stationKey}
              position={[monumentX, 0.1, st.z]}
              activeWorkProject={activeWorkProject}
              activeAboutTab={activeAboutTab}
              activeStackCategory={activeStackCategory}
            />
            <VolumetricBeam
              position={[monumentX, 0, st.z]}
              radiusTop={0.55}
              radiusBottom={2.3}
              height={8.2}
              phase={(idx + 1) * 1.1}
            />
            <StationPulseRing position={[monumentX, 0, st.z]} phase={(idx + 1) * 0.22} />
            <StationText
              text={`${st.indexLabel} / ${st.label.toUpperCase()}`}
              position={[monumentX, isMobile ? 2.15 : 2.38, st.z]}
              scale={isMobile ? 0.72 : 0.92}
            />
          </group>
        );
      })}
    </>
  );
};

export default Scene;
