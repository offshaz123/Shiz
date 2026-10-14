import { isDbConfigured } from "@/lib/db";
import { failDelay } from "@/lib/auth";
import { field, readUploads, sendMail, sendToShop } from "@/lib/mail";
import { getOrder, statusLabels } from "@/lib/orders";
import { clientIp, rateLimited } from "@/lib/places";
import { describe, money } from "@/lib/plates";
import { refundReasons } from "@/lib/refunds";
import { site } from "@/lib/site";

// A customer asks for a refund. Nothing is refunded automatically: the
// request is emailed to the shop to look at, and the customer gets a copy.
export async function POST(req: Request) {
  if (rateLimited(`refund:${clientIp(req)}`, 5))
    return Response.json({ error: "Too many attempts. Please wait a minute and try again." }, { status: 429 });
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Your request could not be read. Please try again." }, { status: 400 });
  }
  const rawRef = field(form, "ref", 20).toUpperCase().replace(/[^A-Z0-9-]/g, "");
  const ref = rawRef && !rawRef.startsWith("PU-") ? `PU-${rawRef}` : rawRef;
  const email = field(form, "email", 190).toLowerCase();
  const name = field(form, "name", 120);
  const reason = field(form, "reason", 80);
  const message = field(form, "message", 5000);
  if (!ref || !/^\S+@\S+\.\S+$/.test(email) || !name || !message)
    return Response.json({ error: "Please fill in your order number, name, email and what happened." }, { status: 400 });
  if (!(refundReasons as readonly string[]).includes(reason))
    return Response.json({ error: "Please choose a reason." }, { status: 400 });

  const uploads = await readUploads(form, [
    { name: "photo1", label: "photo 1", required: false },
    { name: "photo2", label: "photo 2", required: false },
    { name: "photo3", label: "photo 3", required: false },
  ]);
  if ("error" in uploads) return Response.json({ error: uploads.error }, { status: 400 });

  // Check it's a real order placed with this email, so the shop isn't sent requests for orders that don't exist.
  let orderLines: string[] = [];
  if (isDbConfigured()) {
    try {
      const order = await getOrder(ref);
      if (!order || order.email.toLowerCase() !== email) {
        await failDelay();
        return Response.json(
          { error: "We couldn't find an order with that number and email. Check both match your order confirmation email." },
          { status: 404 },
        );
      }
      orderLines = [
        `Status: ${statusLabels[order.status]}`,
        `Paid: ${money(order.amount_paid ?? order.total)}`,
        `Placed: ${new Date(order.created_at).toLocaleString("en-GB", { timeZone: "Europe/London" })}`,
        ...order.items.map((i) => `- ${i.reg}${i.qty > 1 ? ` x${i.qty}` : ""}: ${describe(i)}`),
        `Admin: ${site.url}/admin/orders/${order.ref}`,
      ];
    } catch (err) {
      console.error("Refund request order lookup failed", err);
      return Response.json({ error: "Something went wrong. Please try again or message us on WhatsApp." }, { status: 500 });
    }
  }

  try {
    await sendToShop({
      subject: `REFUND REQUEST: ${ref} (${reason})`,
      text: [
        `${name} has asked for a refund. Nothing has been refunded yet: check the order and reply to the customer.`,
        "",
        `Order: ${ref}`,
        `Name: ${name}`,
        `Email: ${email}`,
        `Reason: ${reason}`,
        uploads.attachments.length ? `Photos: ${uploads.attachments.length} attached` : "Photos: none",
        "",
        "What they said:",
        message,
        ...(orderLines.length ? ["", "Order details:", ...orderLines] : []),
      ].join("\n"),
      replyTo: email,
      attachments: uploads.attachments,
    });
  } catch (err) {
    console.error("Refund request email failed", err);
    return Response.json({ error: "Your request couldn't be sent. Please message us on WhatsApp." }, { status: 500 });
  }

  // A copy for the customer. Their request is already with us, so a failure here isn't shown to them.
  try {
    await sendMail({
      to: email,
      subject: `We've received your refund request for ${ref}`,
      text: [
        `Hi ${name},`,
        "",
        `Thanks for getting in touch. We've received your refund request for order ${ref} and we'll look into it and reply by email, usually within 1 working day (${site.hours}).`,
        "",
        `Reason: ${reason}`,
        "",
        "If your plates arrived damaged or there's a mistake on them, please keep them until we've replied.",
        "",
        `You can also message us on WhatsApp: https://wa.me/${site.whatsapp}`,
        "",
        "PlatedUp",
      ].join("\n"),
      replyTo: process.env.ORDERS_EMAIL || site.email,
    });
  } catch (err) {
    console.error("Refund request copy to customer failed", err);
  }
  return Response.json({ ok: true, ref });
}
