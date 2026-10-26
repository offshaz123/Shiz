import { execute, isDbConfigured } from "@/lib/db";
import { clientIp, rateLimited } from "@/lib/places";
import { isFunnelStep, isSource } from "@/lib/sources";

// Counts a step towards a sale (plate builder, basket, checkout) by where the
// visit came from (Admin → Insights). Only a number per day, source and step.
export async function POST(req: Request) {
  if (!isDbConfigured() || rateLimited(`funnel:${clientIp(req)}`, 30)) return new Response(null, { status: 204 });
  if (/bot|crawl|spider|preview|lighthouse|headless/i.test(req.headers.get("user-agent") ?? "")) return new Response(null, { status: 204 });
  const [step, source] = (await req.text().catch(() => "")).trim().split(" ");
  if (!isFunnelStep(step) || !(isSource(source) || source === "unknown")) return new Response(null, { status: 204 });
  const day = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
  try {
    await execute("INSERT INTO funnel (day, source, step, count) VALUES (?, ?, ?, 1) ON DUPLICATE KEY UPDATE count = count + 1", [day, source, step]);
  } catch (err) {
    console.error("Counting a funnel step failed", err);
  }
  return new Response(null, { status: 204 });
}
