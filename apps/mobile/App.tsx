import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  AppState,
  Platform,
  Alert,
} from 'react-native';
import * as Device from 'expo-device';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { FeedbackModal } from './src/components/FeedbackModal';
import { initializeFeatureFlags } from './src/config/featureFlags';
import { AuthProvider } from './src/context/AuthContext';
import { BiometricAuthProvider } from './src/context/BiometricAuthContext';
import { ConfirmationProvider } from './src/context/ConfirmationContext';
import { NetworkProvider } from './src/context/NetworkContext';
import { RealtimeProvider } from './src/context/RealtimeContext';
import { ToastProvider } from './src/context/ToastContext';
import { useFeedbackPrompt } from './src/hooks/useFeedbackPrompt';
import AppNavigator from './src/navigation/AppNavigator';
import { logger } from './src/utils/logger';
import { validateEnvironment, env } from './src/config/env.config';
import { migrateSensitiveDataToSecure } from './src/utils/secureStorage';
import { initSecurityMonitoring } from './src/utils/securityChecks';
import './src/config/i18n'; // Initialize i18n
import PostHog from 'posthog-react-native';

import { messageService } from './src/services/messageService';
import { cacheService } from './src/services/cacheService';
import { sessionManager } from './src/services/sessionManager';
import { pendingTransactionsService } from './src/services/pendingTransactionsService';
import { storageMonitor } from './src/services/storageMonitor';
import { PendingTransactionsModal } from './src/components/PendingTransactionsModal';
import type { PendingPayment, PendingUpload } from './src/services/pendingTransactionsService';

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

// Initialize security monitoring (DEV mode only)
if (__DEV__) {
  initSecurityMonitoring();
  logger.info('App', '🛡️ Security monitoring initialized');
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [_isBackground, setIsBackground] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const appState = useRef(AppState.currentState);
  const { showFeedback, dismissFeedback, incrementSessionCount } =
    useFeedbackPrompt();

  useEffect(() => {
    async function prepare() {
      try {
        // 1. Security Check: Root/Jailbreak Detection (Warning Only)
        const isRooted = await Device.isRootedExperimentalAsync();
        if (isRooted) {
          logger.warn('App', 'Device is rooted/jailbroken - security risk');
          // Show warning but don't block (user choice)
          Alert.alert(
            'Security Warning',
            'This device appears to be rooted or jailbroken. This may reduce the security of your data. Continue at your own risk.',
            [
              {
                text: 'I Understand',
                style: 'default',
              },
            ],
            { cancelable: true },
          );
          // Continue with app initialization
        }
        
        // Note: Screenshot protection is now handled per-screen via useScreenSecurity() hook
        // Applied to: WithdrawScreen, GiftScreen, PaymentMethodScreen, BankAccountScreen

        // 2. Security: Migrate sensitive data to SecureStore (one-time)
        try {
          await migrateSensitiveDataToSecure();
          logger.info('App', 'Sensitive data migration completed');
        } catch (migrationError) {
          logger.warn('App', 'Data migration failed (may already be migrated)', migrationError);
        }

        // 3. Session: Initialize and validate stored session
        const sessionState = await sessionManager.initialize();
        logger.info('App', `Session state: ${sessionState}`);
        
        // If session is expired, try to refresh automatically
        if (sessionState === 'expired') {
          logger.info('App', 'Attempting automatic session refresh');
          const isValid = await sessionManager.isSessionValid();
          if (!isValid) {
            logger.warn('App', 'Session refresh failed - user needs to re-login');
          } else {
            logger.info('App', 'Session refreshed successfully');
          }
        }

        // 4. Initialize Services
        messageService.init();
        
        // Initialize cache service with size limits and cleanup
        await cacheService.initialize();
        logger.info('CacheService initialized with 50MB limit');

        // 5. Initialize PostHog Analytics
        const posthogApiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
        const posthogHost = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

        if (posthogApiKey && env.ENABLE_ANALYTICS) {
          try {
            await PostHog.initAsync(posthogApiKey, {
              host: posthogHost,
              captureApplicationLifecycleEvents: true,
              captureDeepLinks: true,
              enableSessionReplay: false, // Enable if needed (beta feature)
              autocapture: {
                captureScreens: true,
                captureTouches: true,
                captureLifecycleEvents: true,
              },
            });

            // Set global properties
            PostHog.register({
              platform: Platform.OS,
              device_model: Device.modelName || 'unknown',
              os_version: String(Platform.Version),
              app_version: '1.0.0',
              app_env: env.APP_ENV,
            });

            logger.info('PostHog initialized successfully');
          } catch (error) {
            logger.warn('PostHog initialization failed (non-critical)', error);
          }
        } else {
          logger.info('PostHog not configured - skipping analytics');
        }

        // Increment session count
        incrementSessionCount();

        // Initialize feature flags
        await initializeFeatureFlags('user-123');
        logger.info('FeatureFlags initialized');

        // Import Sentry dynamically
        const { initSentry } = await import('./src/config/sentry');
        void initSentry();

        // 6. Initialize Storage Monitor
        storageMonitor.initialize();
        logger.info('Storage monitor initialized');

        // 7. Check Pending Transactions (app crash recovery)
        const { hasPayments, hasUploads } = await pendingTransactionsService.checkPendingOnStartup();
        if (hasPayments || hasUploads) {
          logger.info('App', `Found pending transactions - payments: ${hasPayments}, uploads: ${hasUploads}`);
          const payments = await pendingTransactionsService.getPendingPayments();
          const uploads = await pendingTransactionsService.getPendingUploads();
          setPendingPayments(payments);
          setPendingUploads(uploads);
          setShowPendingModal(true);
        }

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
      // Cleanup storage monitor
      storageMonitor.destroy();
    };
  }, [incrementSessionCount]);

  const handleResumePayment = useCallback(async (payment: PendingPayment) => {
    logger.info('App', `Resuming payment: ${payment.id} (${payment.type})`);
    // TODO: Navigate to payment screen with pre-filled data
    // For now, just dismiss
    await pendingTransactionsService.removePendingPayment(payment.id);
    setPendingPayments(prev => prev.filter(p => p.id !== payment.id));
  }, []);

  const handleResumeUpload = useCallback(async (upload: PendingUpload) => {
    logger.info('App', `Retrying upload: ${upload.id} (${upload.type})`);
    // TODO: Trigger upload service retry
    // For now, just increment retry count
    await pendingTransactionsService.incrementUploadRetry(upload.id);
    const uploads = await pendingTransactionsService.getPendingUploads();
    setPendingUploads(uploads);
  }, []);

  const handleDismissPayment = useCallback(async (paymentId: string) => {
    logger.info('App', `Dismissing payment: ${paymentId}`);
    await pendingTransactionsService.removePendingPayment(paymentId);
    setPendingPayments(prev => prev.filter(p => p.id !== paymentId));
  }, []);

  const handleDismissUpload = useCallback(async (uploadId: string) => {
    logger.info('App', `Dismissing upload: ${uploadId}`);
    await pendingTransactionsService.removePendingUpload(uploadId);
    setPendingUploads(prev => prev.filter(u => u.id !== uploadId));
  }, []);

  const handleClosePendingModal = useCallback(() => {
    setShowPendingModal(false);
  }, []);

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
              <BiometricAuthProvider>
                <RealtimeProvider>
                  <ToastProvider>
                    <ConfirmationProvider>
                      <StatusBar style="auto" />
                      <AppNavigator />
                      <FeedbackModal
                        visible={showFeedback}
                        onClose={dismissFeedback}
                      />
                      <PendingTransactionsModal
                        visible={showPendingModal}
                        payments={pendingPayments}
                        uploads={pendingUploads}
                        onResumePayment={handleResumePayment}
                        onResumeUpload={handleResumeUpload}
                        onDismissPayment={handleDismissPayment}
                        onDismissUpload={handleDismissUpload}
                        onClose={handleClosePendingModal}
                      />
                    </ConfirmationProvider>
                  </ToastProvider>
                </RealtimeProvider>
              </BiometricAuthProvider>
            </AuthProvider>
          </NetworkProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
