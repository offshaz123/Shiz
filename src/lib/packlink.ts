import { execute } from "./db";
import type { Order } from "./orders";
import { site } from "./site";

// Packlink PRO: every paid order is sent to Packlink as a draft shipment, so
// the shop can pick a courier, pay and print the label there. Needs
// PACKLINK_API_KEY in the Hostinger settings (Packlink → Settings → Packlink
// PRO API key). Follows Packlink's own shop connector (packlink-dev/ecommerce_module_core).

// PACKLINK_API_URL is only for testing against a pretend Packlink.
const API = process.env.PACKLINK_API_URL || "https://api.packlink.com/v1/";

// A pair of plates in a plate box. Used when the Packlink account has no
// default parcel size saved.
const FALLBACK_BOX = { width: 16, height: 3, length: 56, weight: 0.6 };

export function isPacklinkConfigured() {
  return Boolean(process.env.PACKLINK_API_KEY);
}

async function call<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  const res = await fetch(API + path, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: process.env.PACKLINK_API_KEY ?? "",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Packlink said ${res.status}: ${text.slice(0, 300) || res.statusText}`);
  return (text ? JSON.parse(text) : {}) as T;
}

type Warehouse = {
  name?: string;
  surname?: string;
  company?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  default_selection?: boolean;
};
type Parcel = { weight?: number; width?: number; length?: number; height?: number; default_selection?: boolean };

const pickDefault = <T extends { default_selection?: boolean }>(list: unknown) =>
  Array.isArray(list) ? ((list as T[]).find((x) => x.default_selection) ?? (list as T[])[0]) : undefined;

// The order as a Packlink draft: the customer's address, the shop's default
// address and parcel from the Packlink account, and our order number.
async function draftFor(order: Order) {
  const [warehouses, parcels] = await Promise.all([
    call<Warehouse[]>("GET", "clients/warehouses").catch(() => []),
    call<Parcel[]>("GET", "users/parcels").catch(() => []),
  ]);
  const from = pickDefault<Warehouse>(warehouses);
  const parcel = pickDefault<Parcel>(parcels);
  const box = parcel?.length && parcel.width && parcel.height && parcel.weight ? parcel : FALLBACK_BOX;
  // One box holds two pairs; each further pair adds a little height and weight.
  const pairs = order.items.reduce((n, i) => n + i.qty * (i.which === "pair" ? 1 : 0.5), 0);
  const extra = Math.max(0, Math.ceil(pairs) - 1);
  const [first, ...rest] = order.customer_name.trim().split(/\s+/);

  return {
    platform: "PRO",
    platform_country: "GB",
    source: "PRO",
    shipment_custom_reference: order.ref,
    content: order.items.map((i) => `${i.qty} x number plates ${i.reg}`),
    contentvalue: Math.round(order.subtotal) / 100,
    contentValue_currency: "GBP",
    content_second_hand: false,
    priority: false,
    has_customs: false,
    from: from && {
      name: from.name ?? "",
      surname: from.surname ?? "",
      company: from.company || site.name,
      street1: from.address ?? "",
      street2: "",
      zip_code: from.postal_code ?? "",
      city: from.city ?? "",
      country: from.country || "GB",
      phone: from.phone ?? "",
      email: from.email ?? "",
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
        height: Math.ceil(box.height! + extra * 2),
        length: Math.ceil(box.length!),
        weight: Math.round((box.weight! + extra * 0.5) * 100) / 100,
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
