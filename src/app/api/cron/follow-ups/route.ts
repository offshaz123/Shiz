import { NextResponse } from "next/server";
import { runFollowUps } from "@/lib/run-follow-ups";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Starts a follow-up run on demand, guarded by CRON_SECRET — without that
 * anyone who found this URL could run the whole sequence at will.
 *
 * This is no longer the only way a run starts. The site schedules itself now
 * (src/lib/scheduler.ts), because this route behind a hPanel cron job is
 * exactly the arrangement that sat dead for a week: the job was listed, on a
 * sensible schedule, and nothing ever ran. The route stays because being able
 * to fire a run by hand is worth keeping, and because an external scheduler
 * is a reasonable belt to the in-process braces.
 *
 * The work itself lives in run-follow-ups.ts and is safe to run twice, so a
 * hPanel cron job and the in-process timer can both exist without the
 * sequence being walked through twice.
 */
function authorised(request: Request): "ok" | "wrong_key" | "not_configured" {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) return "not_configured";

  const header = request.headers.get("authorization");
  if (header === `Bearer ${secret}`) return "ok";

  // Hostinger's cron runs a shell command, and getting a header onto it is
  // fiddlier than a query string, so both are accepted.
  return new URL(request.url).searchParams.get("key") === secret ? "ok" : "wrong_key";
}

export async function POST(request: Request) {
  return run(request);
}

export async function GET(request: Request) {
  return run(request);
}

/**
 * Three outcomes, not two.
 *
 * A missing CRON_SECRET and a wrong one used to both answer 401, which meant
 * a silently dead scheduler looked identical from outside to one being
 * probed by a stranger. Saying which is which costs nothing — it reveals
 * only whether an environment variable exists, never its value — and it is
 * the difference between diagnosing this in a second and guessing at it.
 */
async function run(request: Request) {
  const auth = authorised(request);
  if (auth === "not_configured") {
    return NextResponse.json(
      {
        error: "cron_secret_not_configured",
        fix: "Add CRON_SECRET under Environment variables in hPanel, then redeploy.",
      },
      { status: 503 },
    );
  }
  if (auth !== "ok") {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const result = await runFollowUps();
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  const { sent, failed, skipped, prospects } = result;
  return NextResponse.json({ ok: true, sent, failed, skipped, prospects });
}
