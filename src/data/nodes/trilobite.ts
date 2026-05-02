import type { NodeDef } from "../../shared/types";

export const TRILOBITE: NodeDef = {
  id: "TRILOBITE",
  name: "Trilobite",
  category: "Tressage",
  difficulty: "Intermédiaire",
  maxColors: 4,
  factor4mm: 40,
  marginRecommended: 25,
  // Ratios harmonisés pour 4 couleurs
  ratios: [0.25, 0.25, 0.25, 0.25], 
  allowStartBonus: true,
  startBonusMultiplier: 1.1,
  // Le Trilobite se fait souvent sur 2 brins de cœur pour avoir une base large
  coreCount: 2, 
  coreMultiplier: 1.05,
  coreMinExtraCm: 2,
  isCalibrationPending: true,
};