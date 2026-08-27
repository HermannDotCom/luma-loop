import type { GameMode, TapResolution } from "./types";

export type PlayerStats = {
  totalRuns: number;
  trainingRuns: number;
  totalTaps: number;
  totalHits: number;
  perfectHits: number;
  maxCombo: number;
  dailyChallengesCompleted: number;
};

export const EMPTY_STATS: PlayerStats = {
  totalRuns: 0,
  trainingRuns: 0,
  totalTaps: 0,
  totalHits: 0,
  perfectHits: 0,
  maxCombo: 0,
  dailyChallengesCompleted: 0,
};

export function recordRunStart(stats: PlayerStats | undefined, mode: GameMode): PlayerStats {
  const current = stats ?? EMPTY_STATS;
  return { ...current, totalRuns: current.totalRuns + 1, trainingRuns: current.trainingRuns + (mode === "training" ? 1 : 0) };
}

export function recordTap(stats: PlayerStats | undefined, outcome: TapResolution): PlayerStats {
  const current = stats ?? EMPTY_STATS;
  return {
    ...current,
    totalTaps: current.totalTaps + 1,
    totalHits: current.totalHits + (outcome.hit ? 1 : 0),
    perfectHits: current.perfectHits + (outcome.perfect ? 1 : 0),
    maxCombo: Math.max(current.maxCombo, outcome.state.combo),
  };
}

export function accuracy(stats: PlayerStats | undefined): number {
  const current = stats ?? EMPTY_STATS;
  return current.totalTaps === 0 ? 0 : Math.round((current.totalHits / current.totalTaps) * 100);
}
