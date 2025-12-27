import { useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import type { NetInfoState } from '@react-native-community/netinfo';

interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
  isWifi: boolean;
  isCellular: boolean;
}

interface UseNetworkReturn {
  isOnline: boolean;
  isOffline: boolean;
  networkStatus: NetworkStatus;
  checkConnection: () => Promise<boolean>;
}

/**
 * Hook to monitor network connectivity status
 */
export const useNetwork = (): UseNetworkReturn => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
    isWifi: false,
    isCellular: false,
  });

  useEffect(() => {
    // Get initial state
    void NetInfo.fetch().then(handleNetInfoChange);

    // Subscribe to network changes. Some mocks return a function, others an
    // object with a `remove()` method — support both shapes to avoid runtime
    // errors during tests/unmount.
    const subscriber = NetInfo.addEventListener(handleNetInfoChange);

    return () => {
      if (typeof subscriber === 'function') {
        try {
          subscriber();
        } catch {
          // swallow - defensive in case mock throws on double-unsubscribe
        }
      } else if (
        subscriber &&
        typeof (subscriber as any).remove === 'function'
      ) {
        try {
          (subscriber as any).remove();
        } catch {
          // swallow
        }
      }
    };
  }, []);

  const handleNetInfoChange = useCallback((state: NetInfoState) => {
    setNetworkStatus({
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
      isWifi: state.type === 'wifi',
      isCellular: state.type === 'cellular',
    });
  }, []);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    handleNetInfoChange(state);
    return state.isConnected ?? false;
  }, [handleNetInfoChange]);

  const isOnline =
    networkStatus.isConnected && networkStatus.isInternetReachable !== false;
  const isOffline = !isOnline;

  return {
    isOnline,
    isOffline,
    networkStatus,
    checkConnection,
  };
};

export default useNetwork;
