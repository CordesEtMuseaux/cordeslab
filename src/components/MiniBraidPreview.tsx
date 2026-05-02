type Props = {
  accessoryType: string;
  nodeId?: string;
  colorsHex: string[];
  startColor?: number;
};

function buildPattern(colorsHex: string[], startColor: number, size: number) {
  const palette = colorsHex.length ? colorsHex : ["#111111"];
  return Array.from({ length: size }).map((_, i) => {
    const idx = (startColor - 1 + i) % palette.length;
    return palette[idx];
  });
}

function getNodeStyle(nodeId?: string) {
  const id = (nodeId ?? "").toUpperCase();

  if (id.includes("TRESSAGE_ROND")) {
    return {
      label: "rond",
      bandHeight: 22,
      y: 21,
      radius: 11,
      step: 10,
      amplitude: 7,
      strokeWidth: 1.2,
    };
  }

  if (id.includes("KING_COBRA")) {
    return {
      label: "king",
      bandHeight: 28,
      y: 18,
      radius: 12,
      step: 12,
      amplitude: 10,
      strokeWidth: 1.4,
    };
  }

  if (id.includes("CARRE_COBRA_COUPLE")) {
    return {
      label: "carre",
      bandHeight: 24,
      y: 20,
      radius: 8,
      step: 12,
      amplitude: 4,
      strokeWidth: 1.2,
    };
  }

  return {
    label: "cobra",
    bandHeight: 24,
    y: 20,
    radius: 10,
    step: 11,
    amplitude: 8,
    strokeWidth: 1.2,
  };
}

function renderAccessoryBase(type: string) {
  const upper = type.toUpperCase();

  if (upper === "COLLIER" || upper === "HARNAIS") {
    return (
      <path
        d="M18 42 C 45 16, 115 16, 142 42"
        fill="none"
        stroke="rgba(0,0,0,.10)"
        strokeWidth="14"
        strokeLinecap="round"
      />
    );
  }

  if (upper === "LAISSE") {
    return (
      <>
        <rect
          x="14"
          y="25"
          width="110"
          height="14"
          rx="7"
          fill="rgba(0,0,0,.10)"
        />
        <path
          d="M128 32 C 136 18, 150 18, 154 32"
          fill="none"
          stroke="rgba(0,0,0,.16)"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </>
    );
  }

  if (upper === "POIGNEE") {
    return (
      <rect
        x="35"
        y="20"
        width="90"
        height="24"
        rx="12"
        fill="rgba(0,0,0,.10)"
      />
    );
  }

  return (
    <rect
      x="18"
      y="22"
      width="124"
      height="20"
      rx="10"
      fill="rgba(0,0,0,.10)"
    />
  );
}

function renderBraidPattern(pattern: string[], nodeId?: string) {
  const style = getNodeStyle(nodeId);

  if (style.label === "rond") {
    return (
      <g transform={`translate(18, ${style.y})`}>
        {pattern.map((c, i) => (
          <g key={i} transform={`translate(${i * style.step}, 0)`}>
            <ellipse
              cx="6"
              cy={style.bandHeight / 2}
              rx="6"
              ry="10"
              fill={c}
              stroke="rgba(0,0,0,.10)"
              strokeWidth={style.strokeWidth}
            />
            <path
              d="M2 6 C5 9, 7 13, 10 16"
              fill="none"
              stroke="rgba(255,255,255,.28)"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </g>
        ))}
      </g>
    );
  }

  if (style.label === "carre") {
    return (
      <g transform={`translate(18, ${style.y})`}>
        {pattern.map((c, i) => {
          const x = i * style.step;
          const yOffset = i % 2 === 0 ? 0 : style.amplitude * 0.35;

          return (
            <rect
              key={i}
              x={x}
              y={yOffset}
              width="12"
              height={style.bandHeight}
              rx={style.radius}
              fill={c}
              stroke="rgba(0,0,0,.10)"
              strokeWidth={style.strokeWidth}
            />
          );
        })}
      </g>
    );
  }

  if (style.label === "king") {
    return (
      <g transform={`translate(16, ${style.y})`}>
        {pattern.map((c, i) => {
          const x = i * style.step;
          const y1 = i % 2 === 0 ? 2 : style.amplitude;
          const y2 = i % 2 === 0 ? style.amplitude : 2;

          return (
            <g key={i}>
              <path
                d={`M ${x} ${y1} Q ${x + 6} ${style.bandHeight / 2} ${x + 12} ${y2}`}
                fill="none"
                stroke={c}
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d={`M ${x} ${y2 + 6} Q ${x + 6} ${style.bandHeight / 2 + 6} ${x + 12} ${y1 + 6}`}
                fill="none"
                stroke={pattern[(i + 1) % pattern.length]}
                strokeWidth="8"
                strokeLinecap="round"
                opacity="0.9"
              />
            </g>
          );
        })}
      </g>
    );
  }

  return (
    <g transform={`translate(18, ${style.y})`}>
      {pattern.map((c, i) => {
        const x = i * style.step;
        const up = i % 2 === 0;
        const top = up ? 2 : style.amplitude;
        const bottom = up ? style.amplitude : 2;

        return (
          <path
            key={i}
            d={`M ${x} ${top} L ${x + 10} ${style.bandHeight / 2} L ${x} ${bottom + 12} L ${x - 4} ${style.bandHeight / 2} Z`}
            fill={c}
            stroke="rgba(0,0,0,.08)"
            strokeWidth={style.strokeWidth}
          />
        );
      })}
    </g>
  );
}

export function MiniBraidPreview({
  accessoryType,
  nodeId,
  colorsHex,
  startColor = 1,
}: Props) {
  const pattern = buildPattern(colorsHex, startColor, 12);

  return (
    <svg
      viewBox="0 0 160 64"
      width="160"
      height="64"
      style={{ display: "block", borderRadius: 10 }}
      aria-hidden="true"
    >
      <rect
        x="0"
        y="0"
        width="160"
        height="64"
        rx="12"
        fill="rgba(0,0,0,.04)"
      />

      {renderAccessoryBase(accessoryType)}
      {renderBraidPattern(pattern, nodeId)}
    </svg>
  );
}