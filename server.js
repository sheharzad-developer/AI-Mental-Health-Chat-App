/**
 * Express backend for Stripe subscription payments.
 *
 * Endpoints:
 *   GET  /health                   → liveness check
 *   POST /create-checkout-session  → start a Stripe Checkout (subscription)
 *   POST /webhook                  → receive Stripe events (checkout.session.completed)
 *
 * Run:
 *   npm run stripe-server
 */

const express = require("express");
const Stripe = require("stripe");

// ---------- Config ----------
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const SUCCESS_URL = process.env.STRIPE_SUCCESS_URL || "http://localhost:3000/success";
const CANCEL_URL = process.env.STRIPE_CANCEL_URL || "http://localhost:3000/cancel";
const PORT = Number(process.env.STRIPE_SERVER_PORT || 4242);

if (!STRIPE_SECRET_KEY) {
  console.error("Missing STRIPE_SECRET_KEY. Set it in your .env file.");
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY);
const app = express();

// ---------- Mock "database" ----------
// Pretend store of premium users. In real apps, persist to your DB.
function markUserAsPremium(customerEmail, sessionId) {
  console.log(`[premium] ✅ User upgraded → ${customerEmail} (session: ${sessionId})`);
}

// ---------- Webhook (must be registered BEFORE express.json) ----------
// Stripe needs the raw request body to verify the signature.
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const signature = req.headers["stripe-signature"];
    let event;

    try {
      if (STRIPE_WEBHOOK_SECRET) {
        event = stripe.webhooks.constructEvent(req.body, signature, STRIPE_WEBHOOK_SECRET);
      } else {
        // Fallback for local dev without a webhook secret — DO NOT use in production.
        event = JSON.parse(req.body.toString());
        console.warn("[webhook] ⚠️  STRIPE_WEBHOOK_SECRET not set — signature not verified.");
      }
    } catch (error) {
      console.error("[webhook] Signature verification failed:", error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const email = session.customer_details?.email || session.customer_email || "unknown";
      markUserAsPremium(email, session.id);
    } else {
      console.log(`[webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  }
);

// ---------- JSON body parser for the rest of the app ----------
app.use(express.json());

// ---------- Health check ----------
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// ---------- Create Checkout Session ----------
app.post("/create-checkout-session", async (req, res) => {
  try {
    const priceId = req.body?.priceId || STRIPE_PRICE_ID;

    if (!priceId) {
      return res.status(400).json({
        error: "Missing price ID. Set STRIPE_PRICE_ID in .env or pass priceId in the body.",
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: SUCCESS_URL,
      cancel_url: CANCEL_URL,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("[checkout] Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ---------- Start server ----------
app.listen(PORT, () => {
  console.log(`Stripe server running → http://localhost:${PORT}`);
});
