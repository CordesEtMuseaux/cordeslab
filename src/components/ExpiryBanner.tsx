import React from "react";
import type { UserAccess } from "../shared/types";
import { getDaysLeft, shouldShowExpiryBanner } from "../utils/accessControl";

type Props = {
  access: UserAccess;
  onUpgrade: () => void;
  thresholdDays?: number; // default 7
};

export function ExpiryBanner({ access, onUpgrade, thresholdDays = 7 }: Props) {
  if (!shouldShowExpiryBanner(access, thresholdDays)) return null;

  const daysLeft = getDaysLeft(access.expirationDate);

  const label = access.level === "atelier" ? "Atelier" : access.level === "creator" ? "Creator" : "Pro";
  const dayWord = daysLeft <= 1 ? "jour" : "jours";

  return (
    <div
      className="card"
      style={{
        border: "1px solid rgba(0,0,0,.10)",
        background: "rgba(0,0,0,.03)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div>
        <div style={{ fontWeight: 800 }}>
          Accès {label} — expire dans {daysLeft} {dayWord}
        </div>
        <div className="muted" style={{ marginTop: 4 }}>
          Passez à Creator pour continuer sans interruption.
        </div>
      </div>

      <button className="btn primary" type="button" onClick={onUpgrade}>
        Passer à Creator
      </button>
    </div>
  );
}