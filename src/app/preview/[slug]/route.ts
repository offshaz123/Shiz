import { byToken, recordOpen, tokenFrom } from "@/lib/previews";
import { getProspect } from "@/lib/prospects";
import { merge, otherPages, rebuildFrom } from "@/lib/site-rebuild";
import { previewPage } from "@/lib/preview-page";
import { fetchForAudit } from "@/lib/scan-site";
import { buildReport } from "@/lib/site-audit";
import { outreachLine } from "@/lib/outreach-lines";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * A business looking at their own website, rebuilt.
 *
 * A route rather than a page, because what comes back is a whole
 * document of its own. It borrows their colours and carries their
 * photographs, and putting it inside our own layout would make it a page
 * about us with their logo on it.
 *
 * Built on the way in rather than stored. Nothing of anybody else's is
 * kept on our server, which is the right answer for somebody who never
 * asked us to hold it, and the comparison is always against their site
 * as it is today, so a business that fixed something last week is not
 * told it is still broken.
 *
 * Never indexed and dead after a week. The token is sixteen random
 * characters and is the only thing the page is found by.
 */

const HTML = {
  "content-type": "text/html; charset=utf-8",
  // Belt and braces alongside the meta tag in the document itself.
  "x-robots-tag": "noindex, nofollow, noarchive",
  "cache-control": "no-store",
  // These pages embed the business's own site in a frame; nothing may
  // embed this one.
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
};

/** 3 December, the way somebody reads a date. */
function dayWords(value: string): string {
  const when = new Date(value.replace(" ", "T"));
  if (Number.isNaN(when.getTime())) return "";
  return when.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
}

function notFound(): Response {
  return new Response("Not found", { status: 404, headers: { "x-robots-tag": "noindex" } });
}

/**
 * The short honest page, for the two ways this does not work.
 *
 * They were one message and one status code until somebody clicked a
 * perfectly live link whose business had a website that would not
 * answer, and was told their preview had expired. Two different
 * problems reading the same is how somebody decides the whole thing is
 * broken.
 */
function stop(
  name: string,
  kind: "expired" | "unreachable",
): Response {
  const expired = kind === "expired";
  const title = expired ? "This preview has expired" : "We could not load your website";
  const body = expired
    ? `The page we built${name ? ` for ${name}` : ""} was live for a week and has now come down.
       If you would still like to see it, we can put it back up in a couple of minutes.`
    : `The page we built${name ? ` for ${name}` : ""} is made fresh from your own website each
       time it is opened, and your site did not answer just now. It may be a blip. Try again in
       a few minutes, or tell us and we will send you a copy instead.`;

  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${title}</title>
<style>
 body{margin:0;min-height:100vh;display:grid;place-items:center;background:#07090d;color:#eef2f7;
      font-family:ui-sans-serif,system-ui,sans-serif;padding:24px;text-align:center;line-height:1.6}
 .box{max-width:34rem} h1{font-size:28px;margin:0 0 14px} p{color:#99a3b3;margin:0 0 22px}
 a.btn{display:inline-block;background:#25d366;color:#fff;padding:14px 26px;border-radius:999px;
       text-decoration:none;font-weight:700}
 .small{font-size:14px;margin-top:18px}
</style></head><body><div class="box">
<h1>${title}</h1>
<p>${body}</p>
<p><a class="btn" href="https://wa.me/${siteConfig.whatsappNumber}">Message us on WhatsApp</a></p>
<p class="small">Or ring ${siteConfig.phoneDisplay}. ${siteConfig.name}.</p>
</div></body></html>`,
    // Gone for an expired link, and a plain 200 for a site that did not
    // answer: nothing has expired, and a 410 would tell a crawler this
    // address is dead for good.
    { status: expired ? 410 : 200, headers: HTML },
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  const token = tokenFrom(slug);
  if (!token) return notFound();

  const preview = await byToken(token);
  if (!preview) return notFound();

  const them = await getProspect(preview.prospectId);
  if (!them) return notFound();
  // Deleted from the list means we are finished with them, and a page
  // carrying their logo should not outlive that decision.
  if (them.deletedAt) return notFound();

  // Counted before the expiry check on purpose. A business coming back to
  // a dead link is still a business worth ringing, and that is exactly
  // the call nobody would otherwise know to make.
  await recordOpen(token);

  if (new Date(preview.expiresAt.replace(" ", "T")).getTime() < Date.now()) {
    return stop(them.name, "expired");
  }

  // No website to rebuild. The no-website version of this is a different
  // job and is not switched on.
  if (!them.website.trim()) return notFound();

  try {
    // Ten, not fifteen. This is a cold prospect who has just clicked a
    // link from a stranger; a blank tab for fifteen seconds is a closed
    // tab, and the honest "could not load it" page is better than that.
    const fetched = await fetchForAudit(them.website, 10_000);
    const report = buildReport({
      html: fetched.html,
      finalUrl: fetched.finalUrl,
      robots: fetched.robots,
      sitemap: fetched.sitemap,
      ms: fetched.ms,
      headers: fetched.headers,
    });
    const rank = (s: string) => (s === "critical" ? 0 : 1);
    const worst = report.categories
      .flatMap((c) => c.checks)
      .filter((c) => c.severity === "critical" || c.severity === "warning")
      .sort((a, b) => rank(a.severity) - rank(b.severity));

    // Their other pages, read in parallel. A homepage alone gives one
    // screen of material, which is why the first rebuild read as a
    // leaflet next to a real website. Three at most, each with a short
    // timeout, and any that does not answer is simply left out.
    const main = rebuildFrom(fetched.html, fetched.finalUrl);
    const others = await Promise.all(
      otherPages(fetched.html, fetched.finalUrl).map(async (href) => {
        try {
          const extra = await fetchForAudit(href, 6_000);
          return rebuildFrom(extra.html, extra.finalUrl);
        } catch {
          return null;
        }
      }),
    );

    const built = merge(main, others.filter((one) => one !== null));

    // Nothing to look at, so nothing is shown.
    //
    // The gate at send time means a link like this should not exist,
    // but links already in inboxes predate it, and a site can lose its
    // pictures in the week between the email and the click. An honest
    // short page beats a black screen with their name on it.
    if (built.images.length === 0) return stop(them.name, "unreachable");

    const page = previewPage({
      them: built,
      website: fetched.finalUrl,
      findings: worst.slice(0, 5).map((c) => outreachLine({ label: c.label, why: c.why ?? "" })),
      // Every failed check, not just the worst five: the checklist is
      // about what is missing, and a thing that did not make the top
      // five is still missing.
      missing: worst.map((c) => c.label),
      score: Math.round(report.score),
      expires: dayWords(preview.expiresAt),
      from: siteConfig.name,
      googleRating: them.rating,
      googleReviews: them.reviews,
    });

    return new Response(page, { status: 200, headers: HTML });
  } catch {
    // Their site is down, or refusing us today. Said as what it is,
    // rather than as an expiry that has not happened.
    return stop(them.name, "unreachable");
  }
}
