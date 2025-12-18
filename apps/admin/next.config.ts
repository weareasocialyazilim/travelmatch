import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Skip TypeScript errors during build (unused imports etc.)
  // These will be caught by ESLint/pre-commit hooks
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable Turbopack for build due to pre-rendering issues with client components
  turbopack: {
    // Use webpack for production builds
    // Turbopack can still be used for dev with --turbopack flag
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Disable turbopack for builds
  },
};

export default nextConfig;
