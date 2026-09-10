import { useEffect, useRef } from "react";

/**
 * Scroll-coupled HUD: nav aktif mengikuti scroll, thumb progress.
 * Semua ukuran dari live DOM (getBoundingClientRect), bukan callback animasi.
 */
const SECTIONS = ["home", "about", "skills", "projects", "experience", "contact"] as const;

const Hud = ({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) => {
  const navRef = useRef<HTMLElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const el = containerRef.current;
      if (el) {
        const total = el.scrollHeight - window.innerHeight;
        const y = window.scrollY;
        const p = total > 0 ? Math.min(1, Math.max(0, y / total)) : 0;
        if (thumbRef.current) thumbRef.current.style.transform = `scaleY(${p})`;

        // section aktif = stasiun terdekat (home di 0, tiap stasiun +1)
        const idx = Math.min(SECTIONS.length - 1, Math.round(p * SECTIONS.length));
        const btns = navRef.current?.querySelectorAll("button");
        btns?.forEach((b, i) => b.classList.toggle("active", i === idx));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [containerRef]);

  const jump = (i: number) => {
    const el = containerRef.current;
    if (!el) return;
    const total = el.scrollHeight - window.innerHeight;
    const target = (i / SECTIONS.length) * total;
    window.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <header className="hud">
      <div className="hud-top">
        <div className="hud-name">
          AHMAD<span>KURNIAWAN</span>
        </div>
        <nav className="hud-nav" ref={navRef} aria-label="Portfolio sections">
          {SECTIONS.map((s, i) => (
            <button key={s} onClick={() => jump(i)}>
              {s}
            </button>
          ))}
        </nav>
      </div>
      <div className="hud-bottom">
        <div className="hud-hint">Drag to orbit · Scroll to travel</div>
        <div className="hud-scroll">
          <div className="hud-scroll-track">
            <div className="hud-scroll-thumb" ref={thumbRef} />
          </div>
          <span>Scroll</span>
        </div>
      </div>
    </header>
  );
};

export default Hud;
