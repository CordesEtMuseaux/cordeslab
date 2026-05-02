export type RoundingMode = "none" | "cm" | "5cm" | "10cm";
export type UnitDisplay = "cm" | "m";

/* ======================
   🔐 ACCESS (SaaS-ready)
====================== */

export type AccessLevel = "atelier" | "creator" | "pro";

export type AccessStatus =
  | "active"
  | "expired"
  | "refunded"
  | "suspended";

export type PlanCode =
  | "atelier"
  | "creator_monthly"
  | "creator_yearly"
  | "creator_annual"
  | "pro_monthly"
  | "pro_yearly"
  | "pro_annual";

export interface UserAccess {
  level: AccessLevel;
  status: AccessStatus;
  expirationDate: string; // ISO string (ex: "2026-03-01T00:00:00.000Z")
  projectLimit?: number;
  planCode?: PlanCode;
  token?: string;
}

/* ======================
   CALCUL
====================== */

export type CalcInput = {
  calcName?: string;
  productModelId: string;
  lengthCm: number;
  nodeId: string;
  diameterMm: 3 | 4;
  colorCount: 1 | 2 | 3 | 4;
  startColor?: 1 | 2 | 3 | 4;
  maxSecurity: boolean;
  roundingMode: RoundingMode;
  unitDisplay: UnitDisplay;
  colorsHex?: string[];
};

export type CalcDetails = {
  factorUsed: number;
  marginUsed: number;
  startBonusApplied: boolean;
  startBonusColor?: number;
  rawByColor: Record<number, number>;
  afterMarginByColor: Record<number, number>;
  afterBonusByColor: Record<number, number>;
  finalByColor: Record<number, number>;
  corePerStrandRaw: number;
  corePerStrandFinal: number;
};

export type CalcOutput = {
  activeColorsCm: number[];
  coreCount: number;
  corePerStrandCm: number;
  coreTotalCm: number;
  totalActiveCm: number;
  totalCm: number;
  warnings: string[];
  details: CalcDetails;
};

/* ======================
   NŒUDS
====================== */

export type NodeCategory =
  | "Tressage"
  | "Finition"
  | "Fonctionnel";

export type NodeDifficulty = 
  | "Débutant"
  | "Intermédiaire"
  | "Avancé"
  | "Expert";

export const NODE_DIFFICULTY_OPTIONS: NodeDifficulty[] = [
  "Débutant",
  "Intermédiaire",
  "Avancé",
  "Expert",
];

export const NODE_DIFFICULTY_LABELS: Record<NodeDifficulty, string> = {
  "Débutant": "Débutant",
  "Intermédiaire": "Intermédiaire",
  "Avancé": "Avancé",
  "Expert": "Expert",
};

export type NodeDef = {
  id: string;
  name: string;
  category?: NodeCategory;
  difficulty?: NodeDifficulty;
  maxColors: number;
  factor4mm: number;
  marginRecommended: number;
  ratios: [number, number, number, number];
  allowStartBonus: boolean;
  startBonusMultiplier: number;
  coreCount: number;
  coreMultiplier: number;
  coreMinExtraCm: number;
  isCalibrationPending?: boolean;
};