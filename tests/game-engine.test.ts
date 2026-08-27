import { describe, expect, it } from "vitest";

import { DEFAULT_COSMETICS, DEFAULT_INVENTORY, isOrbitThemeUnlocked, ORBIT_THEMES } from "../lib/game/catalog";
import { advanceDailyProgress, advanceDailyStreak, emptyDailyProgress, getDailyChallenge, getStreakCalendar } from "../lib/game/daily";
import { angularDistance, createInitialState, getDifficulty, resolveTap, TAU } from "../lib/game/engine";
import { getAchievements } from "../lib/game/achievements";
import { accuracy, EMPTY_STATS, recordRunStart, recordTap } from "../lib/game/stats";

describe("Luma Loop game engine", () => {
  it("considers equivalent angles at the circle boundary to be adjacent", () => {
    expect(angularDistance(0.02, TAU - 0.02)).toBeLessThan(0.05);
  });

  it("awards a point and moves the gate for a tap in the target window", () => {
    const state = createInitialState(12);
    const result = resolveTap(state, state.gateAngle);
    expect(result.hit).toBe(true);
    expect(result.finished).toBe(false);
    expect(result.state.score).toBeGreaterThan(state.score);
    expect(result.perfect).toBe(true);
    expect(result.state.gateAngle).not.toBe(state.gateAngle);
  });

  it("removes one life and ends only after the third miss", () => {
    let state = createInitialState(4);
    const missAngle = state.gateAngle + Math.PI;
    state = resolveTap(state, missAngle).state;
    expect(state.lives).toBe(2);
    state = resolveTap(state, missAngle).state;
    const end = resolveTap(state, missAngle);
    expect(end.finished).toBe(true);
    expect(end.state.lives).toBe(0);
  });

  it("keeps every life and never ends a training run after a miss", () => {
    const state = createInitialState(4, "training");
    const miss = resolveTap(state, state.gateAngle + Math.PI);
    expect(miss.state.lives).toBe(3);
    expect(miss.finished).toBe(false);
  });

  it("keeps the guided first run free of penalties until its first success", () => {
    const state = createInitialState(7, "tutorial");
    const miss = resolveTap(state, state.gateAngle + Math.PI);
    const hit = resolveTap(miss.state, miss.state.gateAngle);
    expect(miss.state.lives).toBe(3);
    expect(miss.finished).toBe(false);
    expect(hit.hit).toBe(true);
  });

  it("changes to visible levels with a narrower but still readable success window", () => {
    expect(getDifficulty(0).level).toBe(1);
    expect(getDifficulty(4).level).toBe(2);
    expect(getDifficulty(9).level).toBe(3);
    expect(getDifficulty(22).level).toBe(5);
    expect(getDifficulty(22).gateHalfWidth).toBeLessThan(getDifficulty(0).gateHalfWidth);
    expect(getDifficulty(400).gateHalfWidth).toBeGreaterThanOrEqual(0.24);
  });

  it("awards a level-up and reverses the orbit at the eclipse milestone", () => {
    const state = { ...createInitialState(9), hits: 8, direction: 1 as const };
    const levelUp = resolveTap(state, state.gateAngle);
    expect(levelUp.levelUp).toBe(true);
    expect(levelUp.nextDifficulty.level).toBe(3);
    expect(levelUp.state.direction).toBe(-1);
  });

  it("rewards a perfect tap more than an edge hit", () => {
    const state = { ...createInitialState(6), hits: 5 };
    const perfect = resolveTap(state, state.gateAngle);
    const edge = resolveTap(state, state.gateAngle + getDifficulty(state.hits).gateHalfWidth * 0.9);
    expect(perfect.state.score).toBeGreaterThan(edge.state.score);
  });

  it("keeps default cosmetics available without sales or a paid entitlement", () => {
    expect(DEFAULT_COSMETICS.every((item) => item.entitlement === "free")).toBe(true);
    expect(DEFAULT_INVENTORY.memberBenefitsActive).toBe(false);
    expect(DEFAULT_INVENTORY.unlockedIds).toHaveLength(3);
  });

  it("keeps the daily challenge deterministic and unlocks its reward only at completion", () => {
    const today = new Date(2026, 7, 27);
    const challenge = getDailyChallenge(today);
    expect(getDailyChallenge(today).id).toBe(challenge.id);
    const started = emptyDailyProgress(challenge, today);
    const completed = advanceDailyProgress(started, challenge, challenge.target);
    const dailyTheme = ORBIT_THEMES.find((item) => item.id === "orbit-daybreak");
    expect(completed.completed).toBe(true);
    expect(dailyTheme).toBeDefined();
    expect(isOrbitThemeUnlocked(dailyTheme!, 0, [])).toBe(false);
    expect(isOrbitThemeUnlocked(dailyTheme!, 0, ["orbit-daybreak"])).toBe(true);
  });

  it("counts a daily streak once per day and resets it after a gap", () => {
    const first = advanceDailyStreak(undefined, "2026-08-20");
    const repeated = advanceDailyStreak(first, "2026-08-20");
    const second = advanceDailyStreak(first, "2026-08-21");
    const afterGap = advanceDailyStreak(second, "2026-08-23");
    expect(first.current).toBe(1);
    expect(repeated.current).toBe(1);
    expect(second.current).toBe(2);
    expect(afterGap.current).toBe(1);
    expect(afterGap.best).toBe(2);
  });

  it("renders the last seven days with the completed streak marked", () => {
    const streak = { current: 3, best: 3, lastCompletedDate: "2026-08-27" };
    const calendar = getStreakCalendar(streak, new Date(2026, 7, 27));
    expect(calendar).toHaveLength(7);
    expect(calendar.filter((day) => day.completed)).toHaveLength(3);
    expect(calendar.at(-1)?.today).toBe(true);
  });

  it("records activity metrics and exposes their related achievements", () => {
    const hit = resolveTap(createInitialState(2), Math.PI * 1.5);
    const activeStats = recordTap(recordRunStart(EMPTY_STATS, "training"), hit);
    expect(activeStats.trainingRuns).toBe(1);
    expect(activeStats.totalHits).toBe(1);
    expect(activeStats.perfectHits).toBe(1);
    expect(accuracy(activeStats)).toBe(100);
    const achievements = getAchievements({ stats: { ...activeStats, totalHits: 25 }, dailyStreak: { current: 0, best: 0, lastCompletedDate: null } });
    expect(achievements.find((item) => item.id === "first-light")?.unlocked).toBe(true);
  });
});
