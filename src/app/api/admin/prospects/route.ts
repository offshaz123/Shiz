import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { searchBusinesses } from "@/lib/google-business";
import { industries } from "@/content/industries";
import {
  saveProspects,
  listProspects,
  countByContact,
  listTowns,
  updateProspect,
  isStatus,
  type ContactFilter,
  type ProspectFilters,
  type ProspectStatus,
} from "@/lib/prospects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The call list: searching for businesses, reading the saved ones back, and
 * writing what happened on the phone.
 *
 * Admin only. Not because public listings are sensitive — they aren't — but
 * because every search spends a Google lookup out of a monthly allowance, and
 * an open endpoint would be somebody else's free Places API.
 */

const MAX_QUERY = 120;

async function guard() {
  return (await isAdmin()) ? null : NextResponse.json({ error: "unauthorised" }, { status: 401 });
}

function num(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

/** Only an industry the site actually has. Anything else is ignored. */
function industrySlug(value: unknown): string {
  return typeof value === "string" && industries.some((i) => i.slug === value) ? value : "";
}

/** Reads the saved list back, with the filters applied. */
export async function GET(request: Request) {
  const denied = await guard();
  if (denied) return denied;

  const params = new URL(request.url).searchParams;
  const statusParam = params.get("status") ?? "all";
  const contactParam = params.get("contact");

  const filters: ProspectFilters = {
    maxReviews: num(params.get("maxReviews")),
    minRating: num(params.get("minRating")),
    industry: industrySlug(params.get("industry")),
    sort: params.get("sort") === "worst-site" ? ("worst-site" as const) : ("default" as const),
    status:
      statusParam === "all" || statusParam === "to-call"
        ? statusParam
        : isStatus(statusParam)
          ? statusParam
          : ("all" as const),
    contact: (contactParam === "not-contacted" || contactParam === "contacted"
      ? contactParam
      : "all") as ContactFilter,
    town: (params.get("town") ?? "").slice(0, 80),
  };

  // Both in one request: the list itself, and the two tab counts above it.
  // Separately they would be two round trips that can disagree with each
  // other by a send that happened in between.
  const [prospects, counts, towns] = await Promise.all([
    listProspects(filters),
    countByContact(filters),
    // The town list ignores the town that is selected, so choosing one does
    // not reduce the menu to the thing you just chose.
    listTowns({ ...filters, town: "" }),
  ]);

  if (!prospects) return NextResponse.json({ error: "no_database" }, { status: 500 });
  return NextResponse.json({ prospects, counts, towns: towns ?? [] });
}

/** Searches Google for businesses in an area, and files what it finds. */
export async function POST(request: Request) {
  const denied = await guard();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const query = typeof body?.query === "string" ? body.query.trim().slice(0, MAX_QUERY) : "";
  if (query.length < 3) {
    return NextResponse.json({ error: "query_too_short" }, { status: 400 });
  }

  const maxReviews = num(body?.maxReviews) ?? 50;
  const result = await searchBusinesses(query, Math.min(500, Math.max(0, Math.round(maxReviews))));

  if (result.status === "unavailable") {
    const status = result.reason === "no_key" ? 503 : result.reason === "budget" ? 429 : 502;
    return NextResponse.json({ error: result.reason, message: result.message }, { status });
  }

  // Filed before answering, so the list the page reads back is already
  // complete and a search is never a result you can only see once.
  const industry = industrySlug(body?.industry);
  // The town comes from its own box rather than being picked back out of the
  // query, so "nail salons in Barking" and a free-text search are filed the
  // same way.
  const town = typeof body?.town === "string" ? body.town.trim().slice(0, 80) : "";
  await saveProspects(result.businesses, query, industry, town);

  // A search answers "who else could I approach", so it comes back with the
  // people still to approach — not with everyone already emailed mixed back
  // in. The counts come with it so the tabs are right immediately rather
  // than after a second request.
  const searchFilters = {
    maxReviews,
    status: "all" as const,
    industry,
    contact: "not-contacted" as const,
  };
  const [prospects, counts] = await Promise.all([
    listProspects(searchFilters),
    countByContact(searchFilters),
  ]);

  return NextResponse.json({
    found: result.found,
    dropped: result.dropped,
    matched: result.businesses.length,
    prospects: prospects ?? [],
    counts,
    saved: prospects !== null,
  });
}

/** What happened when you rang them. */
export async function PATCH(request: Request) {
  const denied = await guard();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const id = num(body?.id);
  if (!id) return NextResponse.json({ error: "bad_id" }, { status: 400 });

  const status: ProspectStatus | undefined = isStatus(body?.status) ? body.status : undefined;
  const notes = typeof body?.notes === "string" ? body.notes : undefined;
  const siteScore = num(body?.siteScore);
  // A plain shape check, not validation of the address itself: the person
  // typing it is reading it off the business's own website.
  const email =
    typeof body?.email === "string" && (body.email.trim() === "" || body.email.includes("@"))
      ? body.email
      : undefined;

  const ok = await updateProspect(id, { status, notes, siteScore, email });
  if (!ok) return NextResponse.json({ error: "not_saved" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
