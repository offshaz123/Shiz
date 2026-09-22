import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app sits inside a repository that holds another Next.js app, so two
  // lockfiles are visible and Turbopack would otherwise guess the wrong root.
  turbopack: { root: __dirname },

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
