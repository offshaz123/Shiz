import { createHmac, timingSafeEqual } from "node:crypto";
import { site } from "./site";

// Talks to Stripe's REST API directly, so we don't need the SDK.

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

async function stripe(path: string, init?: { method?: string; body?: URLSearchParams; idempotencyKey?: string }) {
  // STRIPE_API_BASE is only for local testing against a fake Stripe.
  const res = await fetch(`${process.env.STRIPE_API_BASE ?? "https://api.stripe.com/v1"}/${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      ...(init?.body && { "Content-Type": "application/x-www-form-urlencoded" }),
      // Stops a double-click refunding twice: Stripe repeats the first answer.
      ...(init?.idempotencyKey && { "Idempotency-Key": init.idempotencyKey }),
    },
    body: init?.body,
    cache: "no-store",
    // Never leave a customer waiting on a slow connection to Stripe.
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? `Stripe error ${res.status}`);
  return data;
}

export async function createCheckoutSession(opts: {
  ref: string;
  email: string;
  lines: { name: string; amount: number; qty: number }[];
  // The website address the customer is using, so Stripe sends them back to
  // the same one (with or without www) after paying.
  baseUrl?: string;
}) {
  const base = opts.baseUrl ?? site.url;
  const body = new URLSearchParams({
    mode: "payment",
    customer_email: opts.email,
    client_reference_id: opts.ref,
    "metadata[order_ref]": opts.ref,
    "payment_intent_data[metadata][order_ref]": opts.ref,
    // Stripe fills in {CHECKOUT_SESSION_ID} so the thank-you page can check the payment.
    success_url: `${base}/order-confirmed?ref=${opts.ref}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/checkout`,
  });
  opts.lines.forEach((l, i) => {
    body.set(`line_items[${i}][quantity]`, String(l.qty));
    body.set(`line_items[${i}][price_data][currency]`, "gbp");
    body.set(`line_items[${i}][price_data][unit_amount]`, String(l.amount));
    body.set(`line_items[${i}][price_data][product_data][name]`, l.name.slice(0, 250));
  });
  const data = await stripe("checkout/sessions", { method: "POST", body });
  return { id: data.id as string, url: data.url as string };
}

export type PaidSession = {
  sessionId: string;
  ref: string;
  paid: boolean;
  amount: number;
  cardBrand: string | null;
  cardLast4: string | null;
};

// Reads a checkout session back from Stripe, including the card used.
export async function getCheckoutSession(id: string): Promise<PaidSession> {
  const data = await stripe(
    `checkout/sessions/${encodeURIComponent(id)}?expand[]=payment_intent.latest_charge`,
  );
  const card = data.payment_intent?.latest_charge?.payment_method_details?.card;
  return {
    sessionId: data.id,
    ref: data.metadata?.order_ref ?? data.client_reference_id ?? "",
    paid: data.payment_status === "paid",
    amount: data.amount_total ?? 0,
    cardBrand: card?.brand ?? null,
    cardLast4: card?.last4 ?? null,
  };
}

// Checks the Stripe-Signature header on a webhook so nobody can fake a
// "payment received" message. See Stripe's docs on verifying signatures.
export function verifyWebhook(payload: string, header: string | null, secret: string, toleranceSec = 300) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i), p.slice(i + 1)];
    }),
  );
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > toleranceSec) return false;
  // Several secrets can be given, comma separated: one per Stripe webhook
  // endpoint (e.g. one for platedup.co.uk and one for www.platedup.co.uk).
  const sigs = header
    .split(",")
    .filter((p) => p.startsWith("v1="))
    .map((p) => Buffer.from(p.slice(3), "hex"));
  return secret
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .some((s) => {
      const expected = createHmac("sha256", s).update(`${t}.${payload}`).digest();
      return sigs.some((sig) => sig.length === expected.length && timingSafeEqual(sig, expected));
    });
}

// The address (with or without www) a request came in on, if it's ours.
export function requestBaseUrl(req: Request) {
  const own = new URL(site.url).host.replace(/^www\./, "");
  const host = (req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "").split(",")[0].trim().toLowerCase();
  if (host !== own && host !== `www.${own}`) return site.url;
  return `https://${host}`;
}

// Refunds the full payment for a checkout session, back to the customer's card.
export async function refundCheckout(sessionId: string) {
  const session = await stripe(`checkout/sessions/${encodeURIComponent(sessionId)}`);
  const pi = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  if (!pi) throw new Error("There's no card payment on this order to refund.");
  const body = new URLSearchParams({ payment_intent: pi });
  if (session.metadata?.order_ref) body.set("metadata[order_ref]", session.metadata.order_ref);
  const refund = await stripe("refunds", { method: "POST", body, idempotencyKey: `refund-${sessionId}` });
  return { id: refund.id as string, amount: refund.amount as number, status: refund.status as string };
}
