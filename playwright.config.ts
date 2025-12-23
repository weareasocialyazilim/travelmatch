import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration for TravelMatch
 *
 * This configuration enables E2E testing for both web and admin apps.
 *
 * Usage:
 *   - pnpm test:e2e          # Run all E2E tests
 *   - pnpm test:e2e:web      # Run only web app tests
 *   - pnpm test:e2e:admin    # Run only admin app tests
 *   - pnpm test:e2e:ui       # Run with UI mode
 */

export default defineConfig({
  // Test directory
  testDir: './tests/e2e-playwright',

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry failed tests
  retries: process.env.CI ? 2 : 0,

  // Limit workers on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/e2e-results.json' }],
    ['junit', { outputFile: 'test-results/e2e-results.xml' }],
    process.env.CI ? ['github'] : ['list'],
  ],

  // Global timeout
  timeout: 30000,

  // Expect timeout
  expect: {
    timeout: 5000,
  },

  // Shared settings for all projects
  use: {
    // Base URL for tests
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Capture screenshot on failure
    screenshot: 'only-on-failure',

    // Record video on failure
    video: 'retain-on-failure',

    // Default viewport
    viewport: { width: 1280, height: 720 },

    // Action timeout
    actionTimeout: 10000,

    // Navigation timeout
    navigationTimeout: 15000,
  },

  // Configure projects for major browsers
  projects: [
    // Web App Projects
    {
      name: 'web:chromium',
      testMatch: '**/web/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3000',
      },
    },
    {
      name: 'web:firefox',
      testMatch: '**/web/**/*.spec.ts',
      use: {
        ...devices['Desktop Firefox'],
        baseURL: 'http://localhost:3000',
      },
    },
    {
      name: 'web:webkit',
      testMatch: '**/web/**/*.spec.ts',
      use: {
        ...devices['Desktop Safari'],
        baseURL: 'http://localhost:3000',
      },
    },

    // Admin App Projects
    {
      name: 'admin:chromium',
      testMatch: '**/admin/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3001',
      },
    },
    {
      name: 'admin:firefox',
      testMatch: '**/admin/**/*.spec.ts',
      use: {
        ...devices['Desktop Firefox'],
        baseURL: 'http://localhost:3001',
      },
    },

    // Mobile viewport testing
    {
      name: 'web:mobile-chrome',
      testMatch: '**/web/**/*.spec.ts',
      use: {
        ...devices['Pixel 5'],
        baseURL: 'http://localhost:3000',
      },
    },
    {
      name: 'web:mobile-safari',
      testMatch: '**/web/**/*.spec.ts',
      use: {
        ...devices['iPhone 13'],
        baseURL: 'http://localhost:3000',
      },
    },
  ],

  // Web server configuration
  webServer: [
    {
      command: 'pnpm --filter @travelmatch/web dev',
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command: 'pnpm --filter @travelmatch/admin dev',
      port: 3001,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],

  // Output directory for test artifacts
  outputDir: 'test-results/e2e-artifacts',
});
