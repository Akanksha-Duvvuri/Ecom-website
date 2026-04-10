import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  /* config options here */
  reactCompiler: true,
  images: {
    domains: ["firebasestorage.googleapis.com"],
  },
};

export default nextConfig;
