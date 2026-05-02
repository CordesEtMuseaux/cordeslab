import { describe, it, expect } from "vitest";
import { calculate } from "../calcEngine";
import type { CalcInput, NodeDef } from "../../shared/types";
import { NODES } from "../../data/nodes";

const mockNode: NodeDef = {
  id: "TEST",
  name: "Test Node",
  maxColors: 4,
  factor4mm: 2,
  marginRecommended: 10,
  ratios: [1, 1, 1, 1],
  allowStartBonus: true,
  startBonusMultiplier: 1.1,
  coreCount: 1,
  coreMultiplier: 1,
  coreMinExtraCm: 0,
};

const mockInput: CalcInput = {
  productModelId: "TEST",
  lengthCm: 100,
  nodeId: "TEST",
  diameterMm: 4,
  colorCount: 2,
  startColor: 1,
  maxSecurity: true,
  roundingMode: "none",
  unitDisplay: "cm",
};

describe("calculate()", () => {
  it("applique le bonus de départ", () => {
    const result = calculate(mockInput, mockNode);
    expect(result.details.startBonusApplied).toBe(true);
    expect(result.activeColorsCm[0]).toBeGreaterThan(result.activeColorsCm[1]);
  });

  it("calcule des totaux cohérents", () => {
    const result = calculate(mockInput, mockNode);
    const sumColors = result.activeColorsCm.reduce((a, b) => a + b, 0);

    expect(result.totalActiveCm).toBe(sumColors);
    expect(result.totalCm).toBe(sumColors + result.coreTotalCm);
  });
});

it("n'applique pas le bonus si maxSecurity = false", () => {
  const input = { ...mockInput, maxSecurity: false as const };
  const result = calculate(input, mockNode);

  expect(result.details.startBonusApplied).toBe(false);
  expect(result.details.startBonusColor).toBeUndefined();
});

it("applique l'arrondi 5cm sur chaque couleur", () => {
  const node = { ...mockNode, marginRecommended: 0, factor4mm: 1 }; // simple
  const input = {
    ...mockInput,
    lengthCm: 101,          // donne des valeurs pas rondes
    roundingMode: "5cm" as const,
    maxSecurity: false as const,
    colorCount: 2 as const,
  };

  const result = calculate(input, node);

  // chaque valeur doit être un multiple de 5
  for (const v of result.activeColorsCm) {
    expect(v % 5).toBe(0);
  }
});

it("limite colorCount à node.maxColors", () => {
  const node = { ...mockNode, maxColors: 2 };
  const input = { ...mockInput, colorCount: 4 as const }; // demande 4

  const result = calculate(input, node);

  // on doit sortir 2 couleurs seulement
  expect(result.activeColorsCm.length).toBe(2);
  // et on doit avoir un warning
  expect(result.warnings.some(w => w.includes("limité à 2"))).toBe(true);
});

it("ne retourne jamais de NaN", () => {
  const result = calculate(mockInput, mockNode);

  // valeurs couleurs
  for (const v of result.activeColorsCm) {
    expect(Number.isFinite(v)).toBe(true);
  }

  // totaux
  expect(Number.isFinite(result.totalActiveCm)).toBe(true);
  expect(Number.isFinite(result.corePerStrandCm)).toBe(true);
  expect(Number.isFinite(result.coreTotalCm)).toBe(true);
  expect(Number.isFinite(result.totalCm)).toBe(true);

  // détails (optionnel mais utile)
  for (const v of Object.values(result.details.rawByColor)) {
    expect(Number.isFinite(v)).toBe(true);
  }
  for (const v of Object.values(result.details.afterMarginByColor)) {
    expect(Number.isFinite(v)).toBe(true);
  }
  for (const v of Object.values(result.details.afterBonusByColor)) {
    expect(Number.isFinite(v)).toBe(true);
  }
  for (const v of Object.values(result.details.finalByColor)) {
    expect(Number.isFinite(v)).toBe(true);
  }
});

it("fonctionne avec un vrai NodeDef (COBRA_CLASSIQUE)", () => {
  const node = NODES.find((n) => n.id === "COBRA_CLASSIQUE");
  expect(node).toBeTruthy(); // vérifie que le node existe
  if (!node) return;

  const input: CalcInput = {
    productModelId: "TEST", // calculate() ne l'utilise pas
    lengthCm: 32,
    nodeId: node.id,
    diameterMm: 4,
    colorCount: 3,
    startColor: 1,
    maxSecurity: true,
    roundingMode: "5cm",
    unitDisplay: "cm",
  };

  const result = calculate(input, node);

  // 1) Longueur du tableau = nombre de couleurs limité par le node
  const expectedColors = Math.min(input.colorCount, node.maxColors);
  expect(result.activeColorsCm.length).toBe(expectedColors);

  // 2) Jamais de NaN / Infinity
  for (const v of result.activeColorsCm) {
    expect(Number.isFinite(v)).toBe(true);
  }
  expect(Number.isFinite(result.totalCm)).toBe(true);

  // 3) Totaux cohérents
  const sumColors = result.activeColorsCm.reduce((a, b) => a + b, 0);
  expect(result.totalActiveCm).toBe(sumColors);
  expect(result.totalCm).toBe(sumColors + result.coreTotalCm);

  // 4) Si bonus appliqué, la startColor est bien renseignée
  if (result.details.startBonusApplied) {
    expect(result.details.startBonusColor).toBe(input.startColor);
  }
});

it("fonctionne pour tous les NodeDef sans produire de NaN", () => {
  for (const node of NODES) {
    const input: CalcInput = {
      productModelId: "TEST",
      lengthCm: 42,              // valeur réaliste
      nodeId: node.id,
      diameterMm: 4,
      colorCount: Math.min(3, node.maxColors) as 1 | 2 | 3 | 4,
      startColor: 1,
      maxSecurity: true,
      roundingMode: "5cm",
      unitDisplay: "cm",
    };

    const result = calculate(input, node);

    // 1️⃣ Vérifier que le tableau correspond au nombre de couleurs autorisées
    expect(result.activeColorsCm.length).toBe(
      Math.min(input.colorCount, node.maxColors)
    );

    // 2️⃣ Aucune valeur NaN ou Infinity
    for (const v of result.activeColorsCm) {
      expect(Number.isFinite(v)).toBe(true);
    }

    expect(Number.isFinite(result.totalActiveCm)).toBe(true);
    expect(Number.isFinite(result.totalCm)).toBe(true);
    expect(Number.isFinite(result.corePerStrandCm)).toBe(true);
    expect(Number.isFinite(result.coreTotalCm)).toBe(true);

    // 3️⃣ Totaux cohérents
    const sumColors = result.activeColorsCm.reduce((a, b) => a + b, 0);
    expect(result.totalActiveCm).toBe(sumColors);
    expect(result.totalCm).toBe(sumColors + result.coreTotalCm);
  }
});

it("répartit les longueurs selon les ratios (sans marge/bonus/arrondi)", () => {
  const node: NodeDef = {
    ...mockNode,
    factor4mm: 1,            // totalActiveRaw = lengthCm * 1
    marginRecommended: 0,    // pas de marge
    allowStartBonus: false,  // pas de bonus
    ratios: [2, 1, 1, 0],    // ratios voulus
    maxColors: 4,
  };

  const input: CalcInput = {
    ...mockInput,
    lengthCm: 100,           // totalActiveRaw = 100
    colorCount: 3,           // on prend 2:1:1
    maxSecurity: false,
    roundingMode: "none",
  };

  const result = calculate(input, node);

  // ratios 2:1:1 => 50%, 25%, 25% de 100
  expect(result.activeColorsCm[0]).toBeCloseTo(50, 6);
  expect(result.activeColorsCm[1]).toBeCloseTo(25, 6);
  expect(result.activeColorsCm[2]).toBeCloseTo(25, 6);

  // cohérence des totaux
  expect(result.totalActiveCm).toBeCloseTo(100, 6);
});

it("si ratios invalides (somme <= 0), répartit équitablement", () => {
  const node: NodeDef = {
    ...mockNode,
    factor4mm: 1,
    marginRecommended: 0,
    allowStartBonus: false,
    ratios: [0, 0, 0, 0],    // cas invalide
  };

  const input: CalcInput = {
    ...mockInput,
    lengthCm: 120,
    colorCount: 3,
    maxSecurity: false,
    roundingMode: "none",
  };

  const result = calculate(input, node);

  // 120 / 3 = 40 chacun
  expect(result.activeColorsCm[0]).toBeCloseTo(40, 6);
  expect(result.activeColorsCm[1]).toBeCloseTo(40, 6);
  expect(result.activeColorsCm[2]).toBeCloseTo(40, 6);
  expect(result.totalActiveCm).toBeCloseTo(120, 6);
});

it("répartit les longueurs selon les ratios (sans marge/bonus/arrondi)", () => {
  const node: NodeDef = {
    ...mockNode,
    factor4mm: 1,            // totalActiveRaw = lengthCm * 1
    marginRecommended: 0,    // pas de marge
    allowStartBonus: false,  // pas de bonus
    ratios: [2, 1, 1, 0],    // ratios voulus
    maxColors: 4,
  };

  const input: CalcInput = {
    ...mockInput,
    lengthCm: 100,           // totalActiveRaw = 100
    colorCount: 3,           // on prend 2:1:1
    maxSecurity: false,
    roundingMode: "none",
  };

  const result = calculate(input, node);

  // ratios 2:1:1 => 50%, 25%, 25% de 100
  expect(result.activeColorsCm[0]).toBeCloseTo(50, 6);
  expect(result.activeColorsCm[1]).toBeCloseTo(25, 6);
  expect(result.activeColorsCm[2]).toBeCloseTo(25, 6);

  // cohérence des totaux
  expect(result.totalActiveCm).toBeCloseTo(100, 6);
});

it("si ratios invalides (somme <= 0), répartit équitablement", () => {
  const node: NodeDef = {
    ...mockNode,
    factor4mm: 1,
    marginRecommended: 0,
    allowStartBonus: false,
    ratios: [0, 0, 0, 0],    // cas invalide
  };

  const input: CalcInput = {
    ...mockInput,
    lengthCm: 120,
    colorCount: 3,
    maxSecurity: false,
    roundingMode: "none",
  };

  const result = calculate(input, node);

  // 120 / 3 = 40 chacun
  expect(result.activeColorsCm[0]).toBeCloseTo(40, 6);
  expect(result.activeColorsCm[1]).toBeCloseTo(40, 6);
  expect(result.activeColorsCm[2]).toBeCloseTo(40, 6);
  expect(result.totalActiveCm).toBeCloseTo(120, 6);
});