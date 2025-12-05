/**
 * Network Status Hook
 * Monitors device network connectivity status in real-time
 * @module hooks/useNetworkStatus
 */

import { useState, useEffect } from 'react';
import type { NetInfoState } from '@react-native-community/netinfo';
import NetInfo from '@react-native-community/netinfo';

/**
 * Network status information
 */
interface NetworkStatus {
  /** Whether the device has network connectivity */
  isConnected: boolean;
  /** Whether internet is actually reachable (may be null while checking) */
  isInternetReachable: boolean | null;
  /** Network type (wifi, cellular, none, etc.) */
  type: string | null;
}

/**
 * Hook to monitor network connectivity status
 *
 * @returns {NetworkStatus} Current network status
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isConnected, isInternetReachable, type } = useNetworkStatus();
 *
 *   if (!isConnected) {
 *     return <OfflineMessage />;
 *   }
 *
 *   return <OnlineContent />;
 * }
 * ```
 */
export function useNetworkStatus(): NetworkStatus {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: null,
    type: null,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return networkStatus;
}
