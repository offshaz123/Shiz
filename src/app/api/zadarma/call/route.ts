import { NextResponse } from "next/server";
import { attachPhoneCall, listPhoneNumbers, logCall } from "@/lib/prospects";
import { findByPhone } from "@/lib/phone-match";
import { outcomeFor, readCallEnded, signatureMatches } from "@/lib/zadarma";
import { logAction } from "@/lib/staff";
import { staffByExtension } from "@/lib/staff-lookup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The phone system telling us what happened.
 *
 * This is the half of the integration that matters. A call placed from
 * a softphone and then typed into the admin afterwards is two systems
 * and an honesty system; this makes the record of a call a by-product
 * of making it.
 *
 * It is a public address that writes to the call log, so the signature
 * is checked before anything else. Without that, anybody who found this
 * URL could post a hundred calls that never happened into the record —
 * which is precisely the record this exists to make trustworthy.
 *
 * Zadarma also verifies the endpoint on setup by sending a GET with a
 * zd_echo parameter, which has to be echoed back as the whole body.
 */

export async function GET(request: Request) {
  const echo = new URL(request.url).searchParams.get("zd_echo");
  // Their one-time check that this address is really ours. The answer is
  // the bare value, not JSON, or the webhook will not save.
  return echo
    ? new Response(echo, { headers: { "content-type": "text/plain" } })
    : NextResponse.json({ error: "not_found" }, { status: 404 });
}

export async function POST(request: Request) {
  const raw = await request.text();

  if (!signatureMatches(raw, request.headers.get("signature"))) {
    // Deliberately 200 and quiet. A rejected post is either somebody
    // probing or our own keys being wrong, and neither is improved by
    // telling the sender which.
    console.error("Zadarma webhook: signature did not match");
    return NextResponse.json({ ok: true });
  }

  const form: Record<string, string> = {};
  for (const [name, value] of new URLSearchParams(raw)) form[name] = value;

  const ended = readCallEnded(form);
  // Five of the six events that arrive here are not the one we want.
  if (!ended) return NextResponse.json({ ok: true });

  const numbers = await listPhoneNumbers();
  if (!numbers) return NextResponse.json({ ok: true });

  const them = findByPhone(numbers, ended.destination);
  if (!them) {
    // A call to a number that is not on the list. Their own mother, the
    // bank, a business deleted since. Nothing to file it against, and
    // inventing somewhere to put it would be worse than losing it.
    console.log(`Zadarma: call to ${ended.destination} matched no prospect`);
    return NextResponse.json({ ok: true });
  }

  const who = await staffByExtension(ended.internal);
  const minutes = ended.seconds > 0 ? Math.max(1, Math.round(ended.seconds / 60)) : null;

  const outcome = outcomeFor(ended.disposition, ended.seconds) as "spoke" | "no-answer";

  // Pressing Call already wrote a row for this call. Fill that one in
  // rather than writing a second: two rows for one call would double
  // every count on the page and leave the person a write-up prompt for
  // a call they have already been asked about.
  const attached = await attachPhoneCall(them.id, {
    outcome,
    minutes,
    recordingId: ended.recordingId,
    staffId: who?.id ?? null,
    caller: who?.name ?? `extension ${ended.internal}`,
  });

  // Nothing to attach it to: the call was made from the softphone
  // rather than from the website, which is a perfectly normal thing to
  // do and still belongs in the record.
  if (!attached) {
    await logCall(them.id, {
      outcome,
      // Left empty on purpose. The system knows how long the call was
      // and whether it connected; what was actually said is a thing
      // only the person who made it knows, and a note written by a
      // machine that was not listening would read like one.
      notes: "",
      minutes,
      caller: who?.name ?? `extension ${ended.internal}`,
      staffId: who?.id ?? null,
      callbackAt: "",
      recordingId: ended.recordingId,
      loggedBy: "phone",
    });
  }

  await logAction(
    { id: who?.id ?? null, name: who?.name ?? `extension ${ended.internal}` },
    "logged-call",
    them.name ?? `prospect ${them.id}`,
    `${ended.seconds}s, ${ended.disposition}${ended.recordingId ? ", recorded" : ""}`,
  );

  return NextResponse.json({ ok: true });
}
