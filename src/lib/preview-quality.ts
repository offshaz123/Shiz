import { fetchForAudit } from "./scan-site";
import { rebuildFrom } from "./site-rebuild";

/**
 * Would a rebuilt page for this business be worth sending?
 *
 * Asked before the email goes, not after. Walid opened a preview we had
 * sent to a Texas homebuilder and found a black screen: no photographs,
 * no logo, nothing but the business name. Their site is full of
 * pictures — it builds them with JavaScript after the page loads, and we
 * read the HTML as the server sends it, which for that site is an empty
 * shell.
 *
 * The page did exactly what it was told to. The fault was that nobody
 * checked before putting the link in an email, and a prospect who opens
 * a link from a stranger and finds an empty page does not open a second
 * one.
 *
 * So this is the gate. A business whose site we cannot read properly
 * does not get a preview at all: they get the ordinary email, and they
 * are worth a phone call instead. Sending nothing is not the failure
 * here. Sending the black screen was.
 */

/** Below this the page has nothing to look at, so there is no page. */
export const LEAST_IMAGES = 3;

export type PreviewCheck = {
  ok: boolean;
  /** Photographs confirmed to exist and actually load. */
  images: number;
  /** Whether a logo was found, for the header. */
  logo: boolean;
  /** Said plainly, for the admin page and the call list. */
  why: string;
};

/**
 * Does this address actually serve an image?
 *
 * A URL in an img tag is a claim, not a photograph. Sites move files,
 * sites block other domains from loading their pictures, and a CDN that
 * answers 403 to everybody but its own pages is common enough that it
 * has a name. Any of those gives a page full of empty frames, which is
 * worse than a page with three pictures on it.
 *
 * HEAD first because it costs nothing. Some servers refuse HEAD, so a
 * refusal falls back to asking for the first byte rather than being
 * taken as a dead image.
 */
async function loads(url: string, ms = 6000): Promise<boolean> {
  // Worked out once, and never allowed to throw: an address that is not
  // a valid URL is not a photograph, and finding that out should not
  // look like the server refusing us.
  let origin = "";
  try {
    origin = new URL(url).origin;
  } catch {
    return false;
  }

  const check = async (method: "HEAD" | "GET") => {
    const stop = AbortSignal.timeout(ms);
    const res = await fetch(url, {
      method,
      signal: stop,
      redirect: "follow",
      headers: {
        // Their own pages are what their CDN expects to see asking.
        referer: `${origin}/`,
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36",
        ...(method === "GET" ? { range: "bytes=0-0" } : {}),
      },
    });
    if (!res.ok && res.status !== 206) return null;
    return (res.headers.get("content-type") ?? "").toLowerCase();
  };

  try {
    let type = await check("HEAD");
    // 405 and friends come back as a thrown or null result; ask again
    // for one byte before writing the picture off.
    if (type === null) type = await check("GET");
    return type !== null && type.startsWith("image/");
  } catch {
    try {
      const type = await check("GET");
      return type !== null && type.startsWith("image/");
    } catch {
      return false;
    }
  }
}

/**
 * How many of these addresses are really photographs.
 *
 * Checked together rather than one after another, and it stops as soon
 * as enough have passed: this runs while somebody is waiting for a cron
 * to finish, and proving the fourth picture works adds nothing to a
 * decision already made.
 */
export async function liveImages(urls: string[], need = LEAST_IMAGES): Promise<number> {
  let alive = 0;
  // Small batches, so a business with twelve pictures does not open
  // twelve connections to their server at once.
  for (let i = 0; i < urls.length && alive < need; i += 4) {
    const batch = await Promise.all(urls.slice(i, i + 4).map((u) => loads(u)));
    alive += batch.filter(Boolean).length;
  }
  return alive;
}

/**
 * The gate itself.
 *
 * Reads their homepage only. The real page also reads up to three more
 * of their pages, so this is a floor rather than a count: a homepage
 * with three working photographs guarantees the finished page has at
 * least three.
 */
export async function previewWouldWork(website: string): Promise<PreviewCheck> {
  const no = (why: string): PreviewCheck => ({ ok: false, images: 0, logo: false, why });
  if (!website.trim()) return no("No website to rebuild.");

  let html: string;
  let finalUrl: string;
  try {
    const got = await fetchForAudit(website, 10_000);
    html = got.html;
    finalUrl = got.finalUrl;
  } catch {
    return no("Their site did not answer, so there was nothing to build from.");
  }

  const them = rebuildFrom(html, finalUrl);
  const images = await liveImages(them.images);
  const logo = Boolean(them.logo) && (await loads(them.logo));

  if (images < LEAST_IMAGES) {
    return {
      ok: false,
      images,
      logo,
      // The commonest cause by far, and the one worth naming: a site
      // built in the browser hands us an empty shell.
      why:
        them.images.length === 0
          ? "Their site builds itself with JavaScript, so we cannot read their pictures. Worth a call."
          : `Only ${images} of their pictures actually load. Not enough to show them.`,
    };
  }

  return { ok: true, images, logo, why: "" };
}
