import test from "node:test";
import assert from "node:assert/strict";
import {
  STATIONS,
  WORK_DWELL_START,
  WORK_DWELL_END,
  ABOUT_DWELL_START,
  ABOUT_DWELL_END,
  STACK_DWELL_START,
  STACK_DWELL_END,
  clampProgress,
  getStationIndexFromProgress,
  getProgressForStation,
  getWorkProjectIndexFromProgress,
  getProgressForWorkProject,
  getAboutTabIndexFromProgress,
  getProgressForAboutTab,
  getStackCategoryIndexFromProgress,
  getProgressForStackCategory,
  getCameraPoseForProgress,
} from "./stations";
import { config } from "../config";

test("clampProgress bounds values cleanly", () => {
  assert.equal(clampProgress(-0.5), 0);
  assert.equal(clampProgress(0.42), 0.42);
  assert.equal(clampProgress(1.8), 1);
  assert.equal(clampProgress(Number.NaN), 0);
});

test("station index and progress round-trip across all stations", () => {
  for (let i = 0; i < STATIONS.length; i++) {
    const p = getProgressForStation(i);
    assert.equal(getStationIndexFromProgress(p), i);
  }
  assert.equal(getStationIndexFromProgress(0), 0);
  assert.equal(getStationIndexFromProgress(1), STATIONS.length - 1);
});

test("scrolling through Work dwell cycles all 4 projects before advancing to About", () => {
  const seen = new Set<number>();
  for (let i = 0; i < 4; i++) {
    const p = getProgressForWorkProject(i, 4);
    assert.equal(getStationIndexFromProgress(p), 1, `Project ${i} should stay in Work station`);
    assert.equal(getWorkProjectIndexFromProgress(p, 4), i);
    const pose = getCameraPoseForProgress(p);
    assert.equal(pose.z, STATIONS[1].camZ, "Camera should hold at Work while cycling projects");
    seen.add(i);
  }
  assert.equal(seen.size, 4);
  assert.equal(getStationIndexFromProgress(WORK_DWELL_START), 1);
  assert.equal(getStationIndexFromProgress(WORK_DWELL_END), 1);
  assert.equal(getStationIndexFromProgress(ABOUT_DWELL_START), 2);
});

test("scrolling through About dwell cycles both numbered tabs before advancing to Stack", () => {
  const seen = new Set<number>();
  for (let i = 0; i < 2; i++) {
    const p = getProgressForAboutTab(i, 2);
    assert.equal(getStationIndexFromProgress(p), 2, `About tab ${i} should stay in About station`);
    assert.equal(getAboutTabIndexFromProgress(p, 2), i);
    const pose = getCameraPoseForProgress(p);
    assert.equal(pose.z, STATIONS[2].camZ, "Camera should hold at About while cycling tabs");
    seen.add(i);
  }
  assert.equal(seen.size, 2);
  assert.equal(getStationIndexFromProgress(ABOUT_DWELL_START), 2);
  assert.equal(getStationIndexFromProgress(ABOUT_DWELL_END), 2);
  assert.equal(getStationIndexFromProgress(STACK_DWELL_START), 3);
});

test("scrolling through Stack dwell cycles all 5 categories before advancing to Contact", () => {
  const seen = new Set<number>();
  for (let i = 0; i < 5; i++) {
    const p = getProgressForStackCategory(i, 5);
    assert.equal(getStationIndexFromProgress(p), 3, `Stack category ${i} should stay in Stack`);
    assert.equal(getStackCategoryIndexFromProgress(p, 5), i);
    const pose = getCameraPoseForProgress(p);
    assert.equal(pose.z, STATIONS[3].camZ, "Camera should hold at Stack while cycling categories");
    seen.add(i);
  }
  assert.equal(seen.size, 5);
  assert.equal(getStationIndexFromProgress(STACK_DWELL_START), 3);
  assert.equal(getStationIndexFromProgress(STACK_DWELL_END), 3);
  assert.equal(getStationIndexFromProgress(1), 4);
});

test("camera pose interpolates smoothly between station endpoints", () => {
  const start = getCameraPoseForProgress(0);
  assert.equal(start.z, STATIONS[0].camZ);
  assert.equal(start.x, STATIONS[0].camX);

  const end = getCameraPoseForProgress(1);
  const last = STATIONS[STATIONS.length - 1];
  assert.equal(end.z, last.camZ);
  assert.equal(end.lookZ, last.lookZ);
});

test("portfolio config matches ahkur.my.id required content", () => {
  assert.equal(config.brand.fullName, "Ahmad Kurniawan");
  assert.equal(config.projects.length, 4);
  assert.equal(config.techCategories.length, 5);
  assert.equal(config.about.capabilities.length, 4);

  for (const project of config.projects) {
    assert.ok(project.link.startsWith("https://"), `Invalid project link: ${project.link}`);
    assert.ok(project.stack.length >= 3);
  }

  assert.equal(config.contact.mail, "ah.kurniawan27@gmail.com");
  assert.equal(config.contact.discord, "allan4u");
});
