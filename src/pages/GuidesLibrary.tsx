import React from "react";
import { Link } from "react-router-dom";
import { getUserPlan, KNOTS_CATALOG, ACCESSORIES_CONFIG, type PlanLevel } from "../shared/catalog";
import { GUIDES_LIBRARY, isGuideLocked, getGuideMinTier, getGuidesForKnot, getUnlockedGuides } from "../data/guidesLibrary";

const THEME = {
  colors: {
    primaryBg: "#EFE7D8",
    cardBg: "#FFFFFF",
    accent: "#006D6F",
    textMain: "#1F1F1F",
    textMuted: "#6B6B6B",
    border: "#EEEEEE",
    lockedBg: "#F5F5F5",
  },
  radius: { card: "20px", pill: "999px" },
};

const TIER_LABELS: Record<PlanLevel, string> = { Atelier: "Atelier", Creator: "Creator", Pro: "Pro" };

export default function GuidesLibrary() {
  const plan = getUserPlan();
  const unlockedCount = getUnlockedGuides().length;
  const producedCount = GUIDES_LIBRARY.filter((g) => g.contentUrl !== null).length;

  // Regroupement par nœud, dans l'ordre canonique du catalogue (difficulté puis order)
  const groups = KNOTS_CATALOG
    .map((knot) => ({ knot, guides: getGuidesForKnot(knot.id) }))
    .filter((group) => group.guides.length > 0);

  return (
    <div style={{ background: THEME.colors.primaryBg, minHeight: "100vh", padding: "32px 20px 60px" }}>
      <div style={{ maxWidth: "920px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 800, color: THEME.colors.textMain, marginBottom: "6px" }}>
          Bibliothèque de guides
        </h1>
        <p style={{ color: THEME.colors.textMuted, marginBottom: "20px" }}>
          Un guide complet et autonome par combinaison nœud × accessoire — mesures, matériel, étapes de nouage, montage, finition.
        </p>

        <div style={{
          background: THEME.colors.cardBg, borderRadius: THEME.radius.card, padding: "18px 22px",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px",
          marginBottom: "28px", border: `1px solid ${THEME.colors.border}`,
        }}>
          <div>
            <strong style={{ fontSize: "18px" }}>{unlockedCount} / {GUIDES_LIBRARY.length}</strong> guides débloqués avec ton forfait{" "}
            <span style={{ background: THEME.colors.accent, color: "#fff", borderRadius: THEME.radius.pill, padding: "2px 10px", fontSize: "12px", fontWeight: 700 }}>
              {TIER_LABELS[plan]}
            </span>
            <div style={{ fontSize: "13px", color: THEME.colors.textMuted, marginTop: "4px" }}>
              {producedCount} / {GUIDES_LIBRARY.length} guides déjà publiés — les autres arrivent au fil de la production.
            </div>
          </div>
          {plan !== "Pro" && (
            <Link to="/offers" style={{
              background: THEME.colors.accent, color: "#fff", textDecoration: "none", fontWeight: 700,
              padding: "10px 18px", borderRadius: "12px", fontSize: "14px", whiteSpace: "nowrap",
            }}>
              Débloquer plus de guides →
            </Link>
          )}
        </div>

        {groups.map(({ knot, guides }) => (
          <div key={knot.id} style={{
            background: THEME.colors.cardBg, borderRadius: THEME.radius.card, padding: "18px 22px",
            marginBottom: "16px", border: `1px solid ${THEME.colors.border}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>{knot.name}</h2>
              <span style={{
                fontSize: "11px", fontWeight: 600, color: THEME.colors.textMuted,
                border: `1px solid ${THEME.colors.border}`, borderRadius: THEME.radius.pill, padding: "2px 9px",
              }}>
                {knot.difficulty}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
              {guides.map((guide) => {
                const locked = isGuideLocked(guide);
                const minTier = getGuideMinTier(guide);
                const accCfg = ACCESSORIES_CONFIG[guide.accessoryKey];
                const isProduced = guide.contentUrl !== null;

                const content = (
                  <div style={{
                    display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
                    borderRadius: "12px", border: `1px solid ${THEME.colors.border}`,
                    background: locked ? THEME.colors.lockedBg : THEME.colors.cardBg,
                    opacity: locked ? 0.65 : 1,
                  }}>
                    <span style={{ fontSize: "18px" }}>{accCfg.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: THEME.colors.textMain }}>
                        {accCfg.label}
                      </div>
                      <div style={{ fontSize: "11px", color: THEME.colors.textMuted }}>
                        {locked ? `Dès ${TIER_LABELS[minTier]}` : isProduced ? "Voir le guide" : "Bientôt disponible"}
                      </div>
                    </div>
                    <span style={{ fontSize: "16px" }}>
                      {locked ? "🔒" : isProduced ? "📖" : "🛠️"}
                    </span>
                  </div>
                );

                if (!locked && isProduced) {
                  return (
                    <a key={guide.id} href={guide.contentUrl!} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
                      {content}
                    </a>
                  );
                }
                return <div key={guide.id}>{content}</div>;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
