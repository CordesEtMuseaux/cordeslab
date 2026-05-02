import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NecklacePreview from "../components/NecklacePreview";

const THEME = {
  colors: { primaryBg: "#EFE7D8", cardBg: "#FFFFFF", accent: "#006D6F", textMain: "#1F1F1F", textMuted: "#6B6B6B", border: "#EEEEEE", error: "#c53030" },
  radius: { card: "24px", inner: "12px", button: "15px" }
};

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [newProjectName, setNewProjectName] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("cordeslab_projects");
    if (saved) setProjects(JSON.parse(saved));
  }, []);

  const handleOpen = (p: any) => {
    const colorsParam = encodeURIComponent(JSON.stringify(p.colors));
    navigate(`/newcalc?node=${p.nodeId}&l=${p.length}&colors=${colorsParam}&name=${encodeURIComponent(p.name)}&step=1`);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce projet ?")) {
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      localStorage.setItem("cordeslab_projects", JSON.stringify(updated));
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto", backgroundColor: THEME.colors.primaryBg, minHeight: "100vh", fontFamily: "sans-serif" }}>

      <style>{`
        @media (max-width: 480px) {
          .projects-wrap { padding: 16px !important; }
          .projects-header { flex-direction: column !important; align-items: flex-start !important; }
          .projects-search { width: 100% !important; }
          .projects-search input { width: 100% !important; min-width: 0 !important; }
          .project-row { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .project-actions { align-self: flex-end; }
        }
      `}</style>

      <div className="projects-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", flexWrap: "wrap", gap: "15px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "900", color: THEME.colors.textMain, margin: 0 }}>Mes Projets</h1>
          <p style={{ color: THEME.colors.textMuted, margin: "5px 0 0 0" }}>Gérez vos créations et accédez à vos plans de coupe.</p>
        </div>
        <div className="projects-search" style={{ display: "flex", gap: "10px", background: THEME.colors.cardBg, padding: "8px", borderRadius: "20px", border: `1px solid ${THEME.colors.border}` }}>
          <input
            type="text" placeholder="Nom du projet..." value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            style={{ border: "none", outline: "none", padding: "10px 15px", borderRadius: "12px", width: "200px", fontSize: "14px" }}
          />
          <button onClick={() => navigate("/newcalc")} style={{ background: THEME.colors.accent, color: "#fff", border: "none", padding: "10px 20px", borderRadius: "15px", fontWeight: "bold", cursor: "pointer", whiteSpace: "nowrap" }}>
            + Nouveau
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gap: "15px" }}>
        {projects.map((p) => (
          <div key={p.id} className="project-row" style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: THEME.colors.cardBg, padding: "16px", borderRadius: THEME.radius.card,
            border: `1px solid ${THEME.colors.border}`
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px", minWidth: 0 }}>
              <div style={{ width: "80px", height: "50px", background: THEME.colors.primaryBg, borderRadius: "15px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ transform: "scale(0.4) rotate(90deg)" }}>
                  <NecklacePreview knotId={p.nodeId} primaryColor={p.colors[0]} secondaryColor={p.colors[1] || p.colors[0]} />
                </div>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: "900", fontSize: "16px", color: THEME.colors.textMain }}>{p.name}</span>
                  <span style={{ fontSize: "10px", background: "#f0fdfa", padding: "3px 8px", borderRadius: "20px", fontWeight: "bold", color: THEME.colors.accent }}>{p.type}</span>
                </div>
                <div style={{ fontSize: "13px", color: THEME.colors.textMuted }}>{p.knotName} • {p.length} cm • {p.date}</div>
              </div>
            </div>
            <div className="project-actions" style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
              <button onClick={() => handleOpen(p)} style={{ background: THEME.colors.accent, color: "#fff", border: "none", padding: "10px 16px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", fontSize: "13px", whiteSpace: "nowrap" }}>Ouvrir</button>
              <button onClick={() => handleDelete(p.id)} style={{ background: "#fff5f5", border: "none", padding: "10px 12px", borderRadius: "12px", cursor: "pointer", color: THEME.colors.error, fontSize: "16px" }}>🗑️</button>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px", background: "#fff", borderRadius: "24px", border: "2px dashed #eee" }}>
            <p style={{ color: "#888" }}>Aucun projet enregistré pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
