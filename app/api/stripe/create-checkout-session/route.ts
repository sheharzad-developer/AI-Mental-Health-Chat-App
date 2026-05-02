import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * POST /api/stripe/create-checkout-session
 * Body: { priceId: string, successUrl: string, cancelUrl: string, mode?: "subscription" | "payment" }
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { priceId, successUrl, cancelUrl, mode } = body as {
    priceId?: string;
    successUrl?: string;
    cancelUrl?: string;
    mode?: "subscription" | "payment";
  };

  if (!priceId || !successUrl || !cancelUrl) {
    return NextResponse.json(
      { error: "priceId, successUrl, and cancelUrl are required" },
      { status: 400 },
    );
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: mode ?? "subscription",
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
