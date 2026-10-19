import { checkAdminLogin, failDelay, isAdmin } from "@/lib/auth";
import { type OrderStatus, getOrder, markDelivered, markPaid, sendDocsEmail, sendOrderEmails, sendStatusEmail, setDocsStatus, setStatus, setTracking, statusLabels } from "@/lib/orders";
import { cleanTrackingNumber, isCarrier } from "@/lib/tracking";
import { getCheckoutSession, refundCheckout } from "@/lib/stripe";
import { courierTracking, isPacklinkRef, sendToPacklink } from "@/lib/packlink";

const allowed: OrderStatus[] = ["paid", "in_production", "dispatched", "cancelled", "unpaid"];
// Moving an order to one of these emails the customer.
const emailed = ["dispatched", "cancelled", "refunded"] as const;
type Emailed = (typeof emailed)[number];
const isEmailed = (s: string): s is Emailed => (emailed as readonly string[]).includes(s);
const emailName: Record<Emailed, string> = { dispatched: "Dispatch", cancelled: "Cancellation", refunded: "Cancellation" };
const REFUNDABLE: OrderStatus[] = ["paid", "in_production", "dispatched"];

export async function POST(req: Request, ctx: RouteContext<"/api/admin/orders/[ref]">) {
  if (!(await isAdmin())) return Response.json({ error: "Please log in again." }, { status: 401 });
  const { ref } = await ctx.params;
  const order = await getOrder(ref);
  if (!order) return Response.json({ error: "Order not found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  // A Packlink shipment number typed in as the tracking number is swapped for the courier's own.
  let packlinkNote = "";
  const typed = cleanTrackingNumber(body.tracking);
  if (isPacklinkRef(typed)) {
    const found = await courierTracking(typed);
    if (found) {
      body.tracking = found.number;
      if (found.carrier) body.carrier = found.carrier;
      packlinkNote = ` · swapped Packlink's reference for the courier tracking number ${found.number}`;
    } else {
      packlinkNote = " · that looks like Packlink's reference, not the courier's tracking number. We'll swap it automatically once Packlink has it";
    }
  }

  if (body.action === "docs-approve") {
    await setDocsStatus(order, "approved");
    return Response.json({ message: "Documents marked as checked ✓" });
  }
  if (body.action === "delivered") {
    if (order.status !== "dispatched") return Response.json({ error: "Only dispatched orders can be delivered." }, { status: 400 });
    await markDelivered(order);
    return Response.json({ message: "Marked as delivered" });
  }
  if (body.action === "docs-remind") {
    const sent = await sendDocsEmail(order, "docs_reminder");
    return sent ? Response.json({ message: `Reminder emailed to ${order.email}` }) : Response.json({ error: "The email didn't send. WhatsApp the customer instead." }, { status: 502 });
  }
  if (body.action === "docs-retake") {
    const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 400) : "";
    if (!reason) return Response.json({ error: "Choose or type the reason first." }, { status: 400 });
    await setDocsStatus(order, "outstanding");
    const sent = await sendDocsEmail({ ...order, docs_status: "outstanding" }, "docs_retake", reason);
    return sent
      ? Response.json({ message: `Asked ${order.email} for a new photo` })
      : Response.json({ error: "Marked as needing new documents, but the email didn't send. WhatsApp the customer instead." }, { status: 502 });
  }
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
  if (body.action === "refund") {
    // Money leaves the account, so the admin password is asked for again.
    const password = typeof body.password === "string" ? body.password : "";
    if (!password || !checkAdminLogin(process.env.ADMIN_EMAIL ?? "", password)) {
      await failDelay();
      return Response.json({ error: "That's not the admin password. Nothing has been refunded." }, { status: 403 });
    }
    if (!REFUNDABLE.includes(order.status) || !order.stripe_session_id)
      return Response.json({ error: "Only orders paid by card through the website can be refunded here." }, { status: 400 });
    let refund: Awaited<ReturnType<typeof refundCheckout>>;
    try {
      refund = await refundCheckout(order.stripe_session_id);
    } catch (err) {
      console.error(`Refund for ${ref} failed`, err);
      const reason = err instanceof Error ? err.message : "";
      return Response.json(
        { error: /already been refunded/i.test(reason) ? "Stripe says this payment has already been refunded." : `The refund didn't go through: ${reason || "Stripe couldn't be reached"}. Nothing has changed.` },
        { status: 502 },
      );
    }
    // The money has gone back. Record it; if that fails, say so plainly.
    const refunded = `Refunded £${(refund.amount / 100).toFixed(2)} to the customer's card`;
    try {
      await setStatus(ref, "refunded");
    } catch (err) {
      console.error(`Refund for ${ref} done but saving failed`, err);
      return Response.json(
        { error: `${refunded}, but the order couldn't be updated. Don't make or send it. Press the button again to finish (it won't refund twice).` },
        { status: 500 },
      );
    }
    const sent = await sendStatusEmail({ ...order, status: "refunded" }, "refunded");
    return Response.json({ message: `${refunded} · order cancelled${sent ? " · customer emailed" : ", but the email couldn't be sent"}` });
  }
  if (body.action === "tracking") {
    // Add or change the tracking number on a dispatched order.
    const number = cleanTrackingNumber(body.tracking) || null;
    const carrier = isCarrier(body.carrier) ? body.carrier : "royalmail";
    await setTracking(ref, number, carrier);
    if (!body.email || order.status !== "dispatched")
      return Response.json({ message: (number ? "Tracking number saved" : "Tracking number removed") + packlinkNote });
    const sent = await sendStatusEmail({ ...order, tracking_number: number, tracking_carrier: number ? carrier : null }, "dispatched");
    return sent
      ? Response.json({ message: `Tracking number saved · dispatch email sent again to ${order.email}${packlinkNote}` })
      : Response.json({ error: "Tracking number saved, but the email couldn't be sent." }, { status: 502 });
  }
  if (body.action === "packlink") {
    if (!REFUNDABLE.includes(order.status)) return Response.json({ error: "Only paid orders can be sent to Packlink." }, { status: 400 });
    const result = await sendToPacklink(order);
    return result.ok
      ? Response.json({ message: `Sent to Packlink (${result.reference}). Open Packlink to choose a courier.` })
      : Response.json({ error: result.error }, { status: 502 });
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
  // Dispatching can include the parcel's tracking number for the email.
  let updated = order;
  if (status === "dispatched" && cleanTrackingNumber(body.tracking)) {
    const number = cleanTrackingNumber(body.tracking);
    const carrier = isCarrier(body.carrier) ? body.carrier : "royalmail";
    await setTracking(ref, number, carrier);
    updated = { ...order, tracking_number: number, tracking_carrier: carrier };
  }
  await setStatus(ref, status);
  const marked = `Order marked as ${statusLabels[status].toLowerCase()}`;
  // Let the customer know (only the first time it changes to this status).
  if (isEmailed(status) && order.status !== status) {
    const sent = await sendStatusEmail({ ...updated, status }, status);
    return Response.json({
      message: (sent ? `${marked} · customer emailed at ${order.email}` : `${marked}, but the customer email couldn't be sent`) + packlinkNote,
    });
  }
  return Response.json({ message: marked });
}
