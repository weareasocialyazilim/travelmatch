/**
 * Analytics Service
 * Event tracking and analytics operations
 */

import { api } from '../utils/api';
import { logger } from '../utils/logger';

// Types
export type EventCategory =
  | 'navigation'
  | 'interaction'
  | 'transaction'
  | 'engagement'
  | 'error'
  | 'performance';

export interface AnalyticsEvent {
  name: string;
  category: EventCategory;
  properties?: Record<string, unknown>;
  timestamp?: string;
}

export interface UserProperties {
  userId?: string;
  email?: string;
  name?: string;
  accountType?: 'traveler' | 'host' | 'both';
  kycStatus?: string;
  country?: string;
  language?: string;
  appVersion?: string;
  platform?: 'ios' | 'android' | 'web';
}

export interface ScreenViewEvent {
  screenName: string;
  screenClass?: string;
  properties?: Record<string, unknown>;
}

// Pre-defined event names
export const EVENTS = {
  // Auth
  SIGN_UP: 'sign_up',
  LOGIN: 'login',
  LOGOUT: 'logout',
  PASSWORD_RESET: 'password_reset',

  // Moments
  MOMENT_VIEW: 'moment_view',
  MOMENT_CREATE: 'moment_create',
  MOMENT_EDIT: 'moment_edit',
  MOMENT_DELETE: 'moment_delete',
  MOMENT_SHARE: 'moment_share',
  MOMENT_LIKE: 'moment_like',
  MOMENT_SAVE: 'moment_save',

  // Requests
  REQUEST_SEND: 'request_send',
  REQUEST_ACCEPT: 'request_accept',
  REQUEST_DECLINE: 'request_decline',
  REQUEST_CANCEL: 'request_cancel',
  REQUEST_COMPLETE: 'request_complete',

  // Payments
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_COMPLETED: 'payment_completed',
  PAYMENT_FAILED: 'payment_failed',
  WITHDRAWAL_REQUESTED: 'withdrawal_requested',

  // Messaging
  CONVERSATION_STARTED: 'conversation_started',
  MESSAGE_SENT: 'message_sent',

  // Reviews
  REVIEW_SUBMITTED: 'review_submitted',

  // Profile
  PROFILE_UPDATED: 'profile_updated',
  AVATAR_CHANGED: 'avatar_changed',
  KYC_STARTED: 'kyc_started',
  KYC_COMPLETED: 'kyc_completed',

  // Social
  USER_FOLLOWED: 'user_followed',
  USER_UNFOLLOWED: 'user_unfollowed',
  USER_BLOCKED: 'user_blocked',
  USER_REPORTED: 'user_reported',

  // Search
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied',

  // Notifications
  NOTIFICATION_OPENED: 'notification_opened',
  PUSH_PERMISSION_GRANTED: 'push_permission_granted',
  PUSH_PERMISSION_DENIED: 'push_permission_denied',

  // Errors
  APP_ERROR: 'app_error',
  API_ERROR: 'api_error',

  // Performance
  APP_OPENED: 'app_opened',
  SCREEN_LOAD_TIME: 'screen_load_time',
  API_RESPONSE_TIME: 'api_response_time',
} as const;

// Analytics queue for batching
let eventQueue: AnalyticsEvent[] = [];
let flushTimeout: NodeJS.Timeout | null = null;
const BATCH_SIZE = 10;
const FLUSH_INTERVAL = 30000; // 30 seconds

// Analytics Service
export const analyticsService = {
  /**
   * Initialize analytics with user properties
   */
  identify: async (properties: UserProperties): Promise<void> => {
    try {
      await api.post('/analytics/identify', properties);
      logger.debug('[Analytics] User identified:', properties.userId);
    } catch (error) {
      logger.error('[Analytics] Failed to identify user:', error);
    }
  },

  /**
   * Reset analytics (on logout)
   */
  reset: async (): Promise<void> => {
    try {
      await api.post('/analytics/reset');
      logger.debug('[Analytics] Reset');
    } catch (error) {
      logger.error('[Analytics] Failed to reset:', error);
    }
  },

  /**
   * Track a custom event
   */
  track: (
    name: string,
    category: EventCategory = 'interaction',
    properties?: Record<string, unknown>,
  ): void => {
    const event: AnalyticsEvent = {
      name,
      category,
      properties,
      timestamp: new Date().toISOString(),
    };

    eventQueue.push(event);
    logger.debug('[Analytics] Event queued:', name, properties);

    // Flush if batch size reached
    if (eventQueue.length >= BATCH_SIZE) {
      analyticsService.flush();
    } else if (!flushTimeout) {
      // Schedule flush
      flushTimeout = setTimeout(() => {
        analyticsService.flush();
      }, FLUSH_INTERVAL);
    }
  },

  /**
   * Track screen view
   */
  trackScreen: (event: ScreenViewEvent): void => {
    analyticsService.track('screen_view', 'navigation', {
      screen_name: event.screenName,
      screen_class: event.screenClass,
      ...event.properties,
    });
  },

  /**
   * Track a timed event (for measuring durations)
   */
  trackTiming: (
    name: string,
    durationMs: number,
    properties?: Record<string, unknown>,
  ): void => {
    analyticsService.track(name, 'performance', {
      duration_ms: durationMs,
      ...properties,
    });
  },

  /**
   * Track an error
   */
  trackError: (error: Error, properties?: Record<string, unknown>): void => {
    analyticsService.track('error', 'error', {
      error_name: error.name,
      error_message: error.message,
      error_stack: error.stack,
      ...properties,
    });
  },

  /**
   * Flush queued events to server
   */
  flush: async (): Promise<void> => {
    if (eventQueue.length === 0) return;

    // Clear timeout
    if (flushTimeout) {
      clearTimeout(flushTimeout);
      flushTimeout = null;
    }

    const eventsToSend = [...eventQueue];
    eventQueue = [];

    try {
      await api.post('/analytics/events', { events: eventsToSend });
      logger.debug('[Analytics] Flushed', eventsToSend.length, 'events');
    } catch (error) {
      // Re-queue failed events
      eventQueue = [...eventsToSend, ...eventQueue];
      logger.error('[Analytics] Failed to flush events:', error);
    }
  },

  // --- Convenience methods for common events ---

  /**
   * Track moment view
   */
  trackMomentView: (
    momentId: string,
    momentTitle: string,
    hostId: string,
  ): void => {
    analyticsService.track(EVENTS.MOMENT_VIEW, 'engagement', {
      moment_id: momentId,
      moment_title: momentTitle,
      host_id: hostId,
    });
  },

  /**
   * Track search
   */
  trackSearch: (
    query: string,
    resultsCount: number,
    filters?: Record<string, unknown>,
  ): void => {
    analyticsService.track(EVENTS.SEARCH_PERFORMED, 'interaction', {
      search_query: query,
      results_count: resultsCount,
      filters,
    });
  },

  /**
   * Track payment
   */
  trackPayment: (
    eventName:
      | typeof EVENTS.PAYMENT_INITIATED
      | typeof EVENTS.PAYMENT_COMPLETED
      | typeof EVENTS.PAYMENT_FAILED,
    amount: number,
    currency: string,
    momentId: string,
  ): void => {
    analyticsService.track(eventName, 'transaction', {
      amount,
      currency,
      moment_id: momentId,
    });
  },

  /**
   * Track conversion
   */
  trackConversion: (
    conversionType: string,
    value: number,
    currency = 'USD',
  ): void => {
    analyticsService.track('conversion', 'transaction', {
      conversion_type: conversionType,
      value,
      currency,
    });
  },
};

export default analyticsService;
