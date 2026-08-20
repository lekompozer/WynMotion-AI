import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Capacitor iOS native build
  output: 'export',
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
