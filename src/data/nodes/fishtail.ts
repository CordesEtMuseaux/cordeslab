import type { NodeDef } from "../../shared/types";

export const FISHTAIL: NodeDef = {
  id: "FISHTAIL",
  name: "Fishtail",
  category: "Tressage",
  difficulty: "Débutant",
  maxColors: 4,
  factor4mm: 40,
  marginRecommended: 25,
  // Ratios ajustés pour 4 couleurs potentielles
  ratios: [0.25, 0.25, 0.25, 0.25], 
  allowStartBonus: true,
  startBonusMultiplier: 1.1,
  coreCount: 1,
  coreMultiplier: 1.05,
  coreMinExtraCm: 2,
  isCalibrationPending: true, // En attente de ton échantillon physique
};