import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

import {
  activateCreatorAccess,
  activateProAccess,
  syncUserAccessFromServer,
} from "../utils/userAccessStorage";

type ConfirmResponse = {
  success: boolean;
  access?: {
    level: "creator" | "pro";
    expirationDate: string;
    customerId?: string;
    subscriptionId?: string;
  };
};

export default function ThankYou() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setLoading(false);
      return;
    }

    confirmUpgrade(sessionId);
  }, [searchParams]);

  async function confirmUpgrade(sessionId: string) {
    try {
      const userId = localStorage.getItem("userId") || "demo-user";

      const response = await fetch("http://127.0.0.1:4242/confirm-upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          userId,
        }),
      });

      const data: ConfirmResponse = await response.json();

      if (!response.ok || !data.success || !data.access) {
        throw new Error("Activation impossible");
      }

      const { level, expirationDate, customerId, subscriptionId } = data.access;

      if (level === "pro") {
        activateProAccess(expirationDate);
      } else {
        activateCreatorAccess(expirationDate);
      }

      if (customerId || subscriptionId) {
        localStorage.setItem(
          "cordeslab_billing_meta",
          JSON.stringify({
            customerId: customerId ?? null,
            subscriptionId: subscriptionId ?? null,
          })
        );
      }

      await syncUserAccessFromServer();
      setSuccess(true);
    } catch (error) {
      console.error("Erreur activation abonnement :", error);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboardWrap">
        <div className="card">
          <h1>Activation en cours...</h1>
          <div className="muted">Vérification de votre paiement Stripe.</div>
        </div>
      </div>
    );
  }

  if (!success) {
    return (
      <div className="dashboardWrap">
        <div className="card">
          <h1>Activation impossible</h1>

          <div className="muted" style={{ marginTop: 8 }}>
            Nous n’avons pas réussi à confirmer votre abonnement.
          </div>

          <div style={{ marginTop: 16 }}>
            <Link className="btn primary" to="/offres">
              Retour aux abonnements
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboardWrap">
      <div className="card">
        <h1>🎉 Abonnement activé</h1>

        <div className="muted" style={{ marginTop: 8 }}>
          Votre accès CordesLab est maintenant actif.
        </div>

        <div style={{ marginTop: 16 }}>
          <Link className="btn primary" to="/">
            Accéder au Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}