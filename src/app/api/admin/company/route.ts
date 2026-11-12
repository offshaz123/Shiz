import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { companyProfile, searchCompanies, searchRegister, SECTORS } from "@/lib/companies-house";
import { deleteProspectsFromRegister, saveProspects } from "@/lib/prospects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The register, for the admin only.
 *
 * Admin-gated not because the data is secret — it is the public register —
 * but because an open endpoint is somebody else's free Companies House
 * client, and the rate limit it burns through would be ours.
 */

const MESSAGES: Record<string, string> = {
  no_key: "COMPANIES_HOUSE_KEY isn't set on the server, so the register can't be searched.",
  rejected: "Companies House rejected the key. It needs to be a live REST key, not a streaming one.",
  rate_limited: "Companies House is rate limiting us. Wait a minute and try again.",
  not_found: "No company with that number.",
  error: "Companies House didn't answer.",
};

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const number = params.get("number");

  const result = number
    ? await companyProfile(number)
    : await searchCompanies(params.get("q") ?? "");

  if (!result.ok) {
    return NextResponse.json(
      { error: result.reason, message: MESSAGES[result.reason] ?? result.reason },
      { status: result.reason === "not_found" ? 404 : 503 },
    );
  }

  return NextResponse.json(number ? { company: result.data } : { results: result.data });
}

/**
 * Finding newly incorporated companies and putting them on the call list.
 *
 * A separate verb from the lookup above because it writes: the register is
 * read freely, but adding fifty businesses to the thing somebody will ring
 * on Monday should take a deliberate press.
 *
 * The register carries no phone number and no website — it is a list of legal
 * entities, not of shop fronts — so these arrive on the call list with a name
 * and an address and nothing to dial. That is honest and it is still useful:
 * "no website at all" is the easiest conversation this business has, and the
 * list puts those first.
 */
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const sector = typeof body?.sector === "string" ? body.sector : "";
  const location = typeof body?.location === "string" ? body.location : "";
  const months = Number(body?.months) || 3;
  const size = Number(body?.size) || 20;

  const found = await searchRegister({ sector, location, months, size });
  if (!found.ok) {
    return NextResponse.json(
      { error: found.reason, message: MESSAGES[found.reason] ?? found.reason },
      { status: 503 },
    );
  }

  if (!body?.save) return NextResponse.json({ results: found.data });

  /**
   * Only the companies that were ticked.
   *
   * The register is re-searched above rather than the browser posting the
   * rows back, so what gets written is still Companies House's data and not
   * whatever the page happened to be holding. The selection only filters it.
   *
   * No selection means nothing is saved. An empty list used to mean "all of
   * them", which is how fifty companies end up on the call list from one
   * mis-aimed press.
   */
  const select: string[] = Array.isArray(body?.select)
    ? body.select.filter((n: unknown): n is string => typeof n === "string")
    : [];

  if (select.length === 0) {
    return NextResponse.json({ results: found.data, saved: 0 });
  }

  const wanted = new Set(select);
  const chosen = found.data.filter((hit) => wanted.has(hit.number));

  const label = SECTORS.find((s) => s.slug === sector)?.label ?? sector;
  await saveProspects(
    chosen.map((hit) => ({
      // Prefixed so a company from the register and a listing from Google
      // can never collide on the same key, and so it is obvious later where
      // a row came from.
      id: `ch:${hit.number}`,
      name: hit.title,
      address: hit.address,
      mapsUri: "",
      websiteUri: "",
      phone: "",
      category: hit.kind,
      rating: null,
      reviews: 0,
      hasHours: false,
      photos: 0,
      latestReviewAt: null,
      closed: false,
    })),
    `${label} incorporated in the last ${months} months${location ? ` near ${location}` : ""}`,
    "",
    location.trim(),
  );

  return NextResponse.json({ results: found.data, saved: chosen.length });
}

/**
 * Undo for the button above.
 *
 * Adding fifty companies takes one press, so taking them off again should
 * too — it is easy to hit "add all" meaning to look at the results first.
 */
export async function DELETE() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const result = await deleteProspectsFromRegister();

  if (!result) {
    return NextResponse.json({ error: "no_database" }, { status: 503 });
  }

  return NextResponse.json(result);
}
