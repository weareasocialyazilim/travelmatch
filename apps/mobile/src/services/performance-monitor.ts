/**
 * Performance Monitoring Service
 * Real-time performance tracking and alerting
 * Integrates with Sentry Performance Monitoring
 */

import React from 'react';
import * as Sentry from '@sentry/react-native';
import { BrowserTracing } from '@sentry/tracing';
import { logger } from '../utils/logger';

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  tti?: number; // Time to Interactive
  tbt?: number; // Total Blocking Time
}

interface CustomMetrics {
  bundleSize?: number;
  apiLatency?: number;
  renderTime?: number;
  navigationTime?: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  private thresholds = {
    fcp: 1500,
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    ttfb: 600,
    tti: 3000,
    tbt: 300,
    apiLatency: 1000,
    renderTime: 16,
  };

  private constructor() {
    this.initSentry();
    this.observeWebVitals();
    this.trackBundleSize();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initSentry() {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      integrations: [
        new BrowserTracing({
          tracingOrigins: ['localhost', /^\//],
          routingInstrumentation: Sentry.reactRouterV6Instrumentation,
        }),
      ],
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      beforeSend(event) {
        // Filter out non-critical events in production
        if (process.env.NODE_ENV === 'production' && event.level === 'warning') {
          return null;
        }
        return event;
      },
    });
  }

  private observeWebVitals() {
    // Observe Core Web Vitals
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        const lcp = lastEntry.renderTime || lastEntry.loadTime;
        this.recordMetric('lcp', lcp);
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      // First Input Delay (FID)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          // PerformanceEventTiming has processingStart
          if ('processingStart' in entry && 'startTime' in entry) {
            const fid = (entry as PerformanceEventTiming).processingStart - entry.startTime;
            this.recordMetric('fid', fid);
          }
        });
      }).observe({ type: 'first-input', buffered: true });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsEntries: PerformanceEntry[] = [];
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // LayoutShift has hadRecentInput and value properties
          if ('hadRecentInput' in entry && !entry.hadRecentInput && 'value' in entry) {
            clsValue += (entry as LayoutShift).value;
            clsEntries.push(entry);
          }
        }
        this.recordMetric('cls', clsValue);
      }).observe({ type: 'layout-shift', buffered: true });

      // Navigation Timing
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          // PerformanceNavigationTiming has responseStart and requestStart
          if ('responseStart' in entry && 'requestStart' in entry) {
            const navEntry = entry as PerformanceNavigationTiming;
            const ttfb = navEntry.responseStart - navEntry.requestStart;
            this.recordMetric('ttfb', ttfb);
          }

          // First Contentful Paint
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric('fcp', entry.startTime);
          }
        });
      }).observe({ type: 'navigation', buffered: true });

      // Paint timing
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric('fcp', entry.startTime);
          }
        });
      }).observe({ type: 'paint', buffered: true });
    }
  }

  private trackBundleSize() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      let totalSize = 0;

      resources.forEach((resource) => {
        if (resource.initiatorType === 'script' || resource.initiatorType === 'link') {
          totalSize += resource.transferSize || 0;
        }
      });

      this.recordMetric('bundleSize', totalSize);
    }
  }

  recordMetric(name: string, value: number) {
    this.metrics.set(name, value);

    // Check threshold violations
    const threshold = this.thresholds[name as keyof typeof this.thresholds];
    if (threshold && value > threshold) {
      this.reportViolation(name, value, threshold);
    }

    // Send to Sentry
    Sentry.setMeasurement(name, value, 'millisecond');

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      const status = threshold && value <= threshold ? '✅' : '❌';
      // eslint-disable-next-line no-console
      console.log(`${status} ${name}: ${Math.round(value)}ms (threshold: ${threshold}ms)`);
    }
  }

  private reportViolation(metric: string, value: number, threshold: number) {
    const violation = {
      metric,
      value: Math.round(value),
      threshold,
      exceeded: Math.round(value - threshold),
      timestamp: Date.now(),
    };

    // Send to Sentry
    Sentry.captureMessage(`Performance budget exceeded: ${metric}`, {
      level: 'warning',
      extra: violation,
    });

    // Log warning
    logger.warn('⚠️ Performance budget exceeded:', violation);
  }

  // Track custom metrics
  trackAPILatency(endpoint: string, duration: number) {
    const key = `api_${endpoint}`;
    this.recordMetric(key, duration);

    if (duration > this.thresholds.apiLatency) {
      Sentry.captureMessage(`Slow API response: ${endpoint}`, {
        level: 'warning',
        extra: { endpoint, duration, threshold: this.thresholds.apiLatency },
      });
    }
  }

  trackRenderTime(componentName: string, duration: number) {
    const key = `render_${componentName}`;
    this.recordMetric(key, duration);

    if (duration > this.thresholds.renderTime) {
      Sentry.captureMessage(`Slow component render: ${componentName}`, {
        level: 'warning',
        extra: { componentName, duration, threshold: this.thresholds.renderTime },
      });
    }
  }

  trackNavigationTime(route: string, duration: number) {
    const key = `navigation_${route}`;
    this.recordMetric(key, duration);

    Sentry.addBreadcrumb({
      category: 'navigation',
      message: `Navigated to ${route}`,
      level: 'info',
      data: { duration },
    });
  }

  // Get current metrics
  getMetrics(): Map<string, number> {
    return new Map(this.metrics);
  }

  // Get metrics summary
  getSummary(): PerformanceMetrics & CustomMetrics {
    return {
      fcp: this.metrics.get('fcp'),
      lcp: this.metrics.get('lcp'),
      fid: this.metrics.get('fid'),
      cls: this.metrics.get('cls'),
      ttfb: this.metrics.get('ttfb'),
      tti: this.metrics.get('tti'),
      tbt: this.metrics.get('tbt'),
      bundleSize: this.metrics.get('bundleSize'),
    };
  }

  // Check if all budgets are met
  checkBudgets(): { passed: boolean; violations: string[] } {
    const violations: string[] = [];

    Object.entries(this.thresholds).forEach(([metric, threshold]) => {
      const value = this.metrics.get(metric);
      if (value && value > threshold) {
        violations.push(`${metric}: ${Math.round(value)}ms > ${threshold}ms`);
      }
    });

    return {
      passed: violations.length === 0,
      violations,
    };
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// React hook for performance tracking
export function usePerformanceTracking(componentName: string) {
  React.useEffect(() => {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      performanceMonitor.trackRenderTime(componentName, duration);
    };
  }, [componentName]);
}

// Higher-order component for automatic tracking
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent: React.FC<P> = (props) => {
    const name = componentName || Component.displayName || Component.name;
    usePerformanceTracking(name);
    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withPerformanceTracking(${componentName || Component.displayName || Component.name})`;
  return WrappedComponent;
}

export default performanceMonitor;
