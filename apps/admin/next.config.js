/** @type {import('next').NextConfig} */

const { z } = require('zod');

const ENV_SCHEMA = z
  .object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().min(1),
    SENTRY_DSN: z.string().min(1),
    POSTHOG_API_KEY: z.string().optional(),
    EXPO_PUBLIC_POSTHOG_API_KEY: z.string().optional(),
    POSTHOG_PROJECT_ID: z.string().optional(),
  })
  .refine(
    (env) => Boolean(env.POSTHOG_API_KEY || env.EXPO_PUBLIC_POSTHOG_API_KEY),
    {
      message: 'POSTHOG_API_KEY or EXPO_PUBLIC_POSTHOG_API_KEY is required',
      path: ['POSTHOG_API_KEY'],
    },
  );

ENV_SCHEMA.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  SENTRY_DSN: process.env.SENTRY_DSN,
  POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
  EXPO_PUBLIC_POSTHOG_API_KEY: process.env.EXPO_PUBLIC_POSTHOG_API_KEY,
  POSTHOG_PROJECT_ID: process.env.POSTHOG_PROJECT_ID,
});

// Security headers configuration
// OWASP recommended headers for web application security
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // SECURITY: Removed 'unsafe-eval' to prevent XSS attacks
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' http://127.0.0.1:54321 ws://127.0.0.1:54321 http://localhost:54321 ws://localhost:54321 https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
  },
];

const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // Note: ESLint configuration moved to eslint.config.mjs (Next.js 16+ requirement)
  typescript: {
    // SECURITY: Type errors must be fixed before deployment
    // Generate Supabase types with: pnpm supabase gen types typescript
    ignoreBuildErrors: false,
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
        hostname: 'api.dicebear.com',
      },
      {
         protocol: 'https',
         hostname: 'avatar.vercel.sh'
      }
    ],
  },
  // Security headers for all routes
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  // Note: Server Actions are always enabled in Next.js 15+
};

module.exports = withSentryConfig(nextConfig, {
  // Sentry configuration
  org: "lovendo-2d",
  project: "lovendo-admin",

  // Silent mode - no warnings during build
  silent: true,

  // Disable source map upload (no auth token configured)
  sourcemaps: {
    disable: true,
  },

  // Disable release creation (no auth token configured)
  release: {
    create: false,
  },

  // Route browser requests to Sentry through a Next.js rewrite
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,
});

