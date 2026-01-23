/** @type {import('next').NextConfig} */
const { z } = require('zod');

const ENV_SCHEMA = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_POSTHOG_API_KEY: z.string().min(1),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url(),
});

ENV_SCHEMA.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_POSTHOG_API_KEY: process.env.NEXT_PUBLIC_POSTHOG_API_KEY,
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
});

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  eslint: {
    // Vercel build sırasında ESLint hatalarını ignore et
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Vercel optimizations
  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;
