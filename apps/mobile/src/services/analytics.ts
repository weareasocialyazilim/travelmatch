import { logger } from '../utils/logger';
import PostHog from 'posthog-react-native';
import * as Sentry from '@sentry/react-native';

// Analytics property types - support primitive values and nested objects
type AnalyticsPropertyValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | string[]
  | number[]
  | Record<string, string | number | boolean | null | undefined>;

type AnalyticsProperties = Record<string, AnalyticsPropertyValue>;

/**
 * Analytics Service
 * Centralized analytics tracking with PostHog + Sentry
 *
 * Features:
 * - Event tracking (PostHog)
 * - User identification (PostHog + Sentry)
 * - Screen tracking (PostHog)
 * - Performance metrics (Sentry)
 * - Privacy-compliant (EU hosting)
 */
class AnalyticsService {
  private static instance: AnalyticsService;
  private initialized = false;
  private posthog: typeof PostHog | null = null;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Initialize PostHog analytics
   * Must be called before any tracking
   */
  public async init() {
    if (this.initialized) return;

    try {
      const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
      const host =
        process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com';

      if (!apiKey) {
        // In development, analytics being disabled is expected
        if (__DEV__) {
          logger.debug(
            '[Analytics] PostHog API key not configured (optional in development)',
          );
        } else {
          logger.warn(
            '[Analytics] PostHog API key not found, analytics disabled',
          );
        }
        return;
      }

      // Check if PostHog.initAsync exists (may not be available in all environments)
      if (typeof PostHog?.initAsync !== 'function') {
        logger.warn('[Analytics] PostHog.initAsync not available');
        return;
      }

      this.posthog = await PostHog.initAsync(apiKey, {
        host,
        // Automatic event tracking
        captureApplicationLifecycleEvents: true,
        captureDeepLinks: true,
        // Privacy settings
        enableSessionReplay: false, // Disable for privacy
        // Performance
        flushAt: 20, // Send events in batches
        flushInterval: 30000, // Every 30 seconds
      });

      this.initialized = true;
      logger.info('[Analytics] PostHog initialized successfully');
    } catch (error) {
      logger.error('[Analytics] Failed to initialize PostHog:', error);
      Sentry.captureException(error);
    }
  }

  /**
   * Track a custom event
   * Sends to both PostHog and Sentry breadcrumbs
   */
  public trackEvent(eventName: string, properties?: AnalyticsProperties) {
    if (!this.initialized) {
      logger.warn('[Analytics] Not initialized, skipping event:', eventName);
      return;
    }

    try {
      // Send to PostHog
      this.posthog?.capture(eventName, properties);

      // Add Sentry breadcrumb for debugging
      Sentry.addBreadcrumb({
        category: 'user-action',
        message: eventName,
        data: properties,
        level: 'info',
      });

      logger.info(`[Analytics] Event tracked: ${eventName}`, properties);
    } catch (error) {
      logger.error('[Analytics] Failed to track event:', error);
    }
  }

  /**
   * Track a screen view
   */
  public trackScreen(screenName: string, properties?: AnalyticsProperties) {
    if (!this.initialized) return;

    try {
      this.posthog?.screen(screenName, properties);

      Sentry.addBreadcrumb({
        category: 'navigation',
        message: `Screen: ${screenName}`,
        data: properties,
        level: 'info',
      });

      logger.info(`[Analytics] Screen viewed: ${screenName}`, properties);
    } catch (error) {
      logger.error('[Analytics] Failed to track screen:', error);
    }
  }

  /**
   * Alias for trackScreen
   */
  public screen(screenName: string, properties?: AnalyticsProperties) {
    this.trackScreen(screenName, properties);
  }

  /**
   * Identify a user
   * Sets user context in both PostHog and Sentry
   */
  public identify(userId: string, traits?: AnalyticsProperties) {
    if (!this.initialized) return;

    try {
      // PostHog user identification
      this.posthog?.identify(userId, traits);

      // Sentry user context
      Sentry.setUser({
        id: userId,
        ...traits,
      });

      logger.info(`[Analytics] User identified: ${userId}`, traits);
    } catch (error) {
      logger.error('[Analytics] Failed to identify user:', error);
    }
  }

  /**
   * Reset analytics session
   * Call on user logout
   */
  public reset() {
    if (!this.initialized) return;

    try {
      this.posthog?.reset();
      Sentry.setUser(null);

      logger.info('[Analytics] Session reset');
    } catch (error) {
      logger.error('[Analytics] Failed to reset session:', error);
    }
  }

  /**
   * Track timing/performance metrics
   * Useful for measuring app performance
   */
  public trackTiming(
    metricName: string,
    duration: number,
    properties?: AnalyticsProperties,
  ) {
    if (!this.initialized) return;

    try {
      this.trackEvent(`timing_${metricName}`, {
        duration_ms: duration,
        ...properties,
      });

      // Also send to Sentry for performance monitoring
      const sentryMetrics = Sentry as unknown as {
        metrics?: {
          distribution?: (
            name: string,
            value: number,
            opts?: { unit?: string; tags?: Record<string, string> },
          ) => void;
        };
      };
      sentryMetrics.metrics?.distribution?.(metricName, duration, {
        unit: 'millisecond',
        tags: properties as Record<string, string>,
      });
    } catch (error) {
      logger.error('[Analytics] Failed to track timing:', error);
    }
  }

  /**
   * Set user properties
   * Updates user traits without changing distinct_id
   */
  public setUserProperties(properties: AnalyticsProperties) {
    if (!this.initialized) return;

    try {
      this.posthog?.capture('$set', {
        $set: properties,
      });
    } catch (error) {
      logger.error('[Analytics] Failed to set user properties:', error);
    }
  }

  /**
   * Feature flag evaluation
   * Use PostHog feature flags for A/B testing
   */
  public async isFeatureEnabled(flagKey: string): Promise<boolean> {
    if (!this.initialized || !this.posthog) return false;

    try {
      return await this.posthog.isFeatureEnabled(flagKey);
    } catch (error) {
      logger.error('[Analytics] Failed to check feature flag:', error);
      return false;
    }
  }

  /**
   * Get feature flag payload
   */
  public async getFeatureFlagPayload(
    flagKey: string,
  ): Promise<string | boolean | object | undefined> {
    if (!this.initialized || !this.posthog) return undefined;

    try {
      return await this.posthog.getFeatureFlagPayload(flagKey);
    } catch (error) {
      logger.error('[Analytics] Failed to get feature flag payload:', error);
      return undefined;
    }
  }
}

export const analytics = AnalyticsService.getInstance();
