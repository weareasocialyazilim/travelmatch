import React, { useEffect, useState, useCallback, useRef } from 'react';
import { StyleSheet, AppState, Button, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { FeedbackModal } from './src/components/FeedbackModal';
import { InitializationScreen } from './src/components/InitializationScreen';
import { ProviderComposer } from './src/components/ProviderComposer';
import {
  PrivacyConsentModal,
  checkConsentStatus,
  type ConsentPreferences,
} from './src/components/PrivacyConsentModal';
import { AuthProvider } from './src/context/AuthContext';
import { BiometricAuthProvider } from './src/context/BiometricAuthContext';
import { ConfirmationProvider } from './src/context/ConfirmationContext';
import { NetworkProvider } from './src/context/NetworkContext';
import { RealtimeProvider } from './src/context/RealtimeContext';
import { ToastProvider } from './src/context/ToastContext';
import { ModalProvider } from './src/providers';
import { useFeedbackPrompt } from './src/hooks/useFeedbackPrompt';
import AppNavigator from './src/navigation/AppNavigator';
import { logger } from './src/utils/logger';
// Security monitoring is handled by the security service
import './src/config/i18n'; // Initialize i18n

// Services
import { appBootstrap } from './src/services/appBootstrap';
import type {
  BootstrapProgress,
  ServiceName,
} from './src/services/appBootstrap';
import { pendingTransactionsService } from './src/services/pendingTransactionsService';
import { PendingTransactionsModal } from './src/features/wallet/components/PendingTransactionsModal';
import type {
  PendingPayment,
  PendingUpload,
} from './src/services/pendingTransactionsService';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://1237a6f4254344408cfecf338a7dcb74@o4510602285875200.ingest.de.sentry.io/4510602310189136',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
  ],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});
// Sentry is initialized lazily in useEffect to avoid JSI runtime issues with New Architecture
// See: src/config/sentry.ts for full configuration

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Security monitoring is now handled by appBootstrap service

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

type AppInitState = 'initializing' | 'ready' | 'error';

// App component - Sentry.wrap is applied after Sentry is initialized in useEffect
function App() {
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

  // Privacy consent modal (GDPR/KVKK compliance)
  const [showPrivacyConsent, setShowPrivacyConsent] = useState(false);
  const [consentPreferences, setConsentPreferences] =
    useState<ConsentPreferences | null>(null);

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

        // Check privacy consent status (GDPR/KVKK compliance)
        const consentStatus = await checkConsentStatus();
        if (!consentStatus.hasConsented) {
          // Show consent modal after a brief delay for UX
          setTimeout(() => setShowPrivacyConsent(true), 500);
        } else {
          setConsentPreferences(consentStatus.preferences);
        }
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

  // Privacy consent handler (GDPR/KVKK compliance)
  const handlePrivacyConsentGiven = useCallback(
    (preferences: ConsentPreferences) => {
      setConsentPreferences(preferences);
      setShowPrivacyConsent(false);
      logger.info('App', 'Privacy consent given:', preferences);

      // Configure analytics based on consent
      if (!preferences.analytics) {
        // Disable analytics if user declined
        logger.info('App', 'Analytics disabled by user preference');
      }
    },
    [],
  );

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
    logger.info('App', `onLayoutRootView called, state: ${appInitState}`);
    if (appInitState === 'ready' || appInitState === 'error') {
      logger.info('App', 'Hiding splash screen...');
      await SplashScreen.hideAsync();
      logger.info('App', 'Splash screen hidden');
    }
  }, [appInitState]);

  // Force hide splash when ready (backup)
  useEffect(() => {
    if (appInitState === 'ready') {
      logger.info('App', 'App is ready, forcing splash hide');
      SplashScreen.hideAsync().catch((e) =>
        logger.warn('App', 'Failed to hide splash', e),
      );
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
          <InitializationScreen
            progress={
              bootstrapProgress ?? {
                currentStep: 0,
                totalSteps: 9,
                currentService: null,
                services: new Map(),
                isComplete: false,
                canContinue: true,
              }
            }
            onRetry={handleRetryService}
          />
        </ErrorBoundary>
      </GestureHandlerRootView>
    );
  }

  // App providers in order (first wraps outermost)
  const appProviders = [
    SafeAreaProvider,
    NetworkProvider,
    AuthProvider,
    BiometricAuthProvider,
    RealtimeProvider,
    ToastProvider,
    ConfirmationProvider,
  ];

  // Main app content - Provider Hell eliminated via ProviderComposer
  return (
    <GestureHandlerRootView
      style={styles.container}
      onLayout={onLayoutRootView}
    >
      <ErrorBoundary level="app">
        <ProviderComposer providers={appProviders}>
          <ModalProvider>
            <StatusBar style="auto" />
            {/* SENTRY TEST BUTTON - Remove after testing */}
            {__DEV__ && (
              <View
                style={{
                  position: 'absolute',
                  top: 50,
                  right: 10,
                  zIndex: 9999,
                }}
              >
                <Button
                  title="🧪 Test Sentry"
                  onPress={() => {
                    Sentry.captureException(
                      new Error(
                        'Test error from App.tsx - ' + new Date().toISOString(),
                      ),
                    );
                    Sentry.captureMessage('Test message from TravelMatch');
                    console.log('✅ Sentry test events sent!');
                  }}
                  color="#F59E0B"
                />
              </View>
            )}
            <AppNavigator />
            <FeedbackModal visible={showFeedback} onClose={dismissFeedback} />
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
            {/* GDPR/KVKK Privacy Consent Modal - shows on first launch */}
            <PrivacyConsentModal
              visible={showPrivacyConsent}
              onConsentGiven={handlePrivacyConsentGiven}
            />
          </ModalProvider>
        </ProviderComposer>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(App);
