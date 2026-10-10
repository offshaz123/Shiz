import { isAdmin } from "@/lib/auth";
import { type OrderStatus, getOrder, markPaid, sendOrderEmails, sendStatusEmail, setStatus, statusLabels } from "@/lib/orders";
import { getCheckoutSession } from "@/lib/stripe";

const allowed: OrderStatus[] = ["paid", "in_production", "dispatched", "cancelled", "unpaid"];
// Moving an order to one of these emails the customer.
const emailed = ["dispatched", "cancelled"] as const;
type Emailed = (typeof emailed)[number];
const isEmailed = (s: string): s is Emailed => (emailed as readonly string[]).includes(s);
const emailName: Record<Emailed, string> = { dispatched: "Dispatch", cancelled: "Cancellation" };

export async function POST(req: Request, ctx: RouteContext<"/api/admin/orders/[ref]">) {
  if (!(await isAdmin())) return Response.json({ error: "Please log in again." }, { status: 401 });
  const { ref } = await ctx.params;
  const order = await getOrder(ref);
  if (!order) return Response.json({ error: "Order not found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));

  if (body.action === "resend") {
    await sendOrderEmails(order);
    return Response.json({ message: "Emails sent again" });
  }
  if (body.action === "check-payment") {
    // Asks Stripe directly, for when its "payment received" message didn't arrive.
    if (!order.stripe_session_id) return Response.json({ error: "This order never went to Stripe checkout." }, { status: 400 });
    try {
      const session = await getCheckoutSession(order.stripe_session_id);
      if (!session.paid) return Response.json({ message: "Stripe says this order hasn't been paid yet." });
      const updated = await markPaid(session);
      return Response.json({
        message:
          updated && order.status !== updated.status
            ? "Payment confirmed by Stripe · order marked paid and emails sent"
            : "Stripe confirms this order is paid",
      });
    } catch (err) {
      console.error(`Checking payment for ${ref} failed`, err);
      return Response.json({ error: "Couldn't reach Stripe. Please try again in a minute." }, { status: 502 });
    }
  }
  if (body.action === "resend-status") {
    if (!isEmailed(order.status)) return Response.json({ error: "There's no email for this status" }, { status: 400 });
    const sent = await sendStatusEmail(order, order.status);
    return sent
      ? Response.json({ message: `${emailName[order.status]} email sent again to ${order.email}` })
      : Response.json({ error: "The email couldn't be sent. Check the email settings." }, { status: 502 });
  }
  const status = body.status as OrderStatus;
  if (!allowed.includes(status)) return Response.json({ error: "Unknown status" }, { status: 400 });
  await setStatus(ref, status);
  const marked = `Order marked as ${statusLabels[status].toLowerCase()}`;
  // Let the customer know (only the first time it changes to this status).
  if (isEmailed(status) && order.status !== status) {
    const sent = await sendStatusEmail({ ...order, status }, status);
    return Response.json({
      message: sent ? `${marked} · customer emailed at ${order.email}` : `${marked}, but the customer email couldn't be sent`,
    });
  }
  return Response.json({ message: marked });
}
