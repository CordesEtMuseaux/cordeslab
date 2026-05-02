import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const THEME = {
  colors: {
    primaryBg: "#EFE7D8",
    cardBg: "#FFFFFF",
    accent: "#006D6F",
    textMain: "#1F1F1F",
    textMuted: "#6B6B6B",
    border: "#EEEEEE",
  },
  radius: { card: "24px", inner: "15px" }
};

export default function Settings() {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const userPlan = {
    name: "Pro",
    validUntil: "08/09/2026",
    daysLeft: 143,
    projectsCount: "Illimités",
  };

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <div style={{ padding: "16px", maxWidth: "1200px", margin: "0 auto", backgroundColor: THEME.colors.primaryBg, minHeight: "100vh", fontFamily: "sans-serif" }}>

      {/* HEADER */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: "900", color: THEME.colors.textMain, margin: 0 }}>Réglages</h1>
        <p style={{ color: THEME.colors.textMuted, marginTop: "5px", fontSize: "14px" }}>Gérez votre compte et les paramètres de CordesLab.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>

        {/* --- SECTION COMPTE --- */}
        <section style={{ background: THEME.colors.cardBg, borderRadius: THEME.radius.card, border: `1px solid ${THEME.colors.border}`, padding: "20px", height: "fit-content" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "20px", color: THEME.colors.textMain }}>Compte</h2>

          {/* ACCORDÉON ABONNEMENT */}
          <div style={{ marginBottom: "15px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: "800", color: THEME.colors.textMain }}>Abonnement</div>
                <div style={{ fontSize: "13px", color: THEME.colors.textMuted }}>Détails de votre offre et comparatif</div>
              </div>
              <button onClick={() => toggleSection("sub")} style={{ flexShrink: 0, padding: "8px 16px", borderRadius: "10px", border: "none", background: "#E0E0E0", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>
                {openSection === "sub" ? "Masquer" : "Voir"}
              </button>
            </div>

            {openSection === "sub" && (
              <div style={{ marginTop: "20px" }}>

                {/* RÉSUMÉ DU COMPTE */}
                <div style={{ padding: "16px", background: "#F9F9F9", borderRadius: "15px", marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "12px", fontWeight: "800", marginBottom: "12px", color: THEME.colors.accent, textTransform: "uppercase" }}>Résumé du compte</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <div style={{ fontSize: "10px", color: THEME.colors.textMuted, fontWeight: "bold" }}>FORMULE</div>
                      <div style={{ fontWeight: "700" }}>{userPlan.name}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "10px", color: THEME.colors.textMuted, fontWeight: "bold" }}>VALIDITÉ</div>
                      <div style={{ fontWeight: "700" }}>{userPlan.validUntil}</div>
                    </div>
                  </div>
                </div>

                {/* OFFRES DISPONIBLES */}
                <div style={{ padding: "16px", background: "#F9F9F9", borderRadius: "15px" }}>
                  <h3 style={{ fontSize: "12px", fontWeight: "800", marginBottom: "12px", color: THEME.colors.textMain, textTransform: "uppercase" }}>Offres disponibles</h3>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", minWidth: "260px", fontSize: "12px", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ textAlign: "left", color: THEME.colors.textMuted }}>
                          <th style={{ paddingBottom: "10px" }}>NIVEAU</th>
                          <th style={{ paddingBottom: "10px" }}>NŒUDS</th>
                          <th style={{ paddingBottom: "10px" }}>ACCESSOIRES</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderTop: `1px solid ${THEME.colors.border}` }}>
                          <td style={{ padding: "10px 0", fontWeight: "bold" }}>Atelier</td>
                          <td>8 essentiels</td>
                          <td>Colliers</td>
                        </tr>
                        <tr style={{ borderTop: `1px solid ${THEME.colors.border}`, color: THEME.colors.accent }}>
                          <td style={{ padding: "10px 0", fontWeight: "bold" }}>Creator</td>
                          <td>12 sélectionnés</td>
                          <td>Colliers + Poignées</td>
                        </tr>
                        <tr style={{ borderTop: `1px solid ${THEME.colors.border}`, fontWeight: "bold" }}>
                          <td style={{ padding: "10px 0" }}>Pro</td>
                          <td>Intégral</td>
                          <td>Tous (Laisses...)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <button
                    onClick={() => navigate("/offers")}
                    style={{ marginTop: "16px", width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: THEME.colors.accent, color: "#fff", fontWeight: "bold", cursor: "pointer" }}
                  >
                    Changer de formule
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ACCORDÉON SUPPORT */}
          <div style={{ borderTop: `1px solid ${THEME.colors.border}`, paddingTop: "16px", marginTop: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: "800", color: THEME.colors.textMain }}>Support technique</div>
                <div style={{ fontSize: "13px", color: THEME.colors.textMuted }}>Contacter l'assistance CordesLab</div>
              </div>
              <button onClick={() => toggleSection("support")} style={{ flexShrink: 0, padding: "8px 16px", borderRadius: "10px", border: "none", background: "#E0E0E0", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>
                {openSection === "support" ? "Masquer" : "Contacter"}
              </button>
            </div>
            {openSection === "support" && (
              <div style={{ marginTop: "15px", padding: "15px", background: "#F9F9F9", borderRadius: "12px" }}>
                <div style={{ fontSize: "14px", fontWeight: "bold" }}>📧 contact@cordesetmuseaux.fr</div>
                <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: THEME.colors.textMuted }}>Réponse sous 24h à 48h ouvrées.</p>
              </div>
            )}
          </div>
        </section>

        {/* --- SECTION APPLICATION --- */}
        <section style={{ background: THEME.colors.cardBg, borderRadius: THEME.radius.card, border: `1px solid ${THEME.colors.border}`, padding: "20px", height: "fit-content" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "20px", color: THEME.colors.textMain }}>Application</h2>

          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontWeight: "800", color: THEME.colors.textMain }}>Version</div>
            <div style={{ fontSize: "13px", color: THEME.colors.textMuted }}>CordesLab v0.1-beta</div>
          </div>

          <div style={{ borderTop: `1px solid ${THEME.colors.border}`, paddingTop: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: "800", color: THEME.colors.textMain }}>Interface</div>
                <div style={{ fontSize: "13px", color: THEME.colors.textMuted }}>Thèmes et personnalisation</div>
              </div>
              <button onClick={() => toggleSection("ui")} style={{ flexShrink: 0, padding: "8px 16px", borderRadius: "10px", border: "none", background: "#E0E0E0", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>
                {openSection === "ui" ? "Masquer" : "Configurer"}
              </button>
            </div>

            {openSection === "ui" && (
              <div style={{ marginTop: "15px", padding: "20px", background: "#F9F9F9", borderRadius: "12px", border: `1px dashed ${THEME.colors.border}`, textAlign: "center" }}>
                <div style={{ fontSize: "20px", marginBottom: "10px" }}>🎨</div>
                <div style={{ fontSize: "13px", fontWeight: "bold" }}>Options de personnalisation</div>
                <div style={{ fontSize: "12px", color: THEME.colors.textMuted, marginTop: "5px" }}>Cette fonctionnalité sera disponible prochainement.</div>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}