import { stripeGet } from "./stripe";

// Money in and out of Stripe, explained for the admin Money page. Only reads:
// nothing here can move money.

export type FeePart = { amount: number; label: string };

export type Movement = {
  id: string;
  created: Date;
  // When it can be paid out to the bank.
  availableOn: Date;
  status: "pending" | "available";
  kind: "payment" | "refund" | "payout" | "fee" | "dispute" | "other";
  // Plain-English title, e.g. "Customer payment" or "Paid to your bank".
  title: string;
  // Why: the card or payment method, or what a charge from Stripe was for.
  why: string;
  orderRef: string | null;
  // Pence. Amount is before Stripe's fee; net is what it adds to (or takes off) your balance.
  amount: number;
  fee: number;
  net: number;
  feeParts: FeePart[];
  payoutId: string | null;
  chargeId: string;
};

export type Payout = { id: string; amount: number; arrival: Date; created: Date; status: string };

const COUNTRY: Record<string, string> = { GB: "UK", IE: "Irish", FR: "French", DE: "German", ES: "Spanish", IT: "Italian", NL: "Dutch", US: "US" };
const EEA = new Set("AT BE BG HR CY CZ DK EE FI FR DE GR HU IS IE IT LV LI LT LU MT NL NO PL PT RO SK SI ES SE CH".split(" "));
const brandName = (b: string) => ({ visa: "Visa", mastercard: "Mastercard", amex: "American Express" })[b] ?? (b ? b[0].toUpperCase() + b.slice(1) : "Card");

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === "object" ? (v as Obj) : {});
const str = (v: unknown) => (typeof v === "string" ? v : "");
const num = (v: unknown) => (typeof v === "number" ? v : 0);

// How the customer paid, and the usual Stripe price for it.
function paymentWhy(charge: Obj) {
  const pm = obj(charge.payment_method_details);
  const type = str(pm.type);
  if (type === "klarna") return "Paid with Klarna. Klarna payments cost more than cards (see Stripe → Settings → Pricing).";
  if (type === "link")
    return "Paid with Link, Stripe's one-click checkout using a card the customer saved with Stripe. Charged at the normal card rate (UK cards: 1.5% + 20p).";
  if (type === "paypal") return "Paid with PayPal (see Stripe → Settings → Pricing for the rate).";
  const card = obj(pm.card);
  const country = str(card.country);
  const name = `${COUNTRY[country] ?? (country ? `${country}` : "")} ${brandName(str(card.brand))}${card.last4 ? ` ending ${str(card.last4)}` : ""}`.trim();
  if (type === "card" || card.brand) {
    if (country === "GB") return `${name}. UK cards: 1.5% + 20p.`;
    if (EEA.has(country)) return `${name}. European cards: 2.5% + 20p.`;
    if (country) return `${name}. Cards from outside the UK and Europe: 3.25% + 20p (plus 2% if the currency is converted).`;
    return name;
  }
  return type ? `Paid by ${type.replace(/_/g, " ")}.` : "";
}

function toMovement(t: Obj): Movement {
  const type = str(t.type);
  const source = obj(t.source);
  // Our order number travels with the payment (set when the customer checks out).
  // A refund only names its payment; the order is matched up afterwards.
  const charge = str(source.object) === "charge" ? source : {};
  const chargeId = str(source.object) === "charge" ? str(source.id) : str(source.charge);
  const orderRef = str(obj(charge.metadata).order_ref) || null;
  const feeParts = (Array.isArray(t.fee_details) ? t.fee_details : []).map((f) => {
    const d = obj(f);
    const label =
      str(d.type) === "tax" ? "VAT on Stripe's fee" : str(d.type) === "stripe_fee" ? "Stripe's fee" : str(d.description) || "Fee";
    return { amount: num(d.amount), label };
  });
  let kind: Movement["kind"] = "other";
  let title = str(t.description) || type.replace(/_/g, " ");
  let why = "";
  if (type === "charge" || type === "payment") {
    kind = "payment";
    title = "Customer payment";
    why = paymentWhy(charge);
  } else if (type === "refund" || type === "payment_refund") {
    kind = "refund";
    title = "Refund to customer";
    why = "The full amount goes back to the customer. Stripe keeps the fee it took on the original payment.";
  } else if (type === "payout") {
    kind = "payout";
    title = "Paid to your bank";
    why = "Stripe sends your balance to your bank account.";
  } else if (type === "payout_failure" || type === "payout_cancel") {
    kind = "payout";
    title = "Payout returned";
    why = "A payout to your bank didn't go through, so the money came back to your Stripe balance. Check your bank details in Stripe.";
  } else if (type.startsWith("adjustment") || type.includes("dispute")) {
    kind = "dispute";
    title = str(t.description) || "Adjustment";
    why = "Usually a dispute (chargeback): a customer asked their bank to take the money back. Check Stripe → Disputes.";
  } else if (type === "stripe_fee" || type === "tax_fee" || type === "application_fee") {
    kind = "fee";
    title = str(t.description) || "Stripe charge";
    why = "A charge from Stripe itself, not tied to one order (for example a paid Stripe feature or VAT on Stripe's fees).";
  }
  const availableOn = new Date(num(t.available_on) * 1000);
  return {
    id: str(t.id),
    created: new Date(num(t.created) * 1000),
    availableOn,
    status: str(t.status) === "available" ? "available" : "pending",
    kind,
    title,
    why,
    orderRef,
    amount: num(t.amount),
    fee: num(t.fee),
    net: num(t.net),
    feeParts,
    payoutId: null,
    chargeId,
  };
}

// Gives refunds the order number of the payment they refund.
function matchRefunds(list: Movement[]) {
  const orders = new Map(list.filter((m) => m.kind === "payment" && m.orderRef).map((m) => [m.chargeId, m.orderRef]));
  return list.map((m) => (m.kind === "refund" && !m.orderRef ? { ...m, orderRef: orders.get(m.chargeId) ?? null } : m));
}

const EXPAND = "expand[]=data.source";

export async function recentMovements(limit = 100): Promise<Movement[]> {
  const data = obj(await stripeGet(`balance_transactions?limit=${limit}&${EXPAND}`));
  return matchRefunds((Array.isArray(data.data) ? data.data : []).map((t) => toMovement(obj(t))));
}

// What a payout to the bank was made of: the payments, refunds and fees it covers.
export async function payoutMovements(payoutId: string): Promise<Movement[]> {
  const data = obj(await stripeGet(`balance_transactions?limit=100&payout=${encodeURIComponent(payoutId)}&${EXPAND}`));
  return matchRefunds((Array.isArray(data.data) ? data.data : []).map((t) => toMovement(obj(t))))
    .filter((m) => m.kind !== "payout")
    .map((m) => ({ ...m, payoutId }));
}

export async function recentPayouts(limit = 6): Promise<Payout[]> {
  const data = obj(await stripeGet(`payouts?limit=${limit}`));
  return (Array.isArray(data.data) ? data.data : []).map((p) => {
    const o = obj(p);
    return { id: str(o.id), amount: num(o.amount), arrival: new Date(num(o.arrival_date) * 1000), created: new Date(num(o.created) * 1000), status: str(o.status) };
  });
}

// Money in Stripe: waiting to clear, and ready to go to the bank.
export async function balance() {
  const data = obj(await stripeGet("balance"));
  const gbp = (list: unknown) =>
    (Array.isArray(list) ? list : []).map(obj).filter((b) => str(b.currency) === "gbp").reduce((n, b) => n + num(b.amount), 0);
  return { pending: gbp(data.pending), available: gbp(data.available) };
}
