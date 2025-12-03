/**
 * Memory Leak Detector
 * Detects and warns about potential memory leaks in React components
 */

import { useEffect, useRef } from 'react';

type Timer = NodeJS.Timeout | number;
type Listener = { remove?: () => void; unsubscribe?: () => void };

/**
 * Memory Leak Detector Hook
 * Tracks timers, listeners, and subscriptions to detect leaks
 *
 * @example
 * const { timers, listeners } = useMemoryLeakDetector('HomeScreen');
 *
 * const timer = setTimeout(() => {}, 1000);
 * timers.current.push(timer);
 *
 * useEffect(() => {
 *   return () => {
 *     timers.current.forEach(clearTimeout);
 *     timers.current = [];
 *   };
 * }, []);
 */
export const useMemoryLeakDetector = (componentName: string) => {
  const mountTime = useRef(Date.now());
  const timers = useRef<Timer[]>([]);
  const intervals = useRef<Timer[]>([]);
  const listeners = useRef<Listener[]>([]);
  const subscriptions = useRef<Listener[]>([]);

  useEffect(() => {
    if (__DEV__) {
      console.log(`📊 [Memory] ${componentName} mounted`);
    }

    return () => {
      const lifetime = Date.now() - mountTime.current;

      // Check for uncleaned timers
      if (timers.current.length > 0) {
        console.warn(
          `⚠️ [Memory Leak] ${componentName}: ${timers.current.length} timer(s) not cleared`,
          { lifetime: `${lifetime}ms` },
        );
      }

      // Check for uncleaned intervals
      if (intervals.current.length > 0) {
        console.warn(
          `⚠️ [Memory Leak] ${componentName}: ${intervals.current.length} interval(s) not cleared`,
          { lifetime: `${lifetime}ms` },
        );
      }

      // Check for uncleaned listeners
      if (listeners.current.length > 0) {
        console.warn(
          `⚠️ [Memory Leak] ${componentName}: ${listeners.current.length} listener(s) not removed`,
          { lifetime: `${lifetime}ms` },
        );
      }

      // Check for uncleaned subscriptions
      if (subscriptions.current.length > 0) {
        console.warn(
          `⚠️ [Memory Leak] ${componentName}: ${subscriptions.current.length} subscription(s) not unsubscribed`,
          { lifetime: `${lifetime}ms` },
        );
      }

      if (__DEV__) {
        console.log(
          `📊 [Memory] ${componentName} unmounted (lifetime: ${lifetime}ms)`,
        );
      }
    };
  }, [componentName]);

  return {
    timers,
    intervals,
    listeners,
    subscriptions,
  };
};

/**
 * Safe Timeout Hook
 * Automatically tracks and cleans up timeout
 *
 * @example
 * const safeSetTimeout = useSafeTimeout('MyComponent');
 * safeSetTimeout(() => console.log('Hello'), 1000);
 */
export const useSafeTimeout = (componentName: string) => {
  const { timers } = useMemoryLeakDetector(componentName);

  const safeSetTimeout = (callback: () => void, delay: number) => {
    const timer = setTimeout(() => {
      callback();
      // Remove from tracking after execution
      timers.current = timers.current.filter((t) => t !== timer);
    }, delay);

    timers.current.push(timer);
    return timer;
  };

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => clearTimeout(timer));
      timers.current = [];
    };
  }, []);

  return safeSetTimeout;
};

/**
 * Safe Interval Hook
 * Automatically tracks and cleans up interval
 *
 * @example
 * const safeSetInterval = useSafeInterval('MyComponent');
 * safeSetInterval(() => console.log('Tick'), 1000);
 */
export const useSafeInterval = (componentName: string) => {
  const { intervals } = useMemoryLeakDetector(componentName);

  const safeSetInterval = (callback: () => void, delay: number) => {
    const interval = setInterval(callback, delay);
    intervals.current.push(interval);
    return interval;
  };

  useEffect(() => {
    return () => {
      intervals.current.forEach((interval) => clearInterval(interval));
      intervals.current = [];
    };
  }, []);

  return safeSetInterval;
};

/**
 * Memory Usage Monitor
 * Monitors component memory usage (if available)
 */
export const useMemoryMonitor = (componentName: string) => {
  useEffect(() => {
    if (!__DEV__) return;

    // @ts-expect-error - performance.memory is non-standard
    if (typeof performance !== 'undefined' && performance.memory) {
      // @ts-expect-error - performance.memory types
      const { usedJSHeapSize, totalJSHeapSize } = performance.memory;
      const usage = ((usedJSHeapSize / totalJSHeapSize) * 100).toFixed(2);

      console.log(
        `📊 [Memory] ${componentName} - Heap usage: ${usage}% (${Math.round(
          usedJSHeapSize / 1024 / 1024,
        )}MB / ${Math.round(totalJSHeapSize / 1024 / 1024)}MB)`,
      );
    }
  }, [componentName]);
};
