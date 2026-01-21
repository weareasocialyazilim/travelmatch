import type { ExpoConfig, ConfigContext } from 'expo/config';

const IS_PRODUCTION = process.env.APP_ENV === 'production';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Lovendo',
  slug: 'lovendo',
  owner: 'lovendo',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  scheme: 'lovendo',
  newArchEnabled: true,

  // Entry point is defined in package.json "main" field

  // Splash screen - matches brand warm white
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#FFFBF5',
  },

  // ============================================
  // iOS Configuration - App Store Ready
  // ============================================
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.lovendo.app',
    buildNumber: '24',
    associatedDomains: ['applinks:www.lovendo.xyz', 'applinks:lovendo.xyz'],
    config: {
      usesNonExemptEncryption: false,
    },
    infoPlist: {
      // Encryption compliance
      ITSAppUsesNonExemptEncryption: false,

      // Location permissions
      NSLocationWhenInUseUsageDescription:
        'Çevrenizdeki ilham verici anları ve popüler içerik üreticilerini keşfedebilmeniz için konumunuz kullanılır.',

      // Camera and Photos
      NSCameraUsageDescription:
        'Özel anlarınızı (Moments) kaydedip takipçilerinizle paylaşabilmeniz için kamera erişimi gereklidir.',
      NSPhotoLibraryUsageDescription:
        "Vibe'ınızı yansıtan fotoğraf ve videoları profilinizde paylaşabilmeniz için galeri erişimi gereklidir.",
      NSPhotoLibraryAddUsageDescription:
        'Lovendo needs permission to save photos to your library.',

      // Face ID for biometric auth
      NSFaceIDUsageDescription:
        'Lovendo uses Face ID for secure and quick account authentication.',

      // Microphone for voice messages
      NSMicrophoneUsageDescription:
        'Lovendo uses the microphone to record voice messages in chats.',

      // Contacts for finding friends
      NSContactsUsageDescription:
        'Lovendo can help you find friends who are also using the app.',

      // App Tracking Transparency (iOS 14.5+)
      NSUserTrackingUsageDescription:
        'Lovendo uses this to provide personalized recommendations and improve app experience. Your data is never sold to third parties.',

      // Deep link URL schemes (keep legacy lovendo for compatibility)
      CFBundleURLTypes: [
        {
          CFBundleURLName: 'com.lovendo.app',
          CFBundleURLSchemes: ['lovendo'],
        },
      ],

      // Push notifications background modes
      UIBackgroundModes: ['fetch', 'remote-notification'],

      // App Transport Security
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: false,
      },
    },
    entitlements: {
      'aps-environment': IS_PRODUCTION ? 'production' : 'development',
    },
  },

  // ============================================
  // Android Configuration - Play Store Ready
  // ============================================
  android: {
    package: 'com.lovendo.app',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FFFBF5',
    },
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          {
            scheme: 'https',
            host: 'www.lovendo.xyz',
            pathPrefix: '/',
          },
          {
            scheme: 'https',
            host: 'lovendo.xyz',
            pathPrefix: '/',
          },
          {
            scheme: 'lovendo',
            host: '*',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    permissions: [
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.CAMERA',
      'android.permission.RECORD_AUDIO', // Gratitude Video recording
      'android.permission.VIBRATE',
      'android.permission.USE_BIOMETRIC',
      'android.permission.USE_FINGERPRINT',
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      // Android 13+ (API 33) media permissions
      'android.permission.READ_MEDIA_IMAGES',
      'android.permission.READ_MEDIA_VIDEO',
      'android.permission.POST_NOTIFICATIONS', // Android 13+ push notifications
    ],
    blockedPermissions: [
      'android.permission.READ_PHONE_STATE',
      'android.permission.SYSTEM_ALERT_WINDOW',
    ],
    googleServicesFile: IS_PRODUCTION
      ? './google-services.json'
      : './google-services-dev.json',
    config: {},
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#FFFBF5',
    },
  },

  // ============================================
  // Web Configuration
  // ============================================
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },

  // ============================================
  // Expo Plugins
  // ============================================
  plugins: [
    // Build Properties - iOS Privacy Manifests (iOS 17+)
    [
      'expo-build-properties',
      {
        ios: {
          privacyManifests: {
            NSPrivacyAccessedAPITypes: [
              // User Defaults API - Used for app preferences
              {
                NSPrivacyAccessedAPIType:
                  'NSPrivacyAccessedAPICategoryUserDefaults',
                NSPrivacyAccessedAPITypeReasons: ['CA92.1'],
              },
              // File Timestamp API - Used for cache management
              {
                NSPrivacyAccessedAPIType:
                  'NSPrivacyAccessedAPICategoryFileTimestamp',
                NSPrivacyAccessedAPITypeReasons: ['C617.1'],
              },
              // System Boot Time API - Used for analytics session tracking
              {
                NSPrivacyAccessedAPIType:
                  'NSPrivacyAccessedAPICategorySystemBootTime',
                NSPrivacyAccessedAPITypeReasons: ['35F9.1'],
              },
              // Disk Space API - Used for storage management
              {
                NSPrivacyAccessedAPIType:
                  'NSPrivacyAccessedAPICategoryDiskSpace',
                NSPrivacyAccessedAPITypeReasons: ['E174.1'],
              },
            ],
          },
        },
        android: {
          // Enable R8 full mode for better code shrinking
          enableProguardInReleaseBuilds: true,
          // Use hermes for better performance
          usesCleartextTraffic: false,
        },
      },
    ],
    'expo-localization',
    [
      '@sentry/react-native/expo',
      {
        url: 'https://sentry.io/',
        organization: process.env.SENTRY_ORG || 'lovendo-2d',
        project: process.env.SENTRY_PROJECT || 'lovendo-app',
        // authToken is read automatically from SENTRY_AUTH_TOKEN env var
      },
    ],
    'expo-font',
    'expo-secure-store',
    '@react-native-community/datetimepicker',
    [
      '@rnmapbox/maps',
      {
        // Token is now read from RNMAPBOX_MAPS_DOWNLOAD_TOKEN env var automatically
        // @rnmapbox/maps 10.2.10 requires MapboxMaps ~> 11.16.2 (from package.json)
        RNMapboxMapsVersion: '11.16.2',
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#F59E0B',
      },
    ],
    [
      'expo-local-authentication',
      {
        faceIDPermission: 'Lovendo uses Face ID for secure authentication.',
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Lovendo uses your location to show nearby experiences.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'Lovendo needs access to your photos to share moments.',
        cameraPermission: 'Lovendo needs camera access to capture moments.',
      },
    ],
    // Video compression for optimized uploads
    'react-native-compressor',
  ],

  // ============================================
  // Extra Configuration
  // ============================================
  extra: {
    eas: {
      projectId: '55ca9fff-1a53-4190-b368-f9facf1febfd',
    },
    sentryDsn: process.env.SENTRY_DSN || '',
    appEnv: process.env.APP_ENV || 'development',
    apiUrl: IS_PRODUCTION
      ? 'https://api.lovendo.xyz'
      : 'https://staging-api.lovendo.xyz',
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
    enableAnalytics: IS_PRODUCTION,
    enableCrashReporting: true,
  },

  // ============================================
  // Post-publish hooks - Note: hooks are defined in app.json for Expo
  // Sentry hooks configuration moved to eas.json
  // ============================================

  // ============================================
  // OTA Updates
  // ============================================
  updates: {
    enabled: true,
    checkAutomatically: 'ON_LOAD',
    fallbackToCacheTimeout: 30000,
    url: 'https://u.expo.dev/55ca9fff-1a53-4190-b368-f9facf1febfd',
  },

  runtimeVersion: {
    policy: 'appVersion',
  },
});
