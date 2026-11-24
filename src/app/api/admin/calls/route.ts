import { NextResponse } from "next/server";
import { canSee, currentUser } from "@/lib/admin-auth";
import { callsNeedingReview, reviewCall } from "@/lib/call-review";
import { isCallOutcome } from "@/lib/prospect-types";
import { logAction } from "@/lib/staff";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The calls this person has made that nobody has written up yet.
 *
 * Asked for by the page every so often rather than pushed, because a
 * call ends on a phone and the browser has no way of knowing. Polling a
 * count is cheap; a websocket to tell somebody about two rows a day
 * would be machinery with nothing to do.
 */
export async function GET() {
  const who = await currentUser();
  if (!canSee(who, "prospects")) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const pending = await callsNeedingReview(who?.id ?? null);
  return NextResponse.json({ pending: pending ?? [] });
}

/** What they say happened on it. */
export async function POST(request: Request) {
  const who = await currentUser();
  if (!canSee(who, "prospects")) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const id = Number(body?.id);
  if (!Number.isInteger(id) || id <= 0 || !isCallOutcome(body?.outcome)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const ok = await reviewCall(id, {
    outcome: body.outcome,
    notes: typeof body?.notes === "string" ? body.notes : "",
    // A date, not a time. "Thursday" is how people say it, and a
    // callback promised to the minute is one nobody keeps.
    callbackAt: /^\d{4}-\d{2}-\d{2}$/.test(body?.callbackAt ?? "") ? body.callbackAt : "",
  });

  if (!ok) return NextResponse.json({ error: "not_saved" }, { status: 409 });

  await logAction(
    { id: who?.id ?? null, name: who?.name ?? "Walid" },
    "wrote-up-call",
    typeof body?.business === "string" ? body.business : `call ${id}`,
    [body.outcome, typeof body?.notes === "string" ? body.notes.trim().slice(0, 160) : ""]
      .filter(Boolean)
      .join(" — "),
  );

  return NextResponse.json({ ok: true });
}
