/**
 * Production Monitoring Service
 *
 * Integrates Datadog RUM for real-time user monitoring, performance tracking,
 * and error reporting in production.
 *
 * @see https://docs.datadoghq.com/real_user_monitoring/reactnative/
 */

import {
  DdRum,
  RumActionType,
  ErrorSource,
} from '@datadog/mobile-react-native';
import { Platform } from 'react-native';

interface MonitoringConfig {
  applicationId: string;
  clientToken: string;
  env: 'development' | 'staging' | 'production';
  serviceName?: string;
  version?: string;
  enabled?: boolean;
}

class MonitoringService {
  private initialized = false;
  private enabled = false;

  /**
   * Initialize Datadog RUM
   *
   * @example
   * ```typescript
   * await monitoringService.initialize({
   *   applicationId: process.env.DD_APP_ID!,
   *   clientToken: process.env.DD_CLIENT_TOKEN!,
   *   env: 'production',
   *   serviceName: 'travelmatch-mobile',
   *   version: '1.0.0'
   * });
   * ```
   */
  async initialize(config: MonitoringConfig): Promise<void> {
    if (this.initialized) {
      console.warn('[Monitoring] Already initialized');
      return;
    }

    this.enabled = config.enabled ?? config.env === 'production';

    if (!this.enabled) {
      console.log('[Monitoring] Disabled for non-production environment');
      return;
    }

    try {
      // Note: DdRum in v2 requires separate SDK initialization
      // The configuration is passed during DdSdkReactNative.initialize()
      // This service wraps the RUM API calls
      this.initialized = true;
      this.enabled = true;
      console.log('[Monitoring] Datadog RUM service ready');
    } catch (error) {
      console.error('[Monitoring] Failed to initialize:', error);
    }
  }

  /**
   * Set user information for tracking
   *
   * @example
   * ```typescript
   * monitoringService.setUser({
   *   id: user.id,
   *   email: user.email,
   *   name: user.name
   * });
   * ```
   */
  setUser(user: {
    id: string;
    email?: string;
    name?: string;
    [key: string]: any;
  }): void {
    if (!this.enabled) return;

    const { id, email, name, ...extraInfo } = user;
    DdRum.setUser(id, name, email, extraInfo);
  }

  /**
   * Clear user information (on logout)
   */
  clearUser(): void {
    if (!this.enabled) return;
    DdRum.setUser('', '', '', {});
  }

  /**
   * Track a custom action
   *
   * @example
   * ```typescript
   * monitoringService.trackAction('moment_created', {
   *   category: 'beach',
   *   location: 'Antalya',
   *   price: 100
   * });
   * ```
   */
  trackAction(name: string, attributes?: Record<string, any>): void {
    if (!this.enabled) return;

    DdRum.addAction(RumActionType.CUSTOM, name, attributes || {});
  }

  /**
   * Track an error
   *
   * @example
   * ```typescript
   * try {
   *   await createMoment(data);
   * } catch (error) {
   *   monitoringService.trackError(error, {
   *     context: 'moment_creation',
   *     data
   *   });
   * }
   * ```
   */
  trackError(error: Error, context?: Record<string, any>): void {
    if (!this.enabled) return;

    DdRum.addError(error.message, ErrorSource.SOURCE, error.stack || '', {
      ...context,
      timestamp: Date.now(),
    });
  }

  /**
   * Add custom timing
   *
   * @example
   * ```typescript
   * const start = Date.now();
   * await loadMoments();
   * monitoringService.addTiming('moments_load_time', Date.now() - start);
   * ```
   */
  addTiming(
    name: string,
    durationMs: number,
    attributes?: Record<string, any>,
  ): void {
    if (!this.enabled) return;

    DdRum.addTiming(name);
    DdRum.addAction(RumActionType.CUSTOM, `timing_${name}`, {
      duration_ms: durationMs,
      ...attributes,
    });
  }

  /**
   * Start a custom view
   *
   * @example
   * ```typescript
   * monitoringService.startView('MomentDetail', { momentId: '123' });
   * ```
   */
  startView(viewName: string, attributes?: Record<string, any>): void {
    if (!this.enabled) return;

    DdRum.startView(viewName, viewName, attributes || {});
  }

  /**
   * Stop the current view
   */
  stopView(attributes?: Record<string, any>): void {
    if (!this.enabled) return;

    DdRum.stopView(this.currentViewKey || 'unknown', attributes || {});
  }

  private currentViewKey?: string;

  /**
   * Track a resource (API call, image load, etc.)
   *
   * @example
   * ```typescript
   * const resourceId = monitoringService.startResource('GET', '/api/moments');
   * try {
   *   const response = await fetch('/api/moments');
   *   monitoringService.stopResource(resourceId, { statusCode: 200 });
   * } catch (error) {
   *   monitoringService.stopResourceWithError(resourceId, error);
   * }
   * ```
   */
  startResource(
    method: string,
    url: string,
    attributes?: Record<string, any>,
  ): string {
    if (!this.enabled) return '';

    const resourceId = `${method}_${url}_${Date.now()}`;
    DdRum.startResource(resourceId, method, url, attributes || {});
    return resourceId;
  }

  stopResource(resourceId: string, attributes?: Record<string, any>): void {
    if (!this.enabled) return;

    // DdRum.stopResource requires statusCode, kind, size, etc.
    DdRum.stopResource(resourceId, 200, 'xhr', -1, attributes || {});
  }

  stopResourceWithError(resourceId: string, error: Error): void {
    if (!this.enabled) return;

    // Track as error via addError instead - stopResourceWithError doesn't exist in v2
    DdRum.addError(
      `Resource error: ${error.message}`,
      ErrorSource.NETWORK,
      error.stack || '',
      { resourceId },
    );
  }

  /**
   * Add custom attributes to all events
   *
   * @example
   * ```typescript
   * monitoringService.addGlobalContext({
   *   app_version: '1.0.0',
   *   build_number: 42,
   *   feature_flags: { newUI: true }
   * });
   * ```
   */
  addGlobalContext(attributes: Record<string, any>): void {
    if (!this.enabled) return;

    Object.entries(attributes).forEach(([key, value]) => {
      DdRum.addAttribute(key, JSON.stringify(value));
    });
  }

  /**
   * Remove a global attribute
   */
  removeGlobalContext(key: string): void {
    if (!this.enabled) return;

    DdRum.removeAttribute(key);
  }

  /**
   * Check if monitoring is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Check if monitoring is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  // ============================================
  // Moment Detail TTR Tracking (Time To Render)
  // ============================================

  private ttrThresholds = {
    momentDetail: 300, // 300ms threshold for Moment Detail screen
    discoverScreen: 500,
    profileScreen: 400,
  };

  private ttrAlertCallbacks: Map<
    string,
    (screenName: string, ttr: number) => void
  > = new Map();

  /**
   * Register TTR alert callback
   * Called when screen render time exceeds threshold
   */
  onTTRAlert(callback: (screenName: string, ttr: number) => void): () => void {
    const id = Date.now().toString();
    this.ttrAlertCallbacks.set(id, callback);
    return () => this.ttrAlertCallbacks.delete(id);
  }

  /**
   * Track Time To Render for a screen
   * Master tracking: Alerts if TTR exceeds threshold
   *
   * @example
   * ```typescript
   * // In MomentDetailScreen
   * const ttrStart = Date.now();
   * useEffect(() => {
   *   monitoringService.trackScreenTTR('momentDetail', Date.now() - ttrStart, {
   *     momentId: moment.id,
   *     hasImages: moment.images?.length > 0,
   *   });
   * }, []);
   * ```
   */
  trackScreenTTR(
    screenName: 'momentDetail' | 'discoverScreen' | 'profileScreen',
    ttrMs: number,
    attributes?: Record<string, any>,
  ): void {
    if (!this.enabled) return;

    // Track timing
    this.addTiming(`${screenName}_ttr`, ttrMs, {
      screen: screenName,
      ...attributes,
    });

    // Check threshold and alert if exceeded
    const threshold = this.ttrThresholds[screenName];
    if (ttrMs > threshold) {
      console.warn(
        `[Monitoring] ${screenName} TTR (${ttrMs}ms) exceeded threshold (${threshold}ms)`,
      );

      // Track as performance issue
      DdRum.addAction(RumActionType.CUSTOM, 'ttr_threshold_exceeded', {
        screen: screenName,
        ttr_ms: ttrMs,
        threshold_ms: threshold,
        exceeded_by_ms: ttrMs - threshold,
        ...attributes,
      });

      // Notify callbacks (for admin alerts)
      this.ttrAlertCallbacks.forEach((callback) => {
        try {
          callback(screenName, ttrMs);
        } catch (e) {
          console.error('[Monitoring] TTR alert callback error:', e);
        }
      });
    }
  }

  /**
   * Start TTR measurement for a screen
   * Returns a function to call when render is complete
   */
  startTTRMeasurement(
    screenName: 'momentDetail' | 'discoverScreen' | 'profileScreen',
  ): (attributes?: Record<string, any>) => void {
    const startTime = Date.now();

    return (attributes?: Record<string, any>) => {
      const ttr = Date.now() - startTime;
      this.trackScreenTTR(screenName, ttr, attributes);
    };
  }
}

// Export singleton instance
export const monitoringService = new MonitoringService();

// Export types
export type { MonitoringConfig };
