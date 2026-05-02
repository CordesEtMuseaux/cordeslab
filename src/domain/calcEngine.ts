import type { CalcInput, CalcOutput, NodeDef, RoundingMode } from "../shared/types";

export function roundUp(x: number, mode: RoundingMode): number {
  if (mode === "none") return x;
  if (mode === "cm") return Math.ceil(x);
  if (mode === "5cm") return Math.ceil(x / 5) * 5;
  if (mode === "10cm") return Math.ceil(x / 10) * 10;
  return x;
}

function normalizedRatios(ratios: number[], colorCount: number, minShare = 0.05) {
  const r = ratios.slice(0, colorCount);
  const sum = r.reduce((a, b) => a + b, 0);

  if (sum <= 0) {
    return Array.from({ length: colorCount }, () => 1 / colorCount);
  }

  const base = r.map((x) => x / sum);

  const min = Math.min(minShare, 1 / colorCount);
  const remaining = 1 - min * colorCount;

  const extras = base.map((x) => Math.max(0, x - min));
  const extrasSum = extras.reduce((a, b) => a + b, 0);

  if (extrasSum <= 0) {
    return Array.from({ length: colorCount }, () => 1 / colorCount);
  }

  return extras.map((e) => min + remaining * (e / extrasSum));
}

export function calculate(input: CalcInput, node: NodeDef): CalcOutput {
  const warnings: string[] = [];

  if (!(input.lengthCm > 0)) {
    throw new Error("La longueur finie doit être > 0");
  }

  const colorCount = Math.min(input.colorCount, node.maxColors) as 1 | 2 | 3 | 4;
  if (input.colorCount > node.maxColors) {
    warnings.push(`Nœud "${node.name}" : nombre de couleurs limité à ${node.maxColors}.`);
  }

  if (input.diameterMm === 3) warnings.push("Diamètre 3 mm : calibration à confirmer (v1).");
  if (node.isCalibrationPending) warnings.push(`${node.name} : valeurs estimées (calibration en cours).`);

  const factorUsed = node.factor4mm;
  const marginUsed = node.marginRecommended;
  const multMargin = 1 + marginUsed / 100;

  const L = input.lengthCm;
  const totalActiveRaw = L * factorUsed;

  // Détails: on garde tes objets indexés 1..4 (comme avant)
  const rawByColor: Record<number, number> = {};
  const afterMarginByColor: Record<number, number> = {};
  const afterBonusByColor: Record<number, number> = {};
  const finalByColor: Record<number, number> = {};

  // ✅ FIX: activeColorsCm devient un tableau 0-based (longueur = colorCount)
  const activeColorsCm: number[] = Array.from({ length: colorCount }, () => 0);

  const normalized = normalizedRatios(node.ratios, colorCount);

  // init 1..4 pour les détails
  for (let i = 1; i <= 4; i++) {
    const ratio = i <= colorCount ? normalized[i - 1] : 0;
    rawByColor[i] = totalActiveRaw * ratio;
    afterMarginByColor[i] = rawByColor[i] * multMargin;
    afterBonusByColor[i] = afterMarginByColor[i];
  }

  let startBonusApplied = false;
  const startColor = input.startColor ?? 1;

  if (input.maxSecurity && node.allowStartBonus && colorCount >= 2) {
    // startColor est 1..colorCount
    afterBonusByColor[startColor] = afterBonusByColor[startColor] * node.startBonusMultiplier;
    startBonusApplied = true;
  }

  // ✅ FIX: remplir à la fois finalByColor (1-based) et activeColorsCm (0-based)
  for (let i = 1; i <= colorCount; i++) {
    const v = roundUp(afterBonusByColor[i], input.roundingMode);
    finalByColor[i] = v;
    activeColorsCm[i - 1] = v; // 0-based
  }

  const corePerStrandRaw = Math.max(L * node.coreMultiplier, L + node.coreMinExtraCm);
  const corePerStrandFinal = roundUp(corePerStrandRaw, input.roundingMode);
  const coreTotalCm = corePerStrandFinal * node.coreCount;

  const totalActiveCm = activeColorsCm.reduce((a, b) => a + b, 0);
  const totalCm = totalActiveCm + coreTotalCm;

  return {
    activeColorsCm, // ✅ maintenant c'est number[]
    coreCount: node.coreCount,
    corePerStrandCm: corePerStrandFinal,
    coreTotalCm,
    totalActiveCm,
    totalCm,
    warnings,
    details: {
      factorUsed,
      marginUsed,
      startBonusApplied,
      startBonusColor: startBonusApplied ? startColor : undefined,
      rawByColor,
      afterMarginByColor,
      afterBonusByColor,
      finalByColor,
      corePerStrandRaw,
      corePerStrandFinal,
    },
  };
}