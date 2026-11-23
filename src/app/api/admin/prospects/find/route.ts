import { NextResponse } from "next/server";
import { actor, canSee, canSeeRegion, currentUser } from "@/lib/admin-auth";
import { runAutoSearch } from "@/lib/auto-search";
import { toRegion } from "@/lib/regions";
import { logAction } from "@/lib/staff";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Runs today's search rotation on demand, for one country.
 *
 * The same job the scheduler runs at 6:17, reachable from the page by
 * somebody who is signed in. It exists because a new market starts empty
 * and ten searches a day is a slow way to find out whether it works:
 * adding America gave us a list with nothing on it and no way to fill it
 * without waiting a week or knowing the cron secret.
 *
 * It is the rotation rather than a free-text search on purpose. The
 * rotation already knows which trade belongs to today and which places
 * have not been tried lately, so pressing this twice walks forward
 * instead of searching the same town again.
 *
 * It spends Places calls, which are capped daily and shared with the
 * scheduler. The cap lives in google-business.ts and applies here exactly
 * as it does to the cron, so the worst this can do is spend tomorrow's
 * finding on today.
 */

/** Per press. Enough to be worth pressing, small enough that a stuck
 *  request is one press rather than the day's allowance. */
const MAX_PER_PRESS = 20;

export async function POST(request: Request) {
  const who = await currentUser();
  if (!canSee(who, "prospects")) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const region = toRegion(body?.region);
  if (!canSeeRegion(who, region)) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const count = Math.max(1, Math.min(MAX_PER_PRESS, Number(body?.count) || 10));
  // Pressing twice should look somewhere new. The page sends how many it
  // has already asked for in this sitting, so the second press starts
  // where the first one stopped rather than re-running it.
  const offset = Math.max(0, Math.min(5000, Number(body?.offset) || 0));

  const result = await runAutoSearch(new Date(), count, offset, region).catch((err) => {
    console.error("Manual find:", err);
    return null;
  });

  if (!result) {
    return NextResponse.json({ error: "search_failed" }, { status: 502 });
  }

  await logAction(
    await actor(),
    "found-businesses",
    `${region.toUpperCase()} ${result.industry}`,
    `${result.searches} searches, ${result.found} found${
      result.stopped ? ` (stopped: ${result.stopped})` : ""
    }`,
  );

  return NextResponse.json({
    industry: result.industry,
    searches: result.searches,
    found: result.found,
    stopped: result.stopped,
  });
}
