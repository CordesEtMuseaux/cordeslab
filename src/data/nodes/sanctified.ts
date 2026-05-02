import type { NodeDef } from "../../shared/types";

export const SANCTIFIED: NodeDef = {
  id: "SANCTIFIED",
  name: "Sanctified",
  category: "Tressage",
  difficulty: "Avancé",
  maxColors: 4,
  factor4mm: 40,
  marginRecommended: 25,
  ratios: [0.25, 0.25, 0.25, 0.25],
  allowStartBonus: true,
  startBonusMultiplier: 1.1,
  coreCount: 1,
  coreMultiplier: 1.05,
  coreMinExtraCm: 2,
  isCalibrationPending: true,
};
