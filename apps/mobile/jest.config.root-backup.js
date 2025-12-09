module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-native\\+js-polyfills)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-gesture-handler|react-native-reanimated|react-native-screens|react-native-safe-area-context|@react-native-async-storage)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverage: true,
  collectCoverageFrom: [
    'apps/mobile/src/**/*.{ts,tsx}',
    'packages/design-system/src/**/*.{ts,tsx}',
    'packages/shared/src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.stories.{ts,tsx}',
    '!**/*.test.{ts,tsx}',
    '!**/index.{ts,tsx}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!apps/mobile/src/navigation/**',
    '!apps/mobile/src/assets/**',
    '!apps/mobile/src/constants/**',
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './apps/mobile/src/services/**/*.ts': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    './apps/mobile/src/hooks/**/*.ts': {
      branches: 88,
      functions: 92,
      lines: 92,
      statements: 92,
    },
    './apps/mobile/src/components/**/*.{ts,tsx}': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './packages/shared/src/**/*.ts': {
      branches: 85,
      functions: 88,
      lines: 88,
      statements: 88,
    },
    './packages/design-system/src/**/*.{ts,tsx}': {
      branches: 82,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/.expo/',
    '/dist/',
  ],
  testMatch: [
    '<rootDir>/apps/mobile/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/apps/mobile/src/**/*.test.{ts,tsx}',
    '<rootDir>/tests/**/*.test.{ts,tsx}',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/apps/mobile/src/$1',
  },
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react',
      },
    },
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          '@babel/preset-typescript',
          ['@babel/preset-react', { runtime: 'automatic' }],
        ],
        plugins: [
          '@babel/plugin-transform-flow-strip-types',
        ],
      },
    ],
  },
};
