/**
 * usePerformanceMonitor Hook
 * Monitors component render performance and reports issues
 * @module hooks/usePerformanceMonitor
 */

import { useRef, useEffect, useCallback } from 'react';
import { InteractionManager } from 'react-native';
import { logger } from '../utils/logger';

/**
 * Performance metrics for a component
 */
interface PerformanceMetrics {
  /** Component name */
  componentName: string;
  /** Number of renders */
  renderCount: number;
  /** Last render duration in ms */
  lastRenderDuration: number;
  /** Average render duration in ms */
  averageRenderDuration: number;
  /** Total time spent rendering in ms */
  totalRenderTime: number;
  /** Number of slow renders (> threshold) */
  slowRenders: number;
  /** Mount timestamp */
  mountTime: number;
  /** Time since mount in ms */
  lifetimeMs: number;
}

/**
 * Performance monitor options
 */
interface PerformanceMonitorOptions {
  /** Threshold for slow render warning in ms (default: 16) */
  slowRenderThreshold?: number;
  /** Enable logging (default: __DEV__) */
  enableLogging?: boolean;
  /** Log every N renders (default: 0 = disabled) */
  logEveryNRenders?: number;
  /** Callback when slow render detected */
  onSlowRender?: (metrics: PerformanceMetrics) => void;
  /** Callback on unmount with final metrics */
  onUnmount?: (metrics: PerformanceMetrics) => void;
}

/**
 * Hook return type
 */
interface UsePerformanceMonitorReturn {
  /** Current performance metrics */
  metrics: PerformanceMetrics;
  /** Mark the start of a custom performance measurement */
  startMeasure: (name: string) => void;
  /** Mark the end of a custom performance measurement */
  endMeasure: (name: string) => number;
  /** Reset metrics */
  resetMetrics: () => void;
  /** Get formatted metrics string */
  getMetricsReport: () => string;
}

/**
 * Monitor component performance
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { metrics, startMeasure, endMeasure } = usePerformanceMonitor('MyComponent', {
 *     slowRenderThreshold: 16,
 *     onSlowRender: (m) => logger.warn('Slow render:', m.lastRenderDuration),
 *   });
 *
 *   // For custom measurements
 *   const handlePress = async () => {
 *     startMeasure('dataFetch');
 *     const data = await fetchData();
 *     const duration = endMeasure('dataFetch');
 *     logger.debug(`Fetch took ${duration}ms`);
 *   };
 *
 *   return <View>...</View>;
 * };
 * ```
 */
export function usePerformanceMonitor(
  componentName: string,
  options: PerformanceMonitorOptions = {},
): UsePerformanceMonitorReturn {
  const {
    slowRenderThreshold = 16, // 60fps = 16.67ms per frame
    enableLogging = __DEV__,
    logEveryNRenders = 0,
    onSlowRender,
    onUnmount,
  } = options;

  // Metrics state stored in ref to avoid causing re-renders
  const metricsRef = useRef<PerformanceMetrics>({
    componentName,
    renderCount: 0,
    lastRenderDuration: 0,
    averageRenderDuration: 0,
    totalRenderTime: 0,
    slowRenders: 0,
    mountTime: Date.now(),
    lifetimeMs: 0,
  });

  // Custom measurements storage
  const measurementsRef = useRef<Map<string, number>>(new Map());

  // Render start time
  const renderStartRef = useRef<number>(Date.now());

  // Track render start
  renderStartRef.current = Date.now();

  // Update metrics after render
  useEffect(() => {
    const renderDuration = Date.now() - renderStartRef.current;
    const metrics = metricsRef.current;

    metrics.renderCount++;
    metrics.lastRenderDuration = renderDuration;
    metrics.totalRenderTime += renderDuration;
    metrics.averageRenderDuration =
      metrics.totalRenderTime / metrics.renderCount;
    metrics.lifetimeMs = Date.now() - metrics.mountTime;

    // Check for slow render
    if (renderDuration > slowRenderThreshold) {
      metrics.slowRenders++;

      if (enableLogging) {
        logger.warn(
          `⚠️ [Performance] Slow render in ${componentName}: ${renderDuration.toFixed(
            2,
          )}ms`,
        );
      }

      onSlowRender?.(metrics);
    }

    // Periodic logging
    if (logEveryNRenders > 0 && metrics.renderCount % logEveryNRenders === 0) {
      if (enableLogging) {
        logger.debug(
          `📊 [Performance] ${componentName} - ${
            metrics.renderCount
          } renders, avg: ${metrics.averageRenderDuration.toFixed(2)}ms`,
        );
      }
    }
  });

  // Report on unmount
  useEffect(() => {
    return () => {
      const finalMetrics = {
        ...metricsRef.current,
        lifetimeMs: Date.now() - metricsRef.current.mountTime,
      };

      if (enableLogging && finalMetrics.renderCount > 1) {
        logger.debug(
          `📊 [Performance] ${componentName} unmounted - ` +
            `${finalMetrics.renderCount} renders, ` +
            `avg: ${finalMetrics.averageRenderDuration.toFixed(2)}ms, ` +
            `slow: ${finalMetrics.slowRenders}`,
        );
      }

      onUnmount?.(finalMetrics);
    };
  }, []);

  const startMeasure = useCallback((name: string) => {
    measurementsRef.current.set(name, Date.now());
  }, []);

  const endMeasure = useCallback(
    (name: string): number => {
      const startTime = measurementsRef.current.get(name);
      if (!startTime) {
        logger.warn(`[Performance] No start time for measurement: ${name}`);
        return 0;
      }

      const duration = Date.now() - startTime;
      measurementsRef.current.delete(name);

      if (enableLogging) {
        logger.debug(
          `⏱️ [Performance] ${componentName}.${name}: ${duration}ms`,
        );
      }

      return duration;
    },
    [componentName, enableLogging],
  );

  const resetMetrics = useCallback(() => {
    metricsRef.current = {
      componentName,
      renderCount: 0,
      lastRenderDuration: 0,
      averageRenderDuration: 0,
      totalRenderTime: 0,
      slowRenders: 0,
      mountTime: Date.now(),
      lifetimeMs: 0,
    };
  }, [componentName]);

  const getMetricsReport = useCallback((): string => {
    const m = metricsRef.current;
    return [
      `Performance Report: ${m.componentName}`,
      `------------------------`,
      `Renders: ${m.renderCount}`,
      `Last render: ${m.lastRenderDuration.toFixed(2)}ms`,
      `Average render: ${m.averageRenderDuration.toFixed(2)}ms`,
      `Total render time: ${m.totalRenderTime.toFixed(2)}ms`,
      `Slow renders: ${m.slowRenders}`,
      `Lifetime: ${(m.lifetimeMs / 1000).toFixed(2)}s`,
    ].join('\n');
  }, []);

  return {
    metrics: metricsRef.current,
    startMeasure,
    endMeasure,
    resetMetrics,
    getMetricsReport,
  };
}

/**
 * Wait for interactions to complete before running heavy operations
 *
 * @example
 * ```tsx
 * const { runAfterInteractions } = useInteractionManager();
 *
 * useEffect(() => {
 *   runAfterInteractions(() => {
 *     // Heavy computation or data loading
 *     loadLargeDataset();
 *   });
 * }, []);
 * ```
 */
export function useInteractionManager() {
  const tasksRef = useRef<Set<{ cancel: () => void }>>(new Set());

  useEffect(() => {
    const currentTasks = tasksRef.current;
    return () => {
      // Cancel all pending tasks on unmount
      currentTasks.forEach((task) => task.cancel());
      currentTasks.clear();
    };
  }, []);

  const runAfterInteractions = useCallback(
    (callback: () => void): (() => void) => {
      const task = InteractionManager.runAfterInteractions(() => {
        callback();
        tasksRef.current.delete(task);
      });

      tasksRef.current.add(task);

      return () => {
        task.cancel();
        tasksRef.current.delete(task);
      };
    },
    [],
  );

  return { runAfterInteractions };
}

/**
 * Track renders caused by specific props
 *
 * @example
 * ```tsx
 * useWhyDidYouUpdate('MyComponent', { user, theme, onPress });
 * // Logs: [MyComponent] Props changed: user (object), theme (string)
 * ```
 */
export function useWhyDidYouUpdate(
  componentName: string,
  props: Record<string, unknown>,
): void {
  const previousProps = useRef<Record<string, unknown>>({});

  useEffect(() => {
    if (previousProps.current && __DEV__) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changesObj: Record<string, { from: unknown; to: unknown }> = {};

      allKeys.forEach((key) => {
        if (previousProps.current[key] !== props[key]) {
          changesObj[key] = {
            from: previousProps.current[key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changesObj).length > 0) {
        const changesList = Object.keys(changesObj)
          .map((key) => `${key} (${typeof changesObj[key].to})`)
          .join(', ');

        logger.debug(
          `[WhyDidYouUpdate] ${componentName} Props changed: ${changesList}`,
        );
      }
    }

    previousProps.current = props;
  });
}

export default usePerformanceMonitor;
