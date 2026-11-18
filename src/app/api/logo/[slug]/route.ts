import { readLogo } from "@/lib/client-logo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * A client's logo, served to anybody who asks.
 *
 * Public on purpose. It appears on invoices that go to their customers by
 * email, and an email client fetching an image has no session and never
 * will. A business logo is the least secret thing a business owns — it is
 * on their van — so there is nothing here to protect.
 *
 * Nothing but the logo is reachable through it: the slug selects a row in
 * one table of images and the response is bytes with an image type on it.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const logo = await readLogo(slug);
  if (!logo) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(logo.bytes), {
    headers: {
      "Content-Type": logo.mime,
      "Content-Length": String(logo.bytes.length),
      // Cached hard, and busted by the ?v= stamp the pages put on the URL
      // when the logo changes. Without that an email sent today would
      // still be showing last year's logo out of somebody's cache.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
