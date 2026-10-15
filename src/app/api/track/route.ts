import { isDbConfigured } from "@/lib/db";
import { listOrderEvents } from "@/lib/email-log";
import { getOrder } from "@/lib/orders";
import { clientIp, rateLimited } from "@/lib/places";
import { describe } from "@/lib/plates";
import { failDelay } from "@/lib/auth";
import { trackingLink } from "@/lib/tracking";
import { syncTrackingFromPacklink } from "@/lib/packlink";

// "Track my order": a customer looks up their order with its number and the
// email it was placed with. Only shows progress, never the address or payment.
export async function POST(req: Request) {
  if (rateLimited(`track:${clientIp(req)}`, 10))
    return Response.json({ error: "Too many attempts. Please wait a minute and try again." }, { status: 429 });
  if (!isDbConfigured()) return Response.json({ error: "Order tracking isn't available right now." }, { status: 503 });
  const b = await req.json().catch(() => ({}));
  const ref = String(b.ref ?? "").toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 20);
  const email = String(b.email ?? "").trim().toLowerCase().slice(0, 190);
  if (!ref || !email) return Response.json({ error: "Please enter your order number and email." }, { status: 400 });
  const notFound = async () => {
    await failDelay();
    return Response.json({ error: "We couldn't find an order with that number and email. Check both match your order confirmation email." }, { status: 404 });
  };
  try {
    const found = await getOrder(ref.startsWith("PU-") ? ref : `PU-${ref}`);
    if (!found || found.email.toLowerCase() !== email) return notFound();
    const order = await syncTrackingFromPacklink(found);
    const events = await listOrderEvents(order.id);
    const at = (e: string) => [...events].reverse().find((x) => x.event === e)?.created_at ?? null;
    return Response.json({
      ref: order.ref,
      status: order.status,
      placed: order.created_at,
      paid: order.paid_at,
      inProduction: at("in_production"),
      dispatched: at("dispatched"),
      delivery: order.delivery_name,
      docsOutstanding: order.docs_status === "outstanding",
      items: order.items.map((i) => ({ reg: i.reg, qty: i.qty, description: describe(i) })),
      tracking: trackingLink(order),
    });
  } catch (err) {
    console.error("Order lookup failed", err);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
