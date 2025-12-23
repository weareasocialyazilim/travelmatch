/**
 * Jest configuration for root-level tests (integration & performance)
 */
const mobileJestConfig = require('../apps/mobile/jest.config.js');

module.exports = {
  ...mobileJestConfig,
  rootDir: '..',
  testMatch: [
    '<rootDir>/tests/**/*.test.{ts,tsx}',
  ],
  setupFiles: ['<rootDir>/apps/mobile/jest.setup.mobile.js'],
  setupFilesAfterEnv: ['<rootDir>/apps/mobile/jest.setup.afterEnv.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@testing-library|expo|@expo|@unimodules|react-navigation|@react-navigation|@supabase|@shopify)/)',
  ],
  moduleNameMapper: {
    // Custom mocks must come FIRST
    '^expo-file-system/legacy$': '<rootDir>/apps/mobile/__mocks__/expo-file-system/legacy.js',
    '^expo-file-system$': '<rootDir>/apps/mobile/__mocks__/expo-file-system/index.js',
    '^expo-image$': '<rootDir>/apps/mobile/__mocks__/expo-image.js',
    '^expo-secure-store$': '<rootDir>/apps/mobile/__mocks__/expo-secure-store.js',
    '^expo-crypto$': '<rootDir>/apps/mobile/__mocks__/expo-crypto.js',
    '^expo-clipboard$': '<rootDir>/apps/mobile/__mocks__/expo-clipboard.js',
    '^expo-haptics$': '<rootDir>/apps/mobile/__mocks__/expo-haptics.js',
    '^expo-linear-gradient$': '<rootDir>/apps/mobile/__mocks__/expo-linear-gradient.js',
    '^@shopify/flash-list$': '<rootDir>/apps/mobile/__mocks__/@shopify/flash-list.js',
    '^react-native-safe-area-context$': '<rootDir>/apps/mobile/__mocks__/react-native-safe-area-context.js',
    '^@react-native-community/netinfo$': '<rootDir>/apps/mobile/__mocks__/@react-native-community/netinfo.js',
    '^posthog-react-native$': '<rootDir>/apps/mobile/__mocks__/posthog-react-native.js',
    '^@travelmatch/design-system/tokens$': '<rootDir>/apps/mobile/__mocks__/design-tokens.js',
    '^@expo/vector-icons$': '<rootDir>/apps/mobile/__mocks__/@expo/vector-icons.js',
    '^@expo/vector-icons/(.*)$': '<rootDir>/apps/mobile/__mocks__/@expo/vector-icons.js',
    '^@react-navigation/native$': '<rootDir>/apps/mobile/__mocks__/@react-navigation/native.js',
    '^react-native-reanimated$': '<rootDir>/apps/mobile/__mocks__/react-native-reanimated.js',
    '^@sentry/react-native$': '<rootDir>/apps/mobile/__mocks__/@sentry/react-native.js',
    '^react-native-mmkv$': '<rootDir>/apps/mobile/__mocks__/react-native-mmkv.js',
    // Include parent config mappings after custom ones
    ...mobileJestConfig.moduleNameMapper,
    // Path alias must come last
    '^@/(.*)$': '<rootDir>/apps/mobile/src/$1',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  globals: {
    __DEV__: true,
  },
};
