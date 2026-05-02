import type { NodeDef } from "../../shared/types";

export const SPIRAL: NodeDef = {
  id: "SPIRAL",
  name: "Spiral",
  category: "Tressage",
  difficulty: "Débutant",
  maxColors: 4,
  factor4mm: 40,
  marginRecommended: 25,
  // Ratios ajustés pour la cohérence globale
  ratios: [0.25, 0.25, 0.25, 0.25], 
  allowStartBonus: true,
  startBonusMultiplier: 1.1,
  coreCount: 1,
  coreMultiplier: 1.05,
  coreMinExtraCm: 2,
  isCalibrationPending: true,
};