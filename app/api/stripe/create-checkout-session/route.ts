import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * POST /api/stripe/create-checkout-session
 * Body (all optional — falls back to env vars / request origin):
 *   { priceId?: string, successUrl?: string, cancelUrl?: string, mode?: "subscription" | "payment" }
 */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    // empty body is fine — we'll use defaults
  }

  const origin = new URL(req.url).origin;
  const priceId = (body.priceId as string) || process.env.STRIPE_PRICE_ID;
  const successUrl = (body.successUrl as string) || `${origin}/success`;
  const cancelUrl = (body.cancelUrl as string) || `${origin}/cancel`;
  const mode = (body.mode as "subscription" | "payment") || "subscription";

  if (!priceId) {
    return NextResponse.json(
      { error: "Missing priceId. Set STRIPE_PRICE_ID in .env or pass priceId in body." },
      { status: 400 },
    );
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
