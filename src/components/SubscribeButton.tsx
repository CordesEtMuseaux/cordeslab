import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function SubscribeButton() {
  const handleSubscribe = async () => {
    const stripe = await stripePromise;

    if (!stripe) {
      alert("Stripe n'a pas pu être chargé.");
      return;
    }

    alert("La clé publique Stripe est bien chargée. Prochaine étape : relier un backend.");
  };

  return (
    <button onClick={handleSubscribe}>
      Passer Premium
    </button>
  );
}