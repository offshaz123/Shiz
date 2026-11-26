import { fetchable, signedByUs } from "@/lib/preview-image";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * One of their photographs, fetched by us and passed straight through.
 *
 * Here because a good many hosts serve images only to pages on their
 * own domain and answer everybody else with 403 — hotlink protection,
 * on by default on several popular hosts. The rebuilt page then shows a
 * row of empty frames and looks like we built something broken.
 *
 * Their own site is named as the referer, which is the thing a CDN
 * checks, and the bytes are streamed rather than read into memory: a
 * four-megabyte photograph should not become four megabytes of this
 * process while somebody is waiting for it.
 *
 * Nothing is kept. The answer carries a week of cache so the viewer's
 * browser holds it instead, which is the same week the preview lives
 * for, and when the link dies the pictures die with it because there
 * is nothing on our side to delete.
 */

/** Big enough for any photograph on a website, small enough that this
 *  cannot be used to move something large through our server. */
const MOST_BYTES = 12 * 1024 * 1024;

function no(status: number): Response {
  return new Response(null, { status, headers: { "x-robots-tag": "noindex" } });
}

export async function GET(request: Request): Promise<Response> {
  const asked = new URL(request.url).searchParams;
  const url = asked.get("u") ?? "";
  const signature = asked.get("s") ?? "";

  // Signature first, before anything leaves this machine. Unsigned
  // means somebody else chose the address, and an image proxy anybody
  // can aim is an open relay.
  if (!signedByUs(url, signature)) return no(403);
  if (!fetchable(url)) return no(400);

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      signal: AbortSignal.timeout(12_000),
      redirect: "follow",
      headers: {
        // What their CDN is looking for.
        referer: `${new URL(url).origin}/`,
        accept: "image/*,*/*;q=0.8",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36",
      },
    });
  } catch {
    return no(502);
  }

  if (!upstream.ok || !upstream.body) return no(502);

  const type = (upstream.headers.get("content-type") ?? "").toLowerCase();
  // Only pictures come back through here. A server answering with HTML
  // where an image was asked for is an error page, and passing it on
  // would make this route a way to read arbitrary pages through us.
  if (!type.startsWith("image/")) return no(415);

  const length = Number(upstream.headers.get("content-length") ?? 0);
  if (length > MOST_BYTES) return no(413);

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "content-type": type,
      "cache-control": "public, max-age=604800, immutable",
      "x-robots-tag": "noindex, noimageindex",
      "content-security-policy": "default-src 'none'; sandbox",
      "x-content-type-options": "nosniff",
      ...(length ? { "content-length": String(length) } : {}),
    },
  });
}
