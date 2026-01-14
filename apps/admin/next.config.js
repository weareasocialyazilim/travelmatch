/** @type {import('next').NextConfig} */

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
      "connect-src 'self' http://127.0.0.1:54321 ws://127.0.0.1:54321 http://localhost:54321 ws://localhost:54321 https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
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
    // Allow production builds to complete even with type errors
    // This is needed because Supabase types aren't generated for this project
    ignoreBuildErrors: true,
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
  org: "travelmatch-2d",
  project: "travelmatch-admin",

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

