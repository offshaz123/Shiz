import { isDbConfigured } from "@/lib/db";
import { applyFreeDeliveryOffer, checkoutLines, getOrder, resumeTokenMatches, setStatus, setStripeSession } from "@/lib/orders";
import { logOrderEvent } from "@/lib/email-log";
import { clientIp, rateLimited } from "@/lib/places";
import { createCheckoutSession, isStripeConfigured, requestBaseUrl } from "@/lib/stripe";

// The "Complete my order" button in the checkout reminder email: opens a
// fresh Stripe payment for the order they left, with the same price and
// discount, and free delivery if it's within 24 hours of the email.
export async function GET(req: Request) {
  const base = requestBaseUrl(req);
  const to = (path: string) => Response.redirect(`${base}${path}`, 303);
  if (rateLimited(`resume:${clientIp(req)}`, 20)) return to("/basket");
  const url = new URL(req.url);
  const ref = (url.searchParams.get("ref") ?? "").replace(/[^A-Z0-9-]/gi, "").slice(0, 20);
  const token = (url.searchParams.get("t") ?? "").slice(0, 64);
  if (!ref || !token || !isDbConfigured() || !isStripeConfigured()) return to("/basket");
  try {
    const saved = await getOrder(ref);
    if (!saved || !(await resumeTokenMatches(ref, token))) return to("/basket");
    // Already paid (e.g. they clicked twice): show their order.
    if (["paid", "in_production", "dispatched"].includes(saved.status)) return to(`/order-confirmed?ref=${saved.ref}`);
    if (saved.status !== "expired" && saved.status !== "pending") return to("/design");
    // Counted on the Insights page: who came back through the email.
    await logOrderEvent(saved.ref, "resumed");
    // Within 24 hours of the reminder email, delivery is free.
    const order = await applyFreeDeliveryOffer(saved);
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
