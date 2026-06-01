import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

const PRICE_MAP: Record<string, string | undefined> = {
  creator_monthly: process.env.STRIPE_PRICE_CREATOR_MONTHLY,
  creator_yearly:  process.env.STRIPE_PRICE_CREATOR_YEARLY,
  pro_monthly:     process.env.STRIPE_PRICE_PRO_MONTHLY,
  pro_yearly:      process.env.STRIPE_PRICE_PRO_YEARLY,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { planCode } = req.body as { planCode: string };
  const priceId = PRICE_MAP[planCode];

  if (!priceId) return res.status(400).json({ error: "Plan invalide" });

  const appUrl = process.env.VITE_APP_URL || "https://cordeslab.cordesetmuseaux.fr";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/offers`,
      metadata: { planCode },
    });

    res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: err.message });
  }
}
