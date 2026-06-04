import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  sassOptions: {
    loadPaths: [path.join(__dirname, "src"), path.join(__dirname, "src/shared")],
  },
  allowedDevOrigins: ["192.168.1.116"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
