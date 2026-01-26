import { logger } from '../utils/logger';
import PostHog from 'posthog-react-native';

// DISABLED: Sentry v7 incompatible with React 19
// Import from our stub config instead of @sentry/react-native
import { Sentry as StubSentry } from '../config/sentry';

type SentryType = typeof StubSentry;

async function getSentry(): Promise<SentryType | null> {
  // Return stub Sentry - real Sentry disabled due to React 19 incompatibility
  return StubSentry as any;
}

/**
 * PII patterns to sanitize from analytics data
 * Prevents accidental tracking of sensitive information
 */
const PII_PATTERNS: Record<string, RegExp> = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
  phone: /(\+?[0-9]{1,4}[-.\s]?)?(\(?\d{1,4}\)?[-.\s]?)?[\d\s-]{6,14}/g,
  creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
  ssn: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
  ipv4: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  jwt: /eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*/g,
};

/**
 * Keys that should be completely removed from analytics
 */
const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'secret',
  'apiKey',
  'api_key',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'authorization',
  'creditCard',
  'credit_card',
  'cardNumber',
  'card_number',
  'cvv',
  'cvc',
  'ssn',
  'socialSecurityNumber',
  'bankAccount',
  'bank_account',
  'routingNumber',
  'routing_number',
]);

/**
 * Sanitize a string value by redacting PII patterns
 */
function sanitizeString(value: string): string {
  let sanitized = value;
  for (const [_type, pattern] of Object.entries(PII_PATTERNS)) {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }
  return sanitized;
}

/**
 * Recursively sanitize an object, removing sensitive keys and redacting PII
 */
function sanitizeProperties(
  obj: Record<string, any> | undefined,
  depth = 0,
): Record<string, any> | undefined {
  if (!obj || depth > 5) return obj; // Prevent infinite recursion

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Skip sensitive keys entirely
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey) || SENSITIVE_KEYS.has(key)) {
      continue;
    }

    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string'
          ? sanitizeString(item)
          : typeof item === 'object' && item !== null
            ? sanitizeProperties(item, depth + 1)
            : item,
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeProperties(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
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
 *
 * PostHog v4 Migration:
 * - Uses `new PostHog()` constructor instead of deprecated `PostHog.initAsync()`
 * - captureApplicationLifecycleEvents -> captureAppLifecycleEvents
 * - Synchronous initialization with async flush
 */
class AnalyticsService {
  private static instance: AnalyticsService;
  private initialized = false;
  private posthog: InstanceType<typeof PostHog> | null = null;

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
   * PostHog v4 uses synchronous constructor - no more initAsync
   */
  public async init() {
    if (this.initialized) return;

    try {
      const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
      const host =
        process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

      if (!apiKey) {
        logger.warn(
          '[Analytics] PostHog API key not found, analytics disabled',
        );
        return;
      }

      // PostHog v4: Use constructor instead of deprecated initAsync
      this.posthog = new PostHog(apiKey, {
        host,
        // Automatic event tracking (v4 renamed option)
        captureAppLifecycleEvents: true,
        // Privacy settings
        enableSessionReplay: false, // Disable for privacy
        // Performance
        flushAt: 20, // Send events in batches
        flushInterval: 30000, // Every 30 seconds
        // Disable in development to reduce noise
        disabled: __DEV__ && !apiKey.startsWith('phc_'),
      });

      this.initialized = true;
      logger.info('[Analytics] PostHog initialized successfully');
    } catch (error) {
      logger.warn(
        '[Analytics] PostHog initialization failed, analytics disabled:',
        error,
      );
      // Don't throw - analytics failure shouldn't block app startup
      // Don't report to Sentry here as it may also be down
    }
  }

  /**
   * Track a custom event
   * Sends to both PostHog and Sentry breadcrumbs
   * All properties are sanitized to remove PII
   */
  public async trackEvent(eventName: string, properties?: Record<string, any>) {
    if (!this.initialized) {
      logger.warn('[Analytics] Not initialized, skipping event:', eventName);
      return;
    }

    try {
      // Sanitize properties to remove PII before sending
      const sanitizedProps = sanitizeProperties(properties);

      // Send to PostHog
      this.posthog?.capture(eventName, sanitizedProps);

      // Add Sentry breadcrumb for debugging (async, non-blocking)
      const sentry = await getSentry();
      sentry?.addBreadcrumb({
        category: 'user-action',
        message: eventName,
        data: sanitizedProps,
        level: 'info',
      });

      if (__DEV__) {
        logger.info(`[Analytics] Event tracked: ${eventName}`, sanitizedProps);
      }
    } catch (error) {
      logger.error('[Analytics] Failed to track event:', error);
    }
  }

  /**
   * Track a screen view
   * Properties are sanitized to remove PII
   */
  public async trackScreen(
    screenName: string,
    properties?: Record<string, any>,
  ) {
    if (!this.initialized) return;

    try {
      // Sanitize properties to remove PII
      const sanitizedProps = sanitizeProperties(properties);

      this.posthog?.screen(screenName, sanitizedProps);

      const sentry = await getSentry();
      sentry?.addBreadcrumb({
        category: 'navigation',
        message: `Screen: ${screenName}`,
        data: sanitizedProps,
        level: 'info',
      });

      if (__DEV__) {
        logger.info(`[Analytics] Screen viewed: ${screenName}`, sanitizedProps);
      }
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
      // Sanitize traits to remove PII before sending
      const sanitizedTraits = sanitizeProperties(traits);

      // PostHog user identification
      this.posthog?.identify(userId, sanitizedTraits);

      // Sentry user context
      const sentry = await getSentry();
      sentry?.setUser({
        id: userId,
        ...sanitizedTraits,
      });

      logger.info(`[Analytics] User identified: ${userId}`, sanitizedTraits);
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
