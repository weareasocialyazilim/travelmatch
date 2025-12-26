/**
 * Navigation Service
 *
 * Global navigation reference for navigating outside React components
 * Used by services (like apiClient) to trigger navigation on events
 */

import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/routeParams';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Navigate to a screen from anywhere
 */
export function navigate<T extends keyof RootStackParamList>(
  name: T,
  params?: RootStackParamList[T],
) {
  if (navigationRef.isReady()) {
    // Type assertion for generic screen navigation outside components
    (
      navigationRef.navigate as unknown as (
        name: string,
        params?: object,
      ) => void
    )(name as string, params);
  }
}

/**
 * Reset navigation stack
 */
export function resetNavigation(routeName: string) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: routeName }],
    });
  }
}

/**
 * Go back
 */
export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}
