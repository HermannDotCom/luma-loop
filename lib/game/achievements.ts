import type { DailyStreak } from "./daily";
import { accuracy, type PlayerStats } from "./stats";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  category: "precision" | "mastery" | "practice" | "daily";
  current: number;
  target: number;
  unlocked: boolean;
};

type AchievementContext = { stats: PlayerStats; dailyStreak: DailyStreak };

export function getAchievements({ stats, dailyStreak }: AchievementContext): Achievement[] {
  const definitions = [
    { id: "first-light", title: "Première lumière", description: "Réussissez 25 passages.", category: "mastery" as const, current: stats.totalHits, target: 25 },
    { id: "true-center", title: "Cœur juste", description: "Réalisez 10 touches Parfait.", category: "precision" as const, current: stats.perfectHits, target: 10 },
    { id: "steady-orbit", title: "Orbite stable", description: "Atteignez une série de 8.", category: "mastery" as const, current: stats.maxCombo, target: 8 },
    { id: "clear-signal", title: "Signal clair", description: "Atteignez 70 % de précision sur 20 touches.", category: "precision" as const, current: stats.totalTaps >= 20 ? accuracy(stats) : 0, target: 70 },
    { id: "open-space", title: "Espace libre", description: "Lancez 3 entraînements.", category: "practice" as const, current: stats.trainingRuns, target: 3 },
    { id: "daily-glow", title: "Lueur régulière", description: "Terminez 3 défis quotidiens.", category: "daily" as const, current: stats.dailyChallengesCompleted, target: 3 },
    { id: "seven-suns", title: "Sept soleils", description: "Maintenez une série de 7 jours.", category: "daily" as const, current: dailyStreak.best, target: 7 },
  ];
  return definitions.map((achievement) => ({ ...achievement, unlocked: achievement.current >= achievement.target }));
}

export function countUnlocked(achievements: Achievement[]): number {
  return achievements.filter((achievement) => achievement.unlocked).length;
}
