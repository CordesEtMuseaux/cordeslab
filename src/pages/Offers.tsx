import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// --- THÈME CENTRALISÉ ---
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

// --- TYPES ---
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
    { 
      name: "Atelier", price: "0€", desc: "Pour débuter sereinement", current: true,
      features: ["8 tressages essentiels", "Sauvegarde illimitée", "Calculs de base uniquement"] 
    },
    { 
      name: "Creator", price: "9€", desc: "Pour les créateurs passionnés", highlight: true,
      features: ["12 tressages sélectionnés", "Sauvegarde illimitée", "Calculs Poignées", "Export PDF"] 
    },
    { 
      name: "Pro", price: "19€", desc: "L'outil professionnel complet",
      features: ["Bibliothèque intégrale", "Sauvegarde illimitée", "Calculs Laisses & Accessoires", "Gestion client"] 
    }
  ],
  yearly: [
    { 
      name: "Atelier", price: "0€", desc: "Pour débuter sereinement", current: true,
      features: ["8 tressages essentiels", "Sauvegarde illimitée", "Calculs de base uniquement"]
    },
    { 
      name: "Creator", price: "79€", desc: "Pour les créateurs passionnés", highlight: true, saving: "Économisez 29€/an",
      features: ["12 tressages sélectionnés", "Sauvegarde illimitée", "Calculs Poignées", "Export PDF"]
    },
    { 
      name: "Pro", price: "179€", desc: "L'outil professionnel complet", saving: "Économisez 49€/an",
      features: ["Bibliothèque intégrale", "Sauvegarde illimitée", "Calculs Laisses & Accessoires", "Gestion client"]
    }
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
    <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto", backgroundColor: THEME.colors.primaryBg, minHeight: "100vh", fontFamily: "sans-serif" }}>
      
      {/* 1. TABLEAU COMPARATIF D'ABORD */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "900", color: THEME.colors.textMain }}>Comparatif des fonctionnalités</h1>
      </div>
      
      <div style={{ background: THEME.colors.cardBg, padding: "30px", borderRadius: THEME.radius.card, border: `1px solid ${THEME.colors.border}`, marginBottom: "60px", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${THEME.colors.primaryBg}` }}>
              <th style={{ padding: "15px", color: THEME.colors.textMuted }}>Services</th>
              <th style={{ padding: "15px", textAlign: "center" }}>Atelier</th>
              <th style={{ padding: "15px", textAlign: "center", color: THEME.colors.accent }}>Creator</th>
              <th style={{ padding: "15px", textAlign: "center" }}>Pro</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_FEATURES.map((f, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${THEME.colors.border}` }}>
                <td style={{ padding: "12px 15px", fontSize: "14px", fontWeight: "500" }}>{f.name}</td>
                <td style={{ padding: "12px 15px", textAlign: "center", color: THEME.colors.textMuted, fontSize: "14px" }}>{f.atelier}</td>
                <td style={{ padding: "12px 15px", textAlign: "center", color: THEME.colors.accent, fontWeight: "bold", fontSize: "14px" }}>{f.creator}</td>
                <td style={{ padding: "12px 15px", textAlign: "center", fontSize: "14px" }}>{f.pro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. TITRE "NOS FORFAITS" JUSTE AU DESSUS DES CARTES */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h2 style={{ fontSize: "32px", fontWeight: "900", color: THEME.colors.textMain }}>Nos forfaits</h2>
        <div style={{ display: "inline-flex", background: THEME.colors.cardBg, padding: "5px", borderRadius: "50px", marginTop: "20px", border: `1px solid ${THEME.colors.border}` }}>
          <button onClick={() => setBillingCycle("monthly")} style={{ padding: "10px 25px", borderRadius: "50px", border: "none", cursor: "pointer", fontWeight: "bold", background: billingCycle === "monthly" ? THEME.colors.accent : "transparent", color: billingCycle === "monthly" ? "#fff" : THEME.colors.textMuted, transition: "0.3s" }}>Mensuel</button>
          <button onClick={() => setBillingCycle("yearly")} style={{ padding: "10px 25px", borderRadius: "50px", border: "none", cursor: "pointer", fontWeight: "bold", background: billingCycle === "yearly" ? THEME.colors.accent : "transparent", color: billingCycle === "yearly" ? "#fff" : THEME.colors.textMuted, transition: "0.3s" }}>Annuel</button>
        </div>
      </div>

      {/* 3. CARTES DE PRIX */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
        {currentPlans.map((plan, i) => (
          <div key={i} style={{ 
            background: THEME.colors.cardBg, padding: "40px", borderRadius: THEME.radius.card, 
            border: plan.highlight ? `2px solid ${THEME.colors.accent}` : `1px solid ${THEME.colors.border}`,
            display: "flex", flexDirection: "column", position: "relative",
            boxShadow: plan.highlight ? "0 10px 30px rgba(0,0,0,0.05)" : "none"
          }}>
            {plan.highlight && <span style={{ position: "absolute", top: "-15px", left: "50%", transform: "translateX(-50%)", background: THEME.colors.accent, color: "#fff", padding: "5px 15px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>RECOMMANDÉ</span>}
            <h3 style={{ margin: "0 0 10px 0", fontSize: "24px" }}>{plan.name}</h3>
            <div style={{ fontSize: "40px", fontWeight: "900", marginBottom: "5px" }}>{plan.price}<span style={{fontSize: "16px", color: THEME.colors.textMuted}}>{billingCycle === "monthly" ? "/mois" : "/an"}</span></div>
            {plan.saving && <div style={{ color: THEME.colors.accent, fontWeight: "bold", fontSize: "13px", marginBottom: "10px" }}>{plan.saving}</div>}
            <p style={{ color: THEME.colors.textMuted, fontSize: "14px", marginBottom: "25px", minHeight: "40px" }}>{plan.desc}</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 30px 0", flex: 1 }}>
              {plan.features.map((feat, idx) => <li key={idx} style={{ marginBottom: "10px", fontSize: "14px" }}>✅ {feat}</li>)}
            </ul>
            <button onClick={() => plan.current ? null : navigate("/thank-you")} style={{ width: "100%", padding: "15px", borderRadius: THEME.radius.button, border: "none", background: plan.current ? "#F5F5F5" : THEME.colors.accent, color: plan.current ? THEME.colors.textMuted : "#fff", fontWeight: "bold", cursor: plan.current ? "default" : "pointer", transition: "0.2s" }}>
              {plan.current ? "Forfait actuel" : `Choisir ${plan.name}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}