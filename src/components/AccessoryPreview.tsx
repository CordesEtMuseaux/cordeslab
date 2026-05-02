import { useMemo } from "react";
import type { NodeDifficulty } from "../shared/types";

type AccessoryType = "COLLIER" | "LAISSE" | "LONGE" | "HARNAIS" | "POIGNEE";

type Props = {
  accessoryType: string; // productTypeId
  knotLabel: string; // node.name
  colorsHex: string[]; // palette
  startColor: 1 | 2 | 3 | 4;
  difficulty?: NodeDifficulty;
  thicknessCm?: number; // ex: 0.8
  widthCm?: number; // ex: 1.6
};

function toAccessoryType(raw: string): AccessoryType {
  const v = raw?.toUpperCase?.() ?? "";
  if (v.includes("LAISSE")) return "LAISSE";
  if (v.includes("LONGE")) return "LONGE";
  if (v.includes("HARNAIS")) return "HARNAIS";
  if (v.includes("POIG")) return "POIGNEE";
  return "COLLIER";
}

function clampPalette(colorsHex: string[]) {
  const clean = colorsHex.filter(Boolean);
  return clean.length ? clean : ["#111111"];
}

function buildPattern(colorsHex: string[], startColor: number, size: number) {
  const colors = clampPalette(colorsHex);
  return Array.from({ length: size }).map((_, i) => {
    const idx = (startColor - 1 + i) % colors.length;
    return colors[idx];
  });
}

function getDifficultyColor(difficulty?: NodeDifficulty) {
  switch (difficulty) {
    case "Débutant":
      return "#2f7a3e";
    case "Intermédiaire":
      return "#a15c00";
    case "Avancé":
      return "#b42318";
    case "Expert":
      return "#6941c6";
    default:
      return "#2f7a3e";
  }
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "5px 10px",
        borderRadius: 999,
        background: "rgba(255,255,255,.84)",
        border: "1px solid rgba(0,0,0,.08)",
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1.1,
        whiteSpace: "nowrap",
        boxShadow: "0 1px 2px rgba(0,0,0,.04)",
      }}
    >
      {children}
    </span>
  );
}

/**
 * Tresse "cobra" stylisée (effet chevron)
 */
function CobraBraid({
  x,
  y,
  w,
  h,
  colorsHex,
  startColor,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  colorsHex: string[];
  startColor: number;
}) {
  const steps = 16;
  const stepW = w / steps;

  const pattern = buildPattern(colorsHex, startColor, steps);

  return (
    <g>
      <rect
        x={x}
        y={y + h * 0.25}
        width={w}
        height={h * 0.5}
        rx={h * 0.25}
        fill="rgba(0,0,0,.10)"
      />

      {Array.from({ length: steps }).map((_, i) => {
        const cx = x + i * stepW;
        const isLeft = i % 2 === 0;

        const p = isLeft
          ? `M ${cx} ${y + h * 0.15}
             L ${cx + stepW} ${y + h * 0.5}
             L ${cx} ${y + h * 0.85}
             L ${cx - stepW * 0.35} ${y + h * 0.5} Z`
          : `M ${cx} ${y + h * 0.15}
             L ${cx - stepW} ${y + h * 0.5}
             L ${cx} ${y + h * 0.85}
             L ${cx + stepW * 0.35} ${y + h * 0.5} Z`;

        return (
          <path
            key={i}
            d={p}
            fill={pattern[i]}
            opacity={0.98}
            stroke="rgba(0,0,0,.10)"
            strokeWidth={1}
          />
        );
      })}

      <rect
        x={x + 4}
        y={y + h * 0.28}
        width={w - 8}
        height={h * 0.14}
        rx={h * 0.07}
        fill="rgba(255,255,255,.35)"
      />
    </g>
  );
}

export function AccessoryPreview({
  accessoryType,
  knotLabel,
  colorsHex,
  startColor,
  difficulty = "Débutant",
  thicknessCm = 0.8,
  widthCm = 1.6,
}: Props) {
  const type = useMemo(() => toAccessoryType(accessoryType), [accessoryType]);
  const difficultyColor = useMemo(() => getDifficultyColor(difficulty), [difficulty]);

  return (
    <div className="card" style={{ padding: 14 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <h2 style={{ margin: 0 }}>Aperçu</h2>
        <div className="muted" style={{ fontWeight: 700 }}>
          {knotLabel}
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <svg
          viewBox="0 0 860 360"
          width="100%"
          style={{ display: "block", borderRadius: 14, overflow: "hidden" }}
        >
          <defs>
            <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="rgba(0,0,0,.03)" />
              <stop offset="1" stopColor="rgba(0,0,0,.06)" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="860" height="360" rx="18" fill="url(#bg)" />

          {type === "COLLIER" && (
            <>
              <path
                d="M 140 255 C 260 115, 600 115, 720 255"
                fill="none"
                stroke="rgba(0,0,0,.10)"
                strokeWidth="42"
                strokeLinecap="round"
              />
              <path
                d="M 140 255 C 260 115, 600 115, 720 255"
                fill="none"
                stroke="rgba(255,255,255,.35)"
                strokeWidth="18"
                strokeLinecap="round"
              />
              <CobraBraid
                x={175}
                y={208}
                w={510}
                h={56}
                colorsHex={colorsHex}
                startColor={startColor}
              />
            </>
          )}

          {type === "LAISSE" && (
            <>
              <rect x="120" y="165" width="560" height="54" rx="27" fill="rgba(0,0,0,.10)" />
              <rect x="120" y="165" width="560" height="54" rx="27" fill="rgba(255,255,255,.20)" />
              <CobraBraid
                x={140}
                y={170}
                w={520}
                h={44}
                colorsHex={colorsHex}
                startColor={startColor}
              />
              <path
                d="M 690 190 C 720 140, 800 140, 820 190"
                fill="none"
                stroke="rgba(0,0,0,.18)"
                strokeWidth="18"
                strokeLinecap="round"
              />
            </>
          )}

          {type === "LONGE" && (
            <>
              <rect x="110" y="170" width="650" height="48" rx="24" fill="rgba(0,0,0,.10)" />
              <rect x="110" y="170" width="650" height="48" rx="24" fill="rgba(255,255,255,.20)" />
              <CobraBraid
                x={130}
                y={174}
                w={610}
                h={40}
                colorsHex={colorsHex}
                startColor={startColor}
              />
              <rect x="765" y="165" width="60" height="58" rx="18" fill="rgba(0,0,0,.10)" />
              <rect x="778" y="178" width="34" height="32" rx="12" fill="rgba(255,255,255,.45)" />
            </>
          )}

          {type === "POIGNEE" && (
            <>
              <rect x="260" y="150" width="340" height="70" rx="35" fill="rgba(0,0,0,.10)" />
              <rect x="260" y="150" width="340" height="70" rx="35" fill="rgba(255,255,255,.20)" />
              <CobraBraid
                x={280}
                y={160}
                w={300}
                h={50}
                colorsHex={colorsHex}
                startColor={startColor}
              />
            </>
          )}

          {type === "HARNAIS" && (
            <>
              <rect x="170" y="140" width="520" height="54" rx="27" fill="rgba(0,0,0,.10)" />
              <rect x="170" y="140" width="520" height="54" rx="27" fill="rgba(255,255,255,.20)" />
              <CobraBraid
                x={190}
                y={146}
                w={480}
                h={42}
                colorsHex={colorsHex}
                startColor={startColor}
              />

              <rect x="300" y="210" width="260" height="54" rx="27" fill="rgba(0,0,0,.10)" />
              <rect x="300" y="210" width="260" height="54" rx="27" fill="rgba(255,255,255,.20)" />
              <CobraBraid
                x={320}
                y={216}
                w={220}
                h={42}
                colorsHex={colorsHex}
                startColor={startColor}
              />
            </>
          )}

          <g transform="translate(650, 250)">
            <foreignObject x="0" y="0" width="180" height="92">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  alignItems: "flex-end",
                  width: "100%",
                  height: "100%",
                  paddingRight: 2,
                }}
              >
                <Badge>
                  Difficulté&nbsp;
                  <span style={{ color: difficultyColor }}>{difficulty}</span>
                </Badge>
                <Badge>Épaisseur {thicknessCm.toFixed(1)} cm</Badge>
                <Badge>Largeur {widthCm.toFixed(1)} cm</Badge>
              </div>
            </foreignObject>
          </g>
        </svg>

        <small className="muted" style={{ display: "block", marginTop: 8 }}>
          La précision des couleurs dépend de l’éclairage et du type d’écran.
        </small>
      </div>
    </div>
  );
}