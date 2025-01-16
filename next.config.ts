import type { NextConfig } from "next";

const domain = process.env.NEXT_PUBLIC_DOMAIN || "localhost";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: domain,
        port: "",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: domain,
        port: "8000",
        pathname: "/**",
      }
    ],
  },
};

export default nextConfig;
