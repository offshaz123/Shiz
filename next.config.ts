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
};

export default nextConfig;
