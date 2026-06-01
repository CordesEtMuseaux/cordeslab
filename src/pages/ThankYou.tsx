import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { activateCreatorAccess, activateProAccess, saveBillingMeta } from "../utils/userAccessStorage";

type ConfirmResponse = {
  success: boolean;
  access?: {
    level: "creator" | "pro";
    expirationDate: string;
    planCode: string;
    customerId?: string;
    subscriptionId?: string;
  };
};

export default function ThankYou() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading]   = useState(true);
  const [success, setSuccess]   = useState(false);
  const [planLevel, setPlanLevel] = useState<"creator" | "pro">("creator");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) { setLoading(false); return; }
    confirmUpgrade(sessionId);
  }, [searchParams]);

  async function confirmUpgrade(sessionId: string) {
    try {
      const response = await fetch("/api/confirm-upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const data: ConfirmResponse = await response.json();

      if (!response.ok || !data.success || !data.access) {
        throw new Error("Activation impossible");
      }

      const { level, expirationDate, planCode, customerId, subscriptionId } = data.access;

      if (level === "pro") {
        activateProAccess(expirationDate, planCode as any);
      } else {
        activateCreatorAccess(expirationDate, planCode as any);
      }

      if (customerId || subscriptionId) {
        saveBillingMeta({ customerId: customerId ?? null, subscriptionId: subscriptionId ?? null });
      }

      setPlanLevel(level);
      setSuccess(true);
    } catch (error) {
      console.error("Erreur activation abonnement :", error);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div style={wrapStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: "40px", textAlign: "center", marginBottom: "16px" }}>⏳</div>
        <h1 style={titleStyle}>Activation en cours…</h1>
        <p style={mutedStyle}>Vérification de votre paiement Stripe.</p>
      </div>
    </div>
  );

  if (!success) return (
    <div style={wrapStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: "40px", textAlign: "center", marginBottom: "16px" }}>❌</div>
        <h1 style={titleStyle}>Activation impossible</h1>
        <p style={mutedStyle}>Nous n'avons pas réussi à confirmer votre abonnement.</p>
        <Link to="/offers" style={btnStyle}>Retour aux abonnements</Link>
      </div>
    </div>
  );

  return (
    <div style={wrapStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: "40px", textAlign: "center", marginBottom: "16px" }}>🎉</div>
        <h1 style={{ ...titleStyle, color: "#006D6F" }}>
          Plan {planLevel === "pro" ? "Pro" : "Creator"} activé !
        </h1>
        <p style={mutedStyle}>
          Toutes vos fonctionnalités sont débloquées. Bonne création !
        </p>
        <Link to="/" style={btnStyle}>Accéder au Dashboard →</Link>
      </div>
    </div>
  );
}

const wrapStyle: React.CSSProperties = {
  minHeight: "100vh", background: "#EAE3D2",
  display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
};
const cardStyle: React.CSSProperties = {
  background: "#fff", borderRadius: "24px", padding: "40px 32px",
  maxWidth: "420px", width: "100%", textAlign: "center",
  boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
};
const titleStyle: React.CSSProperties = {
  fontSize: "22px", fontWeight: 900, marginBottom: "12px", color: "#1A1A1A",
};
const mutedStyle: React.CSSProperties = {
  fontSize: "14px", color: "#666", lineHeight: 1.6, marginBottom: "24px",
};
const btnStyle: React.CSSProperties = {
  display: "inline-block", padding: "14px 28px", borderRadius: "14px",
  background: "#006D6F", color: "#fff", fontWeight: 800,
  fontSize: "14px", textDecoration: "none",
};
