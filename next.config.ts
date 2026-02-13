import type { NextConfig } from "next";
import path from "node:path";

const tailwindPackagePath = path.join(__dirname, "node_modules", "tailwindcss");

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      tailwindcss: tailwindPackagePath,
    },
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      tailwindcss: tailwindPackagePath,
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gpfjkgdwymwdmmrezecc.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-d65000cceb304d8497fd281ce0293955.r2.dev',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.gigrilla.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
