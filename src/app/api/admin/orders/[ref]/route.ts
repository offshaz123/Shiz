import { isAdmin } from "@/lib/auth";
import { type OrderStatus, getOrder, sendDispatchEmail, sendOrderEmails, setStatus, statusLabels } from "@/lib/orders";

const allowed: OrderStatus[] = ["paid", "in_production", "dispatched", "cancelled", "unpaid"];

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
  if (body.action === "resend-dispatch") {
    const sent = await sendDispatchEmail(order);
    return sent
      ? Response.json({ message: `Dispatch email sent again to ${order.email}` })
      : Response.json({ error: "The dispatch email couldn't be sent. Check the email settings." }, { status: 502 });
  }
  const status = body.status as OrderStatus;
  if (!allowed.includes(status)) return Response.json({ error: "Unknown status" }, { status: 400 });
  await setStatus(ref, status);
  const marked = `Order marked as ${statusLabels[status].toLowerCase()}`;
  // Let the customer know their plates are on the way (only the first time).
  if (status === "dispatched" && order.status !== "dispatched") {
    const sent = await sendDispatchEmail({ ...order, status });
    return Response.json({
      message: sent ? `${marked} · dispatch email sent to ${order.email}` : `${marked}, but the dispatch email couldn't be sent`,
    });
  }
  return Response.json({ message: marked });
}
