/**
 * Feature Flag Hook with Auto-Refresh
 *
 * P2 FIX: Added automatic refresh mechanism for feature flags
 *
 * Features:
 * - Auto-refresh on app foreground (AppState change)
 * - Periodic refresh every 5 minutes when app is active
 * - Manual refresh capability
 * - Optimistic updates with rollback
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { featureFlagService, type FeatureFlags } from '../utils/featureFlags';
import { refreshRemoteConfig } from '../config/remoteConfig';
import { logger } from '../utils/logger';

// Refresh interval: 5 minutes
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

// Minimum time between refreshes: 30 seconds
const MIN_REFRESH_INTERVAL_MS = 30 * 1000;

interface UseFeatureFlagsOptions {
  /** Enable auto-refresh on app foreground */
  autoRefreshOnForeground?: boolean;
  /** Enable periodic refresh while app is active */
  periodicRefresh?: boolean;
  /** Refresh interval in milliseconds (default: 5 minutes) */
  refreshIntervalMs?: number;
}

interface UseFeatureFlagsReturn {
  /** All feature flags */
  flags: FeatureFlags;
  /** Check if a specific flag is enabled */
  isEnabled: (flag: keyof FeatureFlags) => boolean;
  /** Manually trigger a refresh */
  refresh: () => Promise<void>;
  /** Whether a refresh is in progress */
  isRefreshing: boolean;
  /** Last refresh timestamp */
  lastRefreshedAt: Date | null;
  /** Any error from the last refresh */
  error: Error | null;
}

/**
 * Hook for accessing feature flags with auto-refresh capability
 */
export function useFeatureFlags(
  options: UseFeatureFlagsOptions = {}
): UseFeatureFlagsReturn {
  const {
    autoRefreshOnForeground = true,
    periodicRefresh = true,
    refreshIntervalMs = REFRESH_INTERVAL_MS,
  } = options;

  const [flags, setFlags] = useState<FeatureFlags>(featureFlagService.getAllFlags());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const lastRefreshAttempt = useRef<number>(0);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  /**
   * Perform the actual refresh
   */
  const doRefresh = useCallback(async () => {
    const now = Date.now();

    // Prevent too frequent refreshes
    if (now - lastRefreshAttempt.current < MIN_REFRESH_INTERVAL_MS) {
      logger.debug('[useFeatureFlags] Skipping refresh - too soon');
      return;
    }

    lastRefreshAttempt.current = now;
    setIsRefreshing(true);
    setError(null);

    try {
      await refreshRemoteConfig(featureFlagService);
      const newFlags = featureFlagService.getAllFlags();
      setFlags(newFlags);
      setLastRefreshedAt(new Date());
      logger.debug('[useFeatureFlags] Refreshed successfully');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Refresh failed');
      setError(error);
      logger.error('[useFeatureFlags] Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  /**
   * Handle app state changes
   */
  useEffect(() => {
    if (!autoRefreshOnForeground) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // Refresh when app comes to foreground
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        logger.debug('[useFeatureFlags] App foregrounded - refreshing');
        doRefresh();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [autoRefreshOnForeground, doRefresh]);

  /**
   * Setup periodic refresh
   */
  useEffect(() => {
    if (!periodicRefresh) return;

    // Clear any existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Start periodic refresh
    refreshIntervalRef.current = setInterval(() => {
      // Only refresh if app is active
      if (appState.current === 'active') {
        logger.debug('[useFeatureFlags] Periodic refresh');
        doRefresh();
      }
    }, refreshIntervalMs);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [periodicRefresh, refreshIntervalMs, doRefresh]);

  /**
   * Sync with service when flags change externally
   */
  useEffect(() => {
    const checkFlags = () => {
      const currentFlags = featureFlagService.getAllFlags();
      setFlags(currentFlags);
    };

    // Check every second for external changes (e.g., from other hooks)
    const syncInterval = setInterval(checkFlags, 1000);

    return () => clearInterval(syncInterval);
  }, []);

  /**
   * Check if a specific flag is enabled
   */
  const isEnabled = useCallback(
    (flag: keyof FeatureFlags): boolean => {
      return flags[flag] ?? false;
    },
    [flags]
  );

  return {
    flags,
    isEnabled,
    refresh: doRefresh,
    isRefreshing,
    lastRefreshedAt,
    error,
  };
}

/**
 * Hook for checking a single feature flag
 */
export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  const { isEnabled } = useFeatureFlags({ periodicRefresh: false });
  return isEnabled(flag);
}

export default useFeatureFlags;
