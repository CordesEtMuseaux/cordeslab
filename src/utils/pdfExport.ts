import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type LengthItem = { label: string; main: string; secondary?: string; note?: string };

export type CalcPdfPayload = {
  date: string;

  // Header (optionnel)
  calcName?: string;
  productLabel?: string;
  modelLabel?: string;

  // Pour bloc résumé bas de page 1
  nodeLabel?: string;
  nodeId?: string;
  lengthCm?: number;
  diameterMm?: number;
  unitDisplay?: "cm" | "m";
  colorCount?: number;
  startColor?: number;
  colorsHex?: string[]; // "#RRGGBB"
  maxSecurity?: boolean;

  // Résultats principaux
  lengths: LengthItem[];

  // Âme
  coreCount: number;
  corePerStrandMain: string;
  coreTotalMain: string;

  // Synthèse
  totalActiveMain: string;
  totalActiveSecondary?: string;
  totalMain: string;
  totalSecondary?: string;

  // Détails
  factorUsed: number;
  marginUsed: number;
  roundingMode: string;

  // Vigilance
  warnings: string[];

  // Optionnel : mention "estimé"
  isEstimated?: boolean;
};

type PdfRgb = [number, number, number];

type PdfTheme = {
  text: PdfRgb;
  muted: PdfRgb;
  card: PdfRgb;
  line: PdfRgb;
  accent: PdfRgb;
  danger: PdfRgb;
};

const SECTION_AFTER_TITLE_GAP = 8;
const SEPARATOR_GAP = 8;
const SEPARATOR_GAP_LIGHT = 5;
const VIGILANCE_TITLE_DROP_DEFAULT = 6;

const TOP = 42;
const BOTTOM_SAFE = 22;

// --- Résumé (bas page 1) ---
const SUMMARY_BOX_H = 40;
const SUMMARY_TITLE_GAP = 6;
const SUMMARY_RESERVED_TUNE = 3;
const SUMMARY_RESERVED_H = SUMMARY_BOX_H + SUMMARY_TITLE_GAP + 9 + 4 - SUMMARY_RESERVED_TUNE;

// Couleur “warning”
const WARNING_ACCENT: PdfRgb = [216, 154, 72];

function clamp255(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function parseColorToRgb(input: string, fallback: PdfRgb): PdfRgb {
  const v = (input || "").trim();

  if (v.startsWith("#")) {
    const h = v.replace("#", "");
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const n = parseInt(full, 16);
    if (!Number.isFinite(n)) return fallback;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  const m = v.match(/rgba?\(([^)]+)\)/i);
  if (m) {
    const parts = m[1].split(",").map((p) => p.trim());
    const r = clamp255(Number(parts[0]));
    const g = clamp255(Number(parts[1]));
    const b = clamp255(Number(parts[2]));
    if ([r, g, b].some((x) => Number.isNaN(x))) return fallback;
    return [r, g, b];
  }

  return fallback;
}

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function getPdfThemeFromCss(): PdfTheme {
  return {
    text: parseColorToRgb(cssVar("--text"), [31, 31, 31]),
    muted: parseColorToRgb(cssVar("--muted"), [107, 107, 107]),
    card: parseColorToRgb(cssVar("--card"), [255, 250, 240]),
    line: parseColorToRgb(cssVar("--line"), [31, 31, 31]),
    accent: parseColorToRgb(cssVar("--accent"), [143, 175, 154]),
    danger: parseColorToRgb(cssVar("--danger"), [46, 46, 46]),
  };
}

/* ================= HEADER / FOOTER ================= */

function splitCalcNameForHeader(calcName?: string) {
  const raw = (calcName || "").trim();
  if (!raw) return { calcShort: "Nouveau calcul", details: "" };

  const parts = raw.split("—");
  if (parts.length >= 2) {
    return {
      calcShort: (parts[0] || "").trim() || "Nouveau calcul",
      details: parts.slice(1).join("—").trim(),
    };
  }

  return { calcShort: raw, details: "" };
}

function drawHeader(
  doc: jsPDF,
  t: PdfTheme,
  M: number,
  productLine: string,
  calcShort: string,
  detailsLine: string,
  date: string
) {
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...t.text);
  doc.text("CordesLab", M, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...t.muted);
  doc.text(`Date : ${date}`, pageW - M, 14, { align: "right" });

  if (productLine) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...t.muted);
    doc.text(productLine, M, 19);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  doc.setTextColor(...t.text);
  doc.text(calcShort, M, 24);

  if (detailsLine) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...t.muted);
    doc.text(detailsLine, M, 28);
  }

  doc.setDrawColor(...t.line);
  doc.setLineWidth(0.35);
  doc.line(M, 32, pageW - M, 32);
}

function drawFooter(doc: jsPDF, t: PdfTheme, M: number, page: number, total: number) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  doc.setDrawColor(...t.line);
  doc.setLineWidth(0.35);
  doc.line(M, pageH - 14, pageW - M, pageH - 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...t.muted);
  doc.text(`Page ${page} / ${total}`, pageW - M, pageH - 9, { align: "right" });
}

function applyHeaderFooterToAllPages(
  doc: jsPDF,
  t: PdfTheme,
  M: number,
  productLine: string,
  calcShort: string,
  detailsLine: string,
  date: string
) {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    drawHeader(doc, t, M, productLine, calcShort, detailsLine, date);
    drawFooter(doc, t, M, i, total);
  }
}

/* ================= UI HELPERS ================= */

function drawSectionTitle(
  doc: jsPDF,
  t: PdfTheme,
  title: string,
  x: number,
  y: number,
  w: number,
  accentOverride?: PdfRgb
) {
  const accent = accentOverride ?? t.accent;

  doc.setDrawColor(...t.line);
  doc.setLineWidth(0.3);
  doc.setFillColor(...t.card);
  doc.roundedRect(x, y - 5.5, w, 9, 2, 2, "FD");

  doc.setFillColor(...accent);
  doc.roundedRect(x + 1.2, y - 4.2, 2.2, 6.4, 1, 1, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...t.text);
  doc.text(title, x + 5.2, y);
}

function drawSeparator(doc: jsPDF, t: PdfTheme, M: number, y: number, pageW: number) {
  doc.setDrawColor(...t.line);
  doc.setLineWidth(0.4);
  doc.line(M, y, pageW - M, y);
}

function prettyRoundingLabel(roundingMode?: string) {
  if (!roundingMode) return "";
  if (roundingMode === "5cm") return "5 cm";
  if (roundingMode === "10cm") return "10 cm";
  if (roundingMode === "cm") return "1 cm";
  if (roundingMode === "none") return "aucun";
  return roundingMode;
}

/**
 * Bloc Vérification premium
 * - OK : vert
 * - warnings : ambre
 */
function drawVerificationBlock(
  doc: jsPDF,
  t: PdfTheme,
  M: number,
  y: number,
  w: number,
  hasWarnings: boolean
) {
  const accent = hasWarnings ? WARNING_ACCENT : t.accent;

  const pad = 9;
  const lineH = 5.2;

  const title = "Vérification terminée";
  const l2 = hasWarnings ? "Certains éléments méritent votre attention." : "Aucun conflit détecté.";
  const l3 = hasWarnings
    ? "Consultez la section “Points de vigilance”."
    : "Vous pouvez utiliser ces valeurs en toute sécurité.";

  const boxH = pad * 2 + lineH * 3 + 2;

  doc.setFillColor(...t.card);
  doc.setDrawColor(...accent);
  doc.setLineWidth(0.55);
  doc.roundedRect(M, y, w, boxH, 4, 4, "FD");

  doc.setFillColor(...accent);
  doc.roundedRect(M + 3.0, y + 3.0, 3.0, boxH - 6.0, 1.6, 1.6, "F");

  let ty = y + pad + 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.2);
  doc.setTextColor(...t.text);
  doc.text(title, M + pad + 6, ty);

  ty += lineH;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.0);
  doc.setTextColor(...t.muted);
  doc.text(l2, M + pad + 6, ty);

  ty += lineH;
  doc.text(l3, M + pad + 6, ty);

  return y + boxH;
}

/* ================= RÉSUMÉ BAS PAGE 1 ================= */

function drawBottomSummaryOnPage1(doc: jsPDF, t: PdfTheme, M: number, p: CalcPdfPayload) {
  doc.setPage(1);

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const boxW = pageW - 2 * M;
  const boxX = M;
  const boxH = SUMMARY_BOX_H;
  const boxY = pageH - BOTTOM_SAFE - boxH - 4;

  const titleY = boxY - SUMMARY_TITLE_GAP;
  drawSectionTitle(doc, t, "Résumé", M, titleY, boxW);

  doc.setFillColor(...t.card);
  doc.setDrawColor(...t.line);
  doc.setLineWidth(0.4);
  doc.roundedRect(boxX, boxY, boxW, boxH, 3, 3, "FD");

  doc.setFillColor(...t.accent);
  doc.roundedRect(boxX + 3.2, boxY + 3.2, 2.2, boxH - 6.4, 1.2, 1.2, "F");

  const pad = 8;
  const colGap = 8;
  const innerX = boxX + pad + 2;
  const innerW = boxW - (pad * 2) - 4;

  const leftW = 108;
  const rightX = innerX + leftW + colGap;
  const rightW = innerW - leftW - colGap;

  const diam = p.diameterMm ? `Ø ${p.diameterMm} mm` : null;

  const leftLine1 = [
    p.productLabel ? `Produit : ${p.productLabel}` : null,
    p.modelLabel ? `Modèle : ${p.modelLabel}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const leftLine2 = [
    p.nodeLabel ? `Nœud : ${p.nodeLabel}` : p.nodeId ? `Nœud : ${p.nodeId}` : null,
    typeof p.lengthCm === "number" ? `Longueur : ${String(p.lengthCm).replace(".", ",")} cm` : null,
    diam,
  ]
    .filter(Boolean)
    .join(" · ");

  const rightLine1 =
    typeof p.colorCount === "number"
      ? `${p.colorCount} ${p.colorCount > 1 ? "couleurs" : "couleur"}`
      : "";

  const rightLine2 = p.startColor ? `Couleur de départ : C${p.startColor}` : "";

  const prettyRounding = prettyRoundingLabel(p.roundingMode);

  const rightLine3 = [
    prettyRounding ? `Arrondi : ${prettyRounding}` : null,
    p.unitDisplay ? `Unité : ${p.unitDisplay}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const rightLine4 =
    typeof p.maxSecurity === "boolean"
      ? `Sécurité maximale : ${p.maxSecurity ? "activée" : "désactivée"}`
      : "";

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.6);
  doc.setTextColor(...t.text);

  const leftTopY = boxY + 10.0;
  const leftSecondY = boxY + 17.0;

  if (leftLine1) {
    doc.text(doc.splitTextToSize(leftLine1, leftW), innerX, leftTopY);
  }

  if (leftLine2) {
    doc.text(doc.splitTextToSize(leftLine2, leftW), innerX, leftSecondY);
  }

  const badgeReservedW = p.isEstimated ? 24 : 0;
  const rightTextWTop = Math.max(18, rightW - badgeReservedW);

  const rightTopY = boxY + 9.8;
  const rightMidY = boxY + 15.6;
  const rightThirdY = boxY + 21.4;
  const rightFourthY = boxY + 27.2;

  if (rightLine1) {
    doc.text(doc.splitTextToSize(rightLine1, rightTextWTop), rightX, rightTopY);
  }

  if (rightLine2) {
    doc.text(doc.splitTextToSize(rightLine2, rightW), rightX, rightMidY);
  }

  if (rightLine3) {
    doc.text(doc.splitTextToSize(rightLine3, rightW), rightX, rightThirdY);
  }

  if (rightLine4) {
    doc.text(doc.splitTextToSize(rightLine4, rightW), rightX, rightFourthY);
  }

  if (p.isEstimated) {
    const badgeText = "estimé";
    const badgeW = 20;
    const badgeH = 6.5;
    const badgeX = boxX + boxW - badgeW - 8;
    const badgeY = boxY + 5.2;

    doc.setFillColor(...t.accent);
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.0);
    doc.setTextColor(...t.text);
    doc.text(badgeText, badgeX + badgeW / 2, badgeY + 4.4, { align: "center" });
  }

  const palette = (p.colorsHex || []).slice(0, Math.max(0, p.colorCount || 0));
  if (palette.length) {
    const py = boxY + boxH - 5.2;
    let px = rightX;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.8);
    doc.setTextColor(...t.text);
    doc.text("Palette :", px, py);

    px += 18;
    palette.forEach((hex, i) => {
      const rgb = parseColorToRgb(hex, [180, 180, 180]);
      doc.setFillColor(...rgb);
      doc.setDrawColor(...t.line);
      doc.setLineWidth(0.2);
      doc.roundedRect(px + i * 8, py - 4.2, 6, 6, 1.2, 1.2, "FD");
    });
  }
}

/* ================= VIGILANCE SOMBRE ================= */

function computeVigilanceBoxHeight(doc: jsPDF, w: number, warnings: string[]) {
  const pad = 6;
  const lineH = 5;
  const maxTextW = w - pad * 2;

  let lineCount = 0;

  if (!warnings.length) {
    lineCount = 1;
  } else {
    warnings.forEach((ww) => {
      const chunks = doc.splitTextToSize(`• ${ww}`, maxTextW) as string[];
      lineCount += chunks.length;
      lineCount += 1;
    });
    if (lineCount > 0) lineCount -= 1;
  }

  return pad * 2 + 2 + lineCount * lineH;
}

function drawDarkVigilanceBox(doc: jsPDF, t: PdfTheme, M: number, y: number, w: number, warnings: string[]) {
  const pad = 6;
  const lineH = 5;

  const maxTextW = w - pad * 2;
  const lines: string[] = [];

  if (!warnings.length) {
    lines.push("Aucun.");
  } else {
    warnings.forEach((ww) => {
      const chunks = doc.splitTextToSize(`• ${ww}`, maxTextW) as string[];
      lines.push(...chunks);
      lines.push("");
    });
    if (lines.length && lines[lines.length - 1] === "") lines.pop();
  }

  const boxH = pad * 2 + 2 + lines.length * lineH;

  doc.setFillColor(...t.danger);
  doc.setDrawColor(...t.danger);
  doc.setLineWidth(0.1);
  doc.roundedRect(M, y, w, boxH, 3, 3, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(245, 245, 245);

  let ty = y + 10;
  lines.forEach((ln) => {
    if (!ln) {
      ty += 2.5;
      return;
    }
    doc.text(ln, M + pad, ty);
    ty += lineH;
  });

  return y + boxH;
}

/* ================= EXPORT ================= */

export function exportCalcToPDF(p: CalcPdfPayload) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const t = getPdfThemeFromCss();

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 14;

  const BOTTOM_RESERVED_PAGE1 = BOTTOM_SAFE + SUMMARY_RESERVED_H;

  const getBottomLimit = () => {
    const page = doc.getCurrentPageInfo?.().pageNumber || 1;
    return page === 1 ? BOTTOM_RESERVED_PAGE1 : BOTTOM_SAFE;
  };

  const { calcShort, details } = splitCalcNameForHeader(p.calcName);

  const productLine = [
    p.productLabel ? `Produit : ${p.productLabel}` : null,
    p.modelLabel ? `Modèle : ${p.modelLabel}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  let y = TOP;

  /* ========= Longueurs à couper ========= */
  drawSectionTitle(doc, t, "Longueurs à couper", M, y, pageW - 2 * M);
  y += SECTION_AFTER_TITLE_GAP;

  const lengthsBody = p.lengths.map((it) => {
    const note = it.note ? it.note : "";
    const equiv = it.secondary ? it.secondary.replace(/^\(|\)$/g, "") : "";
    return [it.label, it.main, equiv, note];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M, top: TOP, bottom: BOTTOM_RESERVED_PAGE1 },
    head: [["Rep.", "Longueur", "Équiv.", "Note"]],
    body: lengthsBody,
    styles: {
      font: "helvetica",
      fontSize: 10,
      textColor: t.text,
      lineColor: t.line,
      lineWidth: 0.2,
      cellPadding: 3.0,
      valign: "middle",
    },
    headStyles: {
      fillColor: t.accent,
      textColor: t.text,
      fontStyle: "bold",
      lineWidth: 0,
    },
    alternateRowStyles: { fillColor: t.card },
    columnStyles: {
      0: { cellWidth: 18, fontStyle: "bold" },
      1: { cellWidth: 45, halign: "right" },
      2: { cellWidth: 30, halign: "right", textColor: t.muted },
      3: { cellWidth: pageW - 2 * M - (18 + 45 + 30) },
    },
    pageBreak: "auto",
  });

  const lastY = (doc as any).lastAutoTable?.finalY;
  y = (typeof lastY === "number" ? lastY : y) + 10;

  /* ========= Séparateur / saut ========= */
  if (y > pageH - getBottomLimit() - 20) {
    doc.addPage();
    y = TOP;
  } else {
    drawSeparator(doc, t, M, y, pageW);
    y += SEPARATOR_GAP;
  }

  /* ========= Âme ========= */
  drawSectionTitle(doc, t, "Âme", M, y, pageW - 2 * M);
  y += SECTION_AFTER_TITLE_GAP;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...t.text);

  doc.text(`Âme(s) : x${p.coreCount}`, M, y);
  y += 5;
  doc.text(`Longueur : ${p.corePerStrandMain} chacune`, M, y);
  y += 5;
  doc.text(`Total âme : ${p.coreTotalMain}`, M, y);
  y += 8;

  drawSeparator(doc, t, M, y, pageW);
  y += SEPARATOR_GAP;

  /* ========= Bloc Vérification ========= */
  {
    const approxH = 9 * 2 + 5.2 * 3 + 2;
    if (y + approxH > pageH - getBottomLimit()) {
      doc.addPage();
      y = TOP;
    }
    y = drawVerificationBlock(doc, t, M, y, pageW - 2 * M, p.warnings.length > 0) + 10;
  }

  /* ========= Synthèse ========= */
  {
    const boxW = pageW - 2 * M;
    const pad = 8;
    const rowH = 14;
    const metaH = 14;
    const synthBoxH = pad * 2 + 2 * rowH + metaH;
    const synthNeed = SECTION_AFTER_TITLE_GAP + synthBoxH;

    if (y + synthNeed > pageH - getBottomLimit()) {
      doc.addPage();
      y = TOP;
    }
  }

  drawSectionTitle(doc, t, "Synthèse", M, y, pageW - 2 * M);
  y += SECTION_AFTER_TITLE_GAP;

  {
    const boxX = M;
    const boxW = pageW - 2 * M;
    const pad = 8;
    const rowH = 14;

    const synthRows = [
      {
        label: "Total brins",
        main: p.totalActiveMain,
        sub: p.totalActiveSecondary ? p.totalActiveSecondary.replace(/^\(|\)$/g, "") : "",
      },
      {
        label: "Total général",
        main: p.totalMain,
        sub: p.totalSecondary ? p.totalSecondary.replace(/^\(|\)$/g, "") : "",
      },
    ];

    const metaH = 14;
    const synthBoxH = pad * 2 + synthRows.length * rowH + metaH;

    doc.setFillColor(...t.card);
    doc.setDrawColor(...t.line);
    doc.setLineWidth(0.4);
    doc.roundedRect(boxX, y, boxW, synthBoxH, 3, 3, "FD");

    doc.setFillColor(...t.accent);
    doc.roundedRect(boxX + 3.2, y + 3.2, 2.2, synthBoxH - 6.4, 1.2, 1.2, "F");

    let ry = y + pad + 6;

    synthRows.forEach((r, idx) => {
      const labelY = ry;
      const mainY = ry + 0.2;
      const subY = ry + 6.3;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.2);
      doc.setTextColor(...t.text);
      doc.text(r.label, boxX + pad + 2, labelY);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(...t.text);
      doc.text(r.main, boxX + boxW - pad, mainY, { align: "right" });

      if (r.sub) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.3);
        doc.setTextColor(...t.muted);
        doc.text(r.sub, boxX + boxW - pad, subY, { align: "right" });
      }

      if (idx === 0) {
        doc.setDrawColor(...t.line);
        doc.setLineWidth(0.18);
        doc.line(boxX + pad + 2, ry + 9.7, boxX + boxW - pad, ry + 9.7);
      }

      ry += rowH;
    });

    const meta1 = `Ces totaux incluent automatiquement la marge de ${p.marginUsed}% et l’arrondi (${prettyRoundingLabel(p.roundingMode)}).`;
    const meta2 = `Facteur : ${p.factorUsed} · Marge : ${p.marginUsed}% · Arrondi : ${prettyRoundingLabel(p.roundingMode)}`;

    const metaX = boxX + pad + 2;
    const metaW2 = boxW - (pad + 4);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.1);
    doc.setTextColor(...t.muted);

    doc.text(doc.splitTextToSize(meta1, metaW2), metaX, y + synthBoxH - 9.5);
    doc.text(doc.splitTextToSize(meta2, metaW2), metaX, y + synthBoxH - 5.0);

    y = y + synthBoxH + 4;
  }

  drawSeparator(doc, t, M, y, pageW);
  y += SEPARATOR_GAP_LIGHT;

  /* ========= Vigilance ========= */
  {
    const currentPage = doc.getCurrentPageInfo?.().pageNumber || 1;
    const drop = currentPage === 1 ? 0 : VIGILANCE_TITLE_DROP_DEFAULT;

    const darkBoxH = computeVigilanceBoxHeight(doc, pageW - 2 * M, p.warnings);
    const need = drop + SECTION_AFTER_TITLE_GAP + darkBoxH;

    if (y + need > pageH - getBottomLimit()) {
      doc.addPage();
      y = TOP;
    }
  }

  {
    const currentPage = doc.getCurrentPageInfo?.().pageNumber || 1;
    const drop = currentPage === 1 ? 0 : VIGILANCE_TITLE_DROP_DEFAULT;
    const vigilanceAccent = p.warnings.length > 0 ? WARNING_ACCENT : t.accent;

    y += drop;
    drawSectionTitle(doc, t, "Points de vigilance", M, y, pageW - 2 * M, vigilanceAccent);
    y += SECTION_AFTER_TITLE_GAP;

    drawDarkVigilanceBox(doc, t, M, y, pageW - 2 * M, p.warnings);
  }

  /* ========= Header/Footer ========= */
  applyHeaderFooterToAllPages(doc, t, M, productLine, calcShort, details, p.date);

  /* ========= Résumé bas page 1 ========= */
  drawBottomSummaryOnPage1(doc, t, M, p);

  const safeDate = p.date.split("/").join("-");
  const stamp = Date.now();
  doc.save(`cordeslab-calcul-${safeDate}-${stamp}.pdf`);
}