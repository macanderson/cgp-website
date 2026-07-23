import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  headers: async () => [
    {
      source: "/papers/:path*",
      headers: [
        { key: "Content-Disposition", value: "inline" },
        { key: "Cache-Control", value: "public, max-age=3600" },
      ],
    },
  ],
};

export default nextConfig;
