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

    // Subscribe to network changes
    const unsubscribe = NetInfo.addEventListener(handleNetInfoChange);

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
