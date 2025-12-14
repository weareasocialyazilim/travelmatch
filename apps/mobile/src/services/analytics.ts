import { logger } from '../utils/logger';

/**
 * Analytics Service
 * Centralized analytics tracking
 */
class AnalyticsService {
  private static instance: AnalyticsService;
  private initialized = false;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public init() {
    if (this.initialized) return;
    this.initialized = true;
    logger.info('Analytics initialized');
  }

  /**
   * Track a custom event
   * @param eventName Name of the event
   * @param properties Additional properties
   */
  public trackEvent(eventName: string, properties?: Record<string, any>) {
    logger.info(`[Analytics] Track Event: ${eventName}`, properties);
    // Here you would integrate with your analytics provider (e.g. Firebase, Segment, Amplitude)
  }

  /**
   * Track a screen view
   * @param screenName Name of the screen
   * @param properties Additional properties
   */
  public trackScreen(screenName: string, properties?: Record<string, any>) {
    logger.info(`[Analytics] Screen View: ${screenName}`, properties);
  }

  /**
   * Alias for trackScreen
   */
  public screen(screenName: string, properties?: Record<string, any>) {
    this.trackScreen(screenName, properties);
  }

  /**
   * Identify a user
   * @param userId User ID
   * @param traits User traits
   */
  public identify(userId: string, traits?: Record<string, any>) {
    logger.info(`[Analytics] Identify User: ${userId}`, traits);
  }

  /**
   * Reset analytics session
   */
  public reset() {
    logger.info('[Analytics] Reset Session');
  }
}

export const analytics = AnalyticsService.getInstance();
