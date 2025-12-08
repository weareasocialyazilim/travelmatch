import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  AppState,
  Platform,
  Alert,
  BackHandler,
} from 'react-native';
import * as Device from 'expo-device';
import * as ScreenCapture from 'expo-screen-capture';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { FeedbackModal } from './src/components/FeedbackModal';
import { initializeFeatureFlags } from './src/config/featureFlags';
import { AuthProvider } from './src/context/AuthContext';
import { ConfirmationProvider } from './src/context/ConfirmationContext';
import { NetworkProvider } from './src/context/NetworkContext';
import { RealtimeProvider } from './src/context/RealtimeContext';
import { ToastProvider } from './src/context/ToastContext';
import { useFeedbackPrompt } from './src/hooks/useFeedbackPrompt';
import AppNavigator from './src/navigation/AppNavigator';
import { logger } from './src/utils/logger';
import { validateEnvironment } from './src/config/env.config';
import { migrateSensitiveDataToSecure } from './src/utils/secureStorage';
import './src/config/i18n'; // Initialize i18n

import { messageService } from './src/services/messageService';
import { cacheService } from './src/services/cacheService';
import { monitoringService } from './src/services/monitoring';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Validate environment on app startup (fail-fast)
try {
  validateEnvironment();
  logger.info('App', '✅ Environment validation passed');
} catch (error) {
  logger.error('App', '🚨 Environment validation failed', error);
  throw error; // Crash app if env is invalid
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [_isBackground, setIsBackground] = useState(false);
  const appState = useRef(AppState.currentState);
  const { showFeedback, dismissFeedback, incrementSessionCount } =
    useFeedbackPrompt();

  useEffect(() => {
    async function prepare() {
      try {
        // 1. Security Check: Root/Jailbreak Detection
        const isRooted = await Device.isRootedExperimentalAsync();
        if (isRooted) {
          Alert.alert(
            'Security Risk',
            'This device appears to be rooted or jailbroken. For your security, TravelMatch cannot run on this device.',
            [
              {
                text: 'Exit',
                onPress: () => {
                  if (Platform.OS === 'android') {
                    BackHandler.exitApp();
                  }
                },
              },
            ],
            { cancelable: false },
          );
          return; // Stop initialization
        }
        // 2. Security: Prevent Screen Capture (Android) & Recording
        void ScreenCapture.preventScreenCaptureAsync();

        // 3. Security: Migrate sensitive data to SecureStore (one-time)
        try {
          await migrateSensitiveDataToSecure();
          logger.info('App', 'Sensitive data migration completed');
        } catch (migrationError) {
          logger.warn('App', 'Data migration failed (may already be migrated)', migrationError);
        }

        // 4. Initialize Services
        messageService.init();
        
        // Initialize cache service with size limits and cleanup
        await cacheService.initialize();
        logger.info('CacheService initialized with 50MB limit');

        // Initialize monitoring service (Datadog RUM)
        if (process.env.DD_APP_ID && process.env.DD_CLIENT_TOKEN) {
          await monitoringService.initialize({
            applicationId: process.env.DD_APP_ID,
            clientToken: process.env.DD_CLIENT_TOKEN,
            env: __DEV__ ? 'development' : 'production',
            serviceName: 'travelmatch-mobile',
            version: '1.0.0',
            enabled: !__DEV__, // Only enable in production
          });
          
          // Add global context
          monitoringService.addGlobalContext({
            platform: Platform.OS,
            device_model: Device.modelName || 'unknown',
            os_version: Platform.Version,
          });
          
          logger.info('Monitoring service initialized');
        }

        // Increment session count
        incrementSessionCount();

        // Initialize feature flags
        await initializeFeatureFlags('user-123');
        logger.info('FeatureFlags initialized');

        // Import Sentry dynamically
        const { initSentry } = await import('./src/config/sentry');
        void initSentry();

        // Load fonts or other assets here if needed
        // await Font.loadAsync({ ... });
      } catch (e) {
        logger.warn('Error during app initialization:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    void prepare();

    // 3. Security: Privacy Blur on Background (iOS)
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        setIsBackground(false);
      } else if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        setIsBackground(true);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      // Cleanup cache service on app shutdown
      cacheService.destroy();
    };
  }, [incrementSessionCount]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView
      style={styles.container}
      onLayout={onLayoutRootView}
    >
      <ErrorBoundary level="app">
        <SafeAreaProvider>
          <NetworkProvider>
            <AuthProvider>
              <RealtimeProvider>
                <ToastProvider>
                  <ConfirmationProvider>
                    <StatusBar style="auto" />
                    <AppNavigator />
                    <FeedbackModal
                      visible={showFeedback}
                      onClose={dismissFeedback}
                    />
                  </ConfirmationProvider>
                </ToastProvider>
              </RealtimeProvider>
            </AuthProvider>
          </NetworkProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
