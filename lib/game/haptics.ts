import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

function canHaptic(enabled: boolean) {
  return enabled && Platform.OS !== "web";
}

export const gameHaptics = {
  tap(enabled: boolean) {
    if (canHaptic(enabled)) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },
  hit(enabled: boolean) {
    if (canHaptic(enabled)) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },
  miss(enabled: boolean) {
    if (canHaptic(enabled)) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },
};
