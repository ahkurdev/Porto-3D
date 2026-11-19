import { useState } from "react";
import { config } from "../config";
import { STATIONS } from "../lib/stations";

interface PanelsProps {
  activeStation: number;
  activeWorkProject: number;
  activeAboutTab: number;
  activeStackCategory: number;
  onSelectStation: (index: number) => void;
  onSelectWorkProject: (projectIndex: number) => void;
  onSelectAboutTab: (tabIndex: number) => void;
  onSelectStackCategory: (catIndex: number) => void;
}

const HomeHeroOverlay = ({ onExploreWork }: { onExploreWork: () => void }) => (
  <section className="hero-overlay" aria-label="Introduction">
    <div className="hero-meta-row">
      <span>{config.home.kicker}</span>
      <span aria-hidden="true">·</span>
      <span>BASED IN {config.brand.locationShort}</span>
      <span aria-hidden="true">·</span>
      <span>{config.brand.platforms}</span>
    </div>
    <p className="hero-statement">{config.home.statement}</p>
    <div className="hero-actions">
      <button type="button" className="btn-primary" onClick={onExploreWork}>
        <span>View selected work</span>
        <span aria-hidden="true">↓</span>
      </button>
      <a
        className="btn-ghost"
        href={config.contact.socials.github}
        target="_blank"
        rel="noreferrer noopener"
      >
        <span>GitHub</span>
        <span aria-hidden="true">↗</span>
      </a>
      <div className="hero-stats tabular-nums">
        {config.home.stats.map((s) => (
          <div className="hero-stat" key={s.label}>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const WorkPanel = ({
  activeWorkProject,
  onSelectWorkProject,
  onContinueToAbout,
}: {
  activeWorkProject: number;
  onSelectWorkProject: (index: number) => void;
  onContinueToAbout: () => void;
}) => {
  const project = config.projects[activeWorkProject] ?? config.projects[0];
  const isLast = activeWorkProject === config.projects.length - 1;

  return (
    <section className="station-panel" aria-label="Selected work">
      <div className="panel-header-row">
        <div className="panel-header">
          <div className="panel-kicker">01 / SELECTED WORK</div>
          <h2>Software in practice.</h2>
        </div>
        <span className="work-counter tabular-nums">
          0{activeWorkProject + 1} / 0{config.projects.length}
        </span>
      </div>

      <div className="segment-bar work-tabs" role="tablist" aria-label="Select project">
        {config.projects.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={idx === activeWorkProject}
            className={`segment-btn${idx === activeWorkProject ? " active" : ""}`}
            onClick={() => onSelectWorkProject(idx)}
          >
            <span className="segment-num">{item.num}</span>
            <span className="segment-label">{item.name.replace("Pekon ", "")}</span>
          </button>
        ))}
      </div>

      <article className="project-detail">
        <div className="project-meta-line">
          <span>{project.num}</span>
          <span aria-hidden="true">·</span>
          <span>{project.category}</span>
        </div>
        <h3>{project.name}</h3>
        <p className="project-tagline">{project.tagline}</p>
        <p className="panel-body">{project.description}</p>

        <div className="arch-box">
          <div className="arch-head">
            <span>{project.diagramTitle}</span>
            <span className="arch-sub">{project.diagramSubtitle}</span>
          </div>
          <div className="arch-steps">
            {project.flowSteps.map((step, idx) => (
              <div className="arch-step" key={step}>
                <span className="arch-step-text">{step}</span>
                {idx < project.flowSteps.length - 1 && (
                  <span className="arch-arrow" aria-hidden="true">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="inline-meta">{project.stack.join(" · ")}</div>

        <div className="panel-actions">
          <a
            className="btn-primary"
            href={project.link}
            target="_blank"
            rel="noreferrer noopener"
          >
            <span>{project.linkLabel}</span>
            <span aria-hidden="true">↗</span>
          </a>
          <button
            type="button"
            className="btn-ghost"
            onClick={() =>
              isLast ? onContinueToAbout() : onSelectWorkProject(activeWorkProject + 1)
            }
          >
            <span>
              {isLast ? "Next: About" : `Next (${config.projects[activeWorkProject + 1].num})`}
            </span>
            <span aria-hidden="true">↓</span>
          </button>
        </div>
        {project.note && <span className="project-note">{project.note}</span>}
      </article>
    </section>
  );
};

const AboutPanel = ({
  activeAboutTab,
  onSelectAboutTab,
  onContinueToStack,
}: {
  activeAboutTab: number;
  onSelectAboutTab: (tabIndex: number) => void;
  onContinueToStack: () => void;
}) => {
  const isProfile = activeAboutTab === 0;

  return (
    <section className="station-panel" aria-label="About Ahmad Kurniawan">
      <div className="panel-header-row">
        <div className="panel-header">
          <div className="panel-kicker">
            {isProfile ? config.about.kicker : config.about.capabilitiesKicker}
          </div>
          <h2>
            {isProfile ? config.about.heading : config.about.capabilitiesHeading}
          </h2>
        </div>
        <span className="work-counter tabular-nums">0{activeAboutTab + 1} / 02</span>
      </div>

      <div className="segment-bar" role="tablist" aria-label="About sections">
        <button
          type="button"
          role="tab"
          aria-selected={isProfile}
          className={`segment-btn${isProfile ? " active" : ""}`}
          onClick={() => onSelectAboutTab(0)}
        >
          <span className="segment-num">01</span>
          <span className="segment-label">Profile</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!isProfile}
          className={`segment-btn${!isProfile ? " active" : ""}`}
          onClick={() => onSelectAboutTab(1)}
        >
          <span className="segment-num">02</span>
          <span className="segment-label">Capabilities</span>
        </button>
      </div>

      {isProfile ? (
        <div className="about-copy">
          <div className="id-strip">
            <div>
              <strong>{config.brand.fullName}</strong>
              <span>{config.brand.role}</span>
            </div>
            <span className="id-badge">ID / 01</span>
          </div>
          {config.about.paragraphs.map((p, idx) => (
            <p className="panel-body" key={idx}>
              {p}
            </p>
          ))}
          <div className="inline-meta">{config.about.tags.join(" · ")}</div>
        </div>
      ) : (
        <div className="cap-grid">
          {config.about.capabilities.map((cap) => (
            <article className="cap-item" key={cap.num}>
              <div className="cap-head">
                <span className="cap-num">{cap.num}</span>
                <h3>{cap.title}</h3>
              </div>
              <p>{cap.description}</p>
            </article>
          ))}
        </div>
      )}

      <div className="panel-actions">
        <button
          type="button"
          className="btn-ghost"
          onClick={() => (isProfile ? onSelectAboutTab(1) : onContinueToStack())}
        >
          <span>{isProfile ? "Next (02 Capabilities)" : "Next: Stack"}</span>
          <span aria-hidden="true">↓</span>
        </button>
      </div>
    </section>
  );
};

const StackPanel = ({
  activeStackCategory,
  onSelectStackCategory,
  onContinueToContact,
}: {
  activeStackCategory: number;
  onSelectStackCategory: (catIndex: number) => void;
  onContinueToContact: () => void;
}) => {
  const category = config.techCategories[activeStackCategory] ?? config.techCategories[0];
  const isLast = activeStackCategory === config.techCategories.length - 1;

  return (
    <section className="station-panel" aria-label="Technology stack">
      <div className="panel-header-row">
        <div className="panel-header">
          <div className="panel-kicker">04 / TECHNOLOGY</div>
          <h2>A stack with purpose.</h2>
        </div>
        <span className="work-counter tabular-nums">
          0{activeStackCategory + 1} / 0{config.techCategories.length}
        </span>
      </div>

      <div className="segment-bar" role="tablist" aria-label="Technology categories">
        {config.techCategories.map((cat, idx) => (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={idx === activeStackCategory}
            className={`segment-btn${idx === activeStackCategory ? " active" : ""}`}
            onClick={() => onSelectStackCategory(idx)}
          >
            <span className="segment-num">{cat.num}</span>
            <span className="segment-label">{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="stack-body">
        <div className="project-meta-line tabular-nums">
          <span>MY TOOLKIT / {category.num}</span>
          <span aria-hidden="true">·</span>
          <span>{category.items.length} TECHNOLOGIES</span>
        </div>
        <h3>{category.label}</h3>
        <p className="panel-body">{category.description}</p>

        <ul className="tech-grid" aria-label={`${category.label} list`}>
          {category.items.map((tech) => (
            <li key={tech} className="tech-cell">
              {tech}
            </li>
          ))}
        </ul>

        <div className="panel-actions">
          <a
            className="btn-ghost"
            href={config.openSource.reposUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            <span>See my repositories</span>
            <span aria-hidden="true">↗</span>
          </a>
          <button
            type="button"
            className="btn-ghost"
            onClick={() =>
              isLast ? onContinueToContact() : onSelectStackCategory(activeStackCategory + 1)
            }
          >
            <span>
              {isLast
                ? "Next: Contact"
                : `Next (${config.techCategories[activeStackCategory + 1].num})`}
            </span>
            <span aria-hidden="true">↓</span>
          </button>
        </div>
      </div>
    </section>
  );
};

const ContactPanel = () => {
  const [copiedKey, setCopiedKey] = useState<"email" | "discord" | null>(null);

  const copyValue = async (value: string, key: "email" | "discord") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 2000);
    } catch {
      setCopiedKey(key);
    }
  };

  return (
    <section className="station-panel" aria-label="Contact information">
      <div className="panel-header">
        <div className="panel-kicker">{config.contact.kicker}</div>
        <h2>{config.contact.heading}</h2>
      </div>

      <p className="panel-body">{config.contact.description}</p>
      <div className="inline-meta">
        <span>{config.brand.status}</span>
        <span aria-hidden="true">·</span>
        <span>{config.contact.location}</span>
      </div>

      <div className="contact-rows">
        <div className="contact-row">
          <a className="contact-value" href={`mailto:${config.contact.mail}`}>
            {config.contact.mail}
          </a>
          <button
            type="button"
            className="copy-btn"
            onClick={() => copyValue(config.contact.mail, "email")}
            aria-label="Copy email address"
          >
            {copiedKey === "email" ? "Copied" : "Copy email"}
          </button>
        </div>

        <div className="contact-row">
          <span className="contact-value">Discord: {config.contact.discord}</span>
          <button
            type="button"
            className="copy-btn"
            onClick={() => copyValue(config.contact.discord, "discord")}
            aria-label="Copy Discord username"
          >
            {copiedKey === "discord" ? "Copied" : "Copy Discord"}
          </button>
        </div>
      </div>

      <div className="social-links">
        <a
          className="btn-ghost"
          href={config.contact.socials.github}
          target="_blank"
          rel="noreferrer noopener"
        >
          <span>GitHub</span>
          <span aria-hidden="true">↗</span>
        </a>
        <a
          className="btn-ghost"
          href={config.contact.socials.instagram}
          target="_blank"
          rel="noreferrer noopener"
        >
          <span>Instagram</span>
          <span aria-hidden="true">↗</span>
        </a>
        <a
          className="btn-ghost"
          href={config.contact.socials.linkedin}
          target="_blank"
          rel="noreferrer noopener"
        >
          <span>LinkedIn</span>
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
};

const Panels = ({
  activeStation,
  activeWorkProject,
  activeAboutTab,
  activeStackCategory,
  onSelectStation,
  onSelectWorkProject,
  onSelectAboutTab,
  onSelectStackCategory,
}: PanelsProps) => {
  const station = STATIONS[activeStation] ?? STATIONS[0];

  if (station.id === "home") {
    return <HomeHeroOverlay onExploreWork={() => onSelectStation(1)} />;
  }

  return (
    <div className="station-panel-slot" data-station={station.id}>
      {station.id === "work" && (
        <WorkPanel
          activeWorkProject={activeWorkProject}
          onSelectWorkProject={onSelectWorkProject}
          onContinueToAbout={() => onSelectStation(2)}
        />
      )}
      {station.id === "about" && (
        <AboutPanel
          activeAboutTab={activeAboutTab}
          onSelectAboutTab={onSelectAboutTab}
          onContinueToStack={() => onSelectStation(3)}
        />
      )}
      {station.id === "stack" && (
        <StackPanel
          activeStackCategory={activeStackCategory}
          onSelectStackCategory={onSelectStackCategory}
          onContinueToContact={() => onSelectStation(4)}
        />
      )}
      {station.id === "contact" && <ContactPanel />}
    </div>
  );
};

export default Panels;
