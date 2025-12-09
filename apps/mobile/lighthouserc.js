/**
 * Lighthouse CI Configuration
 * Enforces performance budgets across the entire application
 * 
 * Targets:
 * - Load Time: <2s
 * - Bundle Size: <5MB
 * - Time to Interactive (TTI): <3s
 * - First Contentful Paint (FCP): <1.5s
 * - Largest Contentful Paint (LCP): <2.5s
 */

module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      startServerCommand: 'pnpm run start',
      url: [
        'http://localhost:3000',
        'http://localhost:3000/moments',
        'http://localhost:3000/profile',
        'http://localhost:3000/search',
      ],
      settings: {
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // Performance
        'categories:performance': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1500 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'speed-index': ['error', { maxNumericValue: 2000 }],
        'interactive': ['error', { maxNumericValue: 3000 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],

        // Resource hints
        'uses-rel-preconnect': 'warn',
        'uses-rel-preload': 'warn',
        
        // JavaScript bundles
        'unminified-javascript': 'error',
        'unused-javascript': ['warn', { maxLength: 1 }],
        'modern-image-formats': 'warn',
        'uses-optimized-images': 'warn',
        'uses-text-compression': 'error',
        'uses-responsive-images': 'warn',

        // Bundle size budgets
        'resource-summary:script:size': ['error', { maxNumericValue: 5120000 }], // 5MB
        'resource-summary:image:size': ['error', { maxNumericValue: 2048000 }], // 2MB
        'resource-summary:stylesheet:size': ['error', { maxNumericValue: 512000 }], // 500KB
        'resource-summary:font:size': ['error', { maxNumericValue: 512000 }], // 500KB
        'resource-summary:total:size': ['error', { maxNumericValue: 8192000 }], // 8MB total

        // Accessibility
        'categories:accessibility': ['error', { minScore: 0.95 }],

        // Best Practices
        'categories:best-practices': ['error', { minScore: 0.9 }],

        // SEO
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
      githubAppToken: process.env.LHCI_GITHUB_APP_TOKEN,
    },
    server: {
      port: 9001,
      storage: {
        storageMethod: 'sql',
        sqlDatabasePath: './lighthouserc.db',
      },
    },
  },
};
