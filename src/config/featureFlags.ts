/**
 * Feature Flags Initialization
 * Initialize and configure feature flags system with remote config support
 */

import { logger } from '../utils/logger';
import { initializeWithRemoteConfig } from './remoteConfig';
import type { featureFlagService } from '../utils/featureFlags';

type FeatureFlagServiceType = typeof featureFlagService;
let cachedService: FeatureFlagServiceType | null = null;

export const initializeFeatureFlags = async (userId: string) => {
  if (cachedService) {
    return cachedService;
  }

  // Initialize with remote config (falls back to local if remote fails)
  cachedService = await initializeWithRemoteConfig(userId);

  // Log active flags in development
  if (__DEV__ && cachedService) {
    const flags = cachedService.getAllFlags();
    logger.debug('🚩 [FeatureFlags] Initialized with flags:', flags);
  }

  return cachedService;
};

export const getFeatureFlagService = (): FeatureFlagServiceType | null => {
  return cachedService;
};

export default { initializeFeatureFlags, getFeatureFlagService };
