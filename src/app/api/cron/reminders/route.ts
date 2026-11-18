import { NextResponse } from "next/server";
import { sendTodaySummaries, sendTomorrowReminders } from "@/lib/booking-reminders";
import { recordCronRun } from "@/lib/admin-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The diary reminders: tomorrow's jobs the night before, today's at nine.
 *
 * One route, two kinds, because they are the same work at different hours
 * and a second route would be a second thing to keep in step.
 */
function authorised(request: Request): "ok" | "wrong_key" | "not_configured" {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) return "not_configured";
  const header = request.headers.get("authorization");
  if (header === `Bearer ${secret}`) return "ok";
  return new URL(request.url).searchParams.get("key") === secret ? "ok" : "wrong_key";
}

export async function POST(request: Request) {
  return run(request);
}

export async function GET(request: Request) {
  return run(request);
}

async function run(request: Request) {
  const auth = authorised(request);
  if (auth === "not_configured") {
    return NextResponse.json({ error: "cron_secret_not_configured" }, { status: 503 });
  }
  if (auth !== "ok") return NextResponse.json({ error: "unauthorised" }, { status: 401 });

  const kind = new URL(request.url).searchParams.get("kind") === "today" ? "today" : "tomorrow";

  const result =
    kind === "today"
      ? await sendTodaySummaries().catch((err) => {
          console.error("Today summaries:", err);
          return null;
        })
      : await sendTomorrowReminders().catch((err) => {
          console.error("Tomorrow reminders:", err);
          return null;
        });

  // Recorded like every other scheduled job, so a silent stop shows up on
  // the admin overview rather than being noticed when a client misses one.
  await recordCronRun(`reminders-${kind}`, {
    sent: result?.clients ?? 0,
    failed: result?.failed ?? 0,
    considered: result?.jobs ?? 0,
    detail: result
      ? `${result.clients} client(s), ${result.jobs} job(s)`
      : "failed",
  });

  return NextResponse.json({ ok: true, kind, ...(result ?? {}) });
}
