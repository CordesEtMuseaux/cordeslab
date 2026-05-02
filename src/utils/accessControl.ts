// src/utils/accessControl.ts

import type {
  AccessLevel,
  AccessStatus,
  NodeDef,
  NodeDifficulty,
  UserAccess,
} from "../shared/types";
import { NODES } from "../data/nodes";

export type UpgradePlan = "creator" | "pro";

export interface NodeAccessResult {
  allowed: boolean;
  reason: string | null;
  upgradePlan?: UpgradePlan;
}

export interface ProjectAccessResult {
  allowed: boolean;
  reason: string | null;
  upgradePlan?: UpgradePlan;
}

export interface UpgradeCopy {
  title: string;
  body: string;
  cta: string;
}

type ProductTypeLike = {
  id: string;
  name?: string;
  icon?: string;
  accessLevel?: AccessLevel;
  minAccessLevel?: AccessLevel;
  allowedLevels?: AccessLevel[];
  premiumOnly?: boolean;
};

export const ACCESS_LEVELS = {
  ATELIER: "atelier" as const,
  CREATOR: "creator" as const,
  PRO: "pro" as const,
};

export const ACCESS_STATUSES: AccessStatus[] = [
  "active",
  "expired",
  "refunded",
  "suspended",
];

/**
 * Mapping des nœuds vers les plans autorisés.
 * Les clés doivent correspondre EXACTEMENT à NodeDef.id
 */
export const NODE_ACCESS: Record<string, AccessLevel[]> = {
  COBRA_CLASSIQUE: ["atelier", "creator", "pro"],
  CARRE_COBRA_COUPLE: ["creator", "pro"],
  KING_COBRA: ["creator", "pro"],
  TRESSAGE_ROND: ["pro"],
};

const LEVEL_ORDER: Record<AccessLevel, number> = {
  atelier: 0,
  creator: 1,
  pro: 2,
};

/* ------------------------------------------------------------------ */
/* Utils user access                                                  */
/* ------------------------------------------------------------------ */

export function isKnownAccessStatus(
  status?: string | null
): status is AccessStatus {
  return !!status && ACCESS_STATUSES.includes(status as AccessStatus);
}

export function normalizeAccessLevel(level?: string | null): AccessLevel {
  if (!level) return "atelier";

  const normalized = String(level).toLowerCase();

  if (normalized === "creator") return "creator";
  if (normalized === "pro") return "pro";
  return "atelier";
}

export function normalizeAccessStatus(status?: string | null): AccessStatus {
  if (!status) return "expired";

  const normalized = String(status).toLowerCase();

  if (normalized === "active") return "active";
  if (normalized === "refunded") return "refunded";
  if (normalized === "suspended") return "suspended";
  return "expired";
}

export function isAccessExpired(expirationDate?: string | null): boolean {
  if (!expirationDate) return true;

  const expiration = new Date(expirationDate);
  if (Number.isNaN(expiration.getTime())) return true;

  return expiration.getTime() <= Date.now();
}

export function hasActiveAccess(userAccess?: UserAccess | null): boolean {
  if (!userAccess) return false;

  const status = normalizeAccessStatus(userAccess.status);
  if (status !== "active") return false;

  return !isAccessExpired(userAccess.expirationDate);
}

/**
 * Retourne le niveau réellement utilisable.
 * - creator/pro actifs => leur niveau
 * - absent / expiré / remboursé / suspendu => atelier
 */
export function getEffectiveAccessLevel(
  userAccess?: UserAccess | null
): AccessLevel {
  if (!userAccess) return "atelier";
  if (!hasActiveAccess(userAccess)) return "atelier";
  return normalizeAccessLevel(userAccess.level);
}

export function getAccessLabel(level?: AccessLevel | null): string {
  if (level === "pro") return "Pro";
  if (level === "creator") return "Creator";
  return "Atelier";
}

export function isCreator(userAccess?: UserAccess | null): boolean {
  return getEffectiveAccessLevel(userAccess) === "creator";
}

export function isPro(userAccess?: UserAccess | null): boolean {
  return getEffectiveAccessLevel(userAccess) === "pro";
}

export function canAccessCreator(userAccess?: UserAccess | null): boolean {
  const level = getEffectiveAccessLevel(userAccess);
  return level === "creator" || level === "pro";
}

export function canAccessPro(userAccess?: UserAccess | null): boolean {
  return getEffectiveAccessLevel(userAccess) === "pro";
}

export function isDevBypassEnabled(): boolean {
  try {
    if (
      typeof import.meta !== "undefined" &&
      (import.meta as ImportMeta & { env?: Record<string, string> }).env
        ?.VITE_DEV_ACCESS_BYPASS === "true"
    ) {
      return true;
    }
  } catch {
    // ignore
  }

  try {
    return localStorage.getItem("dev_access_bypass") === "true";
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Node lookup                                                        */
/* ------------------------------------------------------------------ */

export function getNodeById(nodeId: string): NodeDef | undefined {
  return NODES.find((node) => node.id === nodeId);
}

export function getAllowedLevelsForNode(nodeId: string): AccessLevel[] {
  return NODE_ACCESS[nodeId] ?? ["atelier", "creator", "pro"];
}

export function getMinimumPlanForNode(nodeId: string): AccessLevel {
  const allowed = getAllowedLevelsForNode(nodeId);

  if (allowed.includes("atelier")) return "atelier";
  if (allowed.includes("creator")) return "creator";
  return "pro";
}

/* ------------------------------------------------------------------ */
/* Core node access                                                   */
/* ------------------------------------------------------------------ */

export function canUseNode(
  nodeId: string,
  userAccess?: UserAccess | null
): boolean {
  return getNodeAccess(nodeId, userAccess).allowed;
}

export function getNodeAccess(
  nodeId: string,
  userAccess?: UserAccess | null
): NodeAccessResult {
  const node = getNodeById(nodeId);

  if (!node) {
    return {
      allowed: false,
      reason: `Nœud inconnu : ${nodeId}`,
    };
  }

  const effectiveLevel = getEffectiveAccessLevel(userAccess);
  const allowedLevels = getAllowedLevelsForNode(nodeId);

  if (allowedLevels.includes(effectiveLevel)) {
    return {
      allowed: true,
      reason: null,
    };
  }

  const requiredPlan = getMinimumPlanForNode(nodeId);

  if (requiredPlan === "creator") {
    return {
      allowed: false,
      reason: `Le nœud "${node.name}" est réservé aux plans Creator et Pro.`,
      upgradePlan: "creator",
    };
  }

  return {
    allowed: false,
    reason: `Le nœud "${node.name}" est réservé au plan Pro.`,
    upgradePlan: "pro",
  };
}

export function getNodeRestrictionReason(
  nodeId: string,
  userAccess?: UserAccess | null
): string | null {
  return getNodeAccess(nodeId, userAccess).reason;
}

export function assertCanUseNode(
  nodeId: string,
  userAccess?: UserAccess | null
): void {
  const result = getNodeAccess(nodeId, userAccess);

  if (!result.allowed) {
    throw new Error(result.reason || "Accès refusé à ce nœud.");
  }
}

/* ------------------------------------------------------------------ */
/* Collections helpers                                                */
/* ------------------------------------------------------------------ */

export function getAllowedNodes(userAccess?: UserAccess | null): NodeDef[] {
  return NODES.filter((node) => canUseNode(node.id, userAccess));
}

export function getVisibleNodes(): NodeDef[] {
  return NODES;
}

export function getNodesWithAccess(userAccess?: UserAccess | null) {
  return NODES.map((node) => {
    const access = getNodeAccess(node.id, userAccess);

    return {
      ...node,
      disabled: !access.allowed,
      reason: access.reason,
      upgradePlan: access.upgradePlan,
    };
  });
}

export function isNodeDisabled(
  nodeId: string,
  userAccess?: UserAccess | null
): boolean {
  return !canUseNode(nodeId, userAccess);
}

export function getAllowedNodeDifficulties(
  _userAccess?: UserAccess | null
): NodeDifficulty[] {
  return ["Débutant", "Intermédiaire", "Avancé", "Expert"];
}

/* ------------------------------------------------------------------ */
/* Product access helpers                                             */
/* ------------------------------------------------------------------ */

function levelSatisfies(
  currentLevel: AccessLevel,
  requiredLevel: AccessLevel
): boolean {
  return LEVEL_ORDER[currentLevel] >= LEVEL_ORDER[requiredLevel];
}

function canUseProductType(
  productType: ProductTypeLike,
  userAccess?: UserAccess | null
): boolean {
  const level = getEffectiveAccessLevel(userAccess);

  if (
    Array.isArray(productType.allowedLevels) &&
    productType.allowedLevels.length
  ) {
    return productType.allowedLevels.includes(level);
  }

  if (productType.minAccessLevel) {
    return levelSatisfies(level, productType.minAccessLevel);
  }

  if (productType.accessLevel) {
    return levelSatisfies(level, productType.accessLevel);
  }

  if (productType.premiumOnly) {
    return level !== "atelier";
  }

  return true;
}

export function getAccessibleProductTypes<T extends ProductTypeLike>(
  userAccess: UserAccess | null | undefined,
  productTypes: T[]
): T[] {
  return productTypes.filter((productType) =>
    canUseProductType(productType, userAccess)
  );
}

/* ------------------------------------------------------------------ */
/* Project limits                                                     */
/* ------------------------------------------------------------------ */

export function getProjectLimit(userAccess?: UserAccess | null): number {
  const effectiveLevel = getEffectiveAccessLevel(userAccess);

  if (effectiveLevel === "atelier") {
    return 10;
  }

  if (effectiveLevel === "creator") {
    return userAccess?.projectLimit ?? 50;
  }

  return userAccess?.projectLimit ?? 999999;
}

export function canCreateProject(
  currentProjectCount: number,
  userAccess?: UserAccess | null,
  totalCreatedCount?: number
): boolean {
  return getProjectCreationAccess(
    currentProjectCount,
    userAccess,
    totalCreatedCount
  ).allowed;
}

export function getProjectCreationAccess(
  currentProjectCount: number,
  userAccess?: UserAccess | null,
  totalCreatedCount?: number
): ProjectAccessResult {
  const limit = getProjectLimit(userAccess);
  const level = getEffectiveAccessLevel(userAccess);

  // Atelier = quota cumulé de créations
  if (level === "atelier") {
    const usedCount = totalCreatedCount ?? currentProjectCount;

    if (usedCount < limit) {
      return {
        allowed: true,
        reason: null,
      };
    }

    return {
      allowed: false,
      reason: `Vous avez atteint la limite de ${limit} créations de projets pour le plan Atelier.`,
      upgradePlan: "creator",
    };
  }

  // Creator / Pro = logique classique basée sur le nombre actuel
  if (currentProjectCount < limit) {
    return {
      allowed: true,
      reason: null,
    };
  }

  if (level === "creator") {
    return {
      allowed: false,
      reason: `Vous avez atteint la limite de ${limit} projets pour le plan Creator.`,
      upgradePlan: "pro",
    };
  }

  return {
    allowed: false,
    reason: `Vous avez atteint la limite de ${limit} projets.`,
    upgradePlan: undefined,
  };
}

/* ------------------------------------------------------------------ */
/* Subscription / account helpers                                     */
/* ------------------------------------------------------------------ */

export function getAccessProblem(userAccess?: UserAccess | null): string | null {
  if (!userAccess) return null;

  const status = normalizeAccessStatus(userAccess.status);

  if (status === "refunded") {
    return "Votre accès a été remboursé.";
  }

  if (status === "suspended") {
    return "Votre accès a été suspendu.";
  }

  if (status === "expired") {
    return "Votre accès a expiré.";
  }

  if (!hasActiveAccess(userAccess)) {
    return "Votre accès a expiré.";
  }

  return null;
}

export function hasUsablePaidAccess(userAccess?: UserAccess | null): boolean {
  if (!hasActiveAccess(userAccess)) return false;

  const level = normalizeAccessLevel(userAccess?.level);
  return level === "creator" || level === "pro";
}

export function getPlanCapabilities(userAccess?: UserAccess | null) {
  const level = getEffectiveAccessLevel(userAccess);

  return {
    level,
    label: getAccessLabel(level),
    hasActiveAccess: hasActiveAccess(userAccess),
    canUseCreatorNodes: level === "creator" || level === "pro",
    canUseProNodes: level === "pro",
    projectLimit: getProjectLimit(userAccess),
  };
}

export function getAccessCapabilities(userAccess?: UserAccess | null) {
  const level = getEffectiveAccessLevel(userAccess);
  const label = getAccessLabel(level);
  const projectLimit = getProjectLimit(userAccess);

  const accessibleNodes = getAllowedNodes(userAccess);
  const accessibleDifficulties = Array.from(
    new Set(
      accessibleNodes
        .map((node) => node.difficulty)
        .filter(Boolean) as NodeDifficulty[]
    )
  );

  const nodesLabel =
    accessibleDifficulties.length > 0
      ? accessibleDifficulties.join(" · ")
      : "Aucun nœud";

  const accessoriesLabel =
    level === "pro"
      ? "Tous les accessoires"
      : level === "creator"
      ? "Accessoires Creator + Atelier"
      : "Accessoires Atelier";

  const projectsLabel =
    level === "pro" && projectLimit >= 999999
      ? "Projets illimités"
      : `${projectLimit} projets max`;

  return {
    level,
    levelLabel: label,
    accessoriesLabel,
    nodesLabel,
    projectsLabel,
  };
}

/* ------------------------------------------------------------------ */
/* Upgrade helpers                                                    */
/* ------------------------------------------------------------------ */

export function getUpgradeReason(
  userAccess: UserAccess | null | undefined,
  currentProjectCount: number,
  totalCreatedCount?: number
): "expired" | "creator" | "pro" | "projects" | null {
  const accessProblem = getAccessProblem(userAccess);

  if (accessProblem) {
    return "expired";
  }

  const creation = getProjectCreationAccess(
    currentProjectCount,
    userAccess,
    totalCreatedCount
  );

  if (!creation.allowed) {
    if (creation.upgradePlan === "creator") return "creator";
    if (creation.upgradePlan === "pro") return "pro";
    return "projects";
  }

  return null;
}

export function getUpgradeCopy(
  userAccess: UserAccess | null | undefined,
  reason: ReturnType<typeof getUpgradeReason>
): UpgradeCopy {
  const level = getEffectiveAccessLevel(userAccess);

  if (reason === "expired") {
    return {
      title: "Votre accès a expiré",
      body: "Réactivez votre formule pour retrouver l’accès au calcul, à la sauvegarde et à l’export PDF.",
      cta: "Voir les offres",
    };
  }

  if (reason === "pro") {
    return {
      title: "Passez au plan Pro",
      body: "Cette action ou ce contenu nécessite le plan Pro.",
      cta: "Découvrir Pro",
    };
  }

  if (reason === "creator") {
    return {
      title: "Passez au plan Creator",
      body: "Cette action ou ce contenu nécessite au minimum le plan Creator.",
      cta: "Découvrir Creator",
    };
  }

  if (reason === "projects") {
    return {
      title: "Limite de projets atteinte",
      body:
        level === "atelier"
          ? "Vous avez atteint la limite de créations du plan Atelier."
          : "Vous avez atteint la limite de projets de votre formule actuelle.",
      cta: "Voir les offres",
    };
  }

  return {
    title: "Débloquer plus de fonctionnalités",
    body: "Passez à une formule supérieure pour accéder à plus de nœuds, d’accessoires et de projets.",
    cta: "Voir les offres",
  };
}

export function canUseWebApp(userAccess?: UserAccess | null): boolean {
  if (isDevBypassEnabled()) return true;
  if (!userAccess) return true;

  const status = normalizeAccessStatus(userAccess.status);

  if (status === "refunded" || status === "suspended") {
    return false;
  }

  return true;
}
export function getDaysLeft(expirationDate?: string | null): number {
  if (!expirationDate) return 0;
  const diff = new Date(expirationDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function shouldShowExpiryBanner(
  userAccess?: UserAccess | null,
  thresholdDays = 7
): boolean {
  if (!userAccess) return false;
  if (userAccess.status !== "active") return false;
  return getDaysLeft(userAccess.expirationDate) <= thresholdDays;
}