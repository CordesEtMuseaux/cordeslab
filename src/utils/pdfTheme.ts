export type PdfRgb = [number, number, number];

function clamp255(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function parseColorToRgb(input: string, fallback: PdfRgb): PdfRgb {
  const v = (input || "").trim();

  // hex #RRGGBB / #RGB
  if (v.startsWith("#")) {
    const h = v.replace("#", "");
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const n = parseInt(full, 16);
    if (!Number.isFinite(n)) return fallback;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  // rgb(...) / rgba(...)
  const m = v.match(/rgba?\(([^)]+)\)/i);
  if (m) {
    const parts = m[1].split(",").map((p) => p.trim());
    const r = clamp255(Number(parts[0]));
    const g = clamp255(Number(parts[1]));
    const b = clamp255(Number(parts[2]));
    // alpha ignoré (PDF = opaque), mais on récupère RGB
    if ([r, g, b].some((x) => Number.isNaN(x))) return fallback;
    return [r, g, b];
  }

  // si jamais tu utilises "transparent" etc.
  return fallback;
}

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function getPdfThemeFromCss() {
  // Tes vars exactes:
  const bg = cssVar("--bg");
  const text = cssVar("--text");
  const muted = cssVar("--muted");
  const card = cssVar("--card");
  const line = cssVar("--line");
  const accent = cssVar("--accent");
  const danger = cssVar("--danger");

  return {
    bg: parseColorToRgb(bg, [239, 231, 216]),          // #EFE7D8
    text: parseColorToRgb(text, [31, 31, 31]),         // #1F1F1F
    muted: parseColorToRgb(muted, [107, 107, 107]),    // #6B6B6B
    card: parseColorToRgb(card, [255, 250, 240]),      // #FFFAF0
    line: parseColorToRgb(line, [31, 31, 31]),         // rgba(...) => RGB
    accent: parseColorToRgb(accent, [143, 175, 154]),  // #8FAF9A
    danger: parseColorToRgb(danger, [58, 58, 58]),     // #3A3A3A
  };
}