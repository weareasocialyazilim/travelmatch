/**
 * Performance Budget Configuration
 * Enforces performance constraints on all components
 */

export interface PerformanceBudget {
  maxRenderTime: number; // ms
  maxReRenderCount: number;
  maxMemoryUsage: number; // MB
  maxBundleSize: number; // KB
}

export const PERFORMANCE_BUDGETS: Record<string, PerformanceBudget> = {
  // Atoms - Smallest components
  atoms: {
    maxRenderTime: 16, // Must render within one frame (60fps)
    maxReRenderCount: 3,
    maxMemoryUsage: 1,
    maxBundleSize: 5,
  },

  // Molecules - Composite components
  molecules: {
    maxRenderTime: 32, // Two frames
    maxReRenderCount: 5,
    maxMemoryUsage: 2,
    maxBundleSize: 15,
  },

  // Organisms - Complex components
  organisms: {
    maxRenderTime: 50,
    maxReRenderCount: 8,
    maxMemoryUsage: 5,
    maxBundleSize: 30,
  },

  // Templates - Page layouts
  templates: {
    maxRenderTime: 100,
    maxReRenderCount: 10,
    maxMemoryUsage: 10,
    maxBundleSize: 50,
  },
};

export interface PerformanceMetrics {
  renderTime: number;
  reRenderCount: number;
  memoryUsage: number;
  componentType: keyof typeof PERFORMANCE_BUDGETS;
}

export function checkPerformanceBudget(
  metrics: PerformanceMetrics
): { passed: boolean; violations: string[] } {
  const budget = PERFORMANCE_BUDGETS[metrics.componentType];
  const violations: string[] = [];

  if (metrics.renderTime > budget.maxRenderTime) {
    violations.push(
      `Render time (${metrics.renderTime}ms) exceeds budget (${budget.maxRenderTime}ms)`
    );
  }

  if (metrics.reRenderCount > budget.maxReRenderCount) {
    violations.push(
      `Re-render count (${metrics.reRenderCount}) exceeds budget (${budget.maxReRenderCount})`
    );
  }

  if (metrics.memoryUsage > budget.maxMemoryUsage) {
    violations.push(
      `Memory usage (${metrics.memoryUsage}MB) exceeds budget (${budget.maxMemoryUsage}MB)`
    );
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}
