/**
 * App Startup Tracker
 * Tracks application startup milestones and performance
 * @module utils/appStartup
 *
 * @description
 * Provides startup performance tracking with:
 * - Milestone tracking (JS load, bundle, render, interactive)
 * - Cold vs warm start detection
 * - Startup time reporting to analytics
 * - Slow startup warnings
 *
 * @example
 * ```typescript
 * import { appStartupTracker } from '@/utils/appStartup';
 *
 * // In App.tsx or entry point
 * appStartupTracker.markMilestone('js_loaded');
 *
 * // After initial render
 * appStartupTracker.markMilestone('first_render');
 *
 * // When app is interactive
 * appStartupTracker.markMilestone('interactive');
 * appStartupTracker.reportStartup();
 * ```
 */

import type { AppStateStatus } from 'react-native';
import { AppState } from 'react-native';
import { logger } from './logger';

/** Startup milestone types */
type StartupMilestone =
  | 'app_init'
  | 'js_loaded'
  | 'bundle_loaded'
  | 'navigation_ready'
  | 'first_render'
  | 'data_loaded'
  | 'interactive';

/** Startup type */
type StartupType = 'cold' | 'warm' | 'hot';

/** Startup report */
interface StartupReport {
  type: StartupType;
  totalTime: number;
  milestones: Record<string, number>;
  isSlow: boolean;
  timestamp: string;
}

/** Slow startup thresholds (ms) */
const SLOW_THRESHOLDS = {
  cold: 5000, // 5 seconds for cold start
  warm: 2000, // 2 seconds for warm start
  hot: 1000, // 1 second for hot start
};

/**
 * App Startup Tracker
 */
class AppStartupTracker {
  private startTime: number;
  private milestones: Map<string, number> = new Map();
  private startupType: StartupType = 'cold';
  private isFirstLaunch = true;
  private hasReported = false;
  private appStateSubscription: ReturnType<
    typeof AppState.addEventListener
  > | null = null;

  constructor() {
    this.startTime = Date.now();
    this.markMilestone('app_init');
    this.setupAppStateListener();
  }

  private setupAppStateListener(): void {
    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange.bind(this),
    );
  }

  private handleAppStateChange(nextAppState: AppStateStatus): void {
    if (nextAppState === 'active' && !this.isFirstLaunch) {
      // App coming to foreground - warm or hot start
      this.reset('warm');
    }
  }

  /**
   * Reset tracker for new startup
   */
  reset(type: StartupType = 'cold'): void {
    this.startTime = Date.now();
    this.milestones.clear();
    this.startupType = type;
    this.hasReported = false;
    this.markMilestone('app_init');
    logger.debug(`[Startup] Reset for ${type} start`);
  }

  /**
   * Mark a startup milestone
   */
  markMilestone(name: StartupMilestone | string): void {
    const elapsed = Date.now() - this.startTime;
    this.milestones.set(name, elapsed);
    logger.debug(`[Startup] ${name}: ${elapsed}ms`);
  }

  /**
   * Get time for a specific milestone
   */
  getMilestoneTime(name: string): number | undefined {
    return this.milestones.get(name);
  }

  /**
   * Get elapsed time since startup
   */
  getElapsedTime(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Check if startup is slow
   */
  isSlow(): boolean {
    const elapsed = this.getElapsedTime();
    return elapsed > SLOW_THRESHOLDS[this.startupType];
  }

  /**
   * Report startup metrics
   */
  reportStartup(): StartupReport {
    if (this.hasReported) {
      logger.debug('[Startup] Already reported');
      return this.getReport();
    }

    this.hasReported = true;
    this.isFirstLaunch = false;

    const report = this.getReport();

    // Log report
    if (report.isSlow) {
      logger.warn(
        `[Startup] Slow ${report.type} start: ${report.totalTime}ms`,
        {
          milestones: report.milestones,
        },
      );
    } else {
      logger.info(
        `[Startup] ${report.type} start completed: ${report.totalTime}ms`,
        {
          milestones: report.milestones,
        },
      );
    }

    // Report to analytics (lazy load to avoid circular deps)
    this.reportToAnalytics(report);

    return report;
  }

  private getReport(): StartupReport {
    const totalTime = this.getElapsedTime();
    const milestones: Record<string, number> = {};
    this.milestones.forEach((value, key) => {
      milestones[key] = value;
    });

    return {
      type: this.startupType,
      totalTime,
      milestones,
      isSlow: totalTime > SLOW_THRESHOLDS[this.startupType],
      timestamp: new Date().toISOString(),
    };
  }

  private async reportToAnalytics(report: StartupReport): Promise<void> {
    try {
      const { loggingService } = await import('../services/loggingService');
      loggingService.trackPerformance(
        `app_startup_${report.type}`,
        report.totalTime,
        {
          operation: 'render',
          metadata: {
            type: report.type,
            milestones: report.milestones,
          },
          isSlow: report.isSlow,
          slowThreshold: SLOW_THRESHOLDS[report.type],
        },
      );
    } catch {
      // Logging service not available yet
    }

    // Report critical slow startups to Sentry
    if (report.isSlow && report.totalTime > 8000) {
      try {
        const { captureMessage } = await import('../config/sentry');
        captureMessage(
          `Very slow app startup: ${report.totalTime}ms (${report.type})`,
          'warning',
          { ...report.milestones },
        );
      } catch {
        // Sentry not available
      }
    }
  }

  /**
   * Get startup type
   */
  getStartupType(): StartupType {
    return this.startupType;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }
}

// Export singleton
export const appStartupTracker = new AppStartupTracker();

// Export types
export type { StartupMilestone, StartupType, StartupReport };
