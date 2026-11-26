import { NextResponse } from "next/server";
import { actor, canSee, canSeeRegion, currentUser } from "@/lib/admin-auth";
import { logAction } from "@/lib/staff";
import { toRegion } from "@/lib/regions";

/**
 * The page behind this route. Checked here as well as on the page,
 * because the browser calls these directly and a member of staff
 * without the page can type the address of its data.
 */
async function allowed(): Promise<boolean> {
  return canSee(await currentUser(), "prospects");
}
import { searchBusinesses } from "@/lib/google-business";
import { industries } from "@/content/industries";
import { countByContact, getProspect, isStatus, listProspects, listTowns, saveProspects, setProspectDeleted, type ContactFilter, type ProspectFilters, type ProspectStatus, updateProspect } from "@/lib/prospects";

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
  return (await allowed()) ? null : NextResponse.json({ error: "unauthorised" }, { status: 401 });
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
    // Anything unrecognised falls through to the whole list, which is
    // the safe answer: a typo in a query string should show too much
    // rather than quietly show the wrong people.
    contact: (contactParam === "not-contacted" ||
    contactParam === "contacted" ||
    contactParam === "previews"
      ? contactParam
      : "all") as ContactFilter,
    town: (params.get("town") ?? "").slice(0, 80),
    region: toRegion(params.get("region")),
  };

  // The switch is only drawn for the countries somebody works, but the
  // address it calls is typeable. Asking for a list you were not given
  // returns nothing rather than returning it.
  if (!canSeeRegion(await currentUser(), toRegion(filters.region))) {
    return NextResponse.json({ prospects: [], counts: { notContacted: 0, contacted: 0 }, towns: [] });
  }

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
  // Which country to search in, and which to file the results under. Sent
  // by the page rather than guessed from the words typed: "detailing in
  // Arlington" is a real place in both.
  const region = toRegion(body?.region);
  if (!canSeeRegion(await currentUser(), region)) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }
  const result = await searchBusinesses(
    query,
    Math.min(500, Math.max(0, Math.round(maxReviews))),
    region,
  );

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
  await saveProspects(result.businesses, query, industry, town, region);

  // A search answers "who else could I approach", so it comes back with the
  // people still to approach — not with everyone already emailed mixed back
  // in. The counts come with it so the tabs are right immediately rather
  // than after a second request.
  const searchFilters = {
    maxReviews,
    status: "all" as const,
    industry,
    contact: "not-contacted" as const,
    region,
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

  // Moving to or out of the deleted folder is its own thing, not a status
  // change: a deleted prospect keeps whatever status it had, so that putting
  // it back does not quietly reset it to new.
  if (typeof body?.deleted === "boolean") {
    // Read before the change, because afterwards the name is the only
    // way to say in the log which business this was.
    const them = await getProspect(id);
    const moved = await setProspectDeleted(id, body.deleted);
    if (!moved) return NextResponse.json({ error: "not_saved" }, { status: 500 });

    // Recorded like everything else. Nothing here deletes a business
    // outright — the folder is where they go and they can always come
    // back — but a row vanishing off somebody's list is still the sort
    // of thing the person whose list it is should be able to see.
    await logAction(
      await actor(),
      body.deleted ? "deleted-business" : "restored-business",
      them?.name ?? `prospect ${id}`,
      them?.phone ?? "",
    );
    return NextResponse.json({ ok: true });
  }

  const ok = await updateProspect(id, { status, notes, siteScore, email });
  if (!ok) return NextResponse.json({ error: "not_saved" }, { status: 500 });

  // Marking somebody interested or not interested is a decision about a
  // business, and it is the decision Walid most wants attached to a name.
  // Notes and email corrections are recorded too, so the log reads as what
  // somebody did rather than only as the verdicts they reached.
  if (status || notes !== undefined || email !== undefined) {
    const them = await getProspect(id);
    await logAction(
      await actor(),
      status ? "set-status" : notes !== undefined ? "wrote-note" : "fixed-email",
      them?.name ?? `prospect ${id}`,
      status ?? (notes !== undefined ? notes.trim().slice(0, 200) : email),
    );
  }

  return NextResponse.json({ ok: true });
}
