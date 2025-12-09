/**
 * Production Monitoring Service
 * 
 * Integrates Datadog RUM for real-time user monitoring, performance tracking,
 * and error reporting in production.
 * 
 * @see https://docs.datadoghq.com/real_user_monitoring/reactnative/
 */

import { DdRum, DdRumErrorTracking, DdRumResourceTracking } from '@datadog/mobile-react-native';
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
      await DdRum.initialize({
        applicationId: config.applicationId,
        clientToken: config.clientToken,
        env: config.env,
        serviceName: config.serviceName || 'travelmatch-mobile',
        version: config.version || '1.0.0',
        
        // Track user interactions (button taps, scrolls, etc.)
        trackInteractions: true,
        
        // Track network requests
        trackResources: true,
        
        // Track errors and crashes
        trackErrors: true,
        
        // Track background events
        trackBackgroundEvents: true,
        
        // Sample rate (100% = track all sessions)
        sessionSampleRate: 100,
        
        // Resource tracking sample rate
        resourceTracingSamplingRate: 100,
        
        // Platform-specific settings
        ...(Platform.OS === 'ios' && {
          nativeCrashReportEnabled: true,
        }),
        ...(Platform.OS === 'android' && {
          nativeCrashReportEnabled: true,
        }),
      });

      this.initialized = true;
      console.log('[Monitoring] Datadog RUM initialized successfully');
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
  setUser(user: { id: string; email?: string; name?: string; [key: string]: any }): void {
    if (!this.enabled) return;

    DdRum.setUser({
      id: user.id,
      email: user.email,
      name: user.name,
      ...user,
    });
  }

  /**
   * Clear user information (on logout)
   */
  clearUser(): void {
    if (!this.enabled) return;
    DdRum.setUser({});
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

    DdRum.addAction(name, attributes || {});
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

    DdRum.addError(error, {
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
  addTiming(name: string, durationMs: number, attributes?: Record<string, any>): void {
    if (!this.enabled) return;

    DdRum.addTiming(name);
    DdRum.addAction(`timing_${name}`, {
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

    DdRum.startView(viewName, attributes || {});
  }

  /**
   * Stop the current view
   */
  stopView(attributes?: Record<string, any>): void {
    if (!this.enabled) return;

    DdRum.stopView(attributes || {});
  }

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
  startResource(method: string, url: string, attributes?: Record<string, any>): string {
    if (!this.enabled) return '';

    const resourceId = `${method}_${url}_${Date.now()}`;
    DdRum.startResource(resourceId, method, url, attributes || {});
    return resourceId;
  }

  stopResource(resourceId: string, attributes?: Record<string, any>): void {
    if (!this.enabled) return;

    DdRum.stopResource(resourceId, attributes || {});
  }

  stopResourceWithError(resourceId: string, error: Error): void {
    if (!this.enabled) return;

    DdRum.stopResourceWithError(resourceId, error.message, 'NetworkError');
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
      DdRum.addAttribute(key, value);
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
}

// Export singleton instance
export const monitoringService = new MonitoringService();

// Export types
export type { MonitoringConfig };
