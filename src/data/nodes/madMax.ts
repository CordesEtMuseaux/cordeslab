import type { NodeDef } from "../../shared/types";

export const MAD_MAX: NodeDef = {
  id: "MAD_MAX",
  name: "Mad Max",
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
