import { NextResponse } from "next/server";
import { canSee, currentUser } from "@/lib/admin-auth";
import { callsNeedingReview, reviewCall } from "@/lib/call-review";
import { isCallOutcome } from "@/lib/prospect-types";
import { noteProblem } from "@/lib/call-notes";
import { callbackProblem, callbackValue } from "@/lib/callback";
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

  // Checked here as well as on the screen. A rule the page enforces and
  // the server does not is a rule that stops the honest and not the
  // hurried: this endpoint is a plain POST and the button is not the
  // only way to reach it.
  const notes = typeof body?.notes === "string" ? body.notes : "";
  const problem = noteProblem(notes);
  if (problem) {
    return NextResponse.json({ error: "note_needed", message: problem }, { status: 400 });
  }

  // A day and a time, both required, and only for the outcome that
  // means they asked to be rung back.
  const callback = {
    date: typeof body?.callbackDate === "string" ? body.callbackDate : "",
    time: typeof body?.callbackTime === "string" ? body.callbackTime : "",
  };
  const whenProblem = callbackProblem(body.outcome, callback);
  if (whenProblem) {
    return NextResponse.json({ error: "callback_needed", message: whenProblem }, { status: 400 });
  }

  const ok = await reviewCall(id, {
    outcome: body.outcome,
    notes,
    callbackAt: body.outcome === "call-back" ? callbackValue(callback) : "",
  });

  if (!ok) return NextResponse.json({ error: "not_saved" }, { status: 409 });

  await logAction(
    { id: who?.id ?? null, name: who?.name ?? "Walid" },
    "wrote-up-call",
    typeof body?.business === "string" ? body.business : `call ${id}`,
    [body.outcome, notes.trim().slice(0, 160)].filter(Boolean).join(" — "),
  );

  return NextResponse.json({ ok: true });
}
