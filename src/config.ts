// Data profil, skill, project, pengalaman — sumber tunggal konten porto.
export const config = {
  title: "Ahmad Kurniawan",
  home: {
    title: "AHMAD KURNIAWAN",
    subtitle: "FULL-STACK DEVELOPER",
  },
  about: {
    kicker: "ABOUT",
    lines: [
      "Full-stack developer crafting web, mobile,",
      "and desktop systems that hold up",
      "under real production load.",
    ],
  },
  skills: [
    { name: "TypeScript", level: 90 },
    { name: "JavaScript", level: 90 },
    { name: "React", level: 85 },
    { name: "Next.js", level: 85 },
    { name: "Node.js", level: 85 },
    { name: "Kotlin", level: 75 },
    { name: "Python", level: 80 },
    { name: "SQL", level: 85 },
    { name: "Docker", level: 70 },
    { name: "Lua", level: 80 },
  ],
  projects: [
    {
      name: "Hikalist",
      description:
        "Windows desktop music player: Kotlin + Compose Desktop. Streaming search, synced lyrics, collaborative playlists, Discord Rich Presence.",
      link: "https://github.com/ahkurdev/Hikalist",
    },
    {
      name: "Web Hikalist",
      description:
        "Companion web client for the Hikalist ecosystem: account, profile, playlist management. TypeScript + React on Vercel.",
      link: "https://github.com/ahkurdev/web-hikalist",
    },
    {
      name: "DOT-LAYER",
      description:
        "Always-on-top crosshair overlay for Windows: six templates, custom PNG, global hotkeys, click-through, anti-capture.",
      link: "https://github.com/ahkurdev/DOT-LAYER",
    },
    {
      name: "Al-Server",
      description:
        "All-in-one local development server manager in C with pluggable drivers for PHP, Node, and static sites.",
      link: "https://github.com/ahkurdev/Al-Server",
    },
    {
      name: "NusaLapak",
      description:
        "Marketplace Nusantara full-stack: Express + SQL, auth, katalog, keranjang, dan alur order end-to-end.",
      link: "https://github.com/ahkurdev/NusaLapak",
    },
    {
      name: "TaskFlow",
      description:
        "Task management API in Go: project, task, and assignment flows with a clean architecture.",
      link: "https://github.com/ahkurdev/TaskFlow",
    },
  ],
  experience: [
    {
      period: "2025 — Mar 2026",
      role: "Head Developer",
      place: "Aether Roleplay",
      detail:
        "Built a production roleplay platform from zero: core systems, event validation, database flows, operational tooling.",
      tags: ["Lua", "Backend Systems", "Event Security"],
    },
    {
      period: "2024",
      role: "Security Specialist",
      place: "Indoraya Roleplay",
      detail:
        "Audited server-side logic, patched exploit paths, hardened framework permissions under real traffic.",
      tags: ["Security Audit", "Exploit Mitigation", "Access Control"],
    },
    {
      period: "2023 — 2024",
      role: "Framework Developer",
      place: "Sanjana Roleplay",
      detail:
        "Integrated gameplay frameworks with persistent data, debugged production issues, optimized Lua/MySQL workflows.",
      tags: ["Lua", "MySQL", "Performance"],
    },
    {
      period: "2023",
      role: "Lead Systems Developer",
      place: "Budaya Roleplay",
      detail:
        "Led custom script development, framework integration, performance cleanup across player-facing systems.",
      tags: ["System Design", "Integration", "Optimization"],
    },
    {
      period: "2022 — Present",
      role: "Independent Developer",
      place: "Freelance",
      detail:
        "Delivered 50+ client projects: custom features, framework conversions, debugging, deployment, consulting.",
      tags: ["Client Delivery", "Debugging", "Consulting"],
    },
  ],
  contact: {
    name: "Ahmad Kurniawan",
    location: "Lampung, Indonesia",
    socials: {
      github: "https://github.com/ahkurdev",
      linkedin: "https://www.linkedin.com/in/ahmad-kurniawan-0a6b42347",
    },
    mail: "ah.kurniawan27@gmail.com",
  },
} as const;
