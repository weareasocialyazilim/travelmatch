const jestExpoPreset = require('jest-expo/jest-preset');

module.exports = {
  ...jestExpoPreset,
  testEnvironment: 'node',
  // Increase timeout for async operations (Phase 3 fix)
  testTimeout: 10000, // Increased from default 5000ms
  // Override setupFiles to avoid React Native's setup.js with Flow types
  setupFiles: ['<rootDir>/jest.setup.mobile.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.afterEnv.js'],
  globals: {
    __DEV__: true,
  },
  transform: {
    ...jestExpoPreset.transform,
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.config.js' }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@testing-library|expo|expo-file-system|@expo|@unimodules|react-navigation|@react-navigation|@supabase|@shopify)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    // Custom mocks must come FIRST to override any preset mappings
    '^expo-file-system/legacy$': '<rootDir>/__mocks__/expo-file-system/legacy.js',
    '^expo-file-system$': '<rootDir>/__mocks__/expo-file-system/index.js',
    '^expo-image$': '<rootDir>/__mocks__/expo-image.js',
    '^expo-secure-store$': '<rootDir>/__mocks__/expo-secure-store.js',
    '^expo-crypto$': '<rootDir>/__mocks__/expo-crypto.js',
    '^expo-clipboard$': '<rootDir>/__mocks__/expo-clipboard.js',
    '^expo-haptics$': '<rootDir>/__mocks__/expo-haptics.js',
    '^expo-linear-gradient$': '<rootDir>/__mocks__/expo-linear-gradient.js',
    '^@shopify/flash-list$': '<rootDir>/__mocks__/@shopify/flash-list.js',
    '^react-native-safe-area-context$': '<rootDir>/__mocks__/react-native-safe-area-context.js',
    '^@react-native-community/netinfo$': '<rootDir>/__mocks__/@react-native-community/netinfo.js',
    '^posthog-react-native$': '<rootDir>/__mocks__/posthog-react-native.js',
    '^@travelmatch/design-system/tokens$': '<rootDir>/__mocks__/design-tokens.js',
    '^@expo/vector-icons$': '<rootDir>/__mocks__/@expo/vector-icons.js',
    '^@expo/vector-icons/(.*)$': '<rootDir>/__mocks__/@expo/vector-icons.js',
    '^@react-navigation/native$': '<rootDir>/__mocks__/@react-navigation/native.js',
    '^react-native-reanimated$': '<rootDir>/__mocks__/react-native-reanimated.js',
    '^@sentry/react-native$': '<rootDir>/__mocks__/@sentry/react-native.js',
    '^react-native-mmkv$': '<rootDir>/__mocks__/react-native-mmkv.js',
    // Include preset mappings after custom ones
    ...jestExpoPreset.moduleNameMapper,
    // Path aliases must come last
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
    '\\.helper\\.tsx?$',
    '/__tests__/helpers/',
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
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 70,
      functions: 75,
      lines: 80,
    },
  },
  // JUnit reporter for Codecov Test Analytics
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './coverage',
        outputName: 'junit.xml',
        suiteName: 'TravelMatch Mobile Tests',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true,
      },
    ],
  ],
};
