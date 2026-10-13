import type { NextConfig } from "next";

// Pages with a customer's details, basket, orders or the admin portal.
const PERSONAL = "account|admin|checkout|order-confirmed|login|signup|basket|upload-documents|track";

const nextConfig: NextConfig = {
  // Don't advertise what the site is built with.
  poweredByHeader: false,
  // Hostinger's shared plan limits how many processes and threads the
  // account can run. Next.js otherwise sizes these by the server's CPU count
  // (dozens on a shared machine): one build worker per CPU, and image
  // resizing threads for half of them.
  experimental: {
    cpus: 1,
    imgOptConcurrency: 1,
  },
  // The plate pictures and email logo are read from disk; make sure they're
  // copied into the standalone build Hostinger runs (every route, since
  // emails can be sent from several places).
  outputFileTracingIncludes: {
    "/**/*": ["./src/assets/**"],
  },
  async headers() {
    return [
      {
        // Browser protections on every page.
        source: "/:path*",
        headers: [
          // Always use HTTPS.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          // Don't let other sites show ours inside a frame (click-jacking).
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; form-action 'self'; upgrade-insecure-requests",
          },
          // Don't let the browser guess file types (e.g. an upload pretending to be a page).
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Only send our address, not full page addresses, to other sites.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
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
