const PRESET_COLORS = [
  { name: "Noir", hex: "#111111" },
  { name: "Blanc", hex: "#F5F5F5" },
  { name: "Rouge", hex: "#C1121F" },
  { name: "Bleu", hex: "#1D4ED8" },
  { name: "Vert", hex: "#15803D" },
  { name: "Or", hex: "#D4AF37" },
  { name: "Argent", hex: "#BFC5C9" },
  { name: "Caramel", hex: "#B87333" },
  { name: "Kaki", hex: "#6B8E23" },
  { name: "Rose", hex: "#E88AAE" },
];

type Props = {
  colors: string[];
  limitedColorCount: number;
  onChange: (next: string[]) => void;
};

export function ColorConfigurator({
  colors,
  limitedColorCount,
  onChange,
}: Props) {
  function setColorAt(index: number, hex: string) {
    const next = [...colors];
    next[index] = hex;
    onChange(next);
  }

  return (
    <div className="card" style={{ padding: 14 }}>
      <h2 style={{ marginTop: 0 }}>Choisissez vos couleurs</h2>

      <div className="colorSlots">
        {Array.from({ length: limitedColorCount }).map((_, i) => {
          const currentColor = colors[i] ?? "#111111";

          return (
            <div className="colorSlotCard" key={i}>
              <div
                className="colorSlotPreview"
                style={{
                  background: currentColor,
                  width: 56,
                  height: 56,
                  minWidth: 56,
                  minHeight: 56,
                  borderRadius: 999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 10,
                }}
                title={`Couleur ${i + 1}`}
              >
                {i + 1}
              </div>

              <div className="colorSlotLabel">Couleur {i + 1}</div>

              <input
                type="color"
                value={currentColor}
                onChange={(e) => setColorAt(i, e.target.value)}
                className="colorPickerInput"
              />

              <div
                className="presetPalette"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 10,
                }}
              >
                {PRESET_COLORS.map((preset) => {
                  const isActive =
                    currentColor.toLowerCase() === preset.hex.toLowerCase();

                  return (
                    <button
                      key={`${i}-${preset.hex}`}
                      type="button"
                      className={"presetDot" + (isActive ? " active" : "")}
                      style={{
                        background: preset.hex,
                        width: 20,
                        height: 20,
                        minWidth: 20,
                        minHeight: 20,
                        borderRadius: 999,
                        border: isActive
                          ? "2px solid rgba(0,0,0,.75)"
                          : "1px solid rgba(0,0,0,.18)",
                        boxShadow: isActive
                          ? "0 0 0 2px rgba(255,255,255,.9) inset"
                          : "none",
                        cursor: "pointer",
                      }}
                      title={preset.name}
                      onClick={() => setColorAt(i, preset.hex)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}