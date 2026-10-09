import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The plate image route reads this font from disk; make sure it's copied
  // into the standalone build Hostinger runs.
  outputFileTracingIncludes: {
    "/api/plate-image": ["./src/assets/**"],
  },
  async headers() {
    return [
      {
        // Orders and enquiries must never be served from a cache.
        source: "/api/((?!plate-image).*)",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;
