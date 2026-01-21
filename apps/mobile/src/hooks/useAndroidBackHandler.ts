/**
 * useAndroidBackHandler - Android Back Button Handling
 * Prevents accidental app exit with "Press again to exit" pattern
 */
import { useCallback, useRef, useEffect } from 'react';
import { BackHandler, ToastAndroid, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface UseAndroidBackHandlerOptions {
  enabled?: boolean;
  exitMessage?: string;
  exitTimeout?: number;
}

export const useAndroidBackHandler = (
  options: UseAndroidBackHandlerOptions = {},
) => {
  const {
    enabled = true,
    exitMessage = 'Çıkmak için tekrar basın',
    exitTimeout = 2000,
  } = options;

  const navigation = useNavigation();
  const lastBackPress = useRef<number>(0);

  const handleBackPress = useCallback(() => {
    // Only handle on Android
    if (Platform.OS !== 'android') return false;

    // Check if we can go back in navigation stack
    if (navigation.canGoBack()) {
      navigation.goBack();
      return true;
    }

    // Double-tap to exit logic
    const now = Date.now();
    if (now - lastBackPress.current < exitTimeout) {
      // User pressed back twice within timeout, allow exit
      BackHandler.exitApp();
      return true;
    }

    // First press - show toast and wait for second press
    lastBackPress.current = now;
    ToastAndroid.show(exitMessage, ToastAndroid.SHORT);
    return true; // Prevent default back action
  }, [navigation, exitMessage, exitTimeout]);

  useEffect(() => {
    if (!enabled || Platform.OS !== 'android') return;

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    return () => subscription.remove();
  }, [enabled, handleBackPress]);

  return { handleBackPress };
};

export default useAndroidBackHandler;
