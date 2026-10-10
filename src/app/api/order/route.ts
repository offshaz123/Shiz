import type { Attachment } from "nodemailer/lib/mailer";
import { describe, delivery, deliveryPrice, money, sanitiseItem, unitPrice } from "@/lib/plates";
import { field, orderRef, readUploads, sendToShop } from "@/lib/mail";
import { site } from "@/lib/site";
import { isDbConfigured } from "@/lib/db";
import { getCurrentUser, isValidPhone } from "@/lib/auth";
import { createCheckoutSession, isStripeConfigured, requestBaseUrl } from "@/lib/stripe";
import { createOrder, getOrder, saveDocuments, sendOrderEmails, setStatus, setStripeSession } from "@/lib/orders";

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Your order could not be read. Please try again." }, { status: 400 });
  }

  const customer = {
    name: field(form, "name"),
    email: field(form, "email").toLowerCase(),
    phone: field(form, "phone", 40),
    address1: field(form, "address1"),
    address2: field(form, "address2"),
    town: field(form, "town", 80),
    postcode: field(form, "postcode", 12).toUpperCase(),
  };
  if (!customer.name || !/^\S+@\S+\.\S+$/.test(customer.email) || !customer.phone)
    return Response.json({ error: "Please fill in your name, email and phone number." }, { status: 400 });
  if (!isValidPhone(customer.phone))
    return Response.json({ error: "Please enter a valid UK phone number, e.g. 07123 456789." }, { status: 400 });
  if (!customer.address1 || !customer.town || !customer.postcode)
    return Response.json({ error: "Please fill in your delivery address." }, { status: 400 });
  if (!form.get("entitled"))
    return Response.json({ error: "Please tick the box to confirm your order." }, { status: 400 });

  let rawItems: unknown;
  try {
    rawItems = JSON.parse(field(form, "items", 20000));
  } catch {
    rawItems = null;
  }
  const items = Array.isArray(rawItems) ? rawItems.slice(0, 20).map(sanitiseItem) : [];
  if (items.length === 0 || items.some((i) => i === null))
    return Response.json({ error: "Something in your basket isn't valid. Please check your plates." }, { status: 400 });
  const plates = items.filter((i) => i !== null);

  const option = delivery.find((d) => d.id === field(form, "delivery")) ?? delivery[0];
  // Show plates don't need documents; anything road legal does.
  const needsDocs = plates.some((i) => i.type !== "show");
  const docsLater = !needsDocs || Boolean(form.get("docsLater"));
  const uploads = await readUploads(form, [
    { name: "entitlement", label: "proof of entitlement", required: !docsLater },
    { name: "identity", label: "ID", required: !docsLater },
  ]);
  if ("error" in uploads) return Response.json({ error: uploads.error }, { status: 400 });
  const hasDocs = uploads.attachments.length >= 2;

  const subtotal = plates.reduce((n, i) => n + unitPrice(i) * i.qty, 0);
  const shipping = deliveryPrice(option.id, subtotal);
  const total = subtotal + shipping;
  const lines = plates.map((i) => ({ name: `${i.reg}: ${describe(i)}`, amount: unitPrice(i), qty: i.qty }));
  if (shipping) lines.push({ name: option.name, amount: shipping, qty: 1 });
  const baseUrl = requestBaseUrl(req);

  if (!isDbConfigured()) return legacyOrder({ customer, plates, option, total, needsDocs, hasDocs, uploads: uploads.attachments, lines, baseUrl });

  // Save the order first. Nothing is emailed until Stripe confirms payment
  // (see /api/stripe/webhook and the thank-you page).
  const paying = isStripeConfigured();
  let ref = orderRef();
  for (let tries = 0; await getOrder(ref); tries++) {
    if (tries > 5) throw new Error("Could not create an order number");
    ref = orderRef();
  }
  const user = await getCurrentUser();
  let orderId: number;
  try {
    orderId = await createOrder({
      ref,
      user_id: user?.id ?? null,
      status: paying ? "pending" : "unpaid",
      customer_name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address1: customer.address1,
      address2: customer.address2,
      town: customer.town,
      postcode: customer.postcode,
      items: plates,
      delivery_name: option.name,
      delivery_price: shipping,
      subtotal,
      total,
      docs_status: !needsDocs ? "not_needed" : hasDocs ? "received" : "outstanding",
    });
    if (uploads.attachments.length) await saveDocuments(orderId, uploads.attachments, ["entitlement", "identity"]);
  } catch (err) {
    console.error("Saving order failed", err);
    return Response.json(
      { error: `We couldn't place your order. Please message us on WhatsApp or email ${site.email}.` },
      { status: 500 },
    );
  }

  if (paying) {
    try {
      const session = await createCheckoutSession({ ref, email: customer.email, lines, baseUrl });
      await setStripeSession(ref, session.id);
      return Response.json({ ref, paymentUrl: session.url });
    } catch (err) {
      console.error("Stripe session failed", err);
      // Don't lose the order: keep it as unpaid and let the shop send a payment link.
      await setStatus(ref, "unpaid");
    }
  }

  const order = await getOrder(ref);
  if (order) await sendOrderEmails(order);
  return Response.json({ ref, paymentUrl: null });
}

// Before a database is set up: email the order straight to the shop, then
// send the customer to Stripe.
async function legacyOrder(o: {
  customer: { name: string; email: string; phone: string; address1: string; address2: string; town: string; postcode: string };
  plates: NonNullable<ReturnType<typeof sanitiseItem>>[];
  option: (typeof delivery)[number];
  total: number;
  needsDocs: boolean;
  hasDocs: boolean;
  uploads: Attachment[];
  lines: { name: string; amount: number; qty: number }[];
  baseUrl: string;
}) {
  const ref = orderRef();
  const c = o.customer;
  const text = [
    `New order ${ref}`,
    isStripeConfigured() ? "Payment: sent to Stripe checkout. Check Stripe shows it as paid before making." : "Payment: NOT taken online. Send the customer a payment link.",
    !o.needsDocs
      ? "Documents: not needed (show plates only)."
      : o.hasDocs
        ? "Documents: attached. Check them before making."
        : "DOCUMENTS OUTSTANDING: do not make road-legal plates until the customer uploads them.",
    "",
    ...o.plates.map((i) => `- "${i.reg}" × ${i.qty}: ${describe(i)} (${money(unitPrice(i) * i.qty)})`),
    `Delivery: ${o.option.name}`,
    `TOTAL: ${money(o.total)}`,
    "",
    c.name, c.email, c.phone, c.address1, c.address2, `${c.town} ${c.postcode}`,
  ].join("\n");
  try {
    await sendToShop({ subject: `New order ${ref} (${money(o.total)})`, text, replyTo: c.email, attachments: o.uploads });
  } catch (err) {
    console.error("Order email failed", err);
    return Response.json({ error: `We couldn't place your order. Please message us on WhatsApp or email ${site.email}.` }, { status: 500 });
  }
  if (!isStripeConfigured()) return Response.json({ ref, paymentUrl: null });
  try {
    const session = await createCheckoutSession({ ref, email: c.email, lines: o.lines, baseUrl: o.baseUrl });
    return Response.json({ ref, paymentUrl: session.url });
  } catch (err) {
    console.error("Stripe session failed", err);
    return Response.json({ ref, paymentUrl: null });
  }
}
