import type { NodeDef } from "../../shared/types";

export const COBRA_CLASSIQUE: NodeDef = {
  id: "COBRA_CLASSIQUE",
  name: "Cobra (classique)",
  category: "Tressage",
  difficulty: "Débutant",
  maxColors: 4,
  factor4mm: 21,
  marginRecommended: 20,
  ratios: [0.5, 0.5, 0, 0],
  allowStartBonus: true,
  startBonusMultiplier: 1.1,
  coreCount: 1,
  coreMultiplier: 1.05,
  coreMinExtraCm: 2,
  isCalibrationPending: false,
};