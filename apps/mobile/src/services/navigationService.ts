/**
 * Navigation Service
 * 
 * Global navigation reference for navigating outside React components
 * Used by services (like apiClient) to trigger navigation on events
 */

import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

/**
 * Navigate to a screen from anywhere
 */
export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    // @ts-ignore - Dynamic route navigation
    navigationRef.navigate(name, params);
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
