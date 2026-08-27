import { describe, expect, it } from "vitest";

import { DEFAULT_COSMETICS, DEFAULT_INVENTORY } from "../lib/game/catalog";
import { angularDistance, createInitialState, getDifficulty, resolveTap, TAU } from "../lib/game/engine";

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
});
