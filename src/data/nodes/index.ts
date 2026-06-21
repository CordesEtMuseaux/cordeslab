import type { NodeDef, NodeDifficulty } from "../../shared/types";

import { COBRA_CLASSIQUE } from "./cobra";
import { CARRE_COBRA_COUPLE } from "./carreCobra";
import { KING_COBRA } from "./kingCobra";
import { TRESSAGE_ROND } from "./tressageRond";
// Import des nouveaux nœuds
import { FISHTAIL } from "./fishtail";
import { CROWN_SINNET } from "./crownSinnet";
import { TRILOBITE } from "./trilobite";
import { LADDER_RACK } from "./ladderRack";
import { SNAKE_KNOTS } from "./snakeKnot";
import { SQUARE_KNOTS } from "./squareKnot";
import { SPIRAL } from "./spiral";
import { VIPER_WEAVE } from "./viperWeave";
import { SHARK_JAWBONE } from "./sharkJawbone";
import { CELTIC_BAR } from "./celticBar";
import { AZTEC_SUN_BAR } from "./aztecSunBar";
import { SANCTIFIED } from "./sanctified";
import { MONKEY_FIST } from "./monkeyFist";
import { DIAMOND_KNOT } from "./diamondKnot";


export const NODES: NodeDef[] = [
  COBRA_CLASSIQUE,
  CARRE_COBRA_COUPLE,
  KING_COBRA,
  TRESSAGE_ROND,
  FISHTAIL,
  CROWN_SINNET,
  TRILOBITE,
  LADDER_RACK,
  SNAKE_KNOTS,
  SQUARE_KNOTS,
  SPIRAL,
  VIPER_WEAVE,
  SHARK_JAWBONE,
  CELTIC_BAR,
  AZTEC_SUN_BAR,
  SANCTIFIED,
  MONKEY_FIST,
  DIAMOND_KNOT,
];

// Classement mis à jour avec "Débutant" au lieu de "Facile"
export const NODES_BY_DIFFICULTY: Record<NodeDifficulty, NodeDef[]> = {
  Débutant: NODES.filter((node) => node.difficulty === "Débutant"),
  Intermédiaire: NODES.filter((node) => node.difficulty === "Intermédiaire"),
  Avancé: NODES.filter((node) => node.difficulty === "Avancé"),
  Expert: NODES.filter((node) => node.difficulty === "Expert"),
};