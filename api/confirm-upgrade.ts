import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-05-28.basil",
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { sessionId } = req.body as { sessionId: string };
  if (!sessionId) return res.status(400).json({ error: "session_id manquant" });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (session.payment_status !== "paid") {
      return res.status(402).json({ success: false, error: "Paiement non confirmé" });
    }

    const planCode = (session.metadata?.planCode ?? "creator_monthly") as string;
    const level    = planCode.startsWith("pro") ? "pro" : "creator";

    const isYearly = planCode.includes("yearly") || planCode.includes("annual");
    const expiry   = new Date();
    if (isYearly) {
      expiry.setFullYear(expiry.getFullYear() + 1);
    } else {
      expiry.setMonth(expiry.getMonth() + 1);
    }

    const sub = session.subscription as Stripe.Subscription | null;

    res.status(200).json({
      success: true,
      access: {
        level,
        expirationDate: expiry.toISOString(),
        planCode,
        customerId:     (session.customer as string) ?? null,
        subscriptionId: sub?.id ?? null,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("confirm-upgrade error:", message);
    res.status(500).json({ success: false, error: message });
  }
}
