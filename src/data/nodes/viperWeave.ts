import type { NodeDef } from "../../shared/types";

export const VIPER_WEAVE: NodeDef = {
  id: "VIPER_WEAVE",
  name: "Viper Weave",
  category: "Tressage",
  difficulty: "Intermédiaire",
  maxColors: 4,
  factor4mm: 40,
  marginRecommended: 25,
  // Ratios harmonisés pour supporter les 4 couleurs sélectionnables
  ratios: [0.25, 0.25, 0.25, 0.25], 
  allowStartBonus: true,
  startBonusMultiplier: 1.1,
  // Le Viper Weave est superbe sur un cœur simple ou double
  coreCount: 1, 
  coreMultiplier: 1.05,
  coreMinExtraCm: 2,
  isCalibrationPending: true,
};