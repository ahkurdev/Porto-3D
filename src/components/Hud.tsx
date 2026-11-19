import { config } from "../config";
import { STATIONS } from "../lib/stations";

interface HudProps {
  activeStation: number;
  scrollProgress: number;
  onSelectStation: (index: number) => void;
}

const Hud = ({ activeStation, scrollProgress, onSelectStation }: HudProps) => {
  const current = STATIONS[activeStation] ?? STATIONS[0];

  return (
    <div className="hud">
      <header className="hud-top">
        <button
          type="button"
          className="hud-brand"
          onClick={() => onSelectStation(0)}
          aria-label="Ahmad Kurniawan home"
        >
          <span className="hud-brand-main">{config.brand.prefix}</span>
          <span className="hud-brand-sub">{config.brand.suffix}</span>
        </button>

        <nav className="hud-nav" aria-label="Portfolio sections">
          {STATIONS.map((station, i) => {
            const isActive = i === activeStation;
            return (
              <button
                key={station.id}
                type="button"
                className={`hud-nav-btn${isActive ? " active" : ""}`}
                onClick={() => onSelectStation(i)}
                aria-current={isActive ? "page" : undefined}
              >
                {station.label}
              </button>
            );
          })}
        </nav>

        <a
          className="hud-cta"
          href={`mailto:${config.contact.mail}`}
          aria-label="Send email to Ahmad Kurniawan"
        >
          <span>Let&apos;s talk</span>
          <span aria-hidden="true">↗</span>
        </a>
      </header>

      <footer className="hud-bottom">
        <div className="hud-hint">
          <span className="hud-hint-desktop">Drag to look · Scroll to explore</span>
          <span className="hud-hint-mobile">Swipe or tap sections to explore</span>
        </div>

        <nav className="hud-mobile-nav" aria-label="Mobile sections">
          {STATIONS.map((station, i) => (
            <button
              key={station.id}
              type="button"
              className={`hud-mobile-btn${i === activeStation ? " active" : ""}`}
              onClick={() => onSelectStation(i)}
            >
              {station.label}
            </button>
          ))}
        </nav>

        <div className="hud-progress-wrap">
          <span className="hud-station-counter tabular-nums">
            {current.indexLabel} / 0{STATIONS.length - 1}
          </span>
          <div className="hud-progress-track" aria-hidden="true">
            <div
              className="hud-progress-fill"
              style={{ transform: `scaleX(${Math.max(0.06, scrollProgress)})` }}
            />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Hud;
