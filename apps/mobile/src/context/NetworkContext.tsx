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
  useMemo,
} from 'react';
import NetInfo from '@react-native-community/netinfo';
import { logger } from '@/utils/logger';
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
    // Get initial state with error handling
    const initNetwork = async () => {
      try {
        const state = await NetInfo.fetch();
        setNetworkState(state);
      } catch (error) {
        // Silently handle network check failures - assume connected
        logger.warn('[NetworkContext] Failed to fetch initial state', error as Error);
        setNetworkState(null);
      }
    };
    void initNetwork();

    // Subscribe to network changes with error boundary
    const unsubscribe = NetInfo.addEventListener((state) => {
      try {
        setNetworkState(state);
      } catch (error) {
        logger.warn('[NetworkContext] State update failed', error as Error);
      }
    });

    return () => unsubscribe();
  }, []);

  const refresh = useCallback(async () => {
    try {
      const state = await NetInfo.refresh();
      setNetworkState(state);
    } catch (error) {
      logger.warn('[NetworkContext] Refresh failed', error as Error);
      // Don't update state on error - keep last known state
    }
  }, []);

  // Build status object - memoized to prevent unnecessary re-renders
  const status = useMemo<NetworkStatus>(
    () => ({
      isConnected: networkState?.isConnected ?? true,
      isInternetReachable: networkState?.isInternetReachable ?? null,
      type: networkState?.type ?? null,
      isWifi: networkState?.type === 'wifi',
      isCellular: networkState?.type === 'cellular',
    }),
    [networkState],
  );

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<NetworkContextValue>(
    () => ({
      isConnected: status.isConnected && status.isInternetReachable !== false,
      status,
      refresh,
    }),
    [status, refresh],
  );

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
};

export default NetworkProvider;
