import AsyncStorage from "@react-native-async-storage/async-storage";

import { EMPTY_DAILY_STREAK, getDailyChallenge, emptyDailyProgress } from "./daily";
import type { PlayerProfile } from "./types";

const PROFILE_KEY = "luma-loop:player-profile:v1";

export const DEFAULT_PROFILE: PlayerProfile = {
  bestScore: 0,
  hapticsEnabled: true,
  soundEnabled: true,
  highContrast: false,
  equippedOrbitId: "orbit-iris",
  unlockedThemeIds: ["orbit-iris"],
  dailyProgress: emptyDailyProgress(getDailyChallenge()),
  dailyStreak: EMPTY_DAILY_STREAK,
};

export async function loadProfile(): Promise<PlayerProfile> {
  try {
    const stored = await AsyncStorage.getItem(PROFILE_KEY);
    return stored ? { ...DEFAULT_PROFILE, ...JSON.parse(stored) } : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export async function saveProfile(profile: PlayerProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Local persistence is a non-blocking enhancement; gameplay remains available.
  }
}
