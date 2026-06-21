import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CobraPreview from "../components/Debutant/CobraPreview";
import FishtailPreview from "../components/Debutant/FishtailPreview";
import LadderRackPreview from "../components/Debutant/LadderRackPreview";
import SnakeKnotPreview from "../components/Debutant/SnakeKnotPreview";
import SpiralPreview from "../components/Debutant/SpiralPreview";
import SquareKnotPreview from "../components/Debutant/SquareKnotPreview";
import TrilobitePreview from "../components/Intermediaire/TrilobitePreview";
import CrownSinnetPreview from "../components/Intermediaire/CrownSinnetPreview";
import TressageRondPreview from "../components/Intermediaire/TressageRondPreview";
import ViperWeavePreview from "../components/Intermediaire/ViperWeavePreview";
import MonkeyFistPreview from "../components/Intermediaire/MonkeyFistPreview";
import DiamondKnotPreview from "../components/Intermediaire/DiamondKnotPreview";
import KingCobraPreview from "../components/Avance/KingCobraPreview";
import SanctifiedPreview from "../components/Avance/SanctifiedPreview";
import SharkJawbonePreview from "../components/Avance/SharkJawbonePreview";
import AztecSunBarPreview from "../components/Expert/AztecSunBarPreview";
import CelticBarPreview from "../components/Expert/CelticBarPreview";

const THEME = {
  colors: { primaryBg: "#EFE7D8", cardBg: "#FFFFFF", accent: "#006D6F", textMain: "#1F1F1F", textMuted: "#6B6B6B", border: "#EEEEEE", error: "#c53030" },
  radius: { card: "24px", inner: "15px" }
};

const KNOT_COMPONENTS: Record<string, React.ComponentType<any>> = {
  Cobra: CobraPreview, Fishtail: FishtailPreview, LadderRack: LadderRackPreview,
  SnakeKnot: SnakeKnotPreview, Spiral: SpiralPreview, SquareKnot: SquareKnotPreview,
  Trilobite: TrilobitePreview, CrownSinnet: CrownSinnetPreview, TressageRond: TressageRondPreview,
  ViperWeave: ViperWeavePreview, KingCobra: KingCobraPreview, Sanctified: SanctifiedPreview,
  MonkeyFist: MonkeyFistPreview, DiamondKnot: DiamondKnotPreview,
  SharkJawbone: SharkJawbonePreview, AztecSunBar: AztecSunBarPreview, CelticBar: CelticBarPreview,
};

function KnotThumbnail({ nodeId, colors, type }: { nodeId: string; colors: string[]; type: string }) {
  const Component = KNOT_COMPONENTS[nodeId] ?? CobraPreview;
  return (
    <div style={{ width: "203px", height: "70px", background: "#ddd6cc", borderRadius: "12px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <div style={{ transform: "scale(0.5)", transformOrigin: "center center" }}>
        <Component color1={colors[0]} color2={colors[1] || colors[0]} accessoryType={type} orientation="horizontal" />
      </div>
    </div>
  );
}

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("cordeslab_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleOpen = (item: any) => {
    const c = encodeURIComponent(JSON.stringify(item.colors));
    navigate(`/newcalc?node=${item.nodeId}&l=${item.length}&colors=${c}&step=2`);
  };

  const handleClearHistory = () => {
    if (window.confirm("Voulez-vous vraiment vider tout l'historique ?")) {
      setHistory([]);
      localStorage.removeItem("cordeslab_history");
    }
  };

  const handleDeleteItem = (id: any) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem("cordeslab_history", JSON.stringify(updated));
  };

  return (
    <div style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto", backgroundColor: THEME.colors.primaryBg, minHeight: "100vh", fontFamily: "sans-serif" }}>
      <style>{`
        @media (max-width: 480px) {
          .history-wrap { padding: 16px !important; }
          .history-header { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .history-header button { width: 100% !important; }
          .history-card-header { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .history-card-actions { display: flex; gap: 8px; }
          .history-detail { flex-direction: column !important; gap: 15px !important; }
          .history-detail-fields { flex-direction: column !important; gap: 12px !important; }
        }
      `}</style>

      <div className="history-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "900", color: THEME.colors.textMain, margin: 0 }}>Historique</h1>
          <p style={{ color: THEME.colors.textMuted, margin: "5px 0 0 0" }}>Retrouvez vos derniers calculs effectués.</p>
        </div>
        {history.length > 0 && (
          <button onClick={handleClearHistory} style={{ background: "transparent", border: `1px solid ${THEME.colors.error}`, color: THEME.colors.error, padding: "10px 20px", borderRadius: "12px", fontSize: "13px", fontWeight: "bold", cursor: "pointer", whiteSpace: "nowrap" }}>
            🗑️ Vider l'historique
          </button>
        )}
      </div>

      <div style={{ display: "grid", gap: "20px" }}>
        {history.map((item) => (
          <div key={item.id} style={{ background: THEME.colors.cardBg, borderRadius: THEME.radius.card, border: `1px solid ${THEME.colors.border}`, overflow: "hidden" }}>
            <div className="history-card-header" style={{ padding: "15px 20px", borderBottom: `1px solid ${THEME.colors.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fcfcfc" }}>
              <div>
                <span style={{ fontWeight: "900", fontSize: "17px", color: THEME.colors.textMain }}>{item.name}</span>
                <span style={{ marginLeft: "12px", fontSize: "12px", color: THEME.colors.textMuted }}>{item.date}</span>
              </div>
              <div className="history-card-actions" style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => handleOpen(item)} style={{ background: THEME.colors.accent, color: "#fff", border: "none", padding: "8px 16px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", whiteSpace: "nowrap" }}>Ouvrir</button>
                <button onClick={() => handleDeleteItem(item.id)} style={{ background: "transparent", border: "none", padding: "8px 12px", borderRadius: "10px", fontSize: "12px", color: THEME.colors.error, cursor: "pointer", whiteSpace: "nowrap" }}>Supprimer</button>
              </div>
            </div>

            <div className="history-detail" style={{ padding: "16px", display: "flex", gap: "20px", alignItems: "center" }}>
              <KnotThumbnail nodeId={item.nodeId} colors={item.colors} type={item.type} />
              <div className="history-detail-fields" style={{ flex: 1, display: "flex", gap: "30px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "10px", fontWeight: "bold", color: "#AAA", textTransform: "uppercase" }}>Tressage</label>
                  <div style={{ fontSize: "14px", fontWeight: "700" }}>{item.knotName}</div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "10px", fontWeight: "bold", color: "#AAA", textTransform: "uppercase" }}>Dimensions</label>
                  <div style={{ fontSize: "14px", fontWeight: "700" }}>{item.length} cm</div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "10px", fontWeight: "bold", color: "#AAA", textTransform: "uppercase" }}>Palette</label>
                  <div style={{ display: "flex", gap: "5px", marginTop: "5px" }}>
                    {item.colors.map((c: string, i: number) => (
                      <div key={i} style={{ width: "16px", height: "16px", borderRadius: "50%", background: c, border: "1px solid #ddd" }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {history.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <h3 style={{ color: THEME.colors.textMuted }}>L'historique est vide</h3>
          </div>
        )}
      </div>
    </div>
  );
}