import { NextResponse } from "next/server";
import { blogPosts } from "@/content/blog";
import { siteConfig } from "@/lib/site-config";
import { submitToIndexNow } from "@/lib/indexnow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Tells Bing about posts published in the last few days.
 *
 * Deliberately not the whole sitemap. Submitting unchanged pages is the way
 * to get a site's submissions ignored, and the sitemap already covers the
 * steady state — this is only for the thing that moves daily, which is the
 * blog. The blog index goes with them because its own content changes every
 * time a post lands on it.
 *
 * A three-day window rather than one, so a day the deploy or the cron missed
 * is picked up by the next run instead of being lost. Re-submitting a URL is
 * harmless; never submitting it is not.
 */
const WINDOW_DAYS = 3;

/** Same three outcomes as the follow-ups cron, for the same reason: a dead
 *  scheduler and a stranger probing the URL must not look identical. */
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
        error: "CRON_SECRET is not set on the server",
        fix: "Add CRON_SECRET under Environment variables in hPanel, then redeploy.",
      },
      { status: 503 }
    );
  }
  if (auth === "wrong_key") {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - WINDOW_DAYS);
  const since = cutoff.toISOString().slice(0, 10);

  const recent = blogPosts.filter((post) => post.publishedAt >= since);
  const urls = recent.map((post) => `${siteConfig.url}/blog/${post.slug}`);
  if (urls.length > 0) urls.push(`${siteConfig.url}/blog`);

  const result = await submitToIndexNow(urls);

  return NextResponse.json({
    ...result,
    since,
    posts: recent.map((post) => post.slug),
  });
}
