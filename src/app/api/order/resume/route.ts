import { isDbConfigured } from "@/lib/db";
import { checkoutLines, getOrder, resumeTokenMatches, setStatus, setStripeSession } from "@/lib/orders";
import { clientIp, rateLimited } from "@/lib/places";
import { createCheckoutSession, isStripeConfigured, requestBaseUrl } from "@/lib/stripe";

// The "Complete my order" button in the checkout reminder email: opens a
// fresh Stripe payment for the order they left, with the same price and discount.
export async function GET(req: Request) {
  const base = requestBaseUrl(req);
  const to = (path: string) => Response.redirect(`${base}${path}`, 303);
  if (rateLimited(`resume:${clientIp(req)}`, 20)) return to("/basket");
  const url = new URL(req.url);
  const ref = (url.searchParams.get("ref") ?? "").replace(/[^A-Z0-9-]/gi, "").slice(0, 20);
  const token = (url.searchParams.get("t") ?? "").slice(0, 64);
  if (!ref || !token || !isDbConfigured() || !isStripeConfigured()) return to("/basket");
  try {
    const order = await getOrder(ref);
    if (!order || !(await resumeTokenMatches(ref, token))) return to("/basket");
    // Already paid (e.g. they clicked twice): show their order.
    if (["paid", "in_production", "dispatched"].includes(order.status)) return to(`/order-confirmed?ref=${order.ref}`);
    if (order.status !== "expired" && order.status !== "pending") return to("/design");
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
