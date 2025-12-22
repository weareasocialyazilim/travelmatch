import type { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'TravelMatch',
  slug: 'travelmatch',
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
    buildNumber: '9',
    associatedDomains: ['applinks:travelmatch.app'],
    config: {},
    infoPlist: {
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
    'expo-updates',
    '@sentry/react-native/expo',
    'expo-font',
    'expo-secure-store',
    '@react-native-community/datetimepicker',
    '@rnmapbox/maps',
  ],
  updates: {
    url: 'https://u.expo.dev/55ca9fff-1a53-4190-b368-f9facf1febfd',
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
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
          authToken: process.env.SENTRY_AUTH_TOKEN || '',
        },
      },
    ],
  },
});
