export interface ProjectItem {
  id: string;
  num: string;
  category: string;
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  link: string;
  linkLabel: string;
  note?: string;
  diagramTitle: string;
  diagramSubtitle: string;
  flowSteps: string[];
}

export interface CapabilityItem {
  num: string;
  title: string;
  description: string;
}

export interface TechCategory {
  num: string;
  id: string;
  label: string;
  description: string;
  items: string[];
}

export const config = {
  brand: {
    prefix: "ahkur",
    suffix: "dev.",
    fullName: "Ahmad Kurniawan",
    role: "Full-Stack Developer",
    location: "Lampung, Indonesia",
    locationShort: "LAMPUNG, ID",
    status: "AVAILABLE FOR PROJECTS",
    platforms: "WEB · MOBILE · DESKTOP",
  },
  home: {
    title: "AHMAD",
    titleSecondLine: "KURNIAWAN",
    subtitle: "FULL-STACK DEVELOPER",
    kicker: "INDEPENDENT DEVELOPER",
    buildingCycle: ["WEB SYSTEMS", "DESKTOP SOFTWARE", "MOBILE APPLICATIONS"],
    statement:
      "I build software for the web, mobile, and desktop. Thoughtful interfaces. Systems that hold together.",
    stats: [
      { value: "35", label: "Public repositories" },
      { value: "4", label: "Selected projects" },
      { value: "3", label: "Target platforms" },
    ],
  },
  projects: [
    {
      id: "sinarmulyo",
      num: "/01",
      category: "WEB / PUBLIC INFORMATION",
      name: "Pekon Sinar Mulyo",
      tagline: "A place for a village to tell its story.",
      description:
        "A public profile platform bringing Pekon information, government pages, news, a gallery, demographics, and local potential into one website.",
      stack: ["Village profile", "Public information", "Content platform"],
      link: "https://sinarmulyo.com",
      linkLabel: "Visit live site",
      note: "Live website. Some published content is marked as examples pending confirmation.",
      diagramTitle: "sinarmulyo.com",
      diagramSubtitle: "LIVE WEBSITE · PUBLIC PORTAL",
      flowSteps: ["Public Portal", "Government & News", "Demographics & Potential"],
    },
    {
      id: "hikalist",
      num: "/02",
      category: "DESKTOP / MUSIC",
      name: "Hikalist",
      tagline: "Music, with a home on your desktop.",
      description:
        "A standalone Windows music player with streaming, synchronized lyrics, offline downloads, and collaborative playlists. Local SQLite storage and Supabase sync keep playlist changes moving when connectivity returns.",
      stack: ["Kotlin", "Compose Desktop", "SQLite", "Supabase", "FFmpeg"],
      link: "https://github.com/ahkurdev/Hikalist",
      linkLabel: "View repository",
      diagramTitle: "HIKALIST · WINDOWS / JVM 21",
      diagramSubtitle: "Listen. Even offline.",
      flowSteps: ["Compose Desktop", "Playback + lyrics · Playlist sync", "SQLite / FFmpeg · Supabase"],
    },
    {
      id: "caloris",
      num: "/03",
      category: "MOBILE / HEALTH TRACKING",
      name: "Caloris",
      tagline: "Everyday tracking. Thoughtful architecture.",
      description:
        "Food, water, weight, activity, and reminders in a Flutter app. Riverpod separates interface and data logic; a per-user SQLite cache and mutation outbox support offline food diaries. Food-photo estimates stay editable before confirmation.",
      stack: ["Flutter", "Riverpod", "Supabase", "PostgreSQL", "SQLite"],
      link: "https://github.com/ahkurdev/Calories",
      linkLabel: "View repository",
      diagramTitle: "CALORIS · FLUTTER / DART",
      diagramSubtitle: "Daily habits. Local first.",
      flowSteps: [
        "01 Interface — Flutter + Riverpod",
        "02 Local persistence — SQLite cache + outbox",
        "03 Synchronization — Supabase + PostgreSQL",
      ],
    },
    {
      id: "taskflow",
      num: "/04",
      category: "WEB / REAL-TIME SYSTEMS",
      name: "TaskFlow",
      tagline: "Boards, lists, and live collaboration.",
      description:
        "Boards, lists, and draggable cards backed by ownership-scoped APIs, transactional reordering, and WebSocket updates across open clients.",
      stack: ["Go", "React", "TypeScript", "PostgreSQL", "WebSocket"],
      link: "https://github.com/ahkurdev/TaskFlow",
      linkLabel: "View repository",
      diagramTitle: "TASKFLOW · REAL-TIME API",
      diagramSubtitle: "Transactional & synced.",
      flowSteps: ["React + TypeScript UI", "Ownership-scoped Go API", "PostgreSQL + WebSocket sync"],
    },
  ] satisfies ProjectItem[],
  about: {
    kicker: "02 / THE PERSON BEHIND THE CODE",
    heading: "Across platforms. Close to the details.",
    paragraphs: [
      "I'm Ahmad, a full-stack developer based in Lampung, Indonesia. I build web, mobile, and desktop software, including the services that connect them.",
      "My current work centers on Next.js, Flutter, and Kotlin with Compose Desktop. I'm interested in how software holds together: API boundaries, local data, synchronization, and the small decisions that make an interface work.",
      "Alongside building, I study Informatics Engineering at IBI Darmajaya. I also work with Python automation and security tooling.",
    ],
    tags: ["LAMPUNG, INDONESIA", "IBI DARMAJAYA", "OPEN TO COLLABORATION"],
    capabilitiesKicker: "03 / CAPABILITIES",
    capabilitiesHeading: "The work underneath.",
    capabilities: [
      {
        num: "01",
        title: "Interface engineering",
        description:
          "Responsive web interfaces built with React, Next.js, and TypeScript. Clear interaction states and maintainable components.",
      },
      {
        num: "02",
        title: "Backend & data",
        description:
          "REST APIs, authentication, and relational data. Boundaries between application logic, storage, and external services.",
      },
      {
        num: "03",
        title: "Mobile & desktop",
        description:
          "Flutter applications and Kotlin desktop software, with local persistence, synchronization, and platform integration.",
      },
      {
        num: "04",
        title: "Automation & tooling",
        description:
          "Python scripts for repeatable tasks, network tooling, and security research workflows.",
      },
    ] satisfies CapabilityItem[],
  },
  techCategories: [
    {
      num: "01",
      id: "languages",
      label: "Languages",
      description: "The languages I use across web, mobile, desktop, and scripting.",
      items: ["JavaScript", "TypeScript", "Kotlin", "Python", "Java", "C", "C++", "Lua", "Dart"],
    },
    {
      num: "02",
      id: "frameworks",
      label: "Frameworks & Runtime",
      description: "The building blocks behind my interfaces and application runtime.",
      items: [
        "React",
        "Next.js",
        "HTML5",
        "CSS3",
        "Tailwind CSS",
        "Bootstrap",
        "Vite",
        "PHP",
        "REST API",
        "Node.js",
        "Flutter",
      ],
    },
    {
      num: "03",
      id: "data",
      label: "Data & Cloud",
      description: "Relational and document databases, cloud services, and data processing.",
      items: ["MySQL", "MariaDB", "MongoDB", "PostgreSQL", "Supabase", "Firebase", "Pandas"],
    },
    {
      num: "04",
      id: "security",
      label: "Security & Scripting",
      description: "Python tools for network work, HTTP requests, parsing, SSH, and packaging.",
      items: ["Scapy", "Requests", "BeautifulSoup", "Paramiko", "PyInstaller"],
    },
    {
      num: "05",
      id: "tools",
      label: "Tools",
      description: "My everyday workspace for version control, development, APIs, and containers.",
      items: ["Git", "GitHub", "GitLab", "VS Code", "Postman", "Linux", "Docker"],
    },
  ] satisfies TechCategory[],
  openSource: {
    kicker: "05 / OPEN SOURCE",
    heading: "The code is part of the story.",
    description:
      "Read the implementation, follow a project, or look through what I'm building next.",
    reposUrl: "https://github.com/ahkurdev?tab=repositories",
  },
  contact: {
    kicker: "04 / GET IN TOUCH",
    heading: "Have something in mind?",
    description:
      "For a project, a role, or a conversation about software. I'd like to hear what you're working on.",
    name: "Ahmad Kurniawan",
    location: "Lampung, Indonesia",
    mail: "ah.kurniawan27@gmail.com",
    discord: "allan4u",
    socials: {
      github: "https://github.com/ahkurdev",
      instagram: "https://www.instagram.com/hmd.alnk/",
      linkedin: "https://www.linkedin.com/in/ahmad-kurniawan-0a6b42347/",
    },
  },
} as const;
