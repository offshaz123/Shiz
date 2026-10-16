import { execute } from "./db";
import { type CarrierId, carrierFromName } from "./tracking";
import { type Order, setTracking } from "./orders";
import { site } from "./site";

// Packlink PRO: every paid order is sent to Packlink as a draft shipment, so
// the shop can pick a courier, pay and print the label there. Needs
// PACKLINK_API_KEY in the Hostinger settings (Packlink → Settings → Packlink
// PRO API key). Follows Packlink's own shop connector (packlink-dev/ecommerce_module_core).

// PACKLINK_API_URL is only for testing against a pretend Packlink.
const API = process.env.PACKLINK_API_URL || "https://api.packlink.com/v1/";

// A pair of plates in a plate envelope, weighed as the heaviest style (7mm
// gel) so no order is ever underweight. Used when the Packlink account has no
// default parcel size saved.
const FALLBACK_BOX = { width: 16, height: 3, length: 56, weight: 2 };
// Added for every pair after the first (same envelope, stacked).
const EXTRA_PAIR = { height: 3, weight: 1.5 };

// Pasted keys sometimes pick up spaces, a line break or quote marks.
const apiKey = () => (process.env.PACKLINK_API_KEY ?? "").trim().replace(/^["']|["']$/g, "");

export function isPacklinkConfigured() {
  return Boolean(apiKey());
}

async function call<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  const res = await fetch(API + path, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: apiKey(),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  const text = await res.text();
  if (res.status === 401 || res.status === 403)
    throw new Error("Packlink didn't accept the API key. Copy the current key from Packlink → Settings → Packlink PRO API key into PACKLINK_API_KEY in Hostinger, then redeploy.");
  if (!res.ok) throw new Error(`Packlink said ${res.status}: ${text.slice(0, 300) || res.statusText}`);
  return (text ? JSON.parse(text) : {}) as T;
}

// Packlink's saved addresses, with the field names it has used over time.
type Warehouse = Record<string, unknown> & { default_selection?: boolean };
const text = (w: Warehouse, ...keys: string[]) => {
  for (const k of keys) if (typeof w[k] === "string" && w[k]) return (w[k] as string).trim();
  return "";
};

type Parcel = { weight?: number; width?: number; length?: number; height?: number; default_selection?: boolean };

const pickDefault = <T extends { default_selection?: boolean }>(list: unknown) =>
  Array.isArray(list) ? ((list as T[]).find((x) => x.default_selection) ?? (list as T[])[0]) : undefined;

// The order as a Packlink draft: the customer's address, the shop's default
// address and parcel from the Packlink account, and our order number.
async function draftFor(order: Order) {
  const [warehouses, parcels] = await Promise.all([
    call<unknown>("GET", "clients/warehouses"),
    call<Parcel[]>("GET", "users/parcels").catch(() => []),
  ]);
  // Sometimes a list, sometimes wrapped in an object.
  const list = Array.isArray(warehouses)
    ? warehouses
    : warehouses && typeof warehouses === "object"
      ? (Object.values(warehouses).find(Array.isArray) ?? [warehouses])
      : [];
  const from = pickDefault<Warehouse>(list);
  const fromZip = from ? text(from, "postal_code", "zip_code", "postalCode", "zipCode", "postcode") : "";
  if (!from || !fromZip)
    throw new Error(
      list.length
        ? `Packlink's sender address has no postcode we could read (fields: ${Object.keys(from ?? {}).join(", ").slice(0, 200)}).`
        : "Packlink has no sender address. Add your workshop in Packlink → Settings → Address book and make it the default.",
    );
  const parcel = pickDefault<Parcel>(parcels);
  const box = parcel?.length && parcel.width && parcel.height && parcel.weight ? parcel : FALLBACK_BOX;
  // Each pair after the first adds height and weight to the same envelope.
  const pairs = order.items.reduce((n, i) => n + i.qty * (i.which === "pair" ? 1 : 0.5), 0);
  const extra = Math.max(0, Math.ceil(pairs) - 1);
  const [first, ...rest] = order.customer_name.trim().split(/\s+/);

  return {
    platform: "PRO",
    platform_country: "GB",
    shipment_custom_reference: order.ref,
    // One line of text, at most 60 characters and without symbols Packlink rejects.
    content: `Number plates ${order.ref}`.replace(/[;:%&/()=?!\\'`^*@#$€]/g, "").slice(0, 60),
    contentvalue: Math.round(order.subtotal) / 100,
    contentValue_currency: "GBP",
    content_second_hand: false,
    priority: false,
    has_customs: false,
    from: {
      name: text(from, "name", "first_name"),
      surname: text(from, "surname", "last_name"),
      company: text(from, "company") || site.name,
      street1: text(from, "address", "street1", "street"),
      street2: text(from, "address2", "street2"),
      zip_code: fromZip,
      city: text(from, "city", "town"),
      country: text(from, "country", "country_code") || "GB",
      phone: text(from, "phone"),
      email: text(from, "email"),
    },
    to: {
      name: first ?? "",
      surname: rest.join(" "),
      company: "",
      street1: order.address1,
      street2: order.address2,
      zip_code: order.postcode,
      city: order.town,
      country: "GB",
      phone: order.phone,
      email: order.email,
    },
    packages: [
      {
        width: Math.ceil(box.width!),
        height: Math.ceil(box.height! + extra * EXTRA_PAIR.height),
        length: Math.ceil(box.length!),
        weight: Math.round((box.weight! + extra * EXTRA_PAIR.weight) * 100) / 100,
      },
    ],
  };
}

// Sends the order to Packlink and remembers the result on the order, so the
// admin page can show it was sent (or why it wasn't). Never throws.
export async function sendToPacklink(order: Order): Promise<{ ok: true; reference: string } | { ok: false; error: string }> {
  if (!isPacklinkConfigured()) return { ok: false, error: "Packlink isn't connected (PACKLINK_API_KEY is missing)." };
  try {
    const result = await call<{ reference?: string }>("POST", "shipments", await draftFor(order));
    if (!result.reference) throw new Error("Packlink didn't return a shipment reference.");
    await execute("UPDATE orders SET packlink_ref = ?, packlink_error = NULL WHERE id = ?", [result.reference.slice(0, 40), order.id]);
    return { ok: true, reference: result.reference };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error(`Sending ${order.ref} to Packlink failed`, error);
    await execute("UPDATE orders SET packlink_error = ? WHERE id = ?", [error.slice(0, 500), order.id]).catch(() => {});
    return { ok: false, error };
  }
}

// Packlink's own shipment number (e.g. UN2026PRO0003678502). Not a courier
// tracking number: customers can't track a parcel with it.
export function isPacklinkRef(v: string | null | undefined) {
  return Boolean(v && /^[A-Z]{2}\d{4}PRO\d{5,}$/.test(v));
}

// The courier's tracking number for a Packlink shipment, once its label has been bought.
export async function courierTracking(reference: string): Promise<{ number: string; carrier: CarrierId | null } | null> {
  if (!isPacklinkConfigured()) return null;
  try {
    const s = await call<{ trackings?: unknown; tracking_codes?: unknown; carrier?: string }>("GET", `shipments/${encodeURIComponent(reference)}`);
    const codes = [s.trackings, s.tracking_codes].find(Array.isArray) as unknown[] | undefined;
    const number = codes?.map((c) => String(c ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "")).find(Boolean);
    return number ? { number: number.slice(0, 40), carrier: carrierFromName(s.carrier) } : null;
  } catch (err) {
    console.error(`Getting tracking for Packlink ${reference} failed`, err instanceof Error ? err.message : err);
    return null;
  }
}

// Fills in (or corrects) a dispatched order's tracking number from Packlink:
// when it has none but went through Packlink, or when Packlink's own reference
// was saved by mistake. Gives up after a few seconds so pages never hang.
export async function syncTrackingFromPacklink(order: Order): Promise<Order> {
  // Before dispatch nothing is saved: the admin page offers Packlink's number
  // when the order is marked dispatched instead.
  const reference = isPacklinkRef(order.tracking_number)
    ? order.tracking_number
    : !order.tracking_number && order.status === "dispatched"
      ? order.packlink_ref
      : null;
  if (!reference || !isPacklinkConfigured()) return order;
  const found = await Promise.race([courierTracking(reference), new Promise<null>((r) => setTimeout(() => r(null), 5000))]);
  if (!found) return order;
  const carrier = found.carrier ?? order.tracking_carrier ?? "royalmail";
  await setTracking(order.ref, found.number, carrier);
  return { ...order, tracking_number: found.number, tracking_carrier: carrier };
}

// What Packlink charged for an order's label, in pence with VAT. Saved on the
// order once the label is bought (it doesn't change after that); null while
// the shipment is still a draft or the order didn't go through Packlink.
export async function packlinkCost(order: Order): Promise<number | null> {
  if (order.packlink_cost !== null) return order.packlink_cost;
  if (!order.packlink_ref || !isPacklinkConfigured()) return null;
  try {
    const s = await call<Record<string, unknown>>("GET", `shipments/${encodeURIComponent(order.packlink_ref)}`);
    const n = (v: unknown) => (typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN);
    const price = s.price && typeof s.price === "object" ? (s.price as Record<string, unknown>) : null;
    // Packlink has sent the price a few ways: a total, or a price plus VAT.
    const total = price
      ? (n(price.total_price) || n(price.base_price) + (n(price.total_taxes) || 0))
      : n(s.price) || n(s.base_price) + (n(s.total_taxes) || 0);
    const codes = [s.trackings, s.tracking_codes].find(Array.isArray) as unknown[] | undefined;
    // Only a bought label has a final price (and a tracking number).
    if (!codes?.length || !Number.isFinite(total) || total <= 0) return null;
    const pence = Math.round(total * 100);
    await execute("UPDATE orders SET packlink_cost = ? WHERE id = ?", [pence, order.id]);
    return pence;
  } catch (err) {
    console.error(`Getting the Packlink price for ${order.ref} failed`, err instanceof Error ? err.message : err);
    return null;
  }
}
