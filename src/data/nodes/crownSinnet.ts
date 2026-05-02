import type { NodeDef } from "../../shared/types";

export const CROWN_SINNET: NodeDef = {
  id: "CROWN_SINNET",
  name: "Crown Sinnet",
  category: "Tressage",
  difficulty: "Intermédiaire",
  maxColors: 4,
  factor4mm: 40,
  marginRecommended: 25,
  // Ratios ajustés pour permettre 4 couleurs si besoin
  ratios: [0.25, 0.25, 0.25, 0.25], 
  allowStartBonus: true,
  startBonusMultiplier: 1.1,
  coreCount: 1,
  coreMultiplier: 1.05,
  coreMinExtraCm: 2,
  isCalibrationPending: true, // En attente de ton test de 10cm
};