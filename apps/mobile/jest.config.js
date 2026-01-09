const jestExpoPreset = require('jest-expo/jest-preset');

module.exports = {
  ...jestExpoPreset,
  // Removed explicit testEnvironment to use jest-expo preset default
  // Increase timeout for async operations (Phase 3 fix)
  testTimeout: 10000, // Increased from default 5000ms
  // Override setupFiles to avoid React Native's setup.js with Flow types
  setupFiles: ['<rootDir>/jest.setup.mobile.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.afterEnv.js'],
  transform: {
    ...jestExpoPreset.transform,
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.config.js' }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|react-native-gesture-handler|@react-native|@testing-library|expo|expo-blur|expo-localization|expo/virtual|expo-image-manipulator|expo-av|@expo|@unimodules|react-navigation|@react-navigation|@supabase|@shopify|uuid|i18next|react-i18next)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    // BottomNav mocks MUST come BEFORE spreading jestExpoPreset.moduleNameMapper
    // because order matters in moduleNameMapper and first match wins
    '^@/components/BottomNav$': '<rootDir>/__mocks__/components/BottomNav.js',
    // Handle relative paths that babel module-resolver may produce (any number of ../)
    '^(\\.\\./)+components/BottomNav$': '<rootDir>/__mocks__/components/BottomNav.js',
    // Mock expo virtual env module (ES module that Jest can't handle)
    '^expo/virtual/env$': '<rootDir>/__mocks__/expo-virtual-env.js',
    // Shared mocks in tests/__mocks__/ to avoid duplication across packages
    '^react-native$': '<rootDir>/../../tests/__mocks__/react-native.js',
    '^react-native-reanimated$': '<rootDir>/../../tests/__mocks__/react-native-reanimated.js',
    // Now spread the preset (contains generic @/ mappings)
    ...jestExpoPreset.moduleNameMapper,
    // Explicit mappings for commonly mocked modules (needed for jest.mock hoisting)
    '^@/config/supabase$': '<rootDir>/src/config/supabase',
    '^@/context/AuthContext$': '<rootDir>/src/context/AuthContext',
    '^@/context/ToastContext$': '<rootDir>/src/context/ToastContext',
    '^@/hooks/useHaptics$': '<rootDir>/src/hooks/useHaptics',
    '^@/utils/logger$': '<rootDir>/src/utils/logger',
    '^@/utils/imageOptimization$': '<rootDir>/src/utils/imageOptimization',
    '^@/utils/validation$': '<rootDir>/src/utils/validation',
    '^@/utils/secureStorage$': '<rootDir>/src/utils/secureStorage',
    '^@/services/notificationService$': '<rootDir>/src/services/notificationService',
    '^@/services/paymentService$': '<rootDir>/src/services/paymentService',
    '^@/services/supabaseAuthService$': '<rootDir>/src/services/supabaseAuthService',
    '^@/services/uploadService$': '<rootDir>/src/services/uploadService',
    '^@/stores/searchStore$': '<rootDir>/src/stores/searchStore',
    '^@/constants/colors$': '<rootDir>/src/constants/colors',
    '^@/components/ui/OptimizedImage$': '<rootDir>/src/components/ui/OptimizedImage',
    '^@/components/ui/ControlledInput$': '<rootDir>/src/components/ui/ControlledInput',
    '^@/components/ui/GenericBottomSheet$': '<rootDir>/src/components/ui/GenericBottomSheet',
    '^@/components/ui/OptimizedFlatList$': '<rootDir>/src/components/ui/OptimizedFlatList',
    '^@/features/payments/components/WalletListItem$': '<rootDir>/src/features/payments/components/WalletListItem',
    // General path alias (must be last)
    '^@/(.*)$': '<rootDir>/src/$1',
    // Expo and React Native mocks
    '^expo-blur$': '<rootDir>/__mocks__/expo-blur.js',
    '^expo-image$': '<rootDir>/__mocks__/expo-image.js',
    '^expo-localization$': '<rootDir>/__mocks__/expo-localization.js',
    '^expo-av$': '<rootDir>/__mocks__/expo-av.js',
    '^expo-image-manipulator$': '<rootDir>/__mocks__/expo-image-manipulator.js',
    '^expo-haptics$': '<rootDir>/__mocks__/expo-haptics.js',
    '^posthog-react-native$': '<rootDir>/__mocks__/posthog-react-native.js',
    '^@travelmatch/design-system/tokens$': '<rootDir>/__mocks__/design-tokens.js',
    '^@react-native-community/datetimepicker$': '<rootDir>/__mocks__/@react-native-community/datetimepicker.js',
    // Shared mocks in tests/__mocks__/ to avoid duplication
    '^react-native-svg$': '<rootDir>/../../tests/__mocks__/react-native-svg.js',
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.test.{ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__\\.backup/',
    '/tests\\.backup/',
    '\\.helper\\.(ts|tsx)$',
    'testUtilsRender\\.helper\\.tsx$',
    'testUtilsAsync\\.helper\\.ts$',
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
  globals: {
    __DEV__: true,
  },
};
