import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Static export for Capacitor iOS native build
  output: 'export',
  outputFileTracingRoot: path.join(__dirname),
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
