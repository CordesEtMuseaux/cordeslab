import type { NodeDef } from "../../shared/types";

export const AZTEC_SUN_BAR: NodeDef = {
  id: "AZTEC_SUN_BAR",
  name: "Aztec Sun Bar",
  category: "Tressage",
  difficulty: "Expert", // Conforme à ton classement PDF 
  maxColors: 4,
  factor4mm: 40,
  marginRecommended: 25,
  // Ratios corrigés pour supporter jusqu'à 4 couleurs
  ratios: [0.25, 0.25, 0.25, 0.25], 
  allowStartBonus: true,
  startBonusMultiplier: 1.1,
  // Le Celtic Bar se tressage généralement sur une base simple (2 fils de coeur)
  coreCount: 1, 
  coreMultiplier: 1.05,
  coreMinExtraCm: 2,
  isCalibrationPending: true,
};