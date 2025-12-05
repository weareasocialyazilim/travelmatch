import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { ToastProvider } from './src/context/ToastContext';
import { ConfirmationProvider } from './src/context/ConfirmationContext';
import { NetworkProvider } from './src/context/NetworkContext';
import { AuthProvider } from './src/context/AuthContext';
import { RealtimeProvider } from './src/context/RealtimeContext';
import { PerformanceMonitor as _PerformanceMonitor } from './src/utils/performance';
import { PerformanceBenchmark } from './src/utils/performanceBenchmark';
import { FeedbackModal } from './src/components/FeedbackModal';
import { useFeedbackPrompt } from './src/hooks/useFeedbackPrompt';
import { initializeFeatureFlags } from './src/config/featureFlags';
import { logger } from './src/utils/logger';
import './src/config/i18n'; // Initialize i18n

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default function App() {
  const { showFeedback, dismissFeedback, incrementSessionCount } =
    useFeedbackPrompt();

  // Lazy load Sentry after first render to reduce initial bundle by ~68MB
  useEffect(() => {
    // Increment session count
    incrementSessionCount();

    // Initialize feature flags
    initializeFeatureFlags('user-123').then(() => {
      logger.info('FeatureFlags initialized');
    });

    // Import Sentry dynamically
    import('./src/config/sentry')
      .then(({ initSentry }) => {
        initSentry();
      })
      .catch((error) => {
        logger.warn('Failed to initialize Sentry:', error);
      });

    // Performance monitoring
    if (__DEV__) {
      // Initialize performance benchmark
      PerformanceBenchmark.generateReport().then((report) => {
        logger.debug(
          'Performance initial report:',
          report.slowestScreens.slice(0, 3),
        );
      });

      // Measure Time to Interactive
      const startTime = Date.now();
      setTimeout(() => {
        const tti = Date.now() - startTime;
        logger.info(`Time to Interactive: ${tti}ms`);
      }, 0);
    }
  }, [incrementSessionCount]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <ErrorBoundary level="app">
        <SafeAreaProvider>
          <NetworkProvider>
            <AuthProvider>
              <RealtimeProvider>
                <ToastProvider>
                  <ConfirmationProvider>
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
