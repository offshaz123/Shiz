import { loadPriceChanges } from "@/lib/prices";
import { getCurrentUser } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import { checkDiscount } from "@/lib/discounts";
import { clientIp, rateLimited } from "@/lib/places";
import { sanitiseItem, unitPrice } from "@/lib/plates";

// Checks a discount code at checkout so the customer sees the new total.
// The order itself checks it again before taking payment.
export async function POST(req: Request) {
  await loadPriceChanges();
  if (rateLimited(`discount:${clientIp(req)}`, 20))
    return Response.json({ error: "Too many attempts. Please wait a minute and try again." }, { status: 429 });
  if (!isDbConfigured()) return Response.json({ error: "Discount codes aren't available right now." }, { status: 503 });
  const body = await req.json().catch(() => ({}));
  const items = Array.isArray(body.items) ? body.items.slice(0, 20).map(sanitiseItem) : [];
  const subtotal = items.reduce((n: number, i: ReturnType<typeof sanitiseItem>) => n + (i ? unitPrice(i) * i.qty : 0), 0);
  try {
    const user = await getCurrentUser();
    const check = await checkDiscount(String(body.code ?? ""), { email: String(body.email ?? ""), userId: user?.id ?? null }, subtotal);
    return check.ok ? Response.json(check) : Response.json({ error: check.error }, { status: 400 });
  } catch (err) {
    console.error("Checking discount failed", err);
    return Response.json({ error: "We couldn't check that code. Please try again." }, { status: 500 });
  }
}
