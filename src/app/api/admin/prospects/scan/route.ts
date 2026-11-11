import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import {
  attachListing,
  getProspect,
  listUncontactable,
  listUnscanned,
  markListingChecked,
  requeueUnresolved,
  saveProspectScan,
} from "@/lib/prospects";
import { findBusiness } from "@/lib/google-business";
import { scanProspectSite } from "@/lib/prospect-scan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Scans the websites of prospects that have never been scanned, so the call
 * list knows what is wrong with each business before anyone rings it.
 *
 * Works in small batches on purpose. Each scan is a live fetch of somebody
 * else's site, and this runs on shared hosting with a hard process ceiling
 * that has already taken the site down once. A handful at a time, two at a
 * time in flight, is slower and will not fall over.
 */

const BATCH = 8;
const CONCURRENCY = 2;

/** Smaller again, because each one of these costs a Places lookup out of a
 *  daily allowance of sixty. */
const ENRICH_BATCH = 5;

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  // Putting the failures back in the queue, so an improvement to the scanner
  // reaches the businesses already on the list rather than only the ones
  // found after it shipped. Separate from the scanning itself: this marks
  // them, the normal batches then work through them.
  const body = await request.json().catch(() => null);
  if (body?.action === "requeue") {
    const requeued = await requeueUnresolved();
    return NextResponse.json({ requeued });
  }

  // One named prospect, for the Scan button on a single row. It has to be
  // this scanner and not the free audit: the audit returns a score and
  // nothing else, so a row scanned that way got a number and never got an
  // address, which is exactly how two businesses ended up showing a site
  // score and no email while publishing one in plain sight.
  // Phone numbers and websites for the companies that came off the register,
  // which arrive with a name and an address and nothing to ring. One Google
  // lookup each, out of the same daily allowance the search spends, so this
  // is a small batch behind a button rather than something that runs on its
  // own and quietly empties the budget.
  if (body?.action === "find-listings") {
    const waiting = await listUncontactable(ENRICH_BATCH);
    if (waiting === null) {
      return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    }
    if (waiting.length === 0) {
      return NextResponse.json({ found: 0, missing: 0, done: true });
    }

    let found = 0;
    let missing = 0;
    for (const prospect of waiting) {
      const listing = await findBusiness(prospect.name, prospect.town || prospect.address);
      if (listing === "no_key" || listing === "budget") {
        // Out of allowance, or never had a key. Stop rather than mark the
        // rest as checked — they have not been.
        return NextResponse.json(
          { error: listing, found, missing, done: false },
          { status: listing === "no_key" ? 503 : 429 },
        );
      }
      if (listing) {
        await attachListing(prospect.id, listing);
        found += 1;
      } else {
        missing += 1;
      }
      await markListingChecked(prospect.id);
    }

    const left = await listUncontactable(1);
    return NextResponse.json({ found, missing, done: !left || left.length === 0 });
  }

  const single = Number(body?.id);
  if (Number.isInteger(single) && single > 0) {
    const prospect = await getProspect(single);
    if (!prospect) return NextResponse.json({ error: "no_prospect" }, { status: 404 });
    if (!prospect.website) return NextResponse.json({ error: "no_website" }, { status: 400 });

    const result = await scanProspectSite(prospect.website);
    await saveProspectScan(prospect.id, result);
    return result
      ? NextResponse.json({ scanned: 1, score: result.score, email: result.email })
      : NextResponse.json({ error: "unreadable" }, { status: 422 });
  }

  const pending = await listUnscanned(BATCH);
  if (pending === null) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }
  if (pending.length === 0) {
    return NextResponse.json({ scanned: 0, remaining: 0, done: true });
  }

  let scanned = 0;
  let unreadable = 0;

  // A simple worker pool: CONCURRENCY workers pulling off one shared queue,
  // so a slow site holds up only itself rather than the whole batch.
  const queue = [...pending];
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      for (;;) {
        const next = queue.shift();
        if (!next) return;
        const result = await scanProspectSite(next.website);
        await saveProspectScan(next.id, result);
        if (result) scanned++;
        else unreadable++;
      }
    })
  );

  // Whether more are waiting, so the client knows to call again.
  const left = await listUnscanned(1);

  return NextResponse.json({
    scanned,
    unreadable,
    done: !left || left.length === 0,
  });
}
