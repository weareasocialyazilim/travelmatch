/**
 * Firebase Remote Config Integration
 * Dynamic feature flag management with fallback to local defaults
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { featureFlagService, type FeatureFlags } from '../utils/featureFlags';
import { logger } from '../utils/logger';

// Environment-based configuration
const getRemoteConfigUrl = (): string => {
  // Priority: Runtime env var > Expo config > Default
  const envUrl = process.env.REMOTE_CONFIG_URL as string | undefined;
  if (envUrl) {
    return envUrl;
  }

  const extra = Constants.expoConfig?.extra as
    | { remoteConfigUrl?: string }
    | undefined;
  if (extra?.remoteConfigUrl) {
    return extra.remoteConfigUrl;
  }

  // Default endpoint
  return 'https://api.travelmatch.com/api/v1/feature-flags';
};

const REMOTE_CONFIG_URL = getRemoteConfigUrl();
const CACHE_KEY = '@feature_flags_cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const REQUEST_TIMEOUT = 5000; // 5 seconds

interface RemoteConfigResponse {
  flags: Partial<FeatureFlags>;
  timestamp: number;
  version: string;
}

/**
 * Fetch feature flags from remote config with timeout
 */
export const fetchRemoteConfig = async (): Promise<Partial<FeatureFlags>> => {
  try {
    // Try to get cached config first
    const cached = await getCachedConfig();
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      logger.debug('🚩 [RemoteConfig] Using cached config');
      return cached.flags;
    }

    // Fetch from remote with timeout
    logger.debug(`🚩 [RemoteConfig] Fetching from ${REMOTE_CONFIG_URL}...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(REMOTE_CONFIG_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data: RemoteConfigResponse = await response.json();

    // Cache the response
    await cacheConfig(data);

    logger.debug(
      '✅ [RemoteConfig] Fetched successfully:',
      Object.keys(data.flags).length,
      'flags',
    );
    return data.flags;
  } catch (error) {
    logger.warn('⚠️ [RemoteConfig] Fetch failed, using local defaults:', error);
    return {};
  }
};

/**
 * Get cached config
 */
const getCachedConfig = async (): Promise<RemoteConfigResponse | null> => {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    return JSON.parse(cached) as RemoteConfigResponse;
  } catch (error) {
    logger.error('[RemoteConfig] Cache read error:', error);
    return null;
  }
};

/**
 * Cache config
 */
const cacheConfig = async (config: RemoteConfigResponse): Promise<void> => {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(config));
  } catch (error) {
    logger.error('[RemoteConfig] Cache write error:', error);
  }
};

/**
 * Clear cached config
 */
export const clearRemoteConfigCache = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
    logger.debug('🗑️ [RemoteConfig] Cache cleared');
  } catch (error) {
    logger.error('[RemoteConfig] Cache clear error:', error);
  }
};

/**
 * Initialize feature flags with remote config
 */
export const initializeWithRemoteConfig = async (
  _userId: string,
): Promise<typeof featureFlagService> => {
  logger.debug('🚩 [RemoteConfig] Initializing feature flags...');

  // Initialize and return service instance
  await featureFlagService.initialize();

  // Fetch remote config
  const remoteFlags = await fetchRemoteConfig();

  // Merge remote flags with local defaults
  if (Object.keys(remoteFlags).length > 0) {
    Object.entries(remoteFlags).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        (
          featureFlagService as unknown as { flags: Record<string, boolean> }
        ).flags[key] = value;
      }
    });

    logger.debug('✅ [RemoteConfig] Merged remote flags with local defaults');
  }

  return featureFlagService;
};

/**
 * Force refresh remote config
 */
export const refreshRemoteConfig = async (
  service: typeof featureFlagService,
): Promise<void> => {
  logger.debug('🔄 [RemoteConfig] Force refreshing...');

  // Clear cache
  await clearRemoteConfigCache();

  // Fetch fresh config
  const remoteFlags = await fetchRemoteConfig();

  // Update service
  if (Object.keys(remoteFlags).length > 0) {
    Object.entries(remoteFlags).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        (service as unknown as { flags: Record<string, boolean> }).flags[key] =
          value;
      }
    });

    logger.debug('✅ [RemoteConfig] Refreshed successfully');
  }
};

export default {
  fetchRemoteConfig,
  initializeWithRemoteConfig,
  refreshRemoteConfig,
  clearRemoteConfigCache,
};
