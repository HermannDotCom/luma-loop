export type RunStatus = "home" | "playing" | "paused" | "gameover" | "settings";

export type GameState = {
  score: number;
  combo: number;
  lives: number;
  gateAngle: number;
  runSeed: number;
  lastResult: "hit" | "miss" | null;
};

export type Difficulty = {
  radiansPerSecond: number;
  gateHalfWidth: number;
  multiplier: number;
};

export type TapResolution = {
  state: GameState;
  hit: boolean;
  finished: boolean;
};

export type PlayerProfile = {
  bestScore: number;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  highContrast: boolean;
};
