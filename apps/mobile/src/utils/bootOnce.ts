import * as Sentry from '@sentry/react-native';
import * as SplashScreen from 'expo-splash-screen';
import { logger } from './logger';

// Prevent splash screen from auto-hiding immediately
SplashScreen.preventAutoHideAsync().catch((e) => {
  logger.warn('Boot', 'Failed to prevent splash auto-hide', e);
});

// Sentry DSN from environment variable
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';

// Track if Sentry is initialized
export let isSentryInitialized = false;

// Initialize Sentry before app mounts
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Only enable in production for performance
    enabled: !__DEV__,

    // Adds more context data to events (IP address, cookies, user, etc.)
    sendDefaultPii: !__DEV__,

    // Enable Logs only in production
    enableLogs: !__DEV__,

    // Configure Session Replay (production only)
    replaysSessionSampleRate: __DEV__ ? 0 : 0.1,
    replaysOnErrorSampleRate: __DEV__ ? 0 : 1,
    integrations: __DEV__
      ? []
      : [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

    // uncomment the line below to enable Spotlight (https://spotlightjs.com)
    // spotlight: __DEV__,
  });
  isSentryInitialized = true;
  logger.info('Boot', 'Sentry initialized');
} else {
  logger.warn('Boot', 'Sentry DSN not found, skipping initialization');
}

export const isBootstrapped = true;
