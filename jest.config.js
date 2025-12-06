/**
 * Jest Configuration for React Native
 * Coverage thresholds are progressive - increase as coverage improves
 *
 * Phase 1: 20% (current) - Baseline coverage
 * Phase 2: 35% - After initial test additions
 * Phase 3: 50% - Target coverage
 * Phase 4: 70%+ - Production-ready coverage
 */

module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|expo|@expo|@unimodules|unimodules|sentry-expo|native-base|react-native-svg|@sentry|zustand)/)',
  ],
  testMatch: [
    '**/__tests__/**/*.test.(ts|tsx|js)',
    '**/*.test.(ts|tsx|js)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
    '!src/types/**',
    '!src/**/index.ts',
  ],
  // Coverage thresholds - Phase 1.5: Pre-production targets
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 25,
      lines: 27,
      statements: 27,
    },
    // Critical validation utils require higher coverage
    './src/utils/validation*.ts': {
      branches: 50,
      functions: 60,
      lines: 60,
      statements: 60,
    },
    './src/utils/rateLimiter.ts': {
      branches: 40,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  // Coverage reporters
  coverageReporters: ['text', 'text-summary', 'lcov', 'html'],
  // Test environment
  testEnvironment: 'node',
  // Module aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  // Test timeout
  testTimeout: 10000,
  // Verbose output
  verbose: true,
};
