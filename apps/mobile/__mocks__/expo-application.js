/**
 * Mock for expo-application
 * Provides basic application info for Jest tests
 */
module.exports = {
  getName: () => 'Lovendo',
  getBundleId: () => 'xyz.lovendo.app',
  getVersion: () => '1.0.0',
  getBuildNumber: () => '1',
  nativeApplicationVersion: '1.0.0',
  nativeBuildNumber: '1',
};
