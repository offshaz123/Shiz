import { timingSafeEqual } from "node:crypto";
import { googleAdsKey, saveGoogleSpend } from "@/lib/ad-spend";
import { isDbConfigured } from "@/lib/db";

// Called every day by the script in the Google Ads account (see Admin →
// Money) with what Google Ads spent on each of the last 30 days.
export async function POST(req: Request) {
  if (!isDbConfigured()) return Response.json({ error: "No database" }, { status: 503 });
  const given = Buffer.from((req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, ""));
  const key = Buffer.from(await googleAdsKey());
  if (given.length !== key.length || !timingSafeEqual(given, key)) return Response.json({ error: "Wrong key" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const days = (Array.isArray(body.days) ? body.days : [])
    .slice(0, 400)
    .map((d: { date?: unknown; cost?: unknown }) => ({ date: String(d.date ?? ""), cost: Number(d.cost) }))
    .filter((d: { date: string; cost: number }) => /^\d{4}-\d{2}-\d{2}$/.test(d.date) && Number.isFinite(d.cost) && d.cost >= 0 && d.cost < 100000);
  await saveGoogleSpend(days);
  return Response.json({ message: `Saved ${days.length} days` });
}
