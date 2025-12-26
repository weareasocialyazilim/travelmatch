import type { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'TravelMatch',
  slug: 'travelmatch',
  owner: 'travelmatch',
  version: '0.0.1',
  orientation: 'portrait',
  // Custom entry point to fix AppEntry.js resolution in monorepo
  entryPoint: './index.ts',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  scheme: 'travelmatch',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.travelmatch.mobile',
    buildNumber: '23',
    associatedDomains: ['applinks:travelmatch.app'],
    config: {},
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSLocationWhenInUseUsageDescription:
        'TravelMatch needs your location to verify your travel moments and show you relevant experiences nearby.',
      NSCameraUsageDescription:
        'TravelMatch needs access to your camera to let you take photos of your travel moments for verification.',
      NSPhotoLibraryUsageDescription:
        'TravelMatch needs access to your photo library to let you upload photos of your travel moments.',
    },
  },
  android: {
    package: 'com.travelmatch.app',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          {
            scheme: 'https',
            host: 'travelmatch.app',
            pathPrefix: '/',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    config: {},
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-localization',
    [
      '@sentry/react-native/expo',
      {
        organization: process.env.SENTRY_ORG || 'travelmatch-2p',
        project: process.env.SENTRY_PROJECT || 'react-native',
        // authToken is read automatically from SENTRY_AUTH_TOKEN env var
      },
    ],
    'expo-font',
    'expo-secure-store',
    '@react-native-community/datetimepicker',
    [
      '@rnmapbox/maps',
      {
        // Build-time only token - NOT bundled in client (no EXPO_PUBLIC_ prefix)
        RNMapboxMapsDownloadToken: process.env.MAPBOX_DOWNLOAD_TOKEN,
        // Use Mapbox v11 for better New Architecture support
        RNMapboxMapsVersion: '11.17.0',
      },
    ],
  ],
  extra: {
    eas: {
      projectId: '55ca9fff-1a53-4190-b368-f9facf1febfd',
    },
    // Sentry configuration (from environment variables)
    sentryDsn: process.env.SENTRY_DSN || '',
  },
  hooks: {
    postPublish: [
      {
        file: '@sentry/react-native/expo',
        config: {
          organization: process.env.SENTRY_ORG || '',
          project: process.env.SENTRY_PROJECT || '',
          // authToken is read automatically from SENTRY_AUTH_TOKEN env var
        },
      },
    ],
  },
});
