import Stripe from "stripe";

let stripe: Stripe | null = null;

/**
 * Stripe client for Next.js Route Handlers (same role as `new Stripe(process.env.STRIPE_SECRET_KEY)` in Express).
 */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!stripe) {
    stripe = new Stripe(key);
  }
  return stripe;
}
