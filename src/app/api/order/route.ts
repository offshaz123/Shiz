import { describe, delivery, money, sanitiseItem, unitPrice } from "@/lib/plates";
import { field, orderRef, readUploads, sendToShop } from "@/lib/mail";
import { site } from "@/lib/site";

// Creates a Stripe Checkout session with the REST API, so we don't need the SDK.
async function createStripeSession(opts: {
  ref: string;
  email: string;
  docsLater: boolean;
  lines: { name: string; amount: number; qty: number }[];
}) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  const body = new URLSearchParams({
    mode: "payment",
    customer_email: opts.email,
    client_reference_id: opts.ref,
    "metadata[order_ref]": opts.ref,
    success_url: `${site.url}/order-confirmed?ref=${opts.ref}&paid=1${opts.docsLater ? "&docs=later" : ""}`,
    cancel_url: `${site.url}/checkout`,
  });
  opts.lines.forEach((l, i) => {
    body.set(`line_items[${i}][quantity]`, String(l.qty));
    body.set(`line_items[${i}][price_data][currency]`, "gbp");
    body.set(`line_items[${i}][price_data][unit_amount]`, String(l.amount));
    body.set(`line_items[${i}][price_data][product_data][name]`, l.name.slice(0, 250));
  });
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? "Stripe error");
  return data.url as string;
}

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Your order could not be read. Please try again." }, { status: 400 });
  }

  const customer = {
    name: field(form, "name"),
    email: field(form, "email"),
    phone: field(form, "phone", 40),
    address1: field(form, "address1"),
    address2: field(form, "address2"),
    town: field(form, "town", 80),
    postcode: field(form, "postcode", 12).toUpperCase(),
  };
  if (!customer.name || !/^\S+@\S+\.\S+$/.test(customer.email) || !customer.phone)
    return Response.json({ error: "Please fill in your name, email and phone number." }, { status: 400 });
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

  const ref = orderRef();
  const subtotal = plates.reduce((n, i) => n + unitPrice(i) * i.qty, 0);
  const total = subtotal + option.price;
  const paying = Boolean(process.env.STRIPE_SECRET_KEY);

  const text = [
    `New order ${ref}`,
    paying ? "Payment: sent to Stripe checkout. Check Stripe shows it as paid before making." : "Payment: NOT taken online. Send the customer a payment link.",
    !needsDocs
      ? "Documents: not needed (show plates only). Plates must NOT carry BS AU 145e marking."
      : docsLater || uploads.attachments.length < 2
        ? "DOCUMENTS OUTSTANDING: do not make road-legal plates until the customer uploads them."
        : "Documents: attached. Check them before making.",
    "",
    "PLATES",
    ...plates.map(
      (i) => `- ${i.reg} × ${i.qty}: ${describe(i)} (${money(unitPrice(i) * i.qty)})`,
    ),
    "",
    `Delivery: ${option.name} (${option.price ? money(option.price) : "FREE"})`,
    `TOTAL: ${money(total)}`,
    "",
    "CUSTOMER",
    customer.name,
    customer.email,
    customer.phone,
    customer.address1,
    customer.address2,
    `${customer.town} ${customer.postcode}`,
  ]
    .filter((l) => l !== "")
    .join("\n");

  try {
    await sendToShop({
      subject: `New order ${ref}: ${plates.map((i) => i.reg).join(", ")} (${money(total)})`,
      text,
      replyTo: customer.email,
      attachments: uploads.attachments,
    });
  } catch (err) {
    console.error("Order email failed", err);
    return Response.json(
      { error: `We couldn't place your order. Please call us on ${site.phone}.` },
      { status: 500 },
    );
  }

  try {
    const lines = plates.map((i) => ({
      name: `${i.reg}: ${describe(i)}`,
      amount: unitPrice(i),
      qty: i.qty,
    }));
    if (option.price) lines.push({ name: option.name, amount: option.price, qty: 1 });
    const paymentUrl = await createStripeSession({ ref, email: customer.email, docsLater: needsDocs && uploads.attachments.length < 2, lines });
    return Response.json({ ref, paymentUrl });
  } catch (err) {
    console.error("Stripe session failed", err);
    // The order is already with the shop, so don't lose it: confirm it and
    // let the shop send a payment link.
    return Response.json({ ref, paymentUrl: null });
  }
}
