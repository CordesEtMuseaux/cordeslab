import type { NodeDef } from "../../shared/types";

export const CELTIC_BAR: NodeDef = {
  id: "CELTIC_BAR",
  name: "Celtic Bar",
  category: "Tressage",
  difficulty: "Expert",
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