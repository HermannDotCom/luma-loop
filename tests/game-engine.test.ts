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

  it("narrows the success window while maintaining a readable minimum", () => {
    expect(getDifficulty(40).gateHalfWidth).toBeLessThan(getDifficulty(0).gateHalfWidth);
    expect(getDifficulty(400).gateHalfWidth).toBeGreaterThanOrEqual(0.18);
  });

  it("keeps default cosmetics available without sales or a paid entitlement", () => {
    expect(DEFAULT_COSMETICS.every((item) => item.entitlement === "free")).toBe(true);
    expect(DEFAULT_INVENTORY.memberBenefitsActive).toBe(false);
    expect(DEFAULT_INVENTORY.unlockedIds).toHaveLength(3);
  });
});
