// Mobile-specific Jest setup
// Workaround for React Native 0.76.5 Flow type issues in @react-native/js-polyfills
// This replaces the problematic react-native/jest/setup.js

// Import comprehensive native mocks FIRST (before any React Native imports)
require('./jest.native-mocks');

// Mock global.performance if not available (needed for some RN components)
if (typeof global.performance === 'undefined') {
  global.performance = {
    now: () => Date.now(),
  };
}

// Set up setImmediate polyfill
global.setImmediate = global.setImmediate || ((fn, ...args) => global.setTimeout(fn, 0, ...args));

// Mock global HermesInternal (used by React Native)
global.HermesInternal = null;

// Mock console methods to avoid noise in tests (keep error and warn)
global.__DEV__ = true;

// Suppress __fbBatchedBridgeConfig warnings
global.__fbBatchedBridgeConfig = {
  remoteModuleConfig: [],
  localModulesConfig: [],
};
