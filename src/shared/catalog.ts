import { loadUserAccess } from "../utils/userAccessStorage";

// ─── Plan utilisateur ──────────────────────────────────────────────────────────
export type PlanLevel = "Atelier" | "Creator" | "Pro";

// getUserPlan — lit cordeslab_user_access (système unifié)
// Déplacé depuis App.tsx pour devenir importable par n'importe quel module
// (catalogue, bibliothèque de guides, calculateur...) sans dépendance circulaire.
export function getUserPlan(): PlanLevel {
  try {
    const access = loadUserAccess();
    if (access.status !== "active") return "Atelier";
    if (access.level === "pro")     return "Pro";
    if (access.level === "creator") return "Creator";
  } catch { /* ignore */ }
  return "Atelier";
}

const TIER_RANK: Record<PlanLevel, number> = { Atelier: 0, Creator: 1, Pro: 2 };
export const tierRank = (tier: PlanLevel) => TIER_RANK[tier];
export const maxTier = (a: PlanLevel, b: PlanLevel): PlanLevel => (tierRank(a) >= tierRank(b) ? a : b);

// ─── Accessoires — config + verrouillage par palier ───────────────────────────
export type AccessoryKey = "COLLIER" | "POIGNEE" | "LAISSE" | "HARNAIS" | "JOUETS";
export type AccessoryLock = "Creator" | "Pro" | null;

export const ACCESSORIES_CONFIG: Record<AccessoryKey, { label: string; icon: string; lock: AccessoryLock; models: string[] }> = {
  COLLIER: { label: "Collier", icon: "🐕", lock: null,      models: ["Boucle plastique", "Boucle métal", "Martingale", "Adaptateur Biothane"] },
  POIGNEE: { label: "Poignée", icon: "✋", lock: "Creator", models: ["Simple", "Confort"] },
  LAISSE:  { label: "Laisse",  icon: "🦮", lock: "Pro",     models: ["1m20", "Multiposition sans poignée", "Multiposition avec poignée"] },
  HARNAIS: { label: "Harnais", icon: "🎗️", lock: "Pro",    models: ["En Y", "En H"] },
  JOUETS:  { label: "Jouets",  icon: "🎾", lock: "Pro",     models: ["Balle avec corde", "Tug simple", "Tug double poignée"] },
};

export const isAccLocked = (lock: AccessoryLock): boolean => {
  const plan = getUserPlan();
  if (!lock || plan === "Pro") return false;
  if (plan === "Creator") return lock === "Pro";
  return true;
};

export const getAccessoryMinTier = (lock: AccessoryLock): PlanLevel => lock ?? "Atelier";

// ─── Nœuds — catalogue canonique (métadonnées seules, sans composants 3D) ─────
// Source unique de vérité pour id / difficulté / order / facteur / temps / calibration.
// NewCalc.tsx (et tout futur module UI) reconstruit son propre registre en y
// ajoutant les composants de preview, sans dupliquer ces données.
export type Difficulty = "Débutant" | "Intermédiaire" | "Avancé" | "Expert";

export interface KnotMeta {
  id: string;
  name: string;
  difficulty: Difficulty;
  order: number;
  factor: number;
  baseMinutes: number;
  calibrated: boolean;
}

export const KNOTS_CATALOG: KnotMeta[] = [
  { id: "Cobra",        name: "Cobra",        difficulty: "Débutant",      order: 1, factor: 21, baseMinutes: 45,  calibrated: true  },
  { id: "Fishtail",     name: "Fishtail",     difficulty: "Débutant",      order: 2, factor: 18, baseMinutes: 55,  calibrated: true  },
  { id: "LadderRack",   name: "Ladder Rack",  difficulty: "Débutant",      order: 3, factor: 20, baseMinutes: 50,  calibrated: false },
  { id: "SnakeKnot",    name: "Snake Knot",   difficulty: "Débutant",      order: 4, factor: 14, baseMinutes: 35,  calibrated: false },
  { id: "Spiral",       name: "Spiral",       difficulty: "Débutant",      order: 5, factor: 6,  baseMinutes: 40,  calibrated: true  },
  { id: "SquareKnot",   name: "Square Knot",  difficulty: "Débutant",      order: 6, factor: 40, baseMinutes: 40,  calibrated: false },
  { id: "Trilobite",    name: "Trilobite",    difficulty: "Intermédiaire", order: 1, factor: 24, baseMinutes: 70,  calibrated: false },
  { id: "CrownSinnet",  name: "Crown Sinnet", difficulty: "Intermédiaire", order: 2, factor: 16, baseMinutes: 60,  calibrated: false },
  { id: "TressageRond", name: "Tressage Rond",difficulty: "Intermédiaire", order: 3, factor: 14, baseMinutes: 55,  calibrated: true  },
  { id: "ViperWeave",   name: "Viper Weave",  difficulty: "Intermédiaire", order: 4, factor: 22, baseMinutes: 65,  calibrated: false },
  { id: "MonkeyFist",   name: "Monkey Fist",  difficulty: "Intermédiaire", order: 5, factor: 40, baseMinutes: 60,  calibrated: false },
  { id: "DiamondKnot",  name: "Diamond Knot", difficulty: "Intermédiaire", order: 6, factor: 40, baseMinutes: 50,  calibrated: false },
  { id: "KingCobra",    name: "King Cobra",   difficulty: "Avancé",        order: 1, factor: 8,  baseMinutes: 90,  calibrated: true  },
  { id: "Sanctified",   name: "Sanctified",   difficulty: "Avancé",        order: 2, factor: 28, baseMinutes: 80,  calibrated: false },
  { id: "SharkJawbone", name: "Shark Jawbone",difficulty: "Avancé",        order: 3, factor: 30, baseMinutes: 85,  calibrated: false },
  { id: "AztecSunBar",  name: "Aztec Sun Bar",difficulty: "Expert",        order: 1, factor: 40, baseMinutes: 105, calibrated: false },
  { id: "CelticBar",    name: "Celtic Bar",   difficulty: "Expert",        order: 2, factor: 38, baseMinutes: 100, calibrated: false },
];

export const getKnotMeta = (knotId: string): KnotMeta | undefined =>
  KNOTS_CATALOG.find((k) => k.id === knotId);

// Nœuds recommandés (⭐) pour le Harnais — section 1 de la synthèse (matrice finale)
export const HARNESS_RECOMMENDED_KNOTS = ["Cobra", "Fishtail", "SquareKnot", "ViperWeave", "KingCobra", "SharkJawbone"];

// isKnotLocked — seuil de déblocage au sein du niveau de difficulté (section 5 synthèse)
// Atelier = order ≤ 2, Creator = order ≤ 3, Pro = tout
export const isKnotLocked = (order: number): boolean => {
  const plan = getUserPlan();
  if (plan === "Pro") return false;
  if (plan === "Creator") return order > 3;
  return order > 2;
};

export const getKnotMinTier = (order: number): PlanLevel => (order <= 2 ? "Atelier" : order <= 3 ? "Creator" : "Pro");
