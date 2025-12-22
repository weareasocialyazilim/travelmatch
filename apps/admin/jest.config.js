/** @type {import('jest').Config} */
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: 'jsdom',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Test match patterns
  testMatch: [
    '<rootDir>/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/**/*.test.{ts,tsx}',
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
  ],

  // Module name mapping for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.{ts,tsx}',
    '!**/node_modules/**',
    '!**/.next/**',
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80,
    },
  },

  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

  // Performance settings
  maxWorkers: '50%',

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,

  // Test timeout
  testTimeout: 10000,
};

module.exports = createJestConfig(customJestConfig);
