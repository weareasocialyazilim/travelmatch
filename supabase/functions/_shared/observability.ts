/**
 * Observability Module for Edge Functions
 *
 * Metrics collection, Grafana-compatible export, and latency tracking.
 * Integrates with distributed tracing for end-to-end observability.
 *
 * Features:
 * - Request/Response metrics
 * - Latency histograms
 * - Error rate tracking
 * - Grafana/Prometheus compatible output
 * - OpenTelemetry-style spans
 *
 * @example
 * ```ts
 * import { metrics, MetricsReporter } from '../_shared/observability.ts';
 *
 * // Record a request
 * metrics.recordRequest('verify-proof', 200, 145);
 *
 * // Get metrics for Grafana
 * const report = MetricsReporter.getPrometheusFormat();
 * ```
 */

// =============================================================================
// TYPES
// =============================================================================

export interface RequestMetric {
  functionName: string;
  status: number;
  durationMs: number;
  timestamp: number;
  traceId?: string;
  spanId?: string;
  errorType?: string;
}

export interface FunctionStats {
  totalRequests: number;
  successCount: number;
  errorCount: number;
  avgDurationMs: number;
  p50DurationMs: number;
  p95DurationMs: number;
  p99DurationMs: number;
  minDurationMs: number;
  maxDurationMs: number;
  lastRequestTime: number;
  errorRate: number;
  requestsPerSecond: number;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  lastCheck: number;
  checks: Record<string, {
    status: 'pass' | 'fail';
    message?: string;
    latencyMs?: number;
  }>;
}

// =============================================================================
// HISTOGRAM BUCKETS (for latency distribution)
// =============================================================================

const LATENCY_BUCKETS = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];

// =============================================================================
// METRICS STORE
// =============================================================================

class MetricsStore {
  private requests: RequestMetric[] = [];
  private startTime: number = Date.now();
  private maxStoredRequests = 10000;
  private aggregationWindowMs = 60000; // 1 minute

  /**
   * Record a request metric
   */
  record(metric: RequestMetric): void {
    this.requests.push(metric);

    // Prune old requests to prevent memory bloat
    if (this.requests.length > this.maxStoredRequests) {
      const cutoff = Date.now() - (this.aggregationWindowMs * 5);
      this.requests = this.requests.filter(r => r.timestamp > cutoff);
    }
  }

  /**
   * Get requests for a specific function
   */
  getByFunction(functionName: string, windowMs?: number): RequestMetric[] {
    const cutoff = windowMs ? Date.now() - windowMs : 0;
    return this.requests.filter(
      r => r.functionName === functionName && r.timestamp > cutoff
    );
  }

  /**
   * Get all requests within a window
   */
  getRecent(windowMs: number = this.aggregationWindowMs): RequestMetric[] {
    const cutoff = Date.now() - windowMs;
    return this.requests.filter(r => r.timestamp > cutoff);
  }

  /**
   * Get unique function names
   */
  getFunctionNames(): string[] {
    return [...new Set(this.requests.map(r => r.functionName))];
  }

  /**
   * Calculate statistics for a function
   */
  getStats(functionName: string, windowMs?: number): FunctionStats {
    const requests = this.getByFunction(functionName, windowMs);

    if (requests.length === 0) {
      return {
        totalRequests: 0,
        successCount: 0,
        errorCount: 0,
        avgDurationMs: 0,
        p50DurationMs: 0,
        p95DurationMs: 0,
        p99DurationMs: 0,
        minDurationMs: 0,
        maxDurationMs: 0,
        lastRequestTime: 0,
        errorRate: 0,
        requestsPerSecond: 0,
      };
    }

    const durations = requests.map(r => r.durationMs).sort((a, b) => a - b);
    const successRequests = requests.filter(r => r.status >= 200 && r.status < 400);
    const errorRequests = requests.filter(r => r.status >= 400);

    const windowSeconds = (windowMs || this.aggregationWindowMs) / 1000;
    const rps = requests.length / windowSeconds;

    return {
      totalRequests: requests.length,
      successCount: successRequests.length,
      errorCount: errorRequests.length,
      avgDurationMs: durations.reduce((a, b) => a + b, 0) / durations.length,
      p50DurationMs: this.percentile(durations, 50),
      p95DurationMs: this.percentile(durations, 95),
      p99DurationMs: this.percentile(durations, 99),
      minDurationMs: durations[0],
      maxDurationMs: durations[durations.length - 1],
      lastRequestTime: Math.max(...requests.map(r => r.timestamp)),
      errorRate: errorRequests.length / requests.length,
      requestsPerSecond: Math.round(rps * 100) / 100,
    };
  }

  /**
   * Calculate percentile
   */
  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Get latency histogram for a function
   */
  getHistogram(functionName: string, windowMs?: number): Record<string, number> {
    const requests = this.getByFunction(functionName, windowMs);
    const histogram: Record<string, number> = {};

    // Initialize buckets
    for (let i = 0; i < LATENCY_BUCKETS.length; i++) {
      const label = i === 0
        ? `le_${LATENCY_BUCKETS[i]}`
        : `le_${LATENCY_BUCKETS[i]}`;
      histogram[label] = 0;
    }
    histogram['le_inf'] = 0;

    // Count requests in each bucket
    for (const request of requests) {
      let counted = false;
      for (const bucket of LATENCY_BUCKETS) {
        if (request.durationMs <= bucket) {
          histogram[`le_${bucket}`]++;
          counted = true;
          break;
        }
      }
      if (!counted) {
        histogram['le_inf']++;
      }
    }

    return histogram;
  }

  /**
   * Get uptime in seconds
   */
  getUptime(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.requests = [];
    this.startTime = Date.now();
  }
}

// =============================================================================
// GLOBAL METRICS INSTANCE
// =============================================================================

export const metricsStore = new MetricsStore();

// =============================================================================
// METRICS API
// =============================================================================

export const metrics = {
  /**
   * Record a request
   */
  recordRequest(
    functionName: string,
    status: number,
    durationMs: number,
    options?: {
      traceId?: string;
      spanId?: string;
      errorType?: string;
    }
  ): void {
    metricsStore.record({
      functionName,
      status,
      durationMs,
      timestamp: Date.now(),
      ...options,
    });
  },

  /**
   * Get statistics for a function
   */
  getStats(functionName: string, windowMs?: number): FunctionStats {
    return metricsStore.getStats(functionName, windowMs);
  },

  /**
   * Get all function statistics
   */
  getAllStats(windowMs?: number): Record<string, FunctionStats> {
    const stats: Record<string, FunctionStats> = {};
    for (const name of metricsStore.getFunctionNames()) {
      stats[name] = metricsStore.getStats(name, windowMs);
    }
    return stats;
  },

  /**
   * Get histogram for a function
   */
  getHistogram(functionName: string, windowMs?: number): Record<string, number> {
    return metricsStore.getHistogram(functionName, windowMs);
  },
};

// =============================================================================
// PROMETHEUS/GRAFANA EXPORTER
// =============================================================================

export class MetricsReporter {
  /**
   * Get metrics in Prometheus format
   */
  static getPrometheusFormat(windowMs: number = 60000): string {
    const lines: string[] = [];
    const allStats = metrics.getAllStats(windowMs);

    // Help and type declarations
    lines.push('# HELP edge_function_requests_total Total number of requests');
    lines.push('# TYPE edge_function_requests_total counter');
    lines.push('# HELP edge_function_duration_seconds Request duration in seconds');
    lines.push('# TYPE edge_function_duration_seconds histogram');
    lines.push('# HELP edge_function_errors_total Total number of errors');
    lines.push('# TYPE edge_function_errors_total counter');

    for (const [functionName, stats] of Object.entries(allStats)) {
      const labels = `function="${functionName}"`;

      // Request counter
      lines.push(`edge_function_requests_total{${labels}} ${stats.totalRequests}`);

      // Error counter
      lines.push(`edge_function_errors_total{${labels}} ${stats.errorCount}`);

      // Duration histogram
      const histogram = metricsStore.getHistogram(functionName, windowMs);
      let cumulativeCount = 0;
      for (const [bucket, count] of Object.entries(histogram)) {
        cumulativeCount += count;
        const le = bucket.replace('le_', '').replace('inf', '+Inf');
        lines.push(`edge_function_duration_seconds_bucket{${labels},le="${le}"} ${cumulativeCount}`);
      }
      lines.push(`edge_function_duration_seconds_sum{${labels}} ${stats.avgDurationMs * stats.totalRequests / 1000}`);
      lines.push(`edge_function_duration_seconds_count{${labels}} ${stats.totalRequests}`);
    }

    // Uptime
    lines.push(`# HELP edge_function_uptime_seconds Uptime in seconds`);
    lines.push(`# TYPE edge_function_uptime_seconds gauge`);
    lines.push(`edge_function_uptime_seconds ${metricsStore.getUptime()}`);

    return lines.join('\n');
  }

  /**
   * Get metrics in JSON format (for custom dashboards)
   */
  static getJsonFormat(windowMs: number = 60000): {
    timestamp: number;
    uptime: number;
    functions: Record<string, FunctionStats & { histogram: Record<string, number> }>;
    summary: {
      totalRequests: number;
      totalErrors: number;
      avgLatencyMs: number;
      errorRate: number;
    };
  } {
    const allStats = metrics.getAllStats(windowMs);
    const functions: Record<string, FunctionStats & { histogram: Record<string, number> }> = {};

    let totalRequests = 0;
    let totalErrors = 0;
    let totalLatency = 0;

    for (const [name, stats] of Object.entries(allStats)) {
      functions[name] = {
        ...stats,
        histogram: metricsStore.getHistogram(name, windowMs),
      };
      totalRequests += stats.totalRequests;
      totalErrors += stats.errorCount;
      totalLatency += stats.avgDurationMs * stats.totalRequests;
    }

    return {
      timestamp: Date.now(),
      uptime: metricsStore.getUptime(),
      functions,
      summary: {
        totalRequests,
        totalErrors,
        avgLatencyMs: totalRequests > 0 ? totalLatency / totalRequests : 0,
        errorRate: totalRequests > 0 ? totalErrors / totalRequests : 0,
      },
    };
  }

  /**
   * Get slow requests (above threshold)
   */
  static getSlowRequests(thresholdMs: number = 1000, limit: number = 10): RequestMetric[] {
    return metricsStore.getRecent(300000) // Last 5 minutes
      .filter(r => r.durationMs > thresholdMs)
      .sort((a, b) => b.durationMs - a.durationMs)
      .slice(0, limit);
  }

  /**
   * Get error summary
   */
  static getErrorSummary(windowMs: number = 60000): {
    totalErrors: number;
    byFunction: Record<string, number>;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
  } {
    const errors = metricsStore.getRecent(windowMs).filter(r => r.status >= 400);

    const byFunction: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};

    for (const error of errors) {
      byFunction[error.functionName] = (byFunction[error.functionName] || 0) + 1;
      byStatus[error.status.toString()] = (byStatus[error.status.toString()] || 0) + 1;
      if (error.errorType) {
        byType[error.errorType] = (byType[error.errorType] || 0) + 1;
      }
    }

    return {
      totalErrors: errors.length,
      byFunction,
      byStatus,
      byType,
    };
  }
}

// =============================================================================
// HEALTH CHECK
// =============================================================================

export class HealthChecker {
  private checks: Map<string, () => Promise<{ pass: boolean; message?: string; latencyMs?: number }>> = new Map();

  /**
   * Register a health check
   */
  register(name: string, check: () => Promise<{ pass: boolean; message?: string; latencyMs?: number }>): void {
    this.checks.set(name, check);
  }

  /**
   * Run all health checks
   */
  async check(): Promise<HealthStatus> {
    const results: HealthStatus['checks'] = {};
    let allPass = true;
    let anyFail = false;

    for (const [name, checkFn] of this.checks) {
      try {
        const start = performance.now();
        const result = await checkFn();
        const latencyMs = performance.now() - start;

        results[name] = {
          status: result.pass ? 'pass' : 'fail',
          message: result.message,
          latencyMs: result.latencyMs || latencyMs,
        };

        if (!result.pass) {
          anyFail = true;
        }
      } catch (error) {
        results[name] = {
          status: 'fail',
          message: error instanceof Error ? error.message : 'Unknown error',
        };
        anyFail = true;
      }
    }

    return {
      status: anyFail ? (allPass ? 'degraded' : 'unhealthy') : 'healthy',
      uptime: metricsStore.getUptime(),
      lastCheck: Date.now(),
      checks: results,
    };
  }

  /**
   * Create a simple ping check
   */
  static createPingCheck(url: string, timeoutMs: number = 5000): () => Promise<{ pass: boolean; message?: string; latencyMs?: number }> {
    return async () => {
      const start = performance.now();
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
        });

        clearTimeout(timeout);
        const latencyMs = performance.now() - start;

        return {
          pass: response.ok,
          message: response.ok ? 'OK' : `HTTP ${response.status}`,
          latencyMs,
        };
      } catch (error) {
        return {
          pass: false,
          message: error instanceof Error ? error.message : 'Ping failed',
          latencyMs: performance.now() - start,
        };
      }
    };
  }
}

export const healthChecker = new HealthChecker();
