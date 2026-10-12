import { execute, query } from "./db";
import { money } from "./plates";

// Discount codes the shop creates in the admin (Admin → Discount codes).
// A code takes money off the plates only, never delivery.

export type DiscountKind = "percent" | "amount";

export type DiscountCode = {
  id: number;
  code: string;
  title: string;
  kind: DiscountKind;
  // Percent (e.g. 10) or pence off (e.g. 500 = £5).
  value: number;
  first_order_only: number;
  // Least the plates must come to, in pence (0 = no minimum).
  min_spend: number;
  max_uses: number | null;
  uses: number;
  expires_at: Date | null;
  active: number;
  created_at: Date;
};

// Codes are stored and typed in capitals, letters and numbers only.
export function cleanCode(input: unknown) {
  return String(input ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 40);
}

export function describeDiscount(d: Pick<DiscountCode, "kind" | "value">) {
  return d.kind === "percent" ? `${d.value}% off` : `${money(d.value)} off`;
}

export function discountAmount(d: Pick<DiscountCode, "kind" | "value">, subtotal: number) {
  const off = d.kind === "percent" ? Math.round((subtotal * d.value) / 100) : d.value;
  return Math.max(0, Math.min(off, subtotal));
}

export async function listDiscounts() {
  return query<DiscountCode>("SELECT * FROM discount_codes ORDER BY created_at DESC");
}

export async function getDiscount(code: string) {
  const rows = await query<DiscountCode>("SELECT * FROM discount_codes WHERE code = ?", [cleanCode(code)]);
  return rows[0] ?? null;
}

export async function createDiscount(d: {
  code: string;
  title: string;
  kind: DiscountKind;
  value: number;
  first_order_only: boolean;
  min_spend: number;
  max_uses: number | null;
  expires_at: string | null;
}) {
  await execute(
    `INSERT INTO discount_codes (code, title, kind, value, first_order_only, min_spend, max_uses, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [d.code, d.title, d.kind, d.value, d.first_order_only ? 1 : 0, d.min_spend, d.max_uses, d.expires_at],
  );
}

export async function setDiscountActive(id: number, active: boolean) {
  await execute("UPDATE discount_codes SET active = ? WHERE id = ?", [active ? 1 : 0, id]);
}

export async function deleteDiscount(id: number) {
  await execute("DELETE FROM discount_codes WHERE id = ?", [id]);
}

// Counted when an order using the code is paid.
export async function countDiscountUse(code: string) {
  await execute("UPDATE discount_codes SET uses = uses + 1 WHERE code = ?", [cleanCode(code)]);
}

export type DiscountCheck =
  | { ok: true; code: string; title: string; label: string; discount: number }
  | { ok: false; error: string };

// Checks a code against a basket of plates worth `subtotal` (pence).
export async function checkDiscount(
  input: string,
  who: { email: string; userId: number | null },
  subtotal: number,
): Promise<DiscountCheck> {
  const code = cleanCode(input);
  if (!code) return { ok: false, error: "Please type a discount code." };
  const d = await getDiscount(code);
  if (!d || !d.active) return { ok: false, error: "That code isn't valid." };
  if (d.expires_at && new Date(d.expires_at) < new Date()) return { ok: false, error: "That code has expired." };
  if (d.max_uses !== null && d.uses >= d.max_uses) return { ok: false, error: "That code has been used up." };
  if (subtotal < d.min_spend) return { ok: false, error: `Spend ${money(d.min_spend)} or more on plates to use this code.` };
  if (d.first_order_only) {
    const email = who.email.trim().toLowerCase();
    if (!email && who.userId === null) return { ok: false, error: "Enter your email above first, then apply the code." };
    const previous = await query(
      `SELECT 1 FROM orders WHERE (LOWER(email) = ? OR (user_id IS NOT NULL AND user_id = ?))
         AND status IN ('paid', 'in_production', 'dispatched', 'refunded') LIMIT 1`,
      [email, who.userId ?? -1],
    );
    if (previous.length) return { ok: false, error: "This code is for first orders only." };
  }
  return { ok: true, code: d.code, title: d.title, label: describeDiscount(d), discount: discountAmount(d, subtotal) };
}
