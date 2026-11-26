import { NextResponse } from "next/server";
import { canSee, currentUser } from "@/lib/admin-auth";
import { teamDiary } from "@/lib/team-calendar";
import { dueNow, leftToday } from "@/lib/calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * What this person owes right now, and what is left of their day.
 *
 * Asked for by the bar across the top every twenty seconds, alongside
 * the calls waiting to be written up. A promise to ring somebody at
 * half nine is worth nothing if the only place it appears is a page
 * nobody has open at half nine.
 *
 * Only call-backs. An invoice falling due is a real thing on the
 * calendar and not a thing to interrupt somebody mid-call about.
 */
export async function GET() {
  const who = await currentUser();
  if (!canSee(who, "prospects")) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const items = await teamDiary({
    regions: who?.regions,
    // Your own, whoever you are. This band crosses the top of every
    // page, and being interrupted about a call somebody else promised
    // to make is not a reminder, it is noise you learn to ignore. The
    // owner still sees the whole team's on the Calendar, which is a
    // page you open rather than one that shouts at you.
    whose: { staffId: who?.kind === "owner" ? null : (who?.id ?? null) },
    // Nothing from months back needs to interrupt anybody. A call-back
    // older than this belongs on the calendar, not in a banner.
    back: 14,
    ahead: 2,
  });

  if (items === null) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }

  const calls = items.filter((item) => item.kind === "call-back");
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
    now.getHours(),
  )}:${pad(now.getMinutes())}`;

  return NextResponse.json({
    due: dueNow(calls, stamp),
    left: leftToday(calls, stamp).length,
  });
}
