import AsyncStorage from "@react-native-async-storage/async-storage";

import type { PlayerProfile } from "./types";

const PROFILE_KEY = "luma-loop:player-profile:v1";

export const DEFAULT_PROFILE: PlayerProfile = {
  bestScore: 0,
  hapticsEnabled: true,
  soundEnabled: true,
  highContrast: false,
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
