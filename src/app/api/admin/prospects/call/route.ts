import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { listProspectCalls, logCall } from "@/lib/prospects";
import { isCallOutcome } from "@/lib/prospect-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Writing down a phone call, and reading back the ones before it.
 *
 * The notes field on a prospect is one box that gets rewritten, so the third
 * call overwrites the first two. This keeps them, which is the difference
 * between "ring this lot" and "here is what they said last time".
 */
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const id = Number(body?.id);
  if (!Number.isInteger(id) || id <= 0 || !isCallOutcome(body?.outcome)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const ok = await logCall(id, {
    outcome: body.outcome,
    notes: typeof body?.notes === "string" ? body.notes : "",
    minutes: Number(body?.minutes) || null,
    caller: typeof body?.caller === "string" ? body.caller : "",
    // A date, not a time. "Thursday" is how people actually say it, and a
    // callback promised to the minute is a callback nobody keeps.
    callbackAt: /^\d{4}-\d{2}-\d{2}$/.test(body?.callbackAt ?? "") ? body.callbackAt : "",
  });

  return ok
    ? NextResponse.json({ logged: true })
    : NextResponse.json({ error: "db_unavailable" }, { status: 503 });
}

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const calls = await listProspectCalls(id);
  return calls === null
    ? NextResponse.json({ error: "db_unavailable" }, { status: 503 })
    : NextResponse.json({ calls });
}
