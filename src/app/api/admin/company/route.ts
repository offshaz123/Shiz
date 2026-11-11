import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { companyProfile, searchCompanies } from "@/lib/companies-house";

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
