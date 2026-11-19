import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getAdminClient, setClientTrade, setSiteScan } from "@/lib/clients";
import { fetchForAudit } from "@/lib/scan-site";
import { buildReport } from "@/lib/site-audit";
import { guessTrade } from "@/lib/guess-trade";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// A scan is a dozen requests to somebody else's server. Given room, but
// not unlimited room.
export const maxDuration = 60;

/**
 * Scans a client's own website and keeps what matters.
 *
 * Run from a button rather than on every page view, because a scan is a
 * dozen requests to somebody else's server and the answer does not
 * change from one hour to the next. What is kept is the score and the
 * handful of things most worth fixing — not the whole report, which
 * nobody reads twice.
 *
 * The trade is only filled in from the guess when nobody has set one by
 * hand. Somebody who went in and chose "number plates" because the site
 * is full of the word "car" should not have it quietly overwritten the
 * next time the site is scanned.
 */
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const slug = typeof (body as { slug?: unknown })?.slug === "string"
    ? (body as { slug: string }).slug
    : "";
  const url = typeof (body as { url?: unknown })?.url === "string"
    ? (body as { url: string }).url
    : "";

  const client = slug ? await getAdminClient(slug) : null;
  if (!client) return NextResponse.json({ error: "no_such_client" }, { status: 404 });
  if (!url.trim()) return NextResponse.json({ error: "needs_a_website" }, { status: 400 });

  let page;
  try {
    page = await fetchForAudit(url);
  } catch {
    return NextResponse.json({ error: "could_not_reach_it" }, { status: 400 });
  }

  const report = buildReport({
    html: page.html,
    finalUrl: page.finalUrl,
    robots: page.robots,
    sitemap: page.sitemap,
    ms: page.ms,
    headers: page.headers,
  });

  // The things worth telling somebody about: broken first, and only the
  // ones that come with a reason. A check we could not explain the cost
  // of is noise on a page meant to be acted on.
  const rank = (severity: string) => (severity === "critical" ? 0 : 1);
  const issues = report.categories
    .flatMap((category) => category.checks)
    .filter((check) => check.severity === "critical" || check.severity === "warning")
    .filter((check): check is typeof check & { why: string } => Boolean(check.why))
    .sort((a, b) => rank(a.severity) - rank(b.severity))
    .slice(0, 5)
    .map((check) => ({ label: check.label, why: check.why }));

  await setSiteScan(client.id, { score: report.score, issues });

  const guess = guessTrade(page.html.replace(/<[^>]+>/g, " "));
  const guessed = guess.trade !== "general" && !client.trade;
  if (guessed) await setClientTrade(client.id, guess.trade);

  return NextResponse.json({
    score: report.score,
    issues,
    trade: guess.trade,
    guessed,
    because: guess.because,
  });
}
