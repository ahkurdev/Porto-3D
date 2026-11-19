import { useEffect, useRef, useState } from "react";
import { config } from "../config";

const HARD_TIMEOUT_MS = 6500;
const MIN_VISUAL_MS = 750;

const Loader = ({ onDone }: { onDone: () => void }) => {
  const autostart =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("autostart") === "1";

  const [progress, setProgress] = useState(autostart ? 100 : 0);
  const [showButton, setShowButton] = useState(autostart);
  const [done, setDone] = useState(autostart);
  const finished = useRef(autostart);

  useEffect(() => {
    if (autostart) {
      onDone();
      return;
    }

    const start = performance.now();
    const iv = window.setInterval(() => {
      const elapsed = performance.now() - start;
      const capped = Math.min(92, (elapsed / 950) * 92);
      setProgress((p) => Math.max(p, Math.round(capped)));
    }, 60);

    const readyTimer = window.setTimeout(() => {
      setProgress(100);
      setShowButton(true);
    }, MIN_VISUAL_MS);

    const hardTimer = window.setTimeout(() => {
      if (finished.current) return;
      finished.current = true;
      setDone(true);
      window.setTimeout(onDone, 500);
    }, HARD_TIMEOUT_MS);

    return () => {
      window.clearInterval(iv);
      window.clearTimeout(readyTimer);
      window.clearTimeout(hardTimer);
    };
  }, [autostart, onDone]);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    setDone(true);
    window.setTimeout(onDone, 500);
  };

  if (autostart) return null;

  return (
    <div
      className={`loader${done ? " done" : ""}`}
      role="status"
      aria-label="Loading portfolio"
    >
      <div className="loader-brand">
        <span>{config.brand.prefix}</span>
        <span className="loader-brand-sub">{config.brand.suffix}</span>
      </div>
      <div className="loader-bar">
        <div
          className="loader-bar-fill"
          style={{ transform: `scaleX(${progress / 100})` }}
        />
      </div>
      <div className="loader-status tabular-nums">
        {showButton ? "SYSTEM READY" : `INITIALIZING ${progress}%`}
      </div>
      <button
        type="button"
        className={`loader-btn${showButton ? " show" : ""}`}
        onClick={finish}
        aria-label="Enter portfolio"
      >
        Enter Experience
      </button>
    </div>
  );
};

export default Loader;
