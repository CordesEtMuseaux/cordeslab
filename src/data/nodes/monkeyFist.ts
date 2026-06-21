import type { NodeDef } from "../../shared/types";

export const MONKEY_FIST: NodeDef = {
  id: "MONKEY_FIST",
  name: "Monkey Fist",
  category: "Finition",
  difficulty: "Intermédiaire",
  maxColors: 4,
  factor4mm: 40,
  marginRecommended: 25,
  // Valeurs par défaut (template aligné sur les autres nœuds non calibrés)
  ratios: [0.25, 0.25, 0.25, 0.25],
  allowStartBonus: true,
  startBonusMultiplier: 1.1,
  coreCount: 1,
  coreMultiplier: 1.05,
  coreMinExtraCm: 2,
  isCalibrationPending: true,
};
