/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: [
    '**/__tests__/**/*.{ts,tsx}',
    '**/*.test.{ts,tsx}',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/app/**/*.tsx', // Exclude Next.js page components
  ],
  moduleNameMapper: {
    // Mock Upstash modules to avoid ESM compatibility issues in Jest
    '^@upstash/ratelimit$': '<rootDir>/src/__mocks__/@upstash/ratelimit.ts',
    '^@upstash/redis$': '<rootDir>/src/__mocks__/@upstash/redis.ts',
    // Explicit mappings for jest.mock hoisting (must come first)
    '^@/lib/utils$': '<rootDir>/src/lib/utils',
    // General path alias
    '^@/(.*)$': '<rootDir>/src/$1',
    // Handle CSS imports (for Tailwind and other styles)
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        moduleResolution: 'node',
        baseUrl: '.',
        paths: {
          '@/*': ['./src/*']
        }
      },
    }],
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
  ],
  // Transform ESM modules from node_modules
  transformIgnorePatterns: [
    '/node_modules/(?!(@upstash|uncrypto)/)',
  ],
  roots: ['<rootDir>/src'],
};
