import type { NodeDef } from "../../shared/types";

export const SHARK_JAWBONE: NodeDef = {
  id: "SHARK_JAWBONE",
  name: "Shark Jawbone",
  category: "Tressage",
  difficulty: "Avancé",
  maxColors: 4,
  factor4mm: 40,
  marginRecommended: 25,
  // Ratios ajustés pour 4 couleurs (somme = 1)
  ratios: [0.25, 0.25, 0.25, 0.25], 
  allowStartBonus: true,
  startBonusMultiplier: 1.1,
  // Passage à 2 cordes de cœur pour la largeur du Shark Jawbone
  coreCount: 2, 
  coreMultiplier: 1.05,
  coreMinExtraCm: 2,
  isCalibrationPending: true,
};