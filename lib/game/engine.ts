import type { Difficulty, GameState, TapResolution } from "./types";

export const TAU = Math.PI * 2;
export const STARTING_LIVES = 3;

const LEVELS: Difficulty[] = [
  { level: 1, name: "Éveil", nextLevelAt: 4, radiansPerSecond: 0.78, gateHalfWidth: 0.68, perfectHalfWidth: 0.17, multiplier: 1, perfectBonus: 1, reverseEvery: null, instruction: "Trouvez le rythme" },
  { level: 2, name: "Élan", nextLevelAt: 9, radiansPerSecond: 1.12, gateHalfWidth: 0.52, perfectHalfWidth: 0.14, multiplier: 2, perfectBonus: 2, reverseEvery: null, instruction: "La porte se resserre" },
  { level: 3, name: "Éclipse", nextLevelAt: 15, radiansPerSecond: 1.48, gateHalfWidth: 0.40, perfectHalfWidth: 0.11, multiplier: 3, perfectBonus: 3, reverseEvery: 3, instruction: "Le sens peut s’inverser" },
  { level: 4, name: "Flux", nextLevelAt: 22, radiansPerSecond: 1.88, gateHalfWidth: 0.31, perfectHalfWidth: 0.09, multiplier: 4, perfectBonus: 4, reverseEvery: 2, instruction: "Gardez votre concentration" },
  { level: 5, name: "Luma", nextLevelAt: null, radiansPerSecond: 2.3, gateHalfWidth: 0.24, perfectHalfWidth: 0.07, multiplier: 5, perfectBonus: 5, reverseEvery: 2, instruction: "Maîtrisez la boucle" },
];

export function normalizeAngle(value: number): number {
  const normal = value % TAU;
  return normal < 0 ? normal + TAU : normal;
}

export function angularDistance(first: number, second: number): number {
  const delta = Math.abs(normalizeAngle(first) - normalizeAngle(second));
  return Math.min(delta, TAU - delta);
}

export function getDifficulty(hits: number): Difficulty {
  if (hits < 4) return LEVELS[0];
  if (hits < 9) return LEVELS[1];
  if (hits < 15) return LEVELS[2];
  if (hits < 22) return LEVELS[3];
  return LEVELS[4];
}

export function createInitialState(runSeed = 0): GameState {
  return {
    score: 0,
    combo: 0,
    lives: STARTING_LIVES,
    hits: 0,
    direction: 1,
    gateAngle: Math.PI * 1.5,
    runSeed,
    lastResult: null,
  };
}

function nextGateAngle(state: GameState, direction: 1 | -1, level: number): number {
  const step = 1.16 + (state.runSeed % 7) * 0.11 + level * 0.17 + (state.hits % 3) * 0.21;
  return normalizeAngle(state.gateAngle + step * direction);
}

export function resolveTap(state: GameState, orbAngle: number): TapResolution {
  const difficulty = getDifficulty(state.hits);
  const distance = angularDistance(orbAngle, state.gateAngle);
  const hit = distance <= difficulty.gateHalfWidth;
  const perfect = hit && distance <= difficulty.perfectHalfWidth;

  if (hit) {
    const hits = state.hits + 1;
    const nextDifficulty = getDifficulty(hits);
    const reverse = nextDifficulty.reverseEvery !== null && hits % nextDifficulty.reverseEvery === 0;
    const direction = reverse ? (state.direction * -1) as 1 | -1 : state.direction;
    const comboBonus = state.combo >= 3 ? 1 : 0;
    return {
      hit: true,
      perfect,
      levelUp: nextDifficulty.level > difficulty.level,
      nextDifficulty,
      finished: false,
      state: {
        ...state,
        score: state.score + difficulty.multiplier + comboBonus + (perfect ? difficulty.perfectBonus : 0),
        combo: state.combo + 1,
        hits,
        direction,
        gateAngle: nextGateAngle({ ...state, hits }, direction, nextDifficulty.level),
        lastResult: perfect ? "perfect" : "hit",
      },
    };
  }

  const lives = state.lives - 1;
  return {
    hit: false,
    perfect: false,
    levelUp: false,
    nextDifficulty: difficulty,
    finished: lives <= 0,
    state: {
      ...state,
      lives,
      combo: 0,
      lastResult: "miss",
    },
  };
}
