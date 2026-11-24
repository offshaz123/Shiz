import { NextResponse } from "next/server";
import { actor, canSee, canSeeRegion, currentUser } from "@/lib/admin-auth";
import { getProspect } from "@/lib/prospects";
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

  // Logged as an attempt, not as a call. Whether it connected is a thing
  // only the phone system knows, and it will say so when it ends.
  await logAction(await actor(), "dialled", them.name, them.phone);

  return NextResponse.json({ ok: true, ringing: who.extension });
}
