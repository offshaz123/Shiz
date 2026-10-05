import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app sits inside a repository that holds another Next.js app, so two
  // lockfiles are visible and Turbopack would otherwise guess the wrong root.
  turbopack: { root: __dirname },

  /**
   * The production build runs on WEBPACK, not Turbopack — see the `--webpack`
   * flag on the build script in package.json.
   *
   * Turbopack compiles CSS by spawning a SEPARATE NODE PROCESS to run
   * PostCSS, which is how Tailwind is processed here. On the deployment
   * container that child process died the moment it was created, and every
   * build failed with:
   *
   *     Failed to write app endpoint /page
   *     Caused by: src/app/globals.css (css)
   *     - creating new process
   *     - node process exited before we could connect to it
   *
   * Nine builds failed that way over four days while the same commits built
   * cleanly elsewhere, because elsewhere was allowed to fork. Webpack runs
   * PostCSS in-process, so nothing has to be spawned and the build has no
   * opinion about the host's process limits. Dev still uses Turbopack, which
   * is fine: the constraint is the deployment container, not this machine.
   *
   * The rest keeps the build's footprint small, since the container that
   * would not let it fork is unlikely to be generous about memory either.
   * None of it changes what is produced.
   */
  experimental: {
    cpus: 1,
    memoryBasedWorkersCount: true,
    webpackMemoryOptimizations: true,
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
