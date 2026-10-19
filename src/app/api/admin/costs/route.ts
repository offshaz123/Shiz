import { isAdmin } from "@/lib/auth";
import { DEFAULT_COSTS, type MaterialCosts, saveCosts } from "@/lib/costs";

// Admin → Costs: new material prices, from today or from a date (e.g. when
// the supplier changed).
export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Please log in again." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const costs = { ...DEFAULT_COSTS };
  for (const key of Object.keys(DEFAULT_COSTS) as (keyof MaterialCosts)[]) {
    const n = Number(body.costs?.[key]);
    if (!Number.isFinite(n) || n < 0 || n > 100) return Response.json({ error: "Each cost must be a number of pounds, like 0.35." }, { status: 400 });
    costs[key] = Math.round(n * 1000) / 1000;
  }
  let from = Date.now();
  if (body.date) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(body.date));
    if (!m) return Response.json({ error: "That date isn't valid." }, { status: 400 });
    from = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  await saveCosts(costs, from);
  return Response.json({ message: "Saved" });
}
