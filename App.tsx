import React, { useEffect, useState, useCallback, useRef } from 'react';
import { StyleSheet, View, AppState, Platform, Alert, BackHandler } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import * as Device from 'expo-device';
import * as ScreenCapture from 'expo-screen-capture';
import { BlurView } from 'expo-blur';

import AppNavigator from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { ToastProvider } from './src/context/ToastContext';
import { ConfirmationProvider } from './src/context/ConfirmationContext';
import { NetworkProvider } from './src/context/NetworkContext';
import { AuthProvider } from './src/context/AuthContext';
import { RealtimeProvider } from './src/context/RealtimeContext';
import { FeedbackModal } from './src/components/FeedbackModal';
import { useFeedbackPrompt } from './src/hooks/useFeedbackPrompt';
import { initializeFeatureFlags } from './src/config/featureFlags';
import { logger } from './src/utils/logger';
import './src/config/i18n'; // Initialize i18n

import { messageService } from './src/services/messageService';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [isBackground, setIsBackground] = useState(false);
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
            { cancelable: false }
          );
          return; // Stop initialization
        }

        // 2. Security: Prevent Screen Capture (Android) & Recording
        await ScreenCapture.preventScreenCaptureAsync();

        // 3. Initialize Services
        messageService.init();

        // Increment session count
        incrementSessionCount();

        // Initialize feature flags
        await initializeFeatureFlags('user-123');
        logger.info('FeatureFlags initialized');

        // Import Sentry dynamically
        const { initSentry } = await import('./src/config/sentry');
        initSentry();

        // Load fonts or other assets here if needed
        // await Font.loadAsync({ ... });

      } catch (e) {
        logger.warn('Error during app initialization:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();

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
    <GestureHandlerRootView style={styles.container} onLayout={onLayoutRootView}>
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
