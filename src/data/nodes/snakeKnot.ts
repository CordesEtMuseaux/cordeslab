import type { NodeDef } from "../../shared/types";

export const SNAKE_KNOTS: NodeDef = {
  id: "SNAKE_KNOTS",
  name: "Snake Knots",
  category: "Tressage",
  difficulty: "Débutant",
  maxColors: 4,
  factor4mm: 40,
  marginRecommended: 25,
  // Ratios ajustés à 0.25 pour la cohérence avec 4 couleurs
  ratios: [0.25, 0.25, 0.25, 0.25], 
  allowStartBonus: true,
  startBonusMultiplier: 1.1,
  coreCount: 1,
  coreMultiplier: 1.05,
  coreMinExtraCm: 2,
  isCalibrationPending: true,
};