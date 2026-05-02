import type { NodeDef } from "../../shared/types";

export const KING_COBRA: NodeDef = {
  id: "KING_COBRA",
  name: "King Cobra (double Cobra)",
  category: "Tressage",
  difficulty: "Avancé",
  maxColors: 4,
  factor4mm: 40,
  marginRecommended: 25,
  // Ratios ajustés pour permettre 4 couleurs (somme = 1)
  ratios: [0.25, 0.25, 0.25, 0.25], 
  allowStartBonus: true,
  startBonusMultiplier: 1.1,
  // Le King Cobra se fait sur la base du premier Cobra (souvent 2 fils de coeur)
  coreCount: 2, 
  coreMultiplier: 1.05,
  coreMinExtraCm: 2,
  isCalibrationPending: true,
};