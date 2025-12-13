import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // O '**' libera todos os domínios externos
      },
    ],
  },
};

export default nextConfig;
