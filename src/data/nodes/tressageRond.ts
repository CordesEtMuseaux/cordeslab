import type { NodeDef } from "../../shared/types";

export const TRESSAGE_ROND: NodeDef = {
  id: "TRESSAGE_ROND",
  name: "Tressage rond",
  category: "Tressage",
  difficulty: "Intermédiaire",
  maxColors: 4,
  // Ajusté à 15 suite à ton test réel (14.4 calculé)
  factor4mm: 14, 
  marginRecommended: 25, 
  ratios: [0.25, 0.25, 0.25, 0.25],
  allowStartBonus: true,
  startBonusMultiplier: 1.1,
  coreCount: 0, // Souvent 0 pour un tressage rond à 6 brins (le tressage forme lui-même le coeur)
  coreMultiplier: 1.05,
  coreMinExtraCm: 2,
  isCalibrationPending: true,
};