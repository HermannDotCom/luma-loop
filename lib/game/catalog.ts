/**
 * Contrats volontairement indépendants du moteur de partie.
 * Le MVP ne montre ni prix, ni monnaie, ni boutique : un futur service pourra
 * alimenter ces catalogues sans modifier la synchronisation, le score ou l’UI.
 */
export type CosmeticSlot = "firefly" | "orbit" | "core";

export type CosmeticDefinition = {
  id: string;
  slot: CosmeticSlot;
  name: string;
  palette: { primary: string; secondary: string; highlight: string };
  entitlement: "free" | "member" | "earned";
};

export type OrbitTheme = CosmeticDefinition & {
  unlockScore: number;
  description: string;
  dailyReward?: boolean;
};

export type PlayerInventory = {
  equipped: Record<CosmeticSlot, string>;
  unlockedIds: string[];
  memberBenefitsActive: boolean;
};

export const DEFAULT_COSMETICS: CosmeticDefinition[] = [
  {
    id: "firefly-mint",
    slot: "firefly",
    name: "Luciole menthe",
    palette: { primary: "#43F3C5", secondary: "#E7FFF8", highlight: "#FFFFFF" },
    entitlement: "free",
  },
  {
    id: "orbit-iris",
    slot: "orbit",
    name: "Orbite iris",
    palette: { primary: "#8B5CF6", secondary: "#C4B5FD", highlight: "#F4F7FF" },
    entitlement: "free",
  },
  {
    id: "core-starlight",
    slot: "core",
    name: "Noyau stellaire",
    palette: { primary: "#4C1D95", secondary: "#A78BFA", highlight: "#F4F7FF" },
    entitlement: "free",
  },
];

export const DEFAULT_INVENTORY: PlayerInventory = {
  equipped: {
    firefly: "firefly-mint",
    orbit: "orbit-iris",
    core: "core-starlight",
  },
  unlockedIds: DEFAULT_COSMETICS.filter((item) => item.entitlement === "free").map((item) => item.id),
  memberBenefitsActive: false,
};

export const ORBIT_THEMES: OrbitTheme[] = [
  { id: "orbit-iris", slot: "orbit", name: "Iris", description: "La signature Luma Loop.", unlockScore: 0, palette: { primary: "#8B5CF6", secondary: "#C4B5FD", highlight: "#F4F7FF" }, entitlement: "free" },
  { id: "orbit-daybreak", slot: "orbit", name: "Aube", description: "La lumière réservée au défi du jour.", unlockScore: 0, dailyReward: true, palette: { primary: "#2DD4BF", secondary: "#FDE68A", highlight: "#F0FDFA" }, entitlement: "earned" },
  { id: "orbit-aurora", slot: "orbit", name: "Aurore", description: "Une traînée douce couleur ciel.", unlockScore: 15, palette: { primary: "#38BDF8", secondary: "#A7F3D0", highlight: "#F0FDFA" }, entitlement: "earned" },
  { id: "orbit-comet", slot: "orbit", name: "Comète", description: "Une courbe vive d’ambre solaire.", unlockScore: 35, palette: { primary: "#FB923C", secondary: "#FDE68A", highlight: "#FFF7ED" }, entitlement: "earned" },
  { id: "orbit-opal", slot: "orbit", name: "Opale", description: "Des couleurs changeantes et calmes.", unlockScore: 60, palette: { primary: "#F472B6", secondary: "#A78BFA", highlight: "#FDF2F8" }, entitlement: "earned" },
  { id: "orbit-supernova", slot: "orbit", name: "Supernova", description: "La récompense des grandes boucles.", unlockScore: 100, palette: { primary: "#FACC15", secondary: "#FB7185", highlight: "#FEFCE8" }, entitlement: "earned" },
];

export function getOrbitTheme(id: string): OrbitTheme {
  return ORBIT_THEMES.find((theme) => theme.id === id) ?? ORBIT_THEMES[0];
}

export function isOrbitThemeUnlocked(theme: OrbitTheme, bestScore: number, unlockedThemeIds: string[] = []): boolean {
  return theme.dailyReward ? unlockedThemeIds.includes(theme.id) : bestScore >= theme.unlockScore;
}
