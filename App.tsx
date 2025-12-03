import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { ToastProvider } from './src/context/ToastContext';
import { PerformanceMonitor } from './src/utils/performance';
import { PerformanceBenchmark } from './src/utils/performanceBenchmark';
import { FeedbackModal } from './src/components/FeedbackModal';
import { useFeedbackPrompt } from './src/hooks/useFeedbackPrompt';
import { initializeFeatureFlags } from './src/config/featureFlags';
import './src/config/i18n'; // Initialize i18n

export default function App() {
  const { showFeedback, dismissFeedback, incrementSessionCount } =
    useFeedbackPrompt();

  // Lazy load Sentry after first render to reduce initial bundle by ~68MB
  useEffect(() => {
    // Increment session count
    incrementSessionCount();

    // Initialize feature flags
    initializeFeatureFlags('user-123').then(() => {
      console.log('✅ [FeatureFlags] Initialized');
    });

    // Import Sentry dynamically
    import('./src/config/sentry')
      .then(({ initSentry }) => {
        initSentry();
      })
      .catch((error) => {
        console.warn('Failed to initialize Sentry:', error);
      });

    // Performance monitoring
    if (__DEV__) {
      // Initialize performance benchmark
      PerformanceBenchmark.generateReport().then((report) => {
        console.log(
          '📊 [Performance] Initial report:',
          report.slowestScreens.slice(0, 3),
        );
      });

      // Measure Time to Interactive
      const startTime = Date.now();
      setTimeout(() => {
        const tti = Date.now() - startTime;
        // eslint-disable-next-line no-console
        console.log(`⚡ Time to Interactive: ${tti}ms`);
      }, 0);
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <ToastProvider>
            <AppNavigator />
            <FeedbackModal visible={showFeedback} onClose={dismissFeedback} />
          </ToastProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
