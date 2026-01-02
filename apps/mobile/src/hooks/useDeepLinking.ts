/**
 * Deep Linking Hook
 * Handle deep links in React components
 */

import { useEffect } from 'react';
import { useNavigation } from '@/hooks/useNavigationHelpers';
import {
  getInitialURL,
  subscribeToDeepLinks,
  handleDeepLink,
} from '../utils/deepLinking';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/routeParams';

/**
 * Handle deep links automatically
 * Call this in App.tsx or root navigation component
 *
 * @example
 * useDeepLinking();
 */
export function useDeepLinking() {
  const navigation = useNavigation();

  useEffect(() => {
    // Handle initial URL (app opened from link)
    void getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url, navigation as NavigationProp<RootStackParamList>);
      }
    });

    // Handle URLs while app is running
    const unsubscribe = subscribeToDeepLinks((url) => {
      handleDeepLink(url, navigation as NavigationProp<RootStackParamList>);
    });

    return unsubscribe;
  }, [navigation]);
}
