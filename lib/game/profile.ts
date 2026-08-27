import AsyncStorage from "@react-native-async-storage/async-storage";

import { EMPTY_DAILY_STREAK, getDailyChallenge, emptyDailyProgress } from "./daily";
import { EMPTY_STATS } from "./stats";
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
  stats: EMPTY_STATS,
  hasSeenOnboarding: false,
  adConsentPreference: "ask_later",
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

export async function clearProfile(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PROFILE_KEY);
  } catch {
    // La suppression reste possible par désinstallation si le stockage local échoue.
  }
}
