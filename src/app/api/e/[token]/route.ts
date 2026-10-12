import { markEmailOpened } from "@/lib/email-log";
import { isDbConfigured } from "@/lib/db";

// A 1×1 see-through GIF inside each customer email. Loading it means the
// email was opened.
const GIF = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

export async function GET(_req: Request, ctx: RouteContext<"/api/e/[token]">) {
  const { token } = await ctx.params;
  if (isDbConfigured()) await markEmailOpened(token).catch((err) => console.error("Marking email opened failed", err));
  return new Response(GIF, {
    headers: { "Content-Type": "image/gif", "Cache-Control": "no-store, max-age=0", "Content-Length": String(GIF.length) },
  });
}
