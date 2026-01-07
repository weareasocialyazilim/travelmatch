/**
 * NetworkGuard Component
 * Wraps children and shows offline state when disconnected
 *
 * Use this to protect sections that require network
 */

import React from 'react';
import { useNetworkStatus } from '../context/NetworkContext';
import { OfflineState, type OfflineStateProps } from './OfflineState';

export interface NetworkGuardProps {
  /**
   * Children to render when online
   */
  children: React.ReactNode;

  /**
   * Custom offline message
   */
  offlineMessage?: string;

  /**
   * Callback when retry is pressed
   * If not provided, will use network refresh
   */
  onRetry?: () => void | Promise<void>;

  /**
   * Show compact banner instead of full screen
   * @default false
   */
  compact?: boolean;

  /**
   * Custom OfflineState component props
   */
  offlineProps?: Partial<OfflineStateProps>;
}

/**
 * NetworkGuard - Protect components that require network
 *
 * @example
 * <NetworkGuard>
 *   <MyNetworkDependentComponent />
 * </NetworkGuard>
 *
 * @example
 * // With custom retry
 * <NetworkGuard onRetry={refetchData}>
 *   <DataList />
 * </NetworkGuard>
 *
 * @example
 * // Compact mode
 * <NetworkGuard compact>
 *   <Content />
 * </NetworkGuard>
 */
export const NetworkGuard: React.FC<NetworkGuardProps> = ({
  children,
  offlineMessage,
  onRetry,
  compact = false,
  offlineProps,
}) => {
  const { isConnected, refresh } = useNetworkStatus();

  if (!isConnected) {
    return (
      <OfflineState
        message={offlineMessage}
        onRetry={onRetry || refresh}
        compact={compact}
        {...offlineProps}
      />
    );
  }

  return <>{children}</>;
};
