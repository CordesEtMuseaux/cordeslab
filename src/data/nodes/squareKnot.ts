import type { NodeDef } from "../../shared/types";

export const SQUARE_KNOTS: NodeDef = {
  id: "SQUARE_KNOTS",
  name: "Square Knots",
  category: "Fonctionnel", // Bien vu pour le changement de catégorie !
  difficulty: "Débutant",
  maxColors: 4,
  factor4mm: 40,
  marginRecommended: 25,
  // Ratios ajustés pour supporter 4 couleurs
  ratios: [0.25, 0.25, 0.25, 0.25], 
  allowStartBonus: true,
  startBonusMultiplier: 1.1,
  coreCount: 1,
  coreMultiplier: 1.05,
  coreMinExtraCm: 2,
  isCalibrationPending: true,
};