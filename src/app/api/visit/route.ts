import { execute, isDbConfigured } from "@/lib/db";
import { clientIp, rateLimited } from "@/lib/places";
import { isSource } from "@/lib/sources";

// Counts a visit by where it came from (Admin → Insights). Only a number per
// day and source is kept: nothing about the visitor.
export async function POST(req: Request) {
  if (!isDbConfigured() || rateLimited(`visit:${clientIp(req)}`, 20)) return new Response(null, { status: 204 });
  // Search engines' and ad networks' robots load pages too; they aren't visitors.
  if (/bot|crawl|spider|preview|lighthouse|headless/i.test(req.headers.get("user-agent") ?? "")) return new Response(null, { status: 204 });
  const source = (await req.text().catch(() => "")).trim();
  if (!isSource(source)) return new Response(null, { status: 204 });
  const day = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
  try {
    await execute("INSERT INTO visits (day, source, count) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE count = count + 1", [day, source]);
  } catch (err) {
    console.error("Counting a visit failed", err);
  }
  return new Response(null, { status: 204 });
}
