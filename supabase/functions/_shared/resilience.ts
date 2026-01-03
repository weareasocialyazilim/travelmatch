/**
 * Resilience Module - Unified Resilience Infrastructure
 *
 * Master module that combines all resilience patterns:
 * - Circuit Breaker
 * - Chaos Engineering
 * - Observability
 * - Graceful Degradation
 * - Health Checks
 *
 * This is the "single entry point" for all resilience concerns.
 *
 * @example
 * ```ts
 * import { resilience, withResilience } from '../_shared/resilience.ts';
 *
 * // Wrap a function with full resilience
 * const result = await withResilience('payment', () => processPayment(data), {
 *   fallback: () => ({ success: false, message: 'Service unavailable' }),
 *   timeout: 10000,
 * });
 *
 * // Get system health dashboard
 * const dashboard = resilience.getDashboard();
 * ```
 */

import { createLogger, Logger } from './logger.ts';
import { metrics, MetricsReporter, healthChecker, HealthStatus } from './observability.ts';
import {
  circuitBreakerRegistry,
  CircuitState,
  CircuitStats,
  assessDegradationLevel,
  DegradationLevel,
} from './circuit-breaker.ts';
import { chaosMonkey, ChaosScenarios, ChaosConfig, ChaosMode } from './chaos.ts';

const logger = createLogger('resilience');

// =============================================================================
// TYPES
// =============================================================================

export interface ResilienceOptions<T> {
  /** Fallback when service is unavailable */
  fallback?: () => T | Promise<T>;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Additional context for logging */
  context?: Record<string, unknown>;
  /** Enable chaos testing (only in non-production) */
  enableChaos?: boolean;
  /** Circuit breaker config overrides */
  circuitConfig?: {
    failureThreshold?: number;
    resetTimeoutMs?: number;
  };
}

export interface SystemDashboard {
  timestamp: number;
  status: 'healthy' | 'degraded' | 'critical' | 'maintenance';
  uptime: number;
  degradation: DegradationLevel;
  circuitBreakers: Record<string, CircuitStats>;
  openCircuits: string[];
  metrics: {
    totalRequests: number;
    totalErrors: number;
    avgLatencyMs: number;
    errorRate: number;
    p95LatencyMs: number;
  };
  health: HealthStatus | null;
  chaos: {
    enabled: boolean;
    mode: ChaosMode;
    disruptionRate: number;
  };
  services: ServiceStatus[];
}

export interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down' | 'maintenance';
  circuitState: CircuitState;
  errorRate: number;
  avgLatencyMs: number;
  lastError?: string;
  lastSuccessTime?: number;
}

// =============================================================================
// RESILIENCE WRAPPER
// =============================================================================

/**
 * Execute a function with full resilience protection
 *
 * This combines:
 * - Circuit breaker protection
 * - Timeout handling
 * - Chaos engineering (when enabled)
 * - Metrics recording
 * - Fallback execution
 */
export async function withResilience<T>(
  serviceName: string,
  fn: () => Promise<T>,
  options: ResilienceOptions<T> = {}
): Promise<T> {
  const startTime = Date.now();
  const circuit = circuitBreakerRegistry.get(serviceName, options.circuitConfig);

  // If chaos is enabled and we're not in production, wrap with chaos
  const wrappedFn = options.enableChaos
    ? () => chaosMonkey.maybeDisrupt(fn, { functionName: serviceName })
    : fn;

  try {
    const result = await circuit.execute(wrappedFn, {
      fallback: options.fallback,
      timeoutMs: options.timeout,
      context: options.context,
    });

    // Record successful metrics
    metrics.recordRequest(serviceName, 200, Date.now() - startTime);

    return result;
  } catch (error) {
    // Record error metrics
    metrics.recordRequest(serviceName, 500, Date.now() - startTime, {
      errorType: (error as Error).name,
    });

    logger.error(`Resilience wrapper caught error for ${serviceName}`, error as Error, options.context);

    // If fallback provided and not already used by circuit breaker
    if (options.fallback && circuit.getState() !== CircuitState.OPEN) {
      return options.fallback();
    }

    throw error;
  }
}

// =============================================================================
// RESILIENCE MANAGER
// =============================================================================

class ResilienceManager {
  private maintenanceMode: Set<string> = new Set();
  private alertCallbacks: Array<(alert: ResilienceAlert) => void> = [];

  /**
   * Put a service into maintenance mode
   */
  setMaintenance(serviceName: string, enabled: boolean): void {
    if (enabled) {
      this.maintenanceMode.add(serviceName);
      circuitBreakerRegistry.get(serviceName).forceOpen();
      logger.warn(`Service ${serviceName} set to MAINTENANCE mode`);
      this.emitAlert({
        type: 'maintenance',
        service: serviceName,
        message: `Service ${serviceName} is now in maintenance mode`,
        timestamp: Date.now(),
      });
    } else {
      this.maintenanceMode.delete(serviceName);
      circuitBreakerRegistry.get(serviceName).forceClose();
      logger.info(`Service ${serviceName} removed from MAINTENANCE mode`);
    }
  }

  /**
   * Check if service is in maintenance
   */
  isInMaintenance(serviceName: string): boolean {
    return this.maintenanceMode.has(serviceName);
  }

  /**
   * Register alert callback
   */
  onAlert(callback: (alert: ResilienceAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Emit alert to all registered callbacks
   */
  private emitAlert(alert: ResilienceAlert): void {
    for (const callback of this.alertCallbacks) {
      try {
        callback(alert);
      } catch (e) {
        logger.error('Alert callback failed', e as Error);
      }
    }
  }

  /**
   * Get comprehensive system dashboard
   */
  async getDashboard(): Promise<SystemDashboard> {
    const degradation = assessDegradationLevel();
    const circuitBreakers = circuitBreakerRegistry.getAllStats();
    const openCircuits = circuitBreakerRegistry.getOpenCircuits();
    const chaosStats = chaosMonkey.getStats();

    // Get metrics summary
    const metricsJson = MetricsReporter.getJsonFormat();
    const allStats = metrics.getAllStats();

    // Calculate P95 across all services
    let maxP95 = 0;
    for (const stats of Object.values(allStats)) {
      if (stats.p95DurationMs > maxP95) {
        maxP95 = stats.p95DurationMs;
      }
    }

    // Get health status
    let health: HealthStatus | null = null;
    try {
      health = await healthChecker.check();
    } catch (e) {
      logger.error('Health check failed', e as Error);
    }

    // Build service status list
    const services: ServiceStatus[] = [];
    for (const [name, cbStats] of Object.entries(circuitBreakers)) {
      const funcStats = allStats[name];
      const inMaintenance = this.maintenanceMode.has(name);

      let status: ServiceStatus['status'] = 'operational';
      if (inMaintenance) {
        status = 'maintenance';
      } else if (cbStats.state === CircuitState.OPEN) {
        status = 'down';
      } else if (cbStats.state === CircuitState.HALF_OPEN || (funcStats?.errorRate || 0) > 0.1) {
        status = 'degraded';
      }

      services.push({
        name,
        status,
        circuitState: cbStats.state,
        errorRate: funcStats?.errorRate || 0,
        avgLatencyMs: funcStats?.avgDurationMs || 0,
        lastSuccessTime: cbStats.lastSuccessTime || undefined,
      });
    }

    // Determine overall system status
    let systemStatus: SystemDashboard['status'] = 'healthy';
    if (this.maintenanceMode.size > 0) {
      systemStatus = 'maintenance';
    } else if (degradation.level === 'critical') {
      systemStatus = 'critical';
    } else if (degradation.level === 'degraded' || openCircuits.length > 0) {
      systemStatus = 'degraded';
    }

    return {
      timestamp: Date.now(),
      status: systemStatus,
      uptime: metricsJson.uptime,
      degradation,
      circuitBreakers,
      openCircuits,
      metrics: {
        totalRequests: metricsJson.summary.totalRequests,
        totalErrors: metricsJson.summary.totalErrors,
        avgLatencyMs: metricsJson.summary.avgLatencyMs,
        errorRate: metricsJson.summary.errorRate,
        p95LatencyMs: maxP95,
      },
      health,
      chaos: {
        enabled: chaosStats.enabled,
        mode: chaosStats.mode,
        disruptionRate: chaosStats.disruptionRate,
      },
      services,
    };
  }

  /**
   * Get Prometheus-formatted metrics including circuit breakers
   */
  getPrometheusMetrics(): string {
    const lines: string[] = [];

    // Observability metrics
    lines.push(MetricsReporter.getPrometheusFormat());
    lines.push('');

    // Circuit breaker metrics
    lines.push(circuitBreakerRegistry.getPrometheusMetrics());
    lines.push('');

    // Chaos metrics
    const chaosStats = chaosMonkey.getStats();
    lines.push('# HELP chaos_monkey_enabled Whether chaos monkey is enabled (0/1)');
    lines.push('# TYPE chaos_monkey_enabled gauge');
    lines.push(`chaos_monkey_enabled ${chaosStats.enabled ? 1 : 0}`);
    lines.push(`chaos_monkey_disruption_rate ${chaosStats.disruptionRate}`);
    lines.push(`chaos_monkey_request_count ${chaosStats.requestCount}`);
    lines.push(`chaos_monkey_disruption_count ${chaosStats.disruptionCount}`);

    // Maintenance mode
    lines.push('');
    lines.push('# HELP service_maintenance_mode Whether service is in maintenance (0/1)');
    lines.push('# TYPE service_maintenance_mode gauge');
    for (const service of this.maintenanceMode) {
      lines.push(`service_maintenance_mode{service="${service}"} 1`);
    }

    return lines.join('\n');
  }

  /**
   * Enable chaos testing with a predefined scenario
   */
  enableChaosScenario(
    scenario: keyof typeof ChaosScenarios
  ): void {
    const config = ChaosScenarios[scenario]();
    chaosMonkey.enable(config);
    logger.warn(`Chaos scenario "${scenario}" enabled`);
  }

  /**
   * Disable all chaos
   */
  disableChaos(): void {
    chaosMonkey.disable();
    logger.info('Chaos disabled');
  }

  /**
   * Run a quick system health probe
   */
  async probe(): Promise<{
    healthy: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check circuit breakers
    const openCircuits = circuitBreakerRegistry.getOpenCircuits();
    if (openCircuits.length > 0) {
      issues.push(`${openCircuits.length} circuit(s) are OPEN: ${openCircuits.join(', ')}`);
      recommendations.push('Investigate failing services and their dependencies');
    }

    // Check maintenance mode
    if (this.maintenanceMode.size > 0) {
      issues.push(`Services in maintenance: ${Array.from(this.maintenanceMode).join(', ')}`);
    }

    // Check error rates
    const allStats = metrics.getAllStats();
    for (const [name, stats] of Object.entries(allStats)) {
      if (stats.errorRate > 0.2) {
        issues.push(`High error rate for ${name}: ${(stats.errorRate * 100).toFixed(1)}%`);
        recommendations.push(`Review logs for ${name} to identify root cause`);
      }
      if (stats.p95DurationMs > 2000) {
        issues.push(`High latency for ${name}: P95 is ${stats.p95DurationMs}ms`);
        recommendations.push(`Consider optimizing ${name} or adding caching`);
      }
    }

    // Run health checks
    try {
      const health = await healthChecker.check();
      if (health.status !== 'healthy') {
        for (const [name, check] of Object.entries(health.checks)) {
          if (check.status === 'fail') {
            issues.push(`Health check failed: ${name} - ${check.message}`);
          }
        }
      }
    } catch (e) {
      issues.push(`Health check system error: ${(e as Error).message}`);
    }

    return {
      healthy: issues.length === 0,
      issues,
      recommendations,
    };
  }
}

// =============================================================================
// ALERT TYPES
// =============================================================================

export interface ResilienceAlert {
  type: 'circuit_open' | 'circuit_close' | 'high_error_rate' | 'high_latency' | 'maintenance';
  service: string;
  message: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const resilience = new ResilienceManager();

// =============================================================================
// RE-EXPORTS FOR CONVENIENCE
// =============================================================================

export {
  CircuitState,
  CircuitStats,
  circuitBreakerRegistry,
  CircuitOpenError,
} from './circuit-breaker.ts';

export {
  chaosMonkey,
  ChaosScenarios,
  ChaosMode,
  ChaosError,
} from './chaos.ts';

export {
  metrics,
  MetricsReporter,
  healthChecker,
} from './observability.ts';
