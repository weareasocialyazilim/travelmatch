/**
 * Analytics Service
 * User event tracking sistemi
 */

import { config, FEATURES } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Event Types
 */
export enum AnalyticsEvent {
  // User Events
  USER_SIGNUP = 'user_signup',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  PROFILE_UPDATED = 'profile_updated',

  // Moment Events
  MOMENT_VIEWED = 'moment_viewed',
  MOMENT_CREATED = 'moment_created',
  MOMENT_UPDATED = 'moment_updated',
  MOMENT_DELETED = 'moment_deleted',
  MOMENT_SHARED = 'moment_shared',
  MOMENT_FAVORITED = 'moment_favorited',

  // Booking Events
  BOOKING_INITIATED = 'booking_initiated',
  BOOKING_COMPLETED = 'booking_completed',
  BOOKING_CANCELLED = 'booking_cancelled',

  // Payment Events
  PAYMENT_METHOD_ADDED = 'payment_method_added',
  PAYMENT_COMPLETED = 'payment_completed',
  PAYMENT_FAILED = 'payment_failed',

  // Search Events
  SEARCH_PERFORMED = 'search_performed',
  FILTER_APPLIED = 'filter_applied',

  // Social Events
  MESSAGE_SENT = 'message_sent',
  USER_FOLLOWED = 'user_followed',
  REVIEW_SUBMITTED = 'review_submitted',

  // Error Events
  ERROR_OCCURRED = 'error_occurred',
  API_ERROR = 'api_error',
}

/**
 * Event Properties
 */
export interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

/**
 * User Properties
 */
export interface UserProperties {
  userId?: string;
  email?: string;
  name?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Analytics Service
 */
class AnalyticsService {
  private isEnabled: boolean;
  private userId?: string;
  private userProperties: UserProperties = {};

  constructor() {
    this.isEnabled = FEATURES.ANALYTICS;
  }

  /**
   * Initialize analytics
   */
  initialize(): void {
    if (!this.isEnabled) {
      logger.debug('Analytics disabled');
      return;
    }

    logger.debug('Analytics initialized');
    // TODO: Initialize your analytics provider (Firebase, Amplitude, etc.)
  }

  /**
   * Identify user
   */
  identify(userId: string, properties?: UserProperties): void {
    if (!this.isEnabled) return;

    this.userId = userId;
    this.userProperties = { ...this.userProperties, ...properties };

    // eslint-disable-next-line no-console
    logger.debug('👤 User identified:', userId, properties);
    // TODO: Call your analytics provider's identify method
  }

  /**
   * Track event
   */
  track(eventName: AnalyticsEvent, properties?: EventProperties): void {
    if (!this.isEnabled) return;

    const eventData = {
      event: eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        userId: this.userId,
        appVersion: config.APP_VERSION,
      },
    };

    // eslint-disable-next-line no-console
    logger.debug('📊 Event tracked:', eventData);
    // TODO: Call your analytics provider's track method

    // Example for different providers:
    // Firebase: analytics().logEvent(eventName, properties)
    // Amplitude: amplitude.logEvent(eventName, properties)
    // Segment: analytics.track(eventName, properties)
  }

  /**
   * Track screen view
   */
  screen(screenName: string, properties?: EventProperties): void {
    if (!this.isEnabled) return;

    // eslint-disable-next-line no-console
    logger.debug('📱 Screen viewed:', screenName, properties);
    this.track(AnalyticsEvent.MOMENT_VIEWED, {
      screen: screenName,
      ...properties,
    });
  }

  /**
   * Track custom event with string name
   */
  trackEvent(eventName: string, properties?: EventProperties): void {
    if (!this.isEnabled) return;

    const eventData = {
      event: eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        userId: this.userId,
        appVersion: config.APP_VERSION,
      },
    };

    // eslint-disable-next-line no-console
    logger.debug('📊 Custom event tracked:', eventData);
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: UserProperties): void {
    if (!this.isEnabled) return;

    this.userProperties = { ...this.userProperties, ...properties };
    logger.debug('User properties updated:', this.userProperties);
    // TODO: Call your analytics provider's setUserProperties method
  }

  /**
   * Track error
   */
  trackError(error: Error, properties?: EventProperties): void {
    if (!this.isEnabled) return;

    this.track(AnalyticsEvent.ERROR_OCCURRED, {
      error: error.message,
      stack: error.stack,
      ...properties,
    });
  }

  /**
   * Reset analytics (on logout)
   */
  reset(): void {
    if (!this.isEnabled) return;

    this.userId = undefined;
    this.userProperties = {};
    logger.debug('🔄 Analytics reset');
    // TODO: Call your analytics provider's reset method
  }
}

/**
 * Export singleton instance
 */
export const analytics = new AnalyticsService();

/**
 * Helper functions for common events
 */
export const trackUserSignup = (method: string) => {
  analytics.track(AnalyticsEvent.USER_SIGNUP, { method });
};

export const trackUserLogin = (method: string) => {
  analytics.track(AnalyticsEvent.USER_LOGIN, { method });
};

export const trackMomentView = (momentId: string, momentTitle: string) => {
  analytics.track(AnalyticsEvent.MOMENT_VIEWED, {
    momentId,
    momentTitle,
  });
};

export const trackSearch = (query: string, resultsCount: number) => {
  analytics.track(AnalyticsEvent.SEARCH_PERFORMED, {
    query,
    resultsCount,
  });
};

export const trackBooking = (momentId: string, amount: number) => {
  analytics.track(AnalyticsEvent.BOOKING_COMPLETED, {
    momentId,
    amount,
  });
};

export const trackPayment = (
  amount: number,
  currency: string,
  success: boolean,
) => {
  analytics.track(
    success ? AnalyticsEvent.PAYMENT_COMPLETED : AnalyticsEvent.PAYMENT_FAILED,
    {
      amount,
      currency,
    },
  );
};
