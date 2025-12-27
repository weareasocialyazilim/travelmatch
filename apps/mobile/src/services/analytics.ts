import { logger } from '../utils/logger';
import PostHog from 'posthog-react-native';

// Sentry is loaded dynamically to avoid JSI runtime errors with New Architecture
// Do NOT import @sentry/react-native at module level
type SentryType = typeof import('@sentry/react-native');
let _sentry: SentryType | null = null;

async function getSentry(): Promise<SentryType | null> {
  if (_sentry) return _sentry;
  try {
    _sentry = await import('@sentry/react-native');
    return _sentry;
  } catch {
    return null;
  }
}

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
   * Uses timeout to prevent blocking app startup on network issues
   */
  public async init() {
    if (this.initialized) return;

    const INIT_TIMEOUT_MS = 5000; // 5 second timeout for initialization

    try {
      const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
      const host =
        process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com';

      if (!apiKey) {
        logger.warn(
          '[Analytics] PostHog API key not found, analytics disabled',
        );
        return;
      }

      // Wrap PostHog initialization with timeout to prevent blocking app startup
      const initPromise = PostHog.initAsync(apiKey, {
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

      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => {
          reject(new Error('PostHog initialization timed out'));
        }, INIT_TIMEOUT_MS);
      });

      this.posthog = await Promise.race([initPromise, timeoutPromise]);

      this.initialized = true;
      logger.info('[Analytics] PostHog initialized successfully');
    } catch (error) {
      logger.warn(
        '[Analytics] PostHog initialization failed or timed out, analytics disabled:',
        error,
      );
      // Don't throw - analytics failure shouldn't block app startup
      // Don't report to Sentry here as it may also be down
    }
  }

  /**
   * Track a custom event
   * Sends to both PostHog and Sentry breadcrumbs
   */
  public async trackEvent(eventName: string, properties?: Record<string, any>) {
    if (!this.initialized) {
      logger.warn('[Analytics] Not initialized, skipping event:', eventName);
      return;
    }

    try {
      // Send to PostHog
      this.posthog?.capture(eventName, properties);

      // Add Sentry breadcrumb for debugging (async, non-blocking)
      const sentry = await getSentry();
      sentry?.addBreadcrumb({
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
  public async trackScreen(
    screenName: string,
    properties?: Record<string, any>,
  ) {
    if (!this.initialized) return;

    try {
      this.posthog?.screen(screenName, properties);

      const sentry = await getSentry();
      sentry?.addBreadcrumb({
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
  public async screen(screenName: string, properties?: Record<string, any>) {
    await this.trackScreen(screenName, properties);
  }

  /**
   * Identify a user
   * Sets user context in both PostHog and Sentry
   */
  public async identify(userId: string, traits?: Record<string, any>) {
    if (!this.initialized) return;

    try {
      // PostHog user identification
      this.posthog?.identify(userId, traits);

      // Sentry user context
      const sentry = await getSentry();
      sentry?.setUser({
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
  public async reset() {
    if (!this.initialized) return;

    try {
      this.posthog?.reset();
      const sentry = await getSentry();
      sentry?.setUser(null);

      logger.info('[Analytics] Session reset');
    } catch (error) {
      logger.error('[Analytics] Failed to reset session:', error);
    }
  }

  /**
   * Track timing/performance metrics
   * Useful for measuring app performance
   */
  public async trackTiming(
    metricName: string,
    duration: number,
    properties?: Record<string, any>,
  ) {
    if (!this.initialized) return;

    try {
      await this.trackEvent(`timing_${metricName}`, {
        duration_ms: duration,
        ...properties,
      });

      // Also send to Sentry for performance monitoring
      const sentry = await getSentry();
      const sentryMetrics = sentry as unknown as {
        metrics?: {
          distribution?: (
            name: string,
            value: number,
            opts?: { unit?: string; tags?: Record<string, string> },
          ) => void;
        };
      };
      sentryMetrics?.metrics?.distribution?.(metricName, duration, {
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
  public setUserProperties(properties: Record<string, any>) {
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
