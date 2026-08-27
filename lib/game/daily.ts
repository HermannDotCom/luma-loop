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
