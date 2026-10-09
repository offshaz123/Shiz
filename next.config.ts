import type { NextConfig } from "next";

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
        // Orders and enquiries must never be served from a cache.
        source: "/api/((?!plate-image).*)",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;
