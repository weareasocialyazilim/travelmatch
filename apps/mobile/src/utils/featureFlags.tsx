/**
 * Feature Flags & A/B Testing System
 * Safe feature rollout with remote configuration
 */

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analytics } from '../services/analytics';
import { logger } from './logger';

/**
 * Feature Flag Configuration
 */
export interface FeatureFlags {
  // UX Improvements
  newOnboardingFlow: boolean;
  simplifiedProofUpload: boolean;
  newGiftFlow: boolean;
  unifiedGiftFlow: boolean;
  unifiedLoadingStates: boolean;

  // Personalization
  personalizedRecommendations: boolean;
  smartNotificationTiming: boolean;
  mlDrivenSearch: boolean;

  // Performance
  lazyImageLoading: boolean;
  optimizedBundleSize: boolean;
  performanceMonitoring: boolean;

  // Features
  inAppFeedback: boolean;
  granularNotifications: boolean;
  darkModeContrast: boolean;
  hapticFeedback: boolean;
  emptyStateIllustrations: boolean;

  // Experimental
  voiceSearch: boolean;
  arMoments: boolean;
  socialSharing: boolean;
}

/**
 * Default flag values (safe fallbacks)
 */
const DEFAULT_FLAGS: FeatureFlags = {
  newOnboardingFlow: false,
  simplifiedProofUpload: false,
  newGiftFlow: false,
  unifiedGiftFlow: true,
  unifiedLoadingStates: true,
  personalizedRecommendations: true,
  smartNotificationTiming: false,
  mlDrivenSearch: false,
  lazyImageLoading: true,
  optimizedBundleSize: true,
  performanceMonitoring: false,
  inAppFeedback: true,
  granularNotifications: true,
  darkModeContrast: true,
  hapticFeedback: true,
  emptyStateIllustrations: true,
  voiceSearch: false,
  arMoments: false,
  socialSharing: false,
};

/**
 * A/B Test Variant
 */
export type Variant = 'control' | 'variant_a' | 'variant_b';

/**
 * A/B Test Configuration
 */
interface ABTest {
  name: string;
  variant: Variant;
  assignedAt: number;
}

/**
 * Feature Flag Service
 */
class FeatureFlagService {
  private flags: FeatureFlags = DEFAULT_FLAGS;
  private abTests: Map<string, ABTest> = new Map();
  private readonly STORAGE_KEY = '@feature_flags';
  private readonly AB_TEST_KEY = '@ab_tests';

  /**
   * Initialize feature flags
   */
  async initialize(): Promise<void> {
    try {
      // Load from local storage
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.flags = {
          ...DEFAULT_FLAGS,
          ...(JSON.parse(stored) as Partial<FeatureFlags>),
        };
      }

      // Load A/B tests
      const storedTests = await AsyncStorage.getItem(this.AB_TEST_KEY);
      if (storedTests) {
        const tests = JSON.parse(storedTests) as Record<string, ABTest>;
        this.abTests = new Map(Object.entries(tests));
      }

      // Fetch from remote config (Supabase app_config table)
      await this.fetchRemoteConfig();
    } catch (error) {
      logger.error('Failed to initialize feature flags:', error);
    }
  }

  /**
   * Fetch remote configuration from Supabase app_config table
   * Falls back gracefully if config unavailable
   */
  private async fetchRemoteConfig(): Promise<void> {
    try {
      // Import supabase dynamically to avoid circular dependencies
      const { supabase } = await import('../config/supabase');

      // Fetch feature flags from app_config table
      const { data, error } = await supabase
        .from('app_config')
        .select('key, value')
        .eq('category', 'feature_flags')
        .eq('is_active', true);

      if (error) {
        // Table might not exist - use defaults silently
        logger.debug('Remote config: Using defaults (table not found)');
        return;
      }

      if (data && data.length > 0) {
        // Parse remote flags
        const remoteFlags: Partial<FeatureFlags> = {};
        for (const config of data) {
          const flagKey = config.key as keyof FeatureFlags;
          if (flagKey in this.flags) {
            // Parse boolean values
            remoteFlags[flagKey] = config.value === 'true' || config.value === true;
          }
        }

        // Merge with existing flags (remote takes precedence)
        this.flags = { ...this.flags, ...remoteFlags };
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.flags));

        logger.info('Remote config: Loaded', Object.keys(remoteFlags).length, 'flags');
      } else {
        logger.debug('Remote config: No remote flags configured, using defaults');
      }
    } catch (err) {
      // Network error or other issue - use cached/default values
      logger.warn('Remote config: Failed to fetch, using cached values', err);
    }
  }

  /**
   * Check if feature is enabled
   */
  isEnabled(flag: keyof FeatureFlags): boolean {
    const enabled = this.flags[flag];

    // Track flag usage
    analytics.trackEvent('feature_flag_checked', {
      flag,
      enabled,
      timestamp: Date.now(),
    });

    return enabled;
  }

  /**
   * Enable a feature flag
   */
  async enable(flag: keyof FeatureFlags): Promise<void> {
    this.flags[flag] = true;
    await this.persist();

    analytics.trackEvent('feature_flag_enabled', {
      flag,
      timestamp: Date.now(),
    });
  }

  /**
   * Disable a feature flag
   */
  async disable(flag: keyof FeatureFlags): Promise<void> {
    this.flags[flag] = false;
    await this.persist();

    analytics.trackEvent('feature_flag_disabled', {
      flag,
      timestamp: Date.now(),
    });
  }

  /**
   * Get all flags
   */
  getAllFlags(): FeatureFlags {
    return { ...this.flags };
  }

  /**
   * Assign user to A/B test
   */
  assignABTest(testName: string, userId: string): Variant {
    // Check if already assigned
    const existing = this.abTests.get(testName);
    if (existing) {
      return existing.variant;
    }

    // Assign variant based on user ID hash
    const variant = this.hashUserId(userId, testName);

    const test: ABTest = {
      name: testName,
      variant,
      assignedAt: Date.now(),
    };

    this.abTests.set(testName, test);
    void this.persistABTests();

    analytics.trackEvent('ab_test_assigned', {
      testName,
      variant,
      userId,
      timestamp: Date.now(),
    });

    return variant;
  }

  /**
   * Get A/B test variant
   */
  getVariant(testName: string): Variant | null {
    const test = this.abTests.get(testName);
    return test ? test.variant : null;
  }

  /**
   * Track A/B test conversion
   */
  trackConversion(testName: string, metricName: string, value?: number): void {
    const test = this.abTests.get(testName);
    if (!test) {
      logger.warn(`A/B test "${testName}" not found`);
      return;
    }

    analytics.trackEvent('ab_test_conversion', {
      testName,
      variant: test.variant,
      metricName,
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * Hash user ID to assign variant
   */
  private hashUserId(userId: string, testName: string): Variant {
    // Simple hash function for demo
    const combined = `${userId}-${testName}`;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = (hash << 5) - hash + combined.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }

    const normalized = Math.abs(hash) % 100;

    // 50-50 split for now
    if (normalized < 50) return 'control';
    return 'variant_a';
  }

  /**
   * Persist flags to storage
   */
  private async persist(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.flags));
    } catch (error) {
      logger.error('Failed to persist feature flags:', error);
    }
  }

  /**
   * Persist A/B tests to storage
   */
  private async persistABTests(): Promise<void> {
    try {
      const tests = Object.fromEntries(this.abTests);
      await AsyncStorage.setItem(this.AB_TEST_KEY, JSON.stringify(tests));
    } catch (error) {
      logger.error('Failed to persist A/B tests:', error);
    }
  }

  /**
   * Reset all flags to defaults
   */
  async reset(): Promise<void> {
    this.flags = { ...DEFAULT_FLAGS };
    this.abTests.clear();
    await AsyncStorage.removeItem(this.STORAGE_KEY);
    await AsyncStorage.removeItem(this.AB_TEST_KEY);
  }
}

// Export singleton instance
export const featureFlagService = new FeatureFlagService();

/**
 * React Hook - Use Feature Flag
 */
export const useFeatureFlag = (flag: keyof FeatureFlags): boolean => {
  const [enabled, setEnabled] = useState(featureFlagService.isEnabled(flag));

  useEffect(() => {
    // Re-check flag on mount
    setEnabled(featureFlagService.isEnabled(flag));
  }, [flag]);

  return enabled;
};

/**
 * React Hook - Use A/B Test
 */
export const useABTest = (testName: string, userId: string): Variant => {
  const [variant, setVariant] = useState<Variant>(
    featureFlagService.getVariant(testName) ?? 'control',
  );

  useEffect(() => {
    const assignedVariant = featureFlagService.assignABTest(testName, userId);
    setVariant(assignedVariant);
  }, [testName, userId]);

  return variant;
};

/**
 * HOC - With Feature Flag
 */
export const withFeatureFlag = <P extends object>(
  flag: keyof FeatureFlags,
  Component: React.ComponentType<P>,
  Fallback?: React.ComponentType<P>,
) => {
  const FeatureFlaggedComponent = (props: P) => {
    const enabled = useFeatureFlag(flag);

    if (enabled) {
      return <Component {...props} />;
    }

    if (Fallback) {
      return <Fallback {...props} />;
    }

    return null;
  };

  FeatureFlaggedComponent.displayName = `WithFeatureFlag(${flag})`;

  return FeatureFlaggedComponent;
};
