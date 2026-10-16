import { isDbConfigured } from "@/lib/db";
import { logOrderEvent } from "@/lib/email-log";
import { checkoutLines, claimFreeDelivery, getOrder, resumeTokenMatches, setStatus, setStripeSession } from "@/lib/orders";
import { clientIp, rateLimited } from "@/lib/places";
import { createCheckoutSession, isStripeConfigured, requestBaseUrl } from "@/lib/stripe";

const cleanRef = (v: unknown) => (typeof v === "string" ? v : "").replace(/[^A-Z0-9-]/gi, "").slice(0, 20);
const cleanToken = (v: unknown) => (typeof v === "string" ? v : "").slice(0, 64);

// Links in reminder emails sent before the "complete your order" page existed.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const ref = cleanRef(url.searchParams.get("ref"));
  const token = cleanToken(url.searchParams.get("t"));
  return Response.redirect(`${requestBaseUrl(req)}/complete-order?ref=${encodeURIComponent(ref)}&t=${encodeURIComponent(token)}`, 303);
}

// From the "complete your order" page: "seen" records that they came back
// (counted on Insights); otherwise the Pay button opens a fresh Stripe payment
// for the order they left, with the same discount and any free delivery.
export async function POST(req: Request) {
  const base = requestBaseUrl(req);
  const to = (path: string) => Response.redirect(`${base}${path}`, 303);
  if (rateLimited(`resume:${clientIp(req)}`, 20)) return to("/basket");
  const form = await req.formData().catch(() => null);
  const ref = cleanRef(form?.get("ref"));
  const token = cleanToken(form?.get("t"));
  const seen = form?.get("seen") === "1";
  if (!ref || !token || !isDbConfigured()) return seen ? new Response(null, { status: 204 }) : to("/basket");
  try {
    const saved = await getOrder(ref);
    if (!saved || !(await resumeTokenMatches(ref, token))) return seen ? new Response(null, { status: 204 }) : to("/basket");
    if (seen) {
      await logOrderEvent(saved.ref, "resumed");
      return new Response(null, { status: 204 });
    }
    // Already paid (e.g. they clicked twice): show their order.
    if (["paid", "in_production", "dispatched"].includes(saved.status)) return to(`/order-confirmed?ref=${saved.ref}`);
    if ((saved.status !== "expired" && saved.status !== "pending") || !isStripeConfigured()) return to("/design");
    const { order } = await claimFreeDelivery(saved);
    const session = await createCheckoutSession({
      ref: order.ref,
      email: order.email,
      lines: checkoutLines(order),
      baseUrl: base,
      ...(order.discount > 0 && { discount: { amount: order.discount, code: order.discount_code ?? "Discount" } }),
    });
    await setStripeSession(order.ref, session.id);
    await setStatus(order.ref, "pending");
    return Response.redirect(session.url, 303);
  } catch (err) {
    console.error(`Resuming order ${ref} failed`, err);
    return to("/basket");
  }
}
