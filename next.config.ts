import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stops Next announcing itself in a response header. It tells an attacker
  // which framework and therefore which published vulnerabilities to try
  // first, and it tells a visitor nothing at all.
  poweredByHeader: false,

  experimental: {
    // Four build workers, not fifty-five.
    //
    // The host reports 55 CPUs and Next sizes its static-generation pool
    // from that, so building 165 pages forked 55 copies of Node and the
    // pool was killed with SIGABRT partway through. It is a memory limit,
    // not a CPU one, and the two do not move together on shared hosting.
    //
    // `cpus` is the setting that actually sizes the pool — see
    // getNumberOfWorkers in next/dist/build/index.js, which reads this and
    // falls back to the machine's core count.
    // staticGenerationMinPagesPerWorker was the obvious-looking knob and
    // did nothing: Next logged it as applied and still forked 55.
    //
    // This site builds its 165 pages in under three seconds on three
    // workers, because the limit here was never CPU.
    cpus: 4,
  },

  async headers() {
    return [
      {
        // Next serves prerendered pages with `s-maxage=31536000`, which tells the
        // CDN in front of us to hold the HTML for a year. Every deploy renames the
        // hashed files under /_next/static/, so cached HTML ends up referencing
        // chunks that no longer exist and the page fails to render until the
        // visitor clears their cache. Revalidating on each request keeps the HTML
        // in step with the assets it points at; the ETag makes that a cheap 304.
        //
        // /_next/static and /_next/image are excluded because those filenames are
        // content-hashed and safe to cache long-term. A bare `/:path*` match does
        // override Next's own `immutable` header on them, which would cost a
        // revalidation round-trip per asset on every page load.
        source: "/((?!_next/static|_next/image).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        /**
         * The security headers, which this site had none of.
         *
         * Worth saying why each is here rather than pasting a block from
         * somewhere, because a header nobody understands is a header nobody
         * will dare change later.
         *
         * Deliberately NOT here: a real Content-Security-Policy. This site
         * loads Google Tag Manager, the Meta pixel and Google Fonts, and a
         * CSP written without testing every one of those breaks tracking
         * silently — the page still renders, the scripts just stop. That is
         * a worse outcome than no CSP, and it is its own job with its own
         * testing.
         */
        source: "/:path*",
        headers: [
          {
            // Tells browsers to refuse plain HTTP to this domain for a year.
            // Safe here because the site is already HTTPS-only. No preload:
            // getting on the preload list is easy and getting off it takes
            // months, so that is not a decision to make in passing.
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            // Stops a browser second-guessing a file's declared type, which
            // is how an uploaded "image" ends up being run as a script.
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Nobody may frame this site. Clickjacking works by putting a
            // real page under an invisible one, and a quote form is exactly
            // the sort of thing worth hijacking.
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            // Send the full URL within our own site, only the domain to
            // anyone else. Without this, a page address with a token or an
            // email in it leaks to every third party the page talks to.
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // This site has no reason to ask for a camera, a microphone or
            // a location, so nothing embedded in it should be able to.
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
      {
        // Lead submissions must never be served from a cache.
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
