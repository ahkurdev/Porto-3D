export interface StationDef {
  id: "home" | "work" | "about" | "stack" | "contact";
  label: string;
  indexLabel: string;
  z: number;
  camZ: number;
  camX: number;
  camY: number;
  lookX: number;
  lookY: number;
  lookZ: number;
}

export const SECTION_SPACING = 15;

export const STATIONS: readonly StationDef[] = [
  {
    id: "home",
    label: "Home",
    indexLabel: "00",
    z: -2,
    camZ: 6.2,
    camX: 0,
    camY: 1.55,
    lookX: 0,
    lookY: 1.15,
    lookZ: -2,
  },
  {
    id: "work",
    label: "Work",
    indexLabel: "01",
    z: -15,
    camZ: -9.2,
    camX: 0.45,
    camY: 1.45,
    lookX: -0.35,
    lookY: 1.05,
    lookZ: -15,
  },
  {
    id: "about",
    label: "About",
    indexLabel: "02",
    z: -30,
    camZ: -24.2,
    camX: 0.45,
    camY: 1.5,
    lookX: -0.35,
    lookY: 1.05,
    lookZ: -30,
  },
  {
    id: "stack",
    label: "Stack",
    indexLabel: "03",
    z: -45,
    camZ: -39.2,
    camX: 0.45,
    camY: 1.5,
    lookX: -0.35,
    lookY: 1.05,
    lookZ: -45,
  },
  {
    id: "contact",
    label: "Contact",
    indexLabel: "04",
    z: -60,
    camZ: -54.2,
    camX: 0.45,
    camY: 1.48,
    lookX: -0.35,
    lookY: 1.05,
    lookZ: -60,
  },
] as const;

export type StationId = StationDef["id"];

export interface CameraPose {
  x: number;
  y: number;
  z: number;
  lookX: number;
  lookY: number;
  lookZ: number;
}

/**
 * Scroll timeline anchors in [0, 1] so every numbered section cycles completely before advancing:
 * - 0.00 -> 0.08: Home -> Work
 * - 0.08 -> 0.36: Dwell at Work while scrolling cycles all 4 project cards (/01 .. /04)
 * - 0.36 -> 0.42: Work -> About
 * - 0.42 -> 0.56: Dwell at About while scrolling cycles both tabs (01 Profile .. 02 Capabilities)
 * - 0.56 -> 0.62: About -> Stack
 * - 0.62 -> 0.94: Dwell at Stack while scrolling cycles all 5 categories (01 Languages .. 05 Tools)
 * - 0.94 -> 1.00: Stack -> Contact
 */
export const WORK_DWELL_START = 0.08;
export const WORK_DWELL_END = 0.36;
export const ABOUT_DWELL_START = 0.42;
export const ABOUT_DWELL_END = 0.56;
export const STACK_DWELL_START = 0.62;
export const STACK_DWELL_END = 0.94;
export const CONTACT_ANCHOR = 1;

export const STATION_PROGRESS_ANCHORS = [
  0,
  getDwellProgressForItem(WORK_DWELL_START, WORK_DWELL_END, 0, 4),
  getDwellProgressForItem(ABOUT_DWELL_START, ABOUT_DWELL_END, 0, 2),
  getDwellProgressForItem(STACK_DWELL_START, STACK_DWELL_END, 0, 5),
  CONTACT_ANCHOR,
] as const;

export function clampProgress(p: number): number {
  if (!Number.isFinite(p)) return 0;
  return Math.min(1, Math.max(0, p));
}

function getDwellIndexFromProgress(
  progress: number,
  start: number,
  end: number,
  itemCount: number,
): number {
  if (itemCount <= 1) return 0;
  const p = clampProgress(progress);
  if (p <= start) return 0;
  if (p >= end) return itemCount - 1;
  const t = (p - start) / (end - start);
  return Math.min(itemCount - 1, Math.max(0, Math.floor(t * itemCount)));
}

function getDwellProgressForItem(
  start: number,
  end: number,
  itemIndex: number,
  itemCount: number,
): number {
  if (itemCount <= 1) return start;
  const idx = Math.min(itemCount - 1, Math.max(0, itemIndex));
  const slice = (end - start) / itemCount;
  return start + (idx + 0.5) * slice;
}

export function getStationIndexFromProgress(progress: number, count = STATIONS.length): number {
  if (count <= 1) return 0;
  const p = clampProgress(progress);
  if (p < WORK_DWELL_START * 0.55) return 0;
  if (p < (WORK_DWELL_END + ABOUT_DWELL_START) * 0.5) return 1;
  if (p < (ABOUT_DWELL_END + STACK_DWELL_START) * 0.5) return 2;
  if (p < (STACK_DWELL_END + CONTACT_ANCHOR) * 0.5) return 3;
  return Math.min(count - 1, 4);
}

export function getProgressForStation(index: number, count = STATIONS.length): number {
  if (count <= 1) return 0;
  const clamped = Math.min(count - 1, Math.max(0, index));
  return STATION_PROGRESS_ANCHORS[clamped] ?? 0;
}

export function getWorkProjectIndexFromProgress(progress: number, projectCount = 4): number {
  return getDwellIndexFromProgress(progress, WORK_DWELL_START, WORK_DWELL_END, projectCount);
}

export function getProgressForWorkProject(projectIndex: number, projectCount = 4): number {
  return getDwellProgressForItem(WORK_DWELL_START, WORK_DWELL_END, projectIndex, projectCount);
}

export function getAboutTabIndexFromProgress(progress: number, tabCount = 2): number {
  return getDwellIndexFromProgress(progress, ABOUT_DWELL_START, ABOUT_DWELL_END, tabCount);
}

export function getProgressForAboutTab(tabIndex: number, tabCount = 2): number {
  return getDwellProgressForItem(ABOUT_DWELL_START, ABOUT_DWELL_END, tabIndex, tabCount);
}

export function getStackCategoryIndexFromProgress(progress: number, categoryCount = 5): number {
  return getDwellIndexFromProgress(progress, STACK_DWELL_START, STACK_DWELL_END, categoryCount);
}

export function getProgressForStackCategory(categoryIndex: number, categoryCount = 5): number {
  return getDwellProgressForItem(STACK_DWELL_START, STACK_DWELL_END, categoryIndex, categoryCount);
}

function smoothstep(t: number): number {
  const c = clampProgress(t);
  return c * c * (3 - 2 * c);
}

function lerpStation(a: StationDef, b: StationDef, t: number): CameraPose {
  const e = smoothstep(t);
  return {
    x: a.camX + (b.camX - a.camX) * e,
    y: a.camY + (b.camY - a.camY) * e,
    z: a.camZ + (b.camZ - a.camZ) * e,
    lookX: a.lookX + (b.lookX - a.lookX) * e,
    lookY: a.lookY + (b.lookY - a.lookY) * e,
    lookZ: a.lookZ + (b.lookZ - a.lookZ) * e,
  };
}

function holdStation(s: StationDef): CameraPose {
  return { x: s.camX, y: s.camY, z: s.camZ, lookX: s.lookX, lookY: s.lookY, lookZ: s.lookZ };
}

export function getCameraPoseForProgress(
  progress: number,
  stations: readonly StationDef[] = STATIONS,
): CameraPose {
  if (stations.length === 0) {
    return { x: 0, y: 1.5, z: 6, lookX: 0, lookY: 1.1, lookZ: -2 };
  }
  if (stations.length === 1) {
    return holdStation(stations[0]);
  }

  const p = clampProgress(progress);

  if (p <= WORK_DWELL_START) {
    return lerpStation(stations[0], stations[1], p / WORK_DWELL_START);
  }
  if (p <= WORK_DWELL_END) {
    return holdStation(stations[1]);
  }
  if (p <= ABOUT_DWELL_START) {
    return lerpStation(
      stations[1],
      stations[2],
      (p - WORK_DWELL_END) / (ABOUT_DWELL_START - WORK_DWELL_END),
    );
  }
  if (p <= ABOUT_DWELL_END) {
    return holdStation(stations[2]);
  }
  if (p <= STACK_DWELL_START) {
    return lerpStation(
      stations[2],
      stations[3],
      (p - ABOUT_DWELL_END) / (STACK_DWELL_START - ABOUT_DWELL_END),
    );
  }
  if (p <= STACK_DWELL_END) {
    return holdStation(stations[3]);
  }
  return lerpStation(
    stations[3],
    stations[4],
    (p - STACK_DWELL_END) / (CONTACT_ANCHOR - STACK_DWELL_END),
  );
}
