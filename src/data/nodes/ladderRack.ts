import type { NodeDef } from "../../shared/types";

export const LADDER_RACK: NodeDef = {
  id: "LADDER_RACK",
  name: "Ladder Rack",
  category: "Tressage",
  difficulty: "Débutant",
  maxColors: 4,
  factor4mm: 40,
  marginRecommended: 25,
  // Ratios équilibrés pour supporter jusqu'à 4 couleurs
  ratios: [0.25, 0.25, 0.25, 0.25], 
  allowStartBonus: true,
  startBonusMultiplier: 1.1,
  // Le Ladder Rack se tresse souvent sur un coeur simple, mais peut être doublé
  coreCount: 1,
  coreMultiplier: 1.05,
  coreMinExtraCm: 2,
  isCalibrationPending: true,
};