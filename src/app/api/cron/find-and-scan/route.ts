import { NextResponse } from "next/server";
import { runAutoSearch, SEARCHES_PER_REGION } from "@/lib/auto-search";
import { REGIONS } from "@/lib/regions";
import { scanBatch } from "@/lib/scan-batch";
import { sweepAddresses } from "@/lib/sweep-addresses";
import { countUnworked } from "@/lib/prospects";
import { recordCronRun } from "@/lib/admin-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Filling the top of the pipeline: find businesses, then read their websites.
 *
 * Its own job rather than more work bolted onto the follow-ups route, for
 * one reason. Both halves of this are slow and neither is urgent: a search
 * is a call to Google, and a scan is a live fetch of somebody else's site,
 * several of them, some of which will hang until they time out. The emails
 * are the thing that must not be delayed or lost, so they keep a route that
 * does almost nothing else and this runs hours earlier.
 *
 * Both halves are safe to run twice. Searches are keyed on Google's place
 * id so a repeat adds nothing, and a scan stamps the row either way so an
 * unreadable site is not retried forever.
 */

/**
 * How many websites to read in one run.
 *
 * Raised because this, not the searching, is what decides how many
 * businesses ever become contactable: the email address is found by
 * reading their site, so a business that is never scanned is a phone
 * number and nothing else. It costs nothing — these are our own requests
 * to public pages, not an API with a meter on it.
 */
const SCAN_BATCH = 80;

/**
 * How big the unworked pile is allowed to get before the search stops.
 *
 * The whole point of the number. Finding is the only part of this that
 * costs money, and it was running flat out whether or not anybody was
 * getting through the last lot — up to two hundred found a day against
 * fifteen emails and whatever the phone managed.
 *
 * So it now looks at what is already waiting and skips the search when
 * there is plenty. Nobody has to tune it: a busy week on the phone empties
 * the pile and searching starts again by itself, a quiet week leaves it
 * full and we stop paying Google to lengthen a queue.
 */
const ENOUGH_WAITING = 150;

function authorised(request: Request): "ok" | "wrong_key" | "not_configured" {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) return "not_configured";

  const header = request.headers.get("authorization");
  if (header === `Bearer ${secret}`) return "ok";
  return new URL(request.url).searchParams.get("key") === secret ? "ok" : "wrong_key";
}

export async function POST(request: Request) {
  return run(request);
}

export async function GET(request: Request) {
  return run(request);
}

async function run(request: Request) {
  const auth = authorised(request);
  if (auth === "not_configured") {
    return NextResponse.json(
      {
        error: "cron_secret_not_configured",
        fix: "Add CRON_SECRET under Environment variables in hPanel, then redeploy.",
      },
      { status: 503 },
    );
  }
  if (auth !== "ok") {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  // Search first: today's new businesses are then scannable in the same run
  // rather than waiting a day to be seen.
  // Both optional and both only for a nudge by hand: the daily run passes
  // neither. `offset` skips past searches a previous run today already did,
  // so a second call adds new businesses rather than re-finding the same
  // ones; `count` is capped because the Places allowance is sixty a day and
  // a typo in a URL should not spend it.
  const params = new URL(request.url).searchParams;
  const offset = Math.max(0, Math.min(2000, Number(params.get("offset")) || 0));
  const count = Math.max(1, Math.min(40, Number(params.get("count")) || 20));

  // Asked for by hand with a count means somebody wants it to run, so the
  // backlog check is skipped. The daily job passes nothing and is checked.
  const forced = params.get("count") !== null;

  // Each country is checked and searched on its own. A full British pile
  // is no reason to stop looking in America, and the whole point of the
  // backlog check is that it responds to what is actually waiting.
  // Split between the countries, not handed to each of them. A forced run
  // asking for forty used to mean forty searches; with two regions and a
  // per-region figure it quietly became eighty, against a daily Places
  // allowance of sixty that did not grow when America was added.
  const perRegion = forced
    ? Math.max(1, Math.floor(count / REGIONS.length))
    : SEARCHES_PER_REGION;
  const runs = [];
  for (const region of REGIONS) {
    const waiting = forced ? null : await countUnworked(region);
    const full = waiting !== null && waiting >= ENOUGH_WAITING;
    const search = full
      ? null
      : await runAutoSearch(new Date(), perRegion, offset, region).catch((err) => {
          console.error(`Auto search (${region}):`, err);
          return null;
        });
    runs.push({ region, waiting, full, search });
  }

  // Totals across both countries. The diary row and the log line read as
  // one job, and taking them from whichever region happened to come back
  // first reported half the work — the find-and-scan figure on the
  // overview would have undercounted from the day America was added.
  const waiting = runs.reduce((n, r) => n + (r.waiting ?? 0), 0);
  const full = runs.every((r) => r.full);
  const found = runs.reduce((n, r) => n + (r.search?.found ?? 0), 0);
  const searches = runs.reduce((n, r) => n + (r.search?.searches ?? 0), 0);
  const stopped = runs.find((r) => r.search?.stopped)?.search?.stopped ?? "";

  const scan = await scanBatch(SCAN_BATCH).catch((err) => {
    console.error("Scan batch:", err);
    return null;
  });

  // A few of the addresses stored before anything checked them. Last, so a
  // slow resolver costs the sweep rather than the scanning.
  const sweep = await sweepAddresses().catch((err) => {
    console.error("Address sweep:", err);
    return null;
  });

  // The diary entry. Without it this job is invisible: it sends nothing, so
  // there is no email anywhere to prove it ran, and a silent stop would
  // look exactly like a quiet week until the list stopped growing.
  await recordCronRun("find-and-scan", {
    considered: found,
    detail:
      (full
        ? `${waiting} still waiting to be worked in both countries, so no searching today. ` +
          `${scan?.scanned ?? 0} scanned.`
        : runs.some((r) => r.search)
          ? // One line per country, so "America found nothing again" is
            // visible rather than averaged away into a single total.
            runs
              .map((r) =>
                r.full
                  ? `${r.region.toUpperCase()}: ${r.waiting} waiting, skipped`
                  : r.search
                    ? `${r.region.toUpperCase()} ${r.search.industry}: ${r.search.searches} searches, ` +
                      `${r.search.found} found${r.search.stopped ? ` (stopped: ${r.search.stopped})` : ""}`
                    : `${r.region.toUpperCase()}: search failed`,
              )
              .join(". ") + `. ${scan?.scanned ?? 0} scanned`
          : `search failed. ${scan?.scanned ?? 0} scanned`) +
      // Only mentioned when it found something. A line saying nothing was
      // wrong, every day, is a line nobody reads.
      (sweep && sweep.dead > 0
        ? ` ${sweep.dead} of ${sweep.checked} stored addresses have no mail server.`
        : ""),
  });

  if (full) {
    console.log(
      `[find-and-scan] ${waiting} unworked, skipping the search. ` +
        `${scan?.scanned ?? 0} scanned.`,
    );
  }

  console.log(
    `[find-and-scan] ${searches} searches across ${runs.filter((r) => r.search).length} ` +
      `countries, ${found} businesses, ${scan?.scanned ?? 0} scanned, ` +
      `${scan?.unreadable ?? 0} unreadable, ` +
      `${sweep?.checked ?? 0} addresses checked (${sweep?.dead ?? 0} dead)` +
      `${stopped ? ` (stopped: ${stopped})` : ""}`,
  );

  return NextResponse.json({ ok: true, waiting, skippedSearch: full, runs, scan, sweep });
}
