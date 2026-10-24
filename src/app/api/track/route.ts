import { NextResponse } from "next/server";
import { withDb } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Records a page view.
 *
 * Deliberately anonymous: the path, where they came from, and the country
 * the CDN reports. No cookie, no identifier, nothing that survives the visit
 * and nothing that could be tied back to a person.
 *
 * That is a design decision, not an oversight. PECR's cookie rules bite when
 * you store or read something on someone's device; this stores nothing, so it
 * needs no banner and keeps working for the people who refuse one. It answers
 * the only question the admin page asks — "is anyone reading the pricing
 * page" — and nothing more.
 */

const MAX_PATH = 255;

/** Obvious junk, so a bot probing for /wp-admin doesn't fill the table. */
function looksReal(path: string): boolean {
  if (!path.startsWith("/")) return false;
  if (path.length > MAX_PATH) return false;
  return !/\.(php|asp|aspx|jsp|cgi|env|git|sql|bak)$/i.test(path);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { path?: unknown; referrer?: unknown }
    | null;

  const path = typeof body?.path === "string" ? body.path.slice(0, MAX_PATH) : "";
  if (!looksReal(path)) {
    // Quietly accepted so a crawler learns nothing from the response.
    return new NextResponse(null, { status: 204 });
  }

  // Only the referring site, never the full URL — a referrer can carry search
  // terms and query strings we have no reason to keep.
  let referrer: string | null = null;
  if (typeof body?.referrer === "string" && body.referrer) {
    try {
      const host = new URL(body.referrer).hostname;
      referrer = host === new URL(request.url).hostname ? null : host.slice(0, 255);
    } catch {
      referrer = null;
    }
  }

  const country =
    request.headers.get("cf-ipcountry")?.slice(0, 2) ??
    request.headers.get("x-vercel-ip-country")?.slice(0, 2) ??
    null;

  await withDb(async (db) => {
    await db.execute(
      "INSERT INTO page_views (path, referrer, country) VALUES (?, ?, ?)",
      [path, referrer, country],
    );
  });

  return new NextResponse(null, { status: 204 });
}
