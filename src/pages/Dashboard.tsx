import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NecklacePreview from "../components/NecklacePreview";
import { THEME } from "../shared/theme";

export default function Dashboard() {
  const navigate = useNavigate();
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [stats, setStats] = useState({ count: 0, time: "0h 00" });

  useEffect(() => {
    const saved = localStorage.getItem("cordeslab_projects");
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

      <h1 style={{ fontSize: "28px", fontWeight: "900", color: THEME.colors.textMain, marginBottom: "30px" }}>Tableau de bord</h1>

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
                <div style={{ width: "70px", height: "45px", background: THEME.colors.primaryBg, borderRadius: "12px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ transform: "scale(0.35) rotate(90deg)" }}>
                    <NecklacePreview knotId={p.nodeId} primaryColor={p.colors[0]} secondaryColor={p.colors[1]} />
                  </div>
                </div>
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
