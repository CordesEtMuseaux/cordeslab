import {
  KNOTS_CATALOG,
  ACCESSORIES_CONFIG,
  getKnotMeta,
  isKnotLocked,
  isAccLocked,
  getKnotMinTier,
  getAccessoryMinTier,
  maxTier,
  type AccessoryKey,
  type PlanLevel,
} from "../shared/catalog";

// ─── Bibliothèque de guides — section 5/6 de la synthèse d'implémentation ─────
// Un guide = une combinaison nœud × accessoire validée par la matrice finale
// (section 1). Le déblocage d'un guide réutilise exactement la même logique
// que le déblocage des nœuds/accessoires dans le calculateur (isKnotLocked /
// isAccLocked) — pas de système de seuil séparé à maintenir en double.

export interface GuideEntry {
  id: string;                 // slug unique, ex. "cobra-collier"
  knotId: string;             // référence vers KNOTS_CATALOG
  accessoryKey: AccessoryKey;
  title: string;               // ex. "Collier Cobra"
  contentUrl: string | null;   // chemin du PDF une fois produit — null = guide pas encore rédigé (section 7, point 8)
}

const toSlug = (knotId: string) =>
  knotId.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

const entry = (knotId: string, accessoryKey: AccessoryKey, contentUrl: string | null = null): GuideEntry => {
  const knotName = getKnotMeta(knotId)?.name ?? knotId;
  const accLabel = ACCESSORIES_CONFIG[accessoryKey].label;
  return {
    id: `${toSlug(knotId)}-${accessoryKey.toLowerCase()}`,
    knotId,
    accessoryKey,
    title: `${accLabel} ${knotName}`,
    contentUrl,
  };
};

// Matrice finale (section 1 de la synthèse) — 41 combinaisons validées.
// Groupé par difficulté pour rester lisible et facile à recouper avec le document.
export const GUIDES_LIBRARY: GuideEntry[] = [
  // ── Débutant (20 guides) ──
  entry("Cobra", "COLLIER", "/guides/cobra-collier.pdf"), entry("Cobra", "LAISSE"), entry("Cobra", "POIGNEE"), entry("Cobra", "HARNAIS"), entry("Cobra", "JOUETS"),
  entry("Fishtail", "COLLIER"), entry("Fishtail", "LAISSE"), entry("Fishtail", "POIGNEE"), entry("Fishtail", "JOUETS"), entry("Fishtail", "HARNAIS"),
  entry("LadderRack", "POIGNEE"), entry("LadderRack", "JOUETS"),
  entry("SnakeKnot", "LAISSE"), entry("SnakeKnot", "POIGNEE"), entry("SnakeKnot", "JOUETS"),
  entry("Spiral", "LAISSE"), entry("Spiral", "JOUETS"),
  entry("SquareKnot", "COLLIER"), entry("SquareKnot", "POIGNEE"), entry("SquareKnot", "HARNAIS"),

  // ── Intermédiaire (11 guides) ── Tressage Rond : jamais Harnais (confort)
  entry("Trilobite", "COLLIER"), entry("Trilobite", "LAISSE"),
  entry("CrownSinnet", "POIGNEE"), entry("CrownSinnet", "JOUETS"),
  entry("TressageRond", "LAISSE"), entry("TressageRond", "POIGNEE"),
  entry("ViperWeave", "COLLIER"), entry("ViperWeave", "HARNAIS"),
  entry("MonkeyFist", "JOUETS"),
  entry("DiamondKnot", "POIGNEE"), entry("DiamondKnot", "JOUETS"),

  // ── Avancé (7 guides) ──
  entry("KingCobra", "COLLIER"), entry("KingCobra", "LAISSE"), entry("KingCobra", "JOUETS"), entry("KingCobra", "HARNAIS"),
  entry("Sanctified", "COLLIER"),
  entry("SharkJawbone", "COLLIER"), entry("SharkJawbone", "HARNAIS"),

  // ── Expert (3 guides) ──
  entry("AztecSunBar", "COLLIER"),
  entry("CelticBar", "COLLIER"), entry("CelticBar", "LAISSE"),
];

// ─── Déblocage — combine la logique nœud ET la logique accessoire ─────────────
// Un guide n'est accessible que si SON nœud ET SON accessoire sont tous deux
// déverrouillés pour le palier de l'utilisateur (même règle que dans le
// calculateur : ex. Cobra est libre dès l'Atelier, mais Cobra+Harnais reste
// verrouillé tant que l'accessoire Harnais lui-même est Pro-exclusif).
export const isGuideLocked = (guide: GuideEntry): boolean => {
  const knot = getKnotMeta(guide.knotId);
  if (!knot) return true; // sécurité : nœud introuvable dans le catalogue = verrouillé par défaut
  return isKnotLocked(knot.order) || isAccLocked(ACCESSORIES_CONFIG[guide.accessoryKey].lock);
};

// Palier minimum requis pour débloquer ce guide (le plus restrictif des deux dimensions)
export const getGuideMinTier = (guide: GuideEntry): PlanLevel => {
  const knot = getKnotMeta(guide.knotId);
  const knotTier = knot ? getKnotMinTier(knot.order) : "Pro";
  const accTier = getAccessoryMinTier(ACCESSORIES_CONFIG[guide.accessoryKey].lock);
  return maxTier(knotTier, accTier);
};

export const getUnlockedGuides = (): GuideEntry[] =>
  GUIDES_LIBRARY.filter((g) => !isGuideLocked(g));

export const getGuidesForKnot = (knotId: string): GuideEntry[] =>
  GUIDES_LIBRARY.filter((g) => g.knotId === knotId);

export const getGuidesForAccessory = (accessoryKey: AccessoryKey): GuideEntry[] =>
  GUIDES_LIBRARY.filter((g) => g.accessoryKey === accessoryKey);

export const getGuideById = (id: string): GuideEntry | undefined =>
  GUIDES_LIBRARY.find((g) => g.id === id);

// Garde-fou dev : vérifie que chaque nœud du catalogue a au moins un guide,
// et que le total correspond bien aux 41 attendus par la synthèse.
if (import.meta.env.DEV) {
  const knotIdsWithGuides = new Set(GUIDES_LIBRARY.map((g) => g.knotId));
  const orphanKnots = KNOTS_CATALOG.filter((k) => !knotIdsWithGuides.has(k.id));
  if (orphanKnots.length > 0) {
    console.warn("[guidesLibrary] Nœuds sans aucun guide :", orphanKnots.map((k) => k.id));
  }
  if (GUIDES_LIBRARY.length !== 41) {
    console.warn(`[guidesLibrary] ${GUIDES_LIBRARY.length} guides trouvés, 41 attendus selon la synthèse.`);
  }
}
