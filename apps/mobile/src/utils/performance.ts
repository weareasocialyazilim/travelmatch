/**
 * Performance Utilities
 * Memoization ve optimization helpers
 */
import { useCallback, useRef, useEffect, useState } from 'react';
import { logger } from './logger';

/**
 * Debounce Hook
 * Delays function execution until after wait time
 */
export const useDebounce = <T>(value: T, delay = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Throttle Hook
 * Limits function execution to once per specified interval
 */
export const useThrottle = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay = 500,
): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      }
    },
    [callback, delay],
  ) as T;
};

/**
 * Previous Value Hook
 * Returns the previous value of a state
 */
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

/**
 * Mounted Hook
 * Checks if component is mounted
 */
export const useIsMounted = () => {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(() => isMounted.current, []);
};

/**
 * Stable Callback
 * Always returns same reference for callbacks
 */
export const useStableCallback = <T extends (...args: unknown[]) => unknown>(
  callback: T,
): T => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => callbackRef.current(...args),
    [],
  ) as T;
};

/**
 * FlatList Optimization Helpers
 */
export const flatListOptimizations = {
  /**
   * Get item layout for fixed height items
   */
  getItemLayout: (itemHeight: number) => (_data: unknown, index: number) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  }),

  /**
   * Key extractor
   */
  keyExtractor: <T extends { id?: string | number }>(
    item: T,
    index: number,
  ) => {
    return item.id?.toString() ?? index.toString();
  },

  /**
   * Default optimization props
   */
  defaultProps: {
    removeClippedSubviews: true,
    maxToRenderPerBatch: 10,
    updateCellsBatchingPeriod: 50,
    initialNumToRender: 10,
    windowSize: 10,
  },
};

/**
 * Memoize by key
 */
const memoCache = new Map<string, unknown>();

export const memoize = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  getKey: (...args: Parameters<T>) => string,
): T => {
  return ((...args: Parameters<T>) => {
    const key = getKey(...args);

    if (memoCache.has(key)) {
      return memoCache.get(key);
    }

    const result = fn(...args);
    memoCache.set(key, result);
    return result;
  }) as T;
};

/**
 * Clear memoization cache
 */
export const clearMemoCache = () => {
  memoCache.clear();
};

/**
 * Image optimization helpers
 */
export const imageOptimizations = {
  /**
   * Get optimized image dimensions
   */
  getOptimizedDimensions: (
    originalWidth: number,
    originalHeight: number,
    maxWidth = 1024,
    maxHeight = 1024,
  ) => {
    const ratio = Math.min(
      maxWidth / originalWidth,
      maxHeight / originalHeight,
    );

    return {
      width: Math.floor(originalWidth * ratio),
      height: Math.floor(originalHeight * ratio),
    };
  },

  /**
   * Default props for fast image rendering
   */
  fastImageProps: {
    resizeMode: 'cover' as const,
    priority: 'normal' as const,
  },
};

/**
 * Performance Monitoring
 * Production-grade performance tracking and alerting
 */

type PerformanceMetric = {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
};

class PerformanceMonitorClass {
  private metrics: PerformanceMetric[] = [];
  private fpsFrames = 0;
  private fpsLastTime = 0;
  private fpsAnimationFrame: number | null = null;

  /**
   * Track FPS (Frames Per Second)
   * Monitors app smoothness - alerts if < 30 FPS
   */
  trackFPS = (): (() => void) => {
    this.fpsLastTime = performance.now();
    this.fpsFrames = 0;

    const measure = () => {
      this.fpsFrames++;
      const now = performance.now();

      if (now - this.fpsLastTime >= 1000) {
        const fps = this.fpsFrames;

        this.recordMetric('fps', fps);

        // Alert on low FPS
        if (fps < 30) {
          logger.warn('⚠️ Low FPS detected:', fps);

          // Send to analytics/Sentry
          if (
            typeof (global as Record<string, unknown>).Sentry !== 'undefined'
          ) {
            (
              (global as Record<string, unknown>).Sentry as {
                captureMessage: (msg: string, opts: unknown) => void;
              }
            ).captureMessage('Performance degradation', {
              level: 'warning',
              extra: { fps },
            });
          }
        }

        this.fpsFrames = 0;
        this.fpsLastTime = now;
      }

      this.fpsAnimationFrame = requestAnimationFrame(measure);
    };

    this.fpsAnimationFrame = requestAnimationFrame(measure);

    // Return cleanup function
    return () => {
      if (this.fpsAnimationFrame !== null) {
        cancelAnimationFrame(this.fpsAnimationFrame);
      }
    };
  };

  /**
   * Track Memory Usage
   * Monitors heap size - alerts if > 80%
   */
  trackMemory = (): void => {
    // @ts-expect-error - performance.memory is non-standard but available in React Native
    if (performance.memory) {
      // @ts-expect-error - performance.memory types
       
      const { usedJSHeapSize, totalJSHeapSize } = performance.memory;
      const usage =
        ((usedJSHeapSize as number) / (totalJSHeapSize as number)) * 100;

      this.recordMetric('memory_usage_percent', usage, {
        usedMB: Math.round((usedJSHeapSize as number) / 1024 / 1024),
        totalMB: Math.round((totalJSHeapSize as number) / 1024 / 1024),
      });

      // Alert on high memory
      if (usage > 80) {
        logger.warn('⚠️ High memory usage:', `${usage.toFixed(1)}%`);

        if (typeof (global as Record<string, unknown>).Sentry !== 'undefined') {
          (
            (global as Record<string, unknown>).Sentry as {
              captureMessage: (msg: string, opts: unknown) => void;
            }
          ).captureMessage('High memory usage', {
            level: 'warning',
            extra: {
              usage,
              usedMB: Math.round(usedJSHeapSize / 1024 / 1024),
            },
          });
        }
      }
    }
  };

  /**
   * Track API Latency
   * Monitors API response times - alerts if > 3s
   */
  trackAPILatency = (
    endpoint: string,
    startTime: number,
    metadata?: Record<string, unknown>,
  ): void => {
    const latency = Date.now() - startTime;

    this.recordMetric(`api_latency_${endpoint}`, latency, metadata);

    // Alert on slow API
    if (latency > 3000) {
      logger.warn('⚠️ Slow API response:', endpoint, `${latency}ms`);

      if (typeof (global as Record<string, unknown>).Sentry !== 'undefined') {
        (
          (global as Record<string, unknown>).Sentry as {
            captureMessage: (msg: string, opts: unknown) => void;
          }
        ).captureMessage('Slow API response', {
          level: 'warning',
          extra: { endpoint, latency, ...metadata },
        });
      }
    }
  };

  /**
   * Track Screen Load Time
   */
  trackScreenLoad = (screenName: string, loadTime: number): void => {
    this.recordMetric(`screen_load_${screenName}`, loadTime);

    if (loadTime > 2000) {
      logger.warn('⚠️ Slow screen load:', screenName, `${loadTime}ms`);
    }
  };

  /**
   * Record custom metric
   */
  recordMetric = (
    name: string,
    value: number,
    metadata?: Record<string, unknown>,
  ): void => {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Keep only last 100 metrics to prevent memory bloat
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }

    // Log in development
    if (__DEV__) {
      logger.debug('📊 Metric:', name, value, metadata);
    }
  };

  /**
   * Get metrics summary
   */
  getMetrics = (): PerformanceMetric[] => {
    return [...this.metrics];
  };

  /**
   * Get average metric value
   */
  getAverageMetric = (name: string): number | null => {
    const filtered = this.metrics.filter((m) => m.name === name);
    if (filtered.length === 0) return null;

    const sum = filtered.reduce((acc, m) => acc + m.value, 0);
    return sum / filtered.length;
  };

  /**
   * Clear all metrics
   */
  clearMetrics = (): void => {
    this.metrics = [];
  };
}

export const PerformanceMonitor = new PerformanceMonitorClass();

/**
 * Hook for tracking screen load time
 */
export const useScreenLoadTracking = (screenName: string) => {
  const loadStartTime = useRef(Date.now());

  useEffect(() => {
    const loadTime = Date.now() - loadStartTime.current;
    PerformanceMonitor.trackScreenLoad(screenName, loadTime);
  }, [screenName]);
};
