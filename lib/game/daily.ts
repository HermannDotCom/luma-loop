export type DailyObjectiveKind = "perfect" | "hits";

export type DailyChallenge = {
  id: string;
  title: string;
  description: string;
  target: number;
  kind: DailyObjectiveKind;
};

export type DailyProgress = {
  dateKey: string;
  challengeId: string;
  value: number;
  completed: boolean;
};

export type DailyStreak = {
  current: number;
  best: number;
  lastCompletedDate: string | null;
};

export type StreakCalendarDay = {
  key: string;
  label: string;
  completed: boolean;
  today: boolean;
};

const DAILY_TEMPLATES: Omit<DailyChallenge, "id">[] = [
  { title: "Éclats précis", description: "Réalisez 3 touches Parfait", target: 3, kind: "perfect" },
  { title: "Rythme stable", description: "Réussissez 12 passages", target: 12, kind: "hits" },
  { title: "Onde lumineuse", description: "Réalisez 5 touches Parfait", target: 5, kind: "perfect" },
  { title: "Tour complet", description: "Réussissez 18 passages", target: 18, kind: "hits" },
];

export function getDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function hashDay(key: string): number {
  return [...key].reduce((sum, character) => (sum * 31 + character.charCodeAt(0)) >>> 0, 17);
}

export function getDailyChallenge(date = new Date()): DailyChallenge {
  const key = getDateKey(date);
  const template = DAILY_TEMPLATES[hashDay(key) % DAILY_TEMPLATES.length];
  return { ...template, id: `${key}:${template.kind}:${template.target}` };
}

export function emptyDailyProgress(challenge: DailyChallenge, date = new Date()): DailyProgress {
  return { dateKey: getDateKey(date), challengeId: challenge.id, value: 0, completed: false };
}

export function ensureDailyProgress(progress: DailyProgress | undefined, challenge: DailyChallenge, date = new Date()): DailyProgress {
  const dateKey = getDateKey(date);
  if (progress?.dateKey === dateKey && progress.challengeId === challenge.id) return progress;
  return emptyDailyProgress(challenge, date);
}

export function advanceDailyProgress(progress: DailyProgress, challenge: DailyChallenge, increment: number): DailyProgress {
  if (progress.completed || increment <= 0) return progress;
  const value = Math.min(challenge.target, progress.value + increment);
  return { ...progress, value, completed: value >= challenge.target };
}

export const EMPTY_DAILY_STREAK: DailyStreak = {
  current: 0,
  best: 0,
  lastCompletedDate: null,
};

function dayNumber(dateKey: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86_400_000;
}

export function advanceDailyStreak(streak: DailyStreak | undefined, completedDate: string): DailyStreak {
  const current = streak ?? EMPTY_DAILY_STREAK;
  if (current.lastCompletedDate === completedDate) return current;
  const consecutive = current.lastCompletedDate !== null && dayNumber(completedDate) - dayNumber(current.lastCompletedDate) === 1;
  const nextCurrent = consecutive ? current.current + 1 : 1;
  return { current: nextCurrent, best: Math.max(current.best, nextCurrent), lastCompletedDate: completedDate };
}

export function getStreakCalendar(streak: DailyStreak | undefined, date = new Date()): StreakCalendarDay[] {
  const current = streak ?? EMPTY_DAILY_STREAK;
  const todayKey = getDateKey(date);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(date);
    day.setDate(date.getDate() - (6 - index));
    const key = getDateKey(day);
    const distanceFromLast = current.lastCompletedDate ? dayNumber(current.lastCompletedDate) - dayNumber(key) : Infinity;
    return {
      key,
      label: new Intl.DateTimeFormat("fr-FR", { weekday: "narrow" }).format(day).toUpperCase(),
      completed: distanceFromLast >= 0 && distanceFromLast < current.current,
      today: key === todayKey,
    };
  });
}
