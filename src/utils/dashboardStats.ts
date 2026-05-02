import { NODES } from "../data/nodes/index";
import { PRODUCT_MODELS, PRODUCT_TYPES } from "../data/products";
import { countProjectsCreated, loadProjects } from "../utils/projectsStorage";
import { loadUserAccess } from "../utils/userAccessStorage";

type ProjectLike = {
  id: string;
  name: string;
  updatedAt?: string;
  createdAt?: string;
  input: {
    productModelId: string;
    nodeId: string;
    colorsHex?: string[];
    maxSecurity?: boolean;
    startColor?: number;
  };
};

function safeProjects(): ProjectLike[] {
  try {
    return (loadProjects() ?? []) as unknown as ProjectLike[];
  } catch {
    return [];
  }
}

function toTimestamp(value?: string) {
  if (!value) return 0;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export function getDashboardProjects() {
  return safeProjects();
}

export function getProjectTypeLabel(productModelId: string) {
  const model = PRODUCT_MODELS.find((m) => m.id === productModelId);
  if (!model) return "—";

  return (
    PRODUCT_TYPES.find((t) => t.id === model.productTypeId)?.name ??
    model.productTypeId
  );
}

export function getProjectTypeId(productModelId: string) {
  const model = PRODUCT_MODELS.find((m) => m.id === productModelId);
  return model?.productTypeId ?? "COLLIER";
}

export function getProjectModelLabel(productModelId: string) {
  return PRODUCT_MODELS.find((m) => m.id === productModelId)?.name ?? productModelId;
}

export function getNodeLabel(nodeId: string) {
  return NODES.find((n) => n.id === nodeId)?.name ?? nodeId;
}

export function getLatestProjects(limit = 3) {
  return [...safeProjects()]
    .sort(
      (a, b) =>
        Math.max(toTimestamp(b.updatedAt), toTimestamp(b.createdAt)) -
        Math.max(toTimestamp(a.updatedAt), toTimestamp(a.createdAt))
    )
    .slice(0, limit);
}

export function getMonthlyConsumptionText() {
  const access = loadUserAccess();
  const currentCount = safeProjects().length;

  if (access.level === "atelier") {
    const used = countProjectsCreated();
    const limit = access.projectLimit ?? 10;
    return `${used} / ${limit} création${used > 1 ? "s" : ""}`;
  }

  if (currentCount === 0) return "—";
  return `${currentCount} projet${currentCount > 1 ? "s" : ""}`;
}

export function getMostUsedNodeLabel() {
  const projects = safeProjects();
  if (projects.length === 0) return "—";

  const counts = new Map<string, number>();

  for (const p of projects) {
    const nodeId = p.input?.nodeId;
    if (!nodeId) continue;
    counts.set(nodeId, (counts.get(nodeId) ?? 0) + 1);
  }

  let bestId = "";
  let bestCount = 0;

  counts.forEach((count, id) => {
    if (count > bestCount) {
      bestId = id;
      bestCount = count;
    }
  });

  return bestId ? getNodeLabel(bestId) : "—";
}

export function getCalculCountText() {
  const count = safeProjects().length;
  return count === 0 ? "—" : String(count);
}

export function getSecurityMaxText() {
  const projects = safeProjects();
  if (projects.length === 0) return "—";

  const withMax = projects.filter((p) => p.input?.maxSecurity).length;
  const pct = Math.round((withMax / projects.length) * 100);

  return `${pct}%`;
}

export function getCurrentPlanLabel() {
  const access = loadUserAccess();
  const planCode = access.planCode ?? "atelier";

  switch (planCode) {
    case "creator_monthly":
      return "Creator";
    case "creator_yearly":
    case "creator_annual":
      return "Creator annuel";
    case "pro_monthly":
      return "Pro";
    case "pro_yearly":
    case "pro_annual":
      return "Pro annuel";
    default:
      return "Atelier";
  }
}

export function getProjectsCapabilityLabel() {
  const access = loadUserAccess();

  if (access.level === "atelier") {
    return `${access.projectLimit ?? 10} créations max`;
  }

  if (access.level === "creator") {
    return "Projets illimités";
  }

  if (access.level === "pro") {
    return "Projets illimités";
  }

  return "—";
}