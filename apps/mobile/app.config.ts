import type { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'TravelMatch',
  slug: 'travelmatch',
  version: '1.0.0',
  orientation: 'portrait',
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
    bundleIdentifier: 'com.travelmatch.app',
    buildNumber: '1',
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
    '@sentry/react-native/expo',
    'expo-font',
    [
      '@rnmapbox/maps',
      {
        RNMapboxMapsDownloadToken: process.env.EXPO_PUBLIC_MAPBOX_SECRET_TOKEN,
      },
    ],
  ],
  extra: {
    eas: {
      projectId: '9721cfe0-b554-463f-af2b-ab2147d98172',
    },
  },
});
