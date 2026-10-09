import { isAdmin } from "@/lib/auth";
import { type OrderStatus, getOrder, sendOrderEmails, setStatus, statusLabels } from "@/lib/orders";

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
  const status = body.status as OrderStatus;
  if (!allowed.includes(status)) return Response.json({ error: "Unknown status" }, { status: 400 });
  await setStatus(ref, status);
  return Response.json({ message: `Order marked as ${statusLabels[status].toLowerCase()}` });
}
