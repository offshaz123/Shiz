import { NextResponse } from "next/server";
import { actor, canSee, canSeeRegion, currentUser } from "@/lib/admin-auth";
import { getProspect, logCall } from "@/lib/prospects";
import { NOT_WRITTEN_UP } from "@/lib/prospect-types";
import { callerIdFor } from "@/lib/settings";
import { extensionCallerId, isConnected, placeCall, setExtensionCallerId } from "@/lib/zadarma";
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

  // The number they see ringing them, chosen by the country they are in.
  // A London number on an American phone is a number nobody rings back.
  //
  // It is set on the extension just before the call, because the phone
  // system has no way to say it per call: its `sip` parameter takes an
  // extension, not a number. The first version of this passed the
  // number there and it did nothing — every call, American ones
  // included, went out showing the London number.
  //
  // Nothing is touched where their own by-destination setting is on:
  // that does the same job across every country rather than the two we
  // know about, and fighting it would make the result depend on which
  // of us wrote last.
  const wanted = await callerIdFor(them.region);
  const current = await extensionCallerId(who.extension);
  let shownAs = current?.number ?? "";
  let callerIdNote = "";

  if (current?.byDirection) {
    // Their setting is in charge. What shows is decided per country at
    // the moment of the call, so there is no single number to record.
    shownAs = "by country";
  } else if (!wanted) {
    callerIdNote = `No ${them.region === "us" ? "American" : "UK"} number saved, so they will see ${shownAs || "whatever this extension is set to"}.`;
  } else if (current && current.number === wanted) {
    shownAs = wanted;
  } else if (await setExtensionCallerId(who.extension, wanted)) {
    shownAs = wanted;
  } else {
    callerIdNote = `Could not switch the number for this call, so they will see ${shownAs || "the usual one"} instead of ${wanted}.`;
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
    // Written down per call, because "which number did they see" is
    // otherwise unanswerable after the fact — the only way to find out
    // is to ring somebody and ask them what came up on their phone.
    shownAs,
  });

  await logAction(me, "dialled", them.name, them.phone);

  return NextResponse.json({
    ok: true,
    ringing: who.extension,
    // What the business will see. Said back to the person dialling so
    // it is checkable on the day rather than on the bill.
    shownAs,
    ...(callerIdNote ? { callerIdNote } : {}),
  });
}
