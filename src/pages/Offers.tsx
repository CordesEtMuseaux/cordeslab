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
    tableHeaderBg: "#F1EBE0"
  },
  radius: { card: "24px", button: "15px", table: "12px" }
};

interface Plan {
  name: string;
  price: string;
  desc: string;
  current?: boolean;
  highlight?: boolean;
  saving?: string;
  features: string[];
}

const PLANS_DATA: Record<"monthly" | "yearly", Plan[]> = {
  monthly: [
    { name: "Atelier", price: "0€", desc: "Pour débuter sereinement", current: true, features: ["8 tressages essentiels", "Sauvegarde illimitée", "Calculs de base uniquement"] },
    { name: "Creator", price: "9€", desc: "Pour les créateurs passionnés", highlight: true, features: ["12 tressages sélectionnés", "Sauvegarde illimitée", "Calculs Poignées", "Export PDF"] },
    { name: "Pro", price: "19€", desc: "L'outil professionnel complet", features: ["Bibliothèque intégrale", "Sauvegarde illimitée", "Calculs Laisses & Accessoires", "Gestion client"] }
  ],
  yearly: [
    { name: "Atelier", price: "0€", desc: "Pour débuter sereinement", current: true, features: ["8 tressages essentiels", "Sauvegarde illimitée", "Calculs de base uniquement"] },
    { name: "Creator", price: "79€", desc: "Pour les créateurs passionnés", highlight: true, saving: "Économisez 29€/an", features: ["12 tressages sélectionnés", "Sauvegarde illimitée", "Calculs Poignées", "Export PDF"] },
    { name: "Pro", price: "179€", desc: "L'outil professionnel complet", saving: "Économisez 49€/an", features: ["Bibliothèque intégrale", "Sauvegarde illimitée", "Calculs Laisses & Accessoires", "Gestion client"] }
  ]
};

const COMPARISON_FEATURES = [
  { section: "Création", name: "Fabrication de Colliers", atelier: "Oui", creator: "Oui", pro: "Oui" },
  { section: "Création", name: "Calculs Poignées", atelier: "Non", creator: "Oui", pro: "Oui" },
  { section: "Création", name: "Calculs Laisses (Simples & Multi.)", atelier: "Non", creator: "Non", pro: "Oui" },
  { section: "Création", name: "Tous les accessoires (Jouets...)", atelier: "Non", creator: "Non", pro: "Oui" },
  { section: "Fonctionnalités", name: "Sauvegarde Projets", atelier: "Illimitée", creator: "Illimitée", pro: "Illimitée" },
  { section: "Fonctionnalités", name: "Catalogue de nœuds", atelier: "8 essentiels", creator: "12 sélectionnés", pro: "Intégral" },
  { section: "Outils", name: "Exports PDF des plans", atelier: "Non", creator: "Oui", pro: "Oui" },
  { section: "Outils", name: "Portail Stripe (Abonnement)", atelier: "Non", creator: "Oui", pro: "Oui" },
];

export default function Offers() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const currentPlans = PLANS_DATA[billingCycle];

  return (
    <div style={{ padding: "24px 16px", maxWidth: "1200px", margin: "0 auto", backgroundColor: THEME.colors.primaryBg, minHeight: "100vh", fontFamily: "sans-serif" }}>

      {/* TABLEAU COMPARATIF */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "900", color: THEME.colors.textMain }}>Comparatif des fonctionnalités</h1>
      </div>

      <div style={{ background: THEME.colors.cardBg, borderRadius: THEME.radius.card, border: `1px solid ${THEME.colors.border}`, marginBottom: "48px", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <table style={{ width: "100%", minWidth: "300px", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${THEME.colors.primaryBg}` }}>
              <th style={{ padding: "12px 6px", color: THEME.colors.textMuted, fontSize: "12px", width: "40%" }}>Services</th>
              <th style={{ padding: "12px 4px", textAlign: "center", fontSize: "12px" }}>Atelier</th>
              <th style={{ padding: "12px 4px", textAlign: "center", color: THEME.colors.accent, fontSize: "12px" }}>Creator</th>
              <th style={{ padding: "12px 4px", textAlign: "center", fontSize: "12px" }}>Pro</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_FEATURES.map((f, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${THEME.colors.border}` }}>
                <td style={{ padding: "10px 6px", fontSize: "12px", fontWeight: "500", width: "40%" }}>{f.name}</td>
                <td style={{ padding: "10px 4px", textAlign: "center", color: THEME.colors.textMuted, fontSize: "12px" }}>{f.atelier}</td>
                <td style={{ padding: "10px 4px", textAlign: "center", color: THEME.colors.accent, fontWeight: "bold", fontSize: "12px" }}>{f.creator}</td>
                <td style={{ padding: "10px 4px", textAlign: "center", fontSize: "12px" }}>{f.pro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FORFAITS */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "900", color: THEME.colors.textMain }}>Nos forfaits</h2>
        <div style={{ display: "inline-flex", background: THEME.colors.cardBg, padding: "5px", borderRadius: "50px", marginTop: "16px", border: `1px solid ${THEME.colors.border}` }}>
          <button onClick={() => setBillingCycle("monthly")} style={{ padding: "10px 20px", borderRadius: "50px", border: "none", cursor: "pointer", fontWeight: "bold", background: billingCycle === "monthly" ? THEME.colors.accent : "transparent", color: billingCycle === "monthly" ? "#fff" : THEME.colors.textMuted, transition: "0.3s" }}>Mensuel</button>
          <button onClick={() => setBillingCycle("yearly")} style={{ padding: "10px 20px", borderRadius: "50px", border: "none", cursor: "pointer", fontWeight: "bold", background: billingCycle === "yearly" ? THEME.colors.accent : "transparent", color: billingCycle === "yearly" ? "#fff" : THEME.colors.textMuted, transition: "0.3s" }}>Annuel</button>
        </div>
      </div>

      {/* CARTES */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
        {currentPlans.map((plan, i) => (
          <div key={i} style={{
            background: THEME.colors.cardBg, padding: "30px 24px", borderRadius: THEME.radius.card,
            border: plan.highlight ? `2px solid ${THEME.colors.accent}` : `1px solid ${THEME.colors.border}`,
            display: "flex", flexDirection: "column", position: "relative",
            boxShadow: plan.highlight ? "0 10px 30px rgba(0,0,0,0.05)" : "none"
          }}>
            {plan.highlight && (
              <span style={{ position: "absolute", top: "-15px", left: "50%", transform: "translateX(-50%)", background: THEME.colors.accent, color: "#fff", padding: "5px 15px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", whiteSpace: "nowrap" }}>
                RECOMMANDÉ
              </span>
            )}
            <h3 style={{ margin: "0 0 10px 0", fontSize: "22px" }}>{plan.name}</h3>
            <div style={{ fontSize: "36px", fontWeight: "900", marginBottom: "5px" }}>
              {plan.price}<span style={{ fontSize: "14px", color: THEME.colors.textMuted }}>{billingCycle === "monthly" ? "/mois" : "/an"}</span>
            </div>
            {plan.saving && <div style={{ color: THEME.colors.accent, fontWeight: "bold", fontSize: "13px", marginBottom: "10px" }}>{plan.saving}</div>}
            <p style={{ color: THEME.colors.textMuted, fontSize: "14px", marginBottom: "20px" }}>{plan.desc}</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0", flex: 1 }}>
              {plan.features.map((feat, idx) => (
                <li key={idx} style={{ marginBottom: "10px", fontSize: "14px" }}>✅ {feat}</li>
              ))}
            </ul>
            <button
              onClick={() => plan.current ? null : navigate("/thank-you")}
              style={{ width: "100%", padding: "14px", borderRadius: THEME.radius.button, border: "none", background: plan.current ? "#F5F5F5" : THEME.colors.accent, color: plan.current ? THEME.colors.textMuted : "#fff", fontWeight: "bold", cursor: plan.current ? "default" : "pointer", transition: "0.2s" }}>
              {plan.current ? "Forfait actuel" : `Choisir ${plan.name}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}