import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.mastersmadness.com" }],
        destination: "https://mastersmadness.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
