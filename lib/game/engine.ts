import type { Difficulty, GameState, TapResolution } from "./types";

export const TAU = Math.PI * 2;
export const STARTING_LIVES = 3;

export function normalizeAngle(value: number): number {
  const normal = value % TAU;
  return normal < 0 ? normal + TAU : normal;
}

export function angularDistance(first: number, second: number): number {
  const delta = Math.abs(normalizeAngle(first) - normalizeAngle(second));
  return Math.min(delta, TAU - delta);
}

export function getDifficulty(score: number): Difficulty {
  const tier = Math.floor(score / 5);
  return {
    radiansPerSecond: Math.min(2.55, 0.9 + tier * 0.12),
    gateHalfWidth: Math.max(0.18, 0.62 - tier * 0.035),
    multiplier: 1 + Math.floor(score / 10),
  };
}

export function createInitialState(runSeed = 0): GameState {
  return {
    score: 0,
    combo: 0,
    lives: STARTING_LIVES,
    gateAngle: Math.PI * 1.5,
    runSeed,
    lastResult: null,
  };
}

function nextGateAngle(state: GameState): number {
  const step = 1.61803398875 + (state.runSeed % 7) * 0.09;
  return normalizeAngle(state.gateAngle + step + state.score * 0.17);
}

export function resolveTap(state: GameState, orbAngle: number): TapResolution {
  const difficulty = getDifficulty(state.score);
  const hit = angularDistance(orbAngle, state.gateAngle) <= difficulty.gateHalfWidth;

  if (hit) {
    return {
      hit: true,
      finished: false,
      state: {
        ...state,
        score: state.score + difficulty.multiplier,
        combo: state.combo + 1,
        gateAngle: nextGateAngle(state),
        lastResult: "hit",
      },
    };
  }

  const lives = state.lives - 1;
  return {
    hit: false,
    finished: lives <= 0,
    state: {
      ...state,
      lives,
      combo: 0,
      lastResult: "miss",
    },
  };
}
