import { useEffect, useRef, useState } from "react";

/**
 * Loader dengan triple fallback: progress bar visual, timer exit mandiri,
 * dan tombol continue. Reveal halaman tidak pernah bergantung pada satu
 * callback animasi — kalau effect dibunuh/HMR, timer tetap jalan.
 */
const HARD_TIMEOUT_MS = 7000;
const MIN_VISUAL_MS = 900;

const Loader = ({ onDone }: { onDone: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [done, setDone] = useState(false);
  const finished = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    setDone(true);
    window.setTimeout(onDone, 750);
  };

  useEffect(() => {
    const start = performance.now();
    const iv = window.setInterval(() => {
      const elapsed = performance.now() - start;
      // visual progress: cepat ke 90, sisanya nunggu real load / timeout
      const capped = Math.min(90, (elapsed / 1400) * 90);
      setProgress((p) => Math.max(p, Math.round(capped)));
    }, 80);

    const readyTimer = window.setTimeout(() => {
      setProgress(100);
      setShowButton(true);
    }, MIN_VISUAL_MS);

    const hardTimer = window.setTimeout(finish, HARD_TIMEOUT_MS);
    return () => {
      window.clearInterval(iv);
      window.clearTimeout(readyTimer);
      window.clearTimeout(hardTimer);
    };
  }, []);

  useEffect(() => {
    if (progress >= 100) setShowButton(true);
  }, [progress]);

  return (
    <div className={`loader${done ? " done" : ""}`} role="status" aria-label="Loading portfolio">
      <div className="loader-name">
        AHMAD<span> KURNIAWAN</span>
      </div>
      <div className="loader-bar">
        <div className="loader-bar-fill" style={{ transform: `scaleX(${progress / 100})` }} />
      </div>
      <div className="loader-status">
        {showButton ? "READY" : `LOADING ${progress}%`}
      </div>
      <button
        className={`loader-btn${showButton ? " show" : ""}`}
        onClick={finish}
        aria-label="Enter portfolio"
      >
        Enter
      </button>
    </div>
  );
};

export default Loader;
