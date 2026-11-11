import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { measureSpeed } from "@/lib/pagespeed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** A PageSpeed call is a real browser loading a real page somewhere, which
 *  takes longer than a default serverless budget allows for. */
export const maxDuration = 60;

const MESSAGES: Record<string, string> = {
  invalid_url: "That isn't a web address.",
  unreachable: "Google couldn't load that page.",
  rate_limited: "Google is rate limiting us. Wait a minute and try again.",
  error: "Google's speed test didn't answer.",
};

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const url = new URL(request.url).searchParams.get("url") ?? "";
  const result = await measureSpeed(url);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.reason, message: MESSAGES[result.reason] ?? result.reason },
      { status: result.reason === "invalid_url" ? 400 : 503 },
    );
  }

  return NextResponse.json(result.report);
}
