import type { PlanCode, UserAccess } from "../shared/types";

const STORAGE_KEY = "cordeslab_user_access";
const BILLING_META_KEY = "cordeslab_billing_meta";

function createDefaultAccess(): UserAccess {
  return {
    level: "atelier",
    status: "active",
    expirationDate: new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 180
    ).toISOString(),
    projectLimit: 10,
    planCode: "atelier",
    token: "CLAB-LOCAL-ATELIER",
  };
}

function normalizePlanCode(value: unknown): PlanCode {
  if (typeof value !== "string") return "atelier";

  switch (value) {
    case "atelier":
    case "creator_monthly":
    case "creator_yearly":
    case "creator_annual":
    case "pro_monthly":
    case "pro_yearly":
    case "pro_annual":
      return value;
    default:
      return "atelier";
  }
}

export function loadUserAccess(): UserAccess {
  const fallback = createDefaultAccess();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as Partial<UserAccess> & {
      planCode?: unknown;
    };

    return {
      level: parsed.level ?? fallback.level,
      status: parsed.status ?? fallback.status,
      expirationDate: parsed.expirationDate ?? fallback.expirationDate,
      projectLimit: parsed.projectLimit ?? fallback.projectLimit,
      planCode: normalizePlanCode(parsed.planCode),
      token: parsed.token ?? fallback.token,
    };
  } catch {
    return fallback;
  }
}

export function saveUserAccess(access: UserAccess) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(access));
}

export function clearUserAccess() {
  localStorage.removeItem(STORAGE_KEY);
}

export function saveBillingMeta(meta: {
  customerId?: string | null;
  subscriptionId?: string | null;
}) {
  localStorage.setItem(BILLING_META_KEY, JSON.stringify(meta));
}

export function clearBillingMeta() {
  localStorage.removeItem(BILLING_META_KEY);
}

export async function syncUserAccessFromServer() {
  try {
    const userId = localStorage.getItem("userId") || "demo-user";

    const response = await fetch(`http://localhost:4242/access/${userId}`);
    const data = await response.json();

    if (!response.ok || !data) {
      return null;
    }

    const current = loadUserAccess();

    const nextAccess: UserAccess = {
      level: data.level ?? "atelier",
      status: data.status ?? "active",
      expirationDate:
        data.expirationDate ??
        new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString(),
      projectLimit: data.projectLimit ?? 10,
      planCode: normalizePlanCode(data.planCode),
      token: current.token ?? "CLAB-LOCAL-ATELIER",
    };

    saveUserAccess(nextAccess);

    if (data.customerId || data.subscriptionId) {
      saveBillingMeta({
        customerId: data.customerId ?? null,
        subscriptionId: data.subscriptionId ?? null,
      });
    }

    return nextAccess;
  } catch (error) {
    console.error("syncUserAccessFromServer error:", error);
    return null;
  }
}

/* ======================
   Helpers pratiques
====================== */

export function markAccessRefunded() {
  const current = loadUserAccess();

  saveUserAccess({
    ...current,
    status: "refunded",
  });
}

export function markAccessSuspended() {
  const current = loadUserAccess();

  saveUserAccess({
    ...current,
    status: "suspended",
  });
}

export function markAccessExpired() {
  const current = loadUserAccess();

  saveUserAccess({
    ...current,
    status: "expired",
  });
}

export function markAccessActive() {
  const current = loadUserAccess();

  saveUserAccess({
    ...current,
    status: "active",
  });
}

export function activateCreatorAccess(
  expirationDate: string,
  planCode: PlanCode = "creator_monthly"
) {
  const current = loadUserAccess();

  saveUserAccess({
    ...current,
    level: "creator",
    status: "active",
    expirationDate,
    projectLimit: 999999,
    planCode,
  });
}

export function activateProAccess(
  expirationDate: string,
  planCode: PlanCode = "pro_monthly"
) {
  const current = loadUserAccess();

  saveUserAccess({
    ...current,
    level: "pro",
    status: "active",
    expirationDate,
    projectLimit: 999999,
    planCode,
  });
}

export function revertToAtelierAccess() {
  const current = loadUserAccess();

  saveUserAccess({
    ...current,
    level: "atelier",
    status: "expired",
    expirationDate: new Date().toISOString(),
    projectLimit: 10,
    planCode: "atelier",
  });
}