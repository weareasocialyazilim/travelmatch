/**
 * Deep Linking Hook
 * Handle deep links in React components
 */

import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import {
  getInitialURL,
  subscribeToDeepLinks,
  handleDeepLink,
} from '../utils/deepLinking';

/**
 * Handle deep links automatically
 * Call this in App.tsx or root navigation component
 *
 * @example
 * useDeepLinking();
 */
export function useDeepLinking() {
  const navigation =
    useNavigation() as NavigationContainerRef<RootStackParamList>;

  useEffect(() => {
    // Handle initial URL (app opened from link)
    getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url, navigation);
      }
    });

    // Handle URLs while app is running
    const unsubscribe = subscribeToDeepLinks((url) => {
      handleDeepLink(url, navigation);
    });

    return unsubscribe;
  }, [navigation]);
}
