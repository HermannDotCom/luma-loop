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
