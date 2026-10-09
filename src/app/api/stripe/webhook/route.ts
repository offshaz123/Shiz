import { getCheckoutSession, verifyWebhook } from "@/lib/stripe";
import { markExpired, markPaid } from "@/lib/orders";
import { isDbConfigured } from "@/lib/db";

// Stripe calls this when a payment goes through (or a checkout expires).
// Set it up in Stripe: Developers → Webhooks → Add endpoint →
// https://YOUR-SITE/api/stripe/webhook with the events
// checkout.session.completed, checkout.session.async_payment_succeeded and
// checkout.session.expired. Put its signing secret in STRIPE_WEBHOOK_SECRET.
export async function POST(req: Request) {
  const payload = await req.text();
  if (!verifyWebhook(payload, req.headers.get("stripe-signature"), process.env.STRIPE_WEBHOOK_SECRET ?? "")) {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }
  if (!isDbConfigured()) return Response.json({ received: true });

  const event = JSON.parse(payload) as { type: string; data: { object: { id: string; metadata?: { order_ref?: string } } } };
  const session = event.data.object;
  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      // Re-read the session from Stripe so we get the card details and the
      // definite payment status rather than trusting the event body alone.
      await markPaid(await getCheckoutSession(session.id));
    } else if (event.type === "checkout.session.expired" && session.metadata?.order_ref) {
      await markExpired(session.metadata.order_ref);
    }
  } catch (err) {
    console.error("Stripe webhook failed", err);
    // A 500 makes Stripe retry later.
    return Response.json({ error: "Webhook handling failed" }, { status: 500 });
  }
  return Response.json({ received: true });
}
