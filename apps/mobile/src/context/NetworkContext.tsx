/**
 * Network State Provider
 * Monitors network connectivity and provides offline status
 * 
 * FINALIZED - Clean API for network status
 */

import type { ReactNode } from 'react';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import NetInfo from '@react-native-community/netinfo';
import type { NetInfoState } from '@react-native-community/netinfo';

// ============================================================================
// TYPES
// ============================================================================

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  isWifi: boolean;
  isCellular: boolean;
}

export interface NetworkContextValue {
  // Primary API - simple boolean
  isConnected: boolean;
  
  // Detailed network info
  status: NetworkStatus;
  
  // Actions
  refresh: () => Promise<void>;
}

// ============================================================================
// CONTEXT
// ============================================================================

const NetworkContext = createContext<NetworkContextValue | undefined>(
  undefined,
);

/**
 * Hook to access network status
 * Must be used within NetworkProvider
 */
export const useNetworkStatus = (): NetworkContextValue => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetworkStatus must be used within NetworkProvider');
  }
  return context;
};

// Alias for backward compatibility
export const useNetwork = useNetworkStatus;

// ============================================================================
// PROVIDER
// ============================================================================

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({
  children,
}) => {
  const [networkState, setNetworkState] = useState<NetInfoState | null>(null);

  useEffect(() => {
    // Get initial state
    void NetInfo.fetch().then(setNetworkState);

    // Subscribe to network changes
    const unsubscribe = NetInfo.addEventListener(setNetworkState);

    return () => unsubscribe();
  }, []);

  const refresh = useCallback(async () => {
    const state = await NetInfo.refresh();
    setNetworkState(state);
  }, []);

  // Build status object
  const status: NetworkStatus = {
    isConnected: networkState?.isConnected ?? true,
    isInternetReachable: networkState?.isInternetReachable ?? null,
    type: networkState?.type ?? null,
    isWifi: networkState?.type === 'wifi',
    isCellular: networkState?.type === 'cellular',
  };

  const value: NetworkContextValue = {
    isConnected: status.isConnected && status.isInternetReachable !== false,
    status,
    refresh,
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};

export default NetworkProvider;
