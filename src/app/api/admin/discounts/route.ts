import { isAdmin } from "@/lib/auth";
import { cleanCode, createDiscount, deleteDiscount, getDiscount, setDiscountActive } from "@/lib/discounts";

// Create, switch on/off and delete discount codes (admin only).
export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Please log in again." }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const bad = (error: string) => Response.json({ error }, { status: 400 });
  const pounds = (v: unknown) => Math.round(Number(v || 0) * 100);

  if (b.action === "toggle" || b.action === "delete") {
    const id = Number(b.id);
    if (!Number.isInteger(id)) return bad("Unknown code.");
    if (b.action === "toggle") await setDiscountActive(id, Boolean(b.active));
    else await deleteDiscount(id);
    return Response.json({ ok: true });
  }

  if (b.action === "create") {
    const code = cleanCode(b.code);
    const title = String(b.title ?? "").trim().slice(0, 200);
    const kind = b.kind === "amount" ? "amount" : "percent";
    const value = kind === "percent" ? Math.round(Number(b.value)) : pounds(b.value);
    const maxUses = b.maxUses === "" || b.maxUses == null ? null : Math.round(Number(b.maxUses));
    const expires = typeof b.expires === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.expires) ? `${b.expires} 23:59:59` : null;
    if (code.length < 3) return bad("The code needs at least 3 letters or numbers.");
    if (!title) return bad("Please give the code a title, e.g. \"Summer sale\".");
    if (kind === "percent" && !(value >= 1 && value <= 100)) return bad("The percentage must be between 1 and 100.");
    if (kind === "amount" && !(value >= 1 && value <= 100000)) return bad("Please enter how many pounds to take off.");
    if (maxUses !== null && !(maxUses >= 1)) return bad("Leave \"how many times\" empty for unlimited, or enter 1 or more.");
    if (await getDiscount(code)) return bad(`There's already a code called ${code}.`);
    await createDiscount({
      code,
      title,
      kind,
      value,
      first_order_only: Boolean(b.firstOrderOnly),
      min_spend: Math.max(0, pounds(b.minSpend)),
      max_uses: maxUses,
      expires_at: expires,
    });
    return Response.json({ ok: true, message: `${code} created.` });
  }
  return bad("Unknown action.");
}
