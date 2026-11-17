import { NextResponse } from "next/server";
import { runAutoSearch } from "@/lib/auto-search";
import { scanBatch } from "@/lib/scan-batch";
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

const SCAN_BATCH = 30;

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
  const search = await runAutoSearch().catch((err) => {
    console.error("Auto search:", err);
    return null;
  });

  const scan = await scanBatch(SCAN_BATCH).catch((err) => {
    console.error("Scan batch:", err);
    return null;
  });

  // The diary entry. Without it this job is invisible: it sends nothing, so
  // there is no email anywhere to prove it ran, and a silent stop would
  // look exactly like a quiet week until the list stopped growing.
  await recordCronRun("find-and-scan", {
    considered: search?.found ?? 0,
    detail: search
      ? `${search.industry}: ${search.searches} searches, ${search.found} found, ` +
        `${scan?.scanned ?? 0} scanned${search.stopped ? ` (stopped: ${search.stopped})` : ""}`
      : "search failed",
  });

  console.log(
    `[find-and-scan] ${search?.industry ?? "?"}: ${search?.searches ?? 0} searches, ` +
      `${search?.found ?? 0} businesses, ${scan?.scanned ?? 0} scanned, ` +
      `${scan?.unreadable ?? 0} unreadable${search?.stopped ? ` (stopped: ${search.stopped})` : ""}`,
  );

  return NextResponse.json({ ok: true, search, scan });
}
