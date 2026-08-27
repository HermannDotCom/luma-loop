export type RunStatus = "home" | "playing" | "paused" | "gameover" | "settings";

export type GameState = {
  score: number;
  combo: number;
  lives: number;
  hits: number;
  direction: 1 | -1;
  gateAngle: number;
  runSeed: number;
  lastResult: "perfect" | "hit" | "miss" | null;
};

export type Difficulty = {
  level: number;
  name: string;
  nextLevelAt: number | null;
  radiansPerSecond: number;
  gateHalfWidth: number;
  perfectHalfWidth: number;
  multiplier: number;
  perfectBonus: number;
  reverseEvery: number | null;
  instruction: string;
};

export type TapResolution = {
  state: GameState;
  hit: boolean;
  perfect: boolean;
  levelUp: boolean;
  nextDifficulty: Difficulty;
  finished: boolean;
};

export type PlayerProfile = {
  bestScore: number;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  highContrast: boolean;
};
