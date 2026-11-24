import { NextResponse } from "next/server";
import { actor, canSee, canSeeRegion, currentUser } from "@/lib/admin-auth";
import { getProspect, logCall } from "@/lib/prospects";
import { NOT_WRITTEN_UP } from "@/lib/prospect-types";
import { isConnected, placeCall } from "@/lib/zadarma";
import { logAction } from "@/lib/staff";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Press a number, your phone rings, then theirs.
 *
 * The number is read from the prospect's own row rather than taken from
 * the request. A dial endpoint that calls whatever number it is handed
 * is a dial endpoint somebody can point at a premium rate line, and the
 * bill lands on us.
 */
export async function POST(request: Request) {
  const who = await currentUser();
  if (!canSee(who, "prospects")) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  if (!isConnected()) {
    return NextResponse.json({ error: "no_phone_system" }, { status: 503 });
  }

  if (!who?.extension) {
    return NextResponse.json({ error: "no_extension" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const id = Number(body?.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const them = await getProspect(id);
  if (!them) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (!canSeeRegion(who, them.region)) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }
  if (!them.phone) {
    return NextResponse.json({ error: "no_number" }, { status: 400 });
  }

  const result = await placeCall(who.extension, them.phone);
  if (!result.ok) {
    return NextResponse.json({ error: "call_failed", detail: result.reason }, { status: 502 });
  }

  // The call is written down here, the moment it is placed, rather than
  // waiting for the phone system to say it ended.
  //
  // This is the difference between a prompt that appears and one that
  // does not. The write-up prompt used to depend entirely on Zadarma's
  // end-of-call webhook, so if that was never registered — or its
  // signature did not match, or the extension matched no account — a
  // call could be made and nobody was ever asked what was said, with
  // nothing anywhere to say why. Now the row exists because somebody
  // pressed the button, which is a fact we already have, and the
  // webhook fills in the length and the recording when it arrives.
  //
  // Its outcome is "pending", not "no answer": what happened on it is
  // not known yet, and guessing would put a fact about a business into
  // the record that nobody established.
  const me = await actor();
  await logCall(them.id, {
    outcome: NOT_WRITTEN_UP,
    notes: "",
    minutes: null,
    caller: me.name,
    staffId: who.id,
    callbackAt: "",
    loggedBy: "click",
  });

  await logAction(me, "dialled", them.name, them.phone);

  return NextResponse.json({ ok: true, ringing: who.extension });
}
