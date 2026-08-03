import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/services/caliper-painting",
        destination: "/services/alloy-refurbishment",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // Every page except the hashed Next.js build assets, which are safe to cache forever.
        source: "/:path((?!_next/static|_next/image|favicon.ico).*)",
        headers: [
          { key: "Cache-Control", value: "no-cache, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
