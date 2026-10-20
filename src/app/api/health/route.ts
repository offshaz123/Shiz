import { isDbConfigured, query } from "@/lib/db";
import { isMailConfigured } from "@/lib/mail";
import { isStripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

// For an uptime monitor (e.g. UptimeRobot) to watch: "OK" when the shop can
// take orders, otherwise "PROBLEM" with a 503, so the monitor emails the
// owner. Says only what's wrong, never any setting's value.
export async function GET() {
  const problems: string[] = [];
  if (!isDbConfigured()) problems.push("database settings missing");
  else {
    try {
      await query("SELECT 1");
    } catch {
      problems.push("database not answering");
    }
  }
  if (!isStripeConfigured()) problems.push("Stripe settings missing");
  if (!isMailConfigured()) problems.push("email settings missing");
  const body = problems.length ? `PROBLEM: ${problems.join(", ")}. See the admin status bar.` : "OK";
  return new Response(body, {
    status: problems.length ? 503 : 200,
    headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" },
  });
}
