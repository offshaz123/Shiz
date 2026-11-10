import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { listUnscanned, saveProspectScan } from "@/lib/prospects";
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

export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
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
