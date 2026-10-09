import type { NextConfig } from "next";

// Pages with a customer's details, basket, orders or the admin portal.
const PERSONAL = "account|admin|checkout|order-confirmed|login|signup|basket|upload-documents";

const nextConfig: NextConfig = {
  // The plate pictures and email logo are read from disk; make sure they're
  // copied into the standalone build Hostinger runs (every route, since
  // emails can be sent from several places).
  outputFileTracingIncludes: {
    "/**/*": ["./src/assets/**"],
  },
  async headers() {
    return [
      {
        // Pages: let Hostinger's CDN keep them for a minute only. Each deploy
        // renames the JavaScript files, so a page cached for longer can point
        // at files that no longer exist and nothing on it works (menus,
        // login, the plate builder).
        source: `/((?!_next/static|_next/image|api|${PERSONAL}).*)`,
        headers: [{ key: "Cache-Control", value: "public, max-age=0, s-maxage=60, stale-while-revalidate=60" }],
      },
      {
        // Pages that show someone's own details are never cached anywhere.
        source: `/(${PERSONAL})(.*)`,
        headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }],
      },
      {
        // Orders and enquiries must never be served from a cache.
        source: "/api/((?!plate-image).*)",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;
