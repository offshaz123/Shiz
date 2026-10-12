import { type NextRequest, NextResponse } from "next/server";
import { site } from "@/lib/site";

// Blocks other websites from making a visitor's browser send orders, logins
// or admin actions to ours (cross-site request forgery). Browsers always say
// which site a request comes from; anything not from PlatedUp is refused.
// Stripe's webhook is checked by its signature instead.
const own = new URL(site.url).host.replace(/^www\./, "");

export function proxy(req: NextRequest) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return NextResponse.next();
  if (req.nextUrl.pathname.startsWith("/api/stripe/webhook")) return NextResponse.next();
  const origin = req.headers.get("origin");
  if (!origin) return NextResponse.next();
  let from = "";
  try {
    from = new URL(origin).host;
  } catch {}
  const allowed = new Set([own, `www.${own}`, req.headers.get("host") ?? "", req.headers.get("x-forwarded-host") ?? ""]);
  if (from && allowed.has(from)) return NextResponse.next();
  return NextResponse.json({ error: "This request isn't allowed." }, { status: 403 });
}

export const config = { matcher: "/api/:path*" };
