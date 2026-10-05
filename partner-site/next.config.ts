import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app sits inside a repository that holds another Next.js app, so two
  // lockfiles are visible and Turbopack would otherwise guess the wrong root.
  turbopack: { root: __dirname },

  /**
   * Keep the production build inside a small container's memory.
   *
   * Builds that had been fine started failing on the host while the same
   * commits built cleanly from a clean `npm ci` locally — which points at
   * the build machine rather than the code. These settings cut the build's
   * peak memory; none of them change what is produced, so the only cost is
   * a slower build, which is a good trade against one that does not finish.
   *
   *  - `cpus: 1` is the big one. Static generation was spawning three
   *    workers, and each is a Node process with its own heap.
   *  - `memoryBasedWorkersCount` lets Next scale workers to the memory
   *    actually available rather than to the core count, which on shared
   *    hosting are very different numbers.
   *  - Source maps are off explicitly rather than by default, because
   *    generating them is a large allocation late in the build.
   *  - `preloadEntriesOnStart: false` also lowers memory at RUNTIME, which
   *    matters on a small instance serving the site.
   */
  experimental: {
    cpus: 1,
    memoryBasedWorkersCount: true,
    serverSourceMaps: false,
    preloadEntriesOnStart: false,
  },
  productionBrowserSourceMaps: false,

  async headers() {
    return [
      {
        // Next serves prerendered pages with `s-maxage=31536000`, which tells a
        // CDN to hold the HTML for a year. Every deploy renames the hashed files
        // under /_next/static/, so cached HTML ends up pointing at chunks that no
        // longer exist. Revalidating on each request keeps the HTML in step with
        // the assets; the ETag makes that a cheap 304.
        source: "/((?!_next/static|_next/image).*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
      },
      {
        // Enquiries must never be served from a cache.
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;
