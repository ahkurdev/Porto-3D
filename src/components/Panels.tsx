import { config } from "../config";

/**
 * Content panels + waypoints yang di-spawn sebagai JSX di dalam Canvas
 * lewat <Html> dari drei. Posisi diselaraskan dengan keyframe kamera di Scene.
 */
export const STATIONS = [
  { name: "about", z: -14 },
  { name: "skills", z: -28 },
  { name: "projects", z: -42 },
  { name: "experience", z: -56 },
  { name: "contact", z: -70 },
] as const;

export type StationName = (typeof STATIONS)[number]["name"];

export const PANEL_X = 2.2;

const ProjectsPanel = () => (
  <div className="panel contact-panel">
    <div className="panel-kicker">01 · Selected work</div>
    <h2>Shipped &amp; open code</h2>
    {config.projects.map((p) => (
      <a
        key={p.name}
        className="proj"
        href={p.link}
        target="_blank"
        rel="noreferrer noopener"
      >
        <div className="proj-name">
          {p.name}
          <span className="arrow">↗</span>
        </div>
        <div className="proj-desc">{p.description}</div>
      </a>
    ))}
  </div>
);

const AboutPanel = () => (
  <div className="panel">
    <div className="panel-kicker">{config.about.kicker}</div>
    <h2>
      Systems that hold up
      <br />
      under real load
    </h2>
    <p>{config.about.lines.join(" ")}</p>
    <p style={{ marginTop: 10 }}>
      Foundation from live community platforms: real users, persistent data,
      exploit pressure, performance problems that had to be solved in production.
    </p>
  </div>
);

const SkillsPanel = () => (
  <div className="panel">
    <div className="panel-kicker">02 · Toolbox</div>
    <h2>Stack &amp; tools</h2>
    {config.skills.map((s) => (
      <div className="skill-row" key={s.name}>
        <div className="skill-name">{s.name}</div>
        <div className="skill-track">
          <div className="skill-fill" style={{ width: `${s.level}%` }} />
        </div>
        <div className="skill-name" style={{ width: 34, textAlign: "right", color: "var(--ink-soft)" }}>
          {s.level}
        </div>
      </div>
    ))}
  </div>
);

const ExperiencePanel = () => (
  <div className="panel" style={{ width: "min(460px, 88vw)" }}>
    <div className="panel-kicker">03 · Systems work</div>
    <h2>Under real load</h2>
    {config.experience.map((x) => (
      <div className="xp" key={`${x.period}-${x.place}`}>
        <div className="xp-head">
          <span className="xp-role">{x.role}</span>
          <span className="xp-period">{x.period}</span>
        </div>
        <div className="xp-place">{x.place}</div>
        <div className="xp-detail">{x.detail}</div>
        <div className="xp-tags">
          {x.tags.map((t) => (
            <span className="xp-tag" key={t}>
              {t}
            </span>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const ContactPanel = () => (
  <div className="panel contact-panel">
    <div className="panel-kicker">04 · Contact</div>
    <h2>Let&apos;s build something reliable</h2>
    <p>
      Open to freelance systems work, internships, and full-time roles where
      reliability matters.
    </p>
    <div className="contact-links">
      <a className="contact-link" href={`mailto:${config.contact.mail}`}>
        Email
      </a>
      <a className="contact-link" href={config.contact.socials.github} target="_blank" rel="noreferrer noopener">
        GitHub
      </a>
      <a className="contact-link" href={config.contact.socials.linkedin} target="_blank" rel="noreferrer noopener">
        LinkedIn
      </a>
    </div>
    <div className="contact-meta">
      <span>Location — {config.contact.location}</span>
      <span>Status — Available for projects</span>
    </div>
  </div>
);

export const PANELS: Record<StationName, () => React.ReactElement> = {
  about: AboutPanel,
  skills: SkillsPanel,
  projects: ProjectsPanel,
  experience: ExperiencePanel,
  contact: ContactPanel,
};
