import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Start a new build worker only every fifty pages.
    //
    // The build died on the host with SIGABRT partway through generating
    // 165 static pages across 55 workers. Fifty-five copies of Node on
    // shared hosting is not a build, it is a fork bomb with a progress
    // bar. Next sizes the pool from the CPUs it can see, so the number
    // crept up as the blog grew and as the host reported more cores —
    // which is why the same code built on Monday and not on Wednesday.
    //
    // Three or four workers build this site in about the same wall-clock
    // time, because the limit here was never CPU.
    staticGenerationMinPagesPerWorker: 50,
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
