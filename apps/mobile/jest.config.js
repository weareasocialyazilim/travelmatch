const jestExpoPreset = require('jest-expo/jest-preset');

module.exports = {
  ...jestExpoPreset,
  testEnvironment: 'node',
  // Increase timeout for async operations (Phase 3 fix)
  testTimeout: 10000, // Increased from default 5000ms
  // Override setupFiles to avoid React Native's setup.js with Flow types
  setupFiles: ['<rootDir>/jest.setup.mobile.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.root-backup.js'],
  transform: {
    ...jestExpoPreset.transform,
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.config.js' }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@testing-library|expo|@expo|@unimodules|react-navigation|@react-navigation|@supabase))',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    ...jestExpoPreset.moduleNameMapper,
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.test.{ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__\\.backup/',
    '/tests\\.backup/',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/index.{ts,tsx}',
    '!src/navigation/**',
    '!src/assets/**',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/.expo/',
  ],
};
