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
import { THEME } from "../shared/theme";

const KNOT_COMPONENTS: Record<string, React.ComponentType<any>> = {
  Cobra: CobraPreview,
  Fishtail: FishtailPreview,
  LadderRack: LadderRackPreview,
  SnakeKnot: SnakeKnotPreview,
  Spiral: SpiralPreview,
  SquareKnot: SquareKnotPreview,
  Trilobite: TrilobitePreview,
  CrownSinnet: CrownSinnetPreview,
  TressageRond: TressageRondPreview,
  ViperWeave: ViperWeavePreview,
  MonkeyFist: MonkeyFistPreview,
  DiamondKnot: DiamondKnotPreview,
  KingCobra: KingCobraPreview,
  Sanctified: SanctifiedPreview,
  SharkJawbone: SharkJawbonePreview,
  AztecSunBar: AztecSunBarPreview,
  CelticBar: CelticBarPreview,
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

export default function Dashboard() {
  const navigate = useNavigate();
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [stats, setStats] = useState({ count: 0, time: "0h 00" });
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cordeslab_projects");
    if (!saved || JSON.parse(saved).length === 0) {
      setShowWelcome(true);
    }
    if (saved) {
      const allProjects = JSON.parse(saved);
      setRecentProjects(allProjects.slice(0, 2));
      let totalMinutes = 0;
      allProjects.forEach((p: any) => {
        const timeStr = p.estimatedTime || "0h 00";
        const parts = timeStr.match(/\d+/g);
        if (parts && parts.length >= 2) {
          totalMinutes += parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
      });
      const finalHours = Math.floor(totalMinutes / 60);
      const finalMins = totalMinutes % 60;
      setStats({ count: allProjects.length, time: `${finalHours}h ${finalMins.toString().padStart(2, "0")}` });
    } else {
      setShowWelcome(true);
    }
  }, []);

  return (
    <div style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto", backgroundColor: THEME.colors.primaryBg, minHeight: "100vh", fontFamily: "sans-serif" }} className="dashboard-wrap">

      <style>{`
        @media (max-width: 480px) {
          .dashboard-stats { grid-template-columns: 1fr !important; }
          .dashboard-stat-value { font-size: 36px !important; }
          .dashboard-project-row { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .dashboard-project-btn { align-self: flex-end; }
          .dashboard-wrap { padding: 16px !important; }
        }
      `}</style>

      <h1 style={{ fontSize: "28px", fontWeight: "900", color: THEME.colors.textMain, marginBottom: "20px" }}>Tableau de bord</h1>

      {showWelcome && (
        <div style={{ background: "#fff", borderRadius: THEME.radius.card, border: `2px solid ${THEME.colors.accent}`, padding: "24px", marginBottom: "30px" }}>
          <div style={{ fontSize: "20px", marginBottom: "8px" }}>👋 Bienvenue sur CordesLab !</div>
          <p style={{ color: THEME.colors.textMuted, fontSize: "14px", marginBottom: "16px", lineHeight: 1.6 }}>
            CordesLab est un <strong>calculateur de longueurs de paracorde</strong> pour confectionner soi-même ses accessoires pour chien (colliers, poignées, laisses...).
          </p>
          <p style={{ color: THEME.colors.textMuted, fontSize: "14px", marginBottom: "16px", lineHeight: 1.6 }}>
            Il vous suffit d'acheter de la <strong>paracorde 4mm</strong> et les attaches de votre choix (boucles plastique ou métal). L'app calcule automatiquement les longueurs à couper selon le nœud et la taille choisie.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "20px" }}>
            {[
              { num: "1", text: "Choisissez votre accessoire et nœud" },
              { num: "2", text: "Entrez la longueur souhaitée" },
              { num: "3", text: "Obtenez vos longueurs à couper" },
              { num: "4", text: "Téléchargez votre plan PDF" },
            ].map((step) => (
              <div key={step.num} style={{ background: THEME.colors.primaryBg, borderRadius: "12px", padding: "12px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <div style={{ background: THEME.colors.accent, color: "#fff", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "12px", flexShrink: 0 }}>{step.num}</div>
                <div style={{ fontSize: "13px", color: THEME.colors.textMain, fontWeight: "600" }}>{step.text}</div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/newcalc")} style={{ background: THEME.colors.accent, color: "#fff", border: "none", padding: "12px 30px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}>
            Commencer mon premier calcul →
          </button>
        </div>
      )}

      <div className="dashboard-stats" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px", marginBottom: "40px" }}>
        <div style={{ background: THEME.colors.accent, padding: "30px", borderRadius: THEME.radius.card, color: "#fff" }}>
          <div style={{ fontSize: "14px", fontWeight: "bold", opacity: 0.8 }}>Projets réalisés</div>
          <div className="dashboard-stat-value" style={{ fontSize: "48px", fontWeight: "900", marginTop: "10px" }}>{stats.count}</div>
        </div>
        <div style={{ background: "#fff", padding: "30px", borderRadius: THEME.radius.card, border: `1px solid ${THEME.colors.border}` }}>
          <div style={{ fontSize: "14px", fontWeight: "bold", color: THEME.colors.textMuted }}>Temps de tressage total</div>
          <div className="dashboard-stat-value" style={{ fontSize: "48px", fontWeight: "900", marginTop: "10px", color: THEME.colors.textMain }}>{stats.time}</div>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "900", color: THEME.colors.textMain, marginBottom: "20px" }}>Projets récents</h2>
        <div style={{ display: "grid", gap: "15px" }}>
          {recentProjects.map((p) => (
            <div key={p.id} className="dashboard-project-row" style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "#fff", padding: "15px 20px", borderRadius: THEME.radius.card,
              border: `1px solid ${THEME.colors.border}`
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <KnotThumbnail nodeId={p.nodeId} colors={p.colors} type={p.type} />
                <div>
                  <div style={{ fontWeight: "900", fontSize: "15px", color: THEME.colors.textMain }}>{p.name}</div>
                  <div style={{ fontSize: "12px", color: THEME.colors.textMuted }}>{p.date || "21/04/2026"} • {p.knotName} • {p.estimatedTime || "0h 00"}</div>
                </div>
              </div>
              <button className="dashboard-project-btn"
                onClick={() => navigate(`/newcalc?node=${p.nodeId}&l=${p.length}&step=2`)}
                style={{ background: "transparent", border: `1px solid ${THEME.colors.accent}`, color: THEME.colors.accent, padding: "8px 16px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", fontSize: "13px", whiteSpace: "nowrap" }}
              >Voir le plan</button>
            </div>
          ))}
          {recentProjects.length === 0 && (
            <div style={{ textAlign: "center", padding: "30px", background: "rgba(255,255,255,0.5)", borderRadius: "20px", border: "1px dashed #ccc" }}>
              <p style={{ color: THEME.colors.textMuted }}>Aucun projet récent à afficher.</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: "40px", padding: "30px", background: "rgba(255,255,255,0.4)", borderRadius: THEME.radius.card, border: `1px dashed ${THEME.colors.border}` }}>
        <h3 style={{ fontWeight: "900", marginBottom: "10px", color: THEME.colors.textMain }}>Prêt pour une nouvelle création ?</h3>
        <p style={{ color: THEME.colors.textMuted, fontSize: "14px", marginBottom: "20px" }}>Lancez le calculateur pour obtenir vos mesures de cordes.</p>
        <button onClick={() => navigate("/newcalc")} style={{ background: THEME.colors.accent, color: "#fff", border: "none", padding: "12px 35px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer" }}>
          Nouveau calcul
        </button>
      </div>
    </div>
  );
}