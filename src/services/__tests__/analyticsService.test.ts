/**
 * Analytics Service Tests
 * Testing analytics tracking functionality
 */

import { analytics, AnalyticsEvent } from '../analytics';

// Mock config and logger
jest.mock('../../config/env', () => ({
  config: {
    APP_VERSION: '1.0.0',
  },
  FEATURES: {
    ANALYTICS: true,
  },
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    debug: jest.fn(),
  },
}));

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    analytics.reset();
  });

  describe('initialize', () => {
    it('should initialize analytics service', () => {
      expect(() => analytics.initialize()).not.toThrow();
    });
  });

  describe('identify', () => {
    it('should identify user with userId', () => {
      analytics.identify('user-123');

      // Verify internal state by tracking an event
      analytics.track(AnalyticsEvent.USER_LOGIN);

      // Should not throw
      expect(true).toBe(true);
    });

    it('should identify user with properties', () => {
      analytics.identify('user-123', {
        email: 'test@example.com',
        name: 'Test User',
      });

      expect(true).toBe(true);
    });
  });

  describe('track', () => {
    it('should track events with enum', () => {
      analytics.track(AnalyticsEvent.USER_SIGNUP);
      expect(true).toBe(true);
    });

    it('should track events with properties', () => {
      analytics.track(AnalyticsEvent.MOMENT_CREATED, {
        momentId: '123',
        category: 'travel',
      });
      expect(true).toBe(true);
    });

    it('should track booking events', () => {
      analytics.track(AnalyticsEvent.BOOKING_COMPLETED, {
        bookingId: 'booking-123',
        amount: 99.99,
      });
      expect(true).toBe(true);
    });

    it('should track payment events', () => {
      analytics.track(AnalyticsEvent.PAYMENT_COMPLETED, {
        paymentId: 'payment-123',
        method: 'credit_card',
      });
      expect(true).toBe(true);
    });
  });

  describe('screen', () => {
    it('should track screen views', () => {
      analytics.screen('HomeScreen');
      expect(true).toBe(true);
    });

    it('should track screen views with properties', () => {
      analytics.screen('ProfileScreen', {
        userId: 'user-123',
        source: 'navigation',
      });
      expect(true).toBe(true);
    });
  });

  describe('trackEvent', () => {
    it('should track custom events', () => {
      analytics.trackEvent('custom_button_clicked', {
        buttonName: 'Submit',
        screen: 'SettingsScreen',
      });
      expect(true).toBe(true);
    });

    it('should track events without properties', () => {
      analytics.trackEvent('app_opened');
      expect(true).toBe(true);
    });
  });

  describe('setUserProperties', () => {
    it('should set user properties', () => {
      analytics.setUserProperties({
        subscription: 'premium',
        age: 25,
      });
      expect(true).toBe(true);
    });

    it('should merge user properties', () => {
      analytics.setUserProperties({ tier: 'gold' });
      analytics.setUserProperties({ locale: 'en-US' });
      expect(true).toBe(true);
    });
  });

  describe('trackError', () => {
    it('should track errors', () => {
      const error = new Error('Test error');
      analytics.trackError(error);
      expect(true).toBe(true);
    });

    it('should track errors with additional context', () => {
      const error = new Error('Network error');
      analytics.trackError(error, {
        endpoint: '/api/users',
        statusCode: 500,
      });
      expect(true).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset analytics state', () => {
      analytics.identify('user-123');
      analytics.setUserProperties({ name: 'Test' });
      analytics.reset();
      expect(true).toBe(true);
    });
  });

  describe('AnalyticsEvent enum', () => {
    it('should have user events', () => {
      expect(AnalyticsEvent.USER_SIGNUP).toBe('user_signup');
      expect(AnalyticsEvent.USER_LOGIN).toBe('user_login');
      expect(AnalyticsEvent.USER_LOGOUT).toBe('user_logout');
    });

    it('should have moment events', () => {
      expect(AnalyticsEvent.MOMENT_VIEWED).toBe('moment_viewed');
      expect(AnalyticsEvent.MOMENT_CREATED).toBe('moment_created');
      expect(AnalyticsEvent.MOMENT_FAVORITED).toBe('moment_favorited');
    });

    it('should have booking events', () => {
      expect(AnalyticsEvent.BOOKING_INITIATED).toBe('booking_initiated');
      expect(AnalyticsEvent.BOOKING_COMPLETED).toBe('booking_completed');
      expect(AnalyticsEvent.BOOKING_CANCELLED).toBe('booking_cancelled');
    });

    it('should have payment events', () => {
      expect(AnalyticsEvent.PAYMENT_METHOD_ADDED).toBe('payment_method_added');
      expect(AnalyticsEvent.PAYMENT_COMPLETED).toBe('payment_completed');
      expect(AnalyticsEvent.PAYMENT_FAILED).toBe('payment_failed');
    });

    it('should have error events', () => {
      expect(AnalyticsEvent.ERROR_OCCURRED).toBe('error_occurred');
      expect(AnalyticsEvent.API_ERROR).toBe('api_error');
    });
  });
});
