import { NextResponse } from "next/server";
import { buildReport } from "@/lib/site-audit";
import { lookupGoogleBusiness } from "@/lib/google-business";
import { fetchForAudit } from "@/lib/scan-site";

export const runtime = "nodejs";

const TIMEOUT_MS = 12_000;

/**
 * The free audit. Fetches a URL chosen by whoever is using the form, which is
 * why every hop is checked against the private address ranges before anything
 * is requested — see scan-site.ts, which holds that protection so the prospect
 * scanner uses exactly the same code rather than a second copy of it.
 */

/** Which failures are the caller's fault and which are the site's. */
const BAD_REQUEST = new Set(["invalid_url", "blocked_address", "unsupported_port", "unsupported_protocol"]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const raw = typeof body?.url === "string" ? body.url : "";

  try {
    const page = await fetchForAudit(raw, TIMEOUT_MS);

    // Has its own timeout inside and never throws, so a Google outage costs
    // us the listing section and nothing else.
    const google = await lookupGoogleBusiness(page.html, page.finalUrl);

    return NextResponse.json(
      buildReport({
        html: page.html,
        finalUrl: page.finalUrl,
        robots: page.robots,
        sitemap: page.sitemap,
        ms: page.ms,
        google,
      })
    );
  } catch (err) {
    const reason = err instanceof Error ? err.message : "failed";
    return NextResponse.json({ error: reason }, { status: BAD_REQUEST.has(reason) ? 400 : 422 });
  }
}
