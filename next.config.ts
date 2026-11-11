import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
