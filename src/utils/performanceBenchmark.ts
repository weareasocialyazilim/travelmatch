/**
 * Performance Benchmarking System
 * Track screen load times, memory usage, and identify slow components
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { InteractionManager, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { performance as _performancePolyfill } from 'perf_hooks';
import { logger } from './logger';

/**
 * Performance Metrics
 */
export interface PerformanceMetric {
  screenName: string;
  mountTime: number; // ms
  renderTime: number; // ms
  interactionTime: number; // ms
  memoryUsage?: number; // MB
  timestamp: number;
}

export interface ComponentMetric {
  componentName: string;
  renderCount: number;
  averageRenderTime: number; // ms
  slowestRenderTime: number; // ms
  lastRendered: number;
}

export interface BenchmarkReport {
  screenMetrics: PerformanceMetric[];
  componentMetrics: ComponentMetric[];
  slowestScreens: Array<{ screenName: string; avgTime: number }>;
  slowestComponents: Array<{ componentName: string; avgTime: number }>;
  memoryTrend: Array<{ timestamp: number; usage: number }>;
  recommendations: string[];
}

/**
 * Performance Benchmark Service
 */
class PerformanceBenchmarkService {
  private static instance: PerformanceBenchmarkService;
  private metrics: PerformanceMetric[] = [];
  private componentMetrics: Map<string, ComponentMetric> = new Map();
  private readonly STORAGE_KEY = '@performance_metrics';
  private readonly MAX_METRICS = 500;
  private readonly SLOW_SCREEN_THRESHOLD = 1000; // ms
  private readonly SLOW_COMPONENT_THRESHOLD = 100; // ms

  private constructor() {
    this.loadMetrics();
  }

  static getInstance(): PerformanceBenchmarkService {
    if (!PerformanceBenchmarkService.instance) {
      PerformanceBenchmarkService.instance = new PerformanceBenchmarkService();
    }
    return PerformanceBenchmarkService.instance;
  }

  /**
   * Track screen performance
   */
  async trackScreen(
    screenName: string,
    mountTime: number,
    renderTime: number,
    interactionTime: number,
  ): Promise<void> {
    const metric: PerformanceMetric = {
      screenName,
      mountTime,
      renderTime,
      interactionTime,
      memoryUsage: await this.getMemoryUsage(),
      timestamp: Date.now(),
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    await this.saveMetrics();

    // Log slow screens
    if (mountTime + renderTime > this.SLOW_SCREEN_THRESHOLD) {
      logger.warn(
        `[Performance] Slow screen detected: ${screenName} (${
          mountTime + renderTime
        }ms)`,
      );
    }
  }

  /**
   * Track component render performance
   */
  trackComponent(componentName: string, renderTime: number): void {
    const existing = this.componentMetrics.get(componentName);

    if (existing) {
      const newCount = existing.renderCount + 1;
      const newAvg =
        (existing.averageRenderTime * existing.renderCount + renderTime) /
        newCount;

      this.componentMetrics.set(componentName, {
        componentName,
        renderCount: newCount,
        averageRenderTime: newAvg,
        slowestRenderTime: Math.max(existing.slowestRenderTime, renderTime),
        lastRendered: Date.now(),
      });
    } else {
      this.componentMetrics.set(componentName, {
        componentName,
        renderCount: 1,
        averageRenderTime: renderTime,
        slowestRenderTime: renderTime,
        lastRendered: Date.now(),
      });
    }

    // Log slow components
    if (renderTime > this.SLOW_COMPONENT_THRESHOLD) {
      logger.warn(
        `[Performance] Slow component render: ${componentName} (${renderTime}ms)`,
      );
    }
  }

  /**
   * Get memory usage (MB)
   */
  private async getMemoryUsage(): Promise<number> {
    try {
      const perfWithMemory = performance as {
        memory?: { usedJSHeapSize: number };
      };
      if (Platform.OS === 'web' && perfWithMemory.memory) {
        return perfWithMemory.memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
      }
      // React Native doesn't provide direct memory access
      return 0;
    } catch {
      return 0;
    }
  }

  /**
   * Generate benchmark report
   */
  async generateReport(): Promise<BenchmarkReport> {
    // Calculate slowest screens
    const screenGroups = new Map<string, number[]>();
    this.metrics.forEach((metric) => {
      const totalTime = metric.mountTime + metric.renderTime;
      const times = screenGroups.get(metric.screenName) || [];
      times.push(totalTime);
      screenGroups.set(metric.screenName, times);
    });

    const slowestScreens = Array.from(screenGroups.entries())
      .map(([screenName, times]) => ({
        screenName,
        avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 10);

    // Calculate slowest components
    const slowestComponents = Array.from(this.componentMetrics.values())
      .map((metric) => ({
        componentName: metric.componentName,
        avgTime: metric.averageRenderTime,
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 10);

    // Memory trend (last 24 hours)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const memoryTrend = this.metrics
      .filter((m) => m.timestamp > oneDayAgo && m.memoryUsage)
      .map((m) => ({
        timestamp: m.timestamp,
        usage: m.memoryUsage || 0,
      }));

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      slowestScreens,
      slowestComponents,
    );

    return {
      screenMetrics: this.metrics.slice(-50), // Last 50 screens
      componentMetrics: Array.from(this.componentMetrics.values()),
      slowestScreens,
      slowestComponents,
      memoryTrend,
      recommendations,
    };
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(
    slowestScreens: Array<{ screenName: string; avgTime: number }>,
    slowestComponents: Array<{ componentName: string; avgTime: number }>,
  ): string[] {
    const recommendations: string[] = [];

    // Screen recommendations
    slowestScreens.forEach((screen) => {
      if (screen.avgTime > 2000) {
        recommendations.push(
          `⚠️ ${screen.screenName}: Very slow (${screen.avgTime.toFixed(
            0,
          )}ms). Consider code splitting or lazy loading.`,
        );
      } else if (screen.avgTime > 1000) {
        recommendations.push(
          `⚡ ${screen.screenName}: Slow (${screen.avgTime.toFixed(
            0,
          )}ms). Optimize heavy operations or use skeleton loaders.`,
        );
      }
    });

    // Component recommendations
    slowestComponents.forEach((component) => {
      if (component.avgTime > 200) {
        recommendations.push(
          `🔧 ${
            component.componentName
          }: Slow renders (${component.avgTime.toFixed(
            0,
          )}ms). Consider React.memo or useMemo.`,
        );
      } else if (component.avgTime > 100) {
        recommendations.push(
          `💡 ${
            component.componentName
          }: Could be optimized (${component.avgTime.toFixed(
            0,
          )}ms). Review prop changes and re-renders.`,
        );
      }
    });

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('✅ All screens and components perform well!');
    } else {
      recommendations.push(
        '\n📊 General Tips:',
        '• Use LoadingState for async operations',
        '• Implement pagination for long lists',
        '• Optimize images with proper sizes',
        '• Use React.memo for pure components',
        '• Avoid inline functions in render',
      );
    }

    return recommendations;
  }

  /**
   * Clear all metrics
   */
  async clearMetrics(): Promise<void> {
    this.metrics = [];
    this.componentMetrics.clear();
    await AsyncStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Save metrics to storage
   */
  private async saveMetrics(): Promise<void> {
    try {
      const data = {
        metrics: this.metrics,
        componentMetrics: Array.from(this.componentMetrics.entries()),
      };
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      logger.error('[Performance] Failed to save metrics:', error);
    }
  }

  /**
   * Load metrics from storage
   */
  private async loadMetrics(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        this.metrics = parsed.metrics || [];
        this.componentMetrics = new Map(parsed.componentMetrics || []);
      }
    } catch (error) {
      logger.error('[Performance] Failed to load metrics:', error);
    }
  }
}

/**
 * React Hook for Screen Performance Tracking
 */
export const useScreenPerformance = (screenName: string) => {
  const mountTimeRef = useRef<number>(Date.now());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const mountTime = Date.now() - mountTimeRef.current;

    // Track time to interactive
    const interactionHandle = InteractionManager.runAfterInteractions(() => {
      const interactionTime = Date.now() - mountTimeRef.current;
      const renderTime = interactionTime - mountTime;

      PerformanceBenchmarkService.getInstance().trackScreen(
        screenName,
        mountTime,
        renderTime,
        interactionTime,
      );

      setIsReady(true);
    });

    return () => {
      interactionHandle.cancel();
    };
  }, [screenName]);

  const trackMount = useCallback(() => {
    const mountTime = Date.now() - mountTimeRef.current;
    logger.debug(`[Performance] ${screenName} mounted in ${mountTime}ms`);
  }, [screenName]);

  const trackRender = useCallback(() => {
    const renderTime = Date.now() - mountTimeRef.current;
    logger.debug(`[Performance] ${screenName} rendered in ${renderTime}ms`);
  }, [screenName]);

  const trackInteraction = useCallback(
    (action: string) => {
      const interactionTime = Date.now() - mountTimeRef.current;
      logger.debug(
        `[Performance] ${screenName} - ${action} at ${interactionTime}ms`,
      );
    },
    [screenName],
  );

  return { isReady, trackMount, trackRender, trackInteraction };
};

/**
 * React Hook for Component Performance Tracking
 */
export const useComponentPerformance = (componentName: string) => {
  const renderStartRef = useRef<number>(0);

  useEffect(() => {
    const renderTime = Date.now() - renderStartRef.current;
    if (renderTime > 0) {
      PerformanceBenchmarkService.getInstance().trackComponent(
        componentName,
        renderTime,
      );
    }
  });

  // Mark render start
  renderStartRef.current = Date.now();
};

/**
 * Export singleton instance
 */
export const PerformanceBenchmark = PerformanceBenchmarkService.getInstance();
