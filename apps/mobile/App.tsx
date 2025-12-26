import React, { useEffect, useState, useCallback, useRef } from 'react';
import { StyleSheet, AppState } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { FeedbackModal } from './src/components/FeedbackModal';
import { InitializationScreen } from './src/components/InitializationScreen';
import { AuthProvider } from './src/context/AuthContext';
import { BiometricAuthProvider } from './src/context/BiometricAuthContext';
import { ConfirmationProvider } from './src/context/ConfirmationContext';
import { NetworkProvider } from './src/context/NetworkContext';
import { RealtimeProvider } from './src/context/RealtimeContext';
import { ToastProvider } from './src/context/ToastContext';
import { useFeedbackPrompt } from './src/hooks/useFeedbackPrompt';
import AppNavigator from './src/navigation/AppNavigator';
import { logger } from './src/utils/logger';
import { initSecurityMonitoring } from './src/utils/securityChecks';
import './src/config/i18n'; // Initialize i18n

// Services
import { appBootstrap } from './src/services/appBootstrap';
import type {
  BootstrapProgress,
  ServiceName,
} from './src/services/appBootstrap';
import { pendingTransactionsService } from './src/services/pendingTransactionsService';
import { PendingTransactionsModal } from './src/components/PendingTransactionsModal';
import type {
  PendingPayment,
  PendingUpload,
} from './src/services/pendingTransactionsService';
import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

// Note: Sentry initialization moved inside component to ensure JSI runtime is ready
// This prevents "Cannot read property 'prototype' of undefined" errors with New Architecture

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

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

type AppInitState = 'initializing' | 'ready' | 'error';

export default Sentry.wrap(function App() {
  // App state
  const [appInitState, setAppInitState] =
    useState<AppInitState>('initializing');
  const [bootstrapProgress, setBootstrapProgress] =
    useState<BootstrapProgress | null>(null);

  // Background/foreground state
  const [_isBackground, setIsBackground] = useState(false);
  const appStateRef = useRef(AppState.currentState);

  // Pending transactions modal
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);

  // Feedback prompt
  const { showFeedback, dismissFeedback, incrementSessionCount } =
    useFeedbackPrompt();

  // Initialize app with new bootstrap service
  useEffect(() => {
    async function initializeApp() {
      try {
        // Set up progress callback for UI updates
        appBootstrap.onProgress((progress) => {
          setBootstrapProgress(progress);
        });

        // Run initialization
        const finalProgress = await appBootstrap.initialize();
        setBootstrapProgress(finalProgress);

        // Check if we can continue
        if (!finalProgress.canContinue) {
          setAppInitState('error');
          logger.error('App', 'Critical services failed, app cannot continue');
          return;
        }

        // Initialize Sentry dynamically
        try {
          const { initSentry } = await import('./src/config/sentry');
          void initSentry();
        } catch (sentryError) {
          logger.warn('App', 'Sentry initialization failed', sentryError);
        }

        // Increment session count for feedback prompt
        incrementSessionCount();

        // Check for pending transactions
        const pendingResult = appBootstrap.getPendingTransactionsResult();
        if (
          pendingResult &&
          (pendingResult.hasPayments || pendingResult.hasUploads)
        ) {
          const payments =
            await pendingTransactionsService.getPendingPayments();
          const uploads = await pendingTransactionsService.getPendingUploads();
          setPendingPayments(payments);
          setPendingUploads(uploads);
          setShowPendingModal(true);
        }

        // Mark app as ready
        setAppInitState('ready');
        logger.info('App', '✅ App initialization complete');
      } catch (error) {
        logger.error('App', 'Fatal error during initialization', error);
        setAppInitState('error');
      }
    }

    void initializeApp();

    // Handle app state changes (background/foreground)
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        setIsBackground(false);
      } else if (
        appStateRef.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        setIsBackground(true);
      }
      appStateRef.current = nextAppState;
    });

    // Cleanup
    return () => {
      subscription.remove();
      appBootstrap.cleanup();
    };
  }, [incrementSessionCount]);

  // Handle retry of failed services
  const handleRetryService = useCallback(async (serviceName: ServiceName) => {
    logger.info('App', `Retrying service: ${serviceName}`);
    const success = await appBootstrap.retryService(serviceName);

    if (success) {
      const progress = appBootstrap.getProgress();
      setBootstrapProgress(progress);

      if (progress.canContinue) {
        setAppInitState('ready');
      }
    }
  }, []);

  // Pending transactions handlers
  const handleResumePayment = useCallback(async (payment: PendingPayment) => {
    logger.info('App', `Resuming payment: ${payment.id} (${payment.type})`);
    await pendingTransactionsService.removePendingPayment(payment.id);
    setPendingPayments((prev) => prev.filter((p) => p.id !== payment.id));
  }, []);

  const handleResumeUpload = useCallback(async (upload: PendingUpload) => {
    logger.info('App', `Retrying upload: ${upload.id} (${upload.type})`);
    await pendingTransactionsService.incrementUploadRetry(upload.id);
    const uploads = await pendingTransactionsService.getPendingUploads();
    setPendingUploads(uploads);
  }, []);

  const handleDismissPayment = useCallback(async (paymentId: string) => {
    logger.info('App', `Dismissing payment: ${paymentId}`);
    await pendingTransactionsService.removePendingPayment(paymentId);
    setPendingPayments((prev) => prev.filter((p) => p.id !== paymentId));
  }, []);

  const handleDismissUpload = useCallback(async (uploadId: string) => {
    logger.info('App', `Dismissing upload: ${uploadId}`);
    await pendingTransactionsService.removePendingUpload(uploadId);
    setPendingUploads((prev) => prev.filter((u) => u.id !== uploadId));
  }, []);

  const handleClosePendingModal = useCallback(() => {
    setShowPendingModal(false);
  }, []);

  // Hide splash screen when ready
  const onLayoutRootView = useCallback(async () => {
    if (appInitState === 'ready' || appInitState === 'error') {
      await SplashScreen.hideAsync();
    }
  }, [appInitState]);

  // Show initialization screen during bootstrap
  if (appInitState === 'initializing' || appInitState === 'error') {
    return (
      <GestureHandlerRootView
        style={styles.container}
        onLayout={onLayoutRootView}
      >
        <ErrorBoundary level="app">
          {bootstrapProgress && (
            <InitializationScreen
              progress={bootstrapProgress}
              onRetry={handleRetryService}
            />
          )}
        </ErrorBoundary>
      </GestureHandlerRootView>
    );
  }

  // Main app content
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
});
