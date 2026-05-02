import type { NodeDef } from "../../shared/types";

export const CARRE_COBRA_COUPLE: NodeDef = {
  id: "CARRE_COBRA_COUPLE",
  name: "Carré (Cobra couplé)",
  category: "Tressage",
  difficulty: "Débutant",
  maxColors: 4,
  factor4mm: 7,
  marginRecommended: 60,
  ratios: [0.5, 0.5, 0, 0],
  allowStartBonus: true,
  startBonusMultiplier: 1.1,
  coreCount: 2,
  coreMultiplier: 1.02,
  coreMinExtraCm: 2,
  isCalibrationPending: false,
};