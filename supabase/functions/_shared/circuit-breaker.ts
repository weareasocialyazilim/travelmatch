/**
 * Circuit Breaker Pattern Implementation
 *
 * Provides resilience by preventing cascading failures when a service is unhealthy.
 * When a service fails consecutively, the circuit "opens" and returns fallback
 * responses instead of overwhelming the failing service.
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Service is failing, requests fail fast with fallback
 * - HALF_OPEN: Testing if service recovered, limited requests allowed
 *
 * @example
 * ```ts
 * const paymentCircuit = circuitBreakerRegistry.get('payment');
 *
 * const result = await paymentCircuit.execute(
 *   () => processPayment(data),
 *   { fallback: () => ({ success: false, message: 'Service temporarily unavailable' }) }
 * );
 * ```
 */

import { createLogger } from './logger.ts';
import { metrics } from './observability.ts';

const logger = createLogger('circuit-breaker');

// =============================================================================
// TYPES
// =============================================================================

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerConfig {
  /** Number of consecutive failures before opening circuit */
  failureThreshold: number;
  /** Time in ms before attempting recovery (half-open state) */
  resetTimeoutMs: number;
  /** Number of successful calls in half-open to close circuit */
  successThreshold: number;
  /** Optional timeout for each call in ms */
  callTimeoutMs?: number;
  /** Services that this circuit depends on */
  dependencies?: string[];
}

export interface CircuitStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  totalRequests: number;
  totalFailures: number;
  totalTimeouts: number;
  openCount: number;
}

export interface ExecuteOptions<T> {
  /** Fallback function when circuit is open */
  fallback?: () => T | Promise<T>;
  /** Override timeout for this specific call */
  timeoutMs?: number;
  /** Context for logging */
  context?: Record<string, unknown>;
}

// =============================================================================
// CIRCUIT BREAKER ERROR
// =============================================================================

export class CircuitOpenError extends Error {
  public readonly serviceName: string;
  public readonly state: CircuitState;
  public readonly retryAfterMs: number;

  constructor(serviceName: string, state: CircuitState, retryAfterMs: number) {
    super(`Circuit breaker is ${state} for service: ${serviceName}`);
    this.name = 'CircuitOpenError';
    this.serviceName = serviceName;
    this.state = state;
    this.retryAfterMs = retryAfterMs;
  }
}

// =============================================================================
// CIRCUIT BREAKER
// =============================================================================

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures = 0;
  private successes = 0;
  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private totalRequests = 0;
  private totalFailures = 0;
  private totalTimeouts = 0;
  private openCount = 0;

  constructor(
    private readonly name: string,
    private readonly config: CircuitBreakerConfig,
  ) {
    logger.info(`Circuit breaker initialized: ${name}`, {
      failureThreshold: config.failureThreshold,
      resetTimeoutMs: config.resetTimeoutMs,
    });
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(
    fn: () => Promise<T>,
    options: ExecuteOptions<T> = {},
  ): Promise<T> {
    this.totalRequests++;

    // Check if circuit should transition from OPEN to HALF_OPEN
    if (this.state === CircuitState.OPEN) {
      const timeSinceFailure = Date.now() - (this.lastFailureTime || 0);

      if (timeSinceFailure >= this.config.resetTimeoutMs) {
        this.transitionTo(CircuitState.HALF_OPEN);
      } else {
        // Circuit is still open - fail fast
        logger.debug(`Circuit OPEN for ${this.name}, failing fast`);
        metrics.recordRequest(this.name, 503, 0, {
          errorType: 'circuit_open',
        });

        if (options.fallback) {
          return options.fallback();
        }

        throw new CircuitOpenError(
          this.name,
          this.state,
          this.config.resetTimeoutMs - timeSinceFailure,
        );
      }
    }

    // Execute the function with optional timeout
    const timeoutMs = options.timeoutMs || this.config.callTimeoutMs;
    const startTime = Date.now();

    try {
      let result: T;

      if (timeoutMs) {
        result = await this.executeWithTimeout(fn, timeoutMs);
      } else {
        result = await fn();
      }

      this.onSuccess(Date.now() - startTime);
      return result;
    } catch (error) {
      this.onFailure(error as Error, Date.now() - startTime);

      // If fallback provided, use it
      if (options.fallback) {
        logger.info(`Using fallback for ${this.name}`, options.context);
        return options.fallback();
      }

      throw error;
    }
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.totalTimeouts++;
        reject(
          new Error(`Call to ${this.name} timed out after ${timeoutMs}ms`),
        );
      }, timeoutMs);

      fn()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Handle successful call
   */
  private onSuccess(durationMs: number): void {
    this.lastSuccessTime = Date.now();
    this.successes++;
    this.failures = 0; // Reset consecutive failures

    metrics.recordRequest(this.name, 200, durationMs);

    if (this.state === CircuitState.HALF_OPEN) {
      if (this.successes >= this.config.successThreshold) {
        this.transitionTo(CircuitState.CLOSED);
      }
    }
  }

  /**
   * Handle failed call
   */
  private onFailure(error: Error, durationMs: number): void {
    this.lastFailureTime = Date.now();
    this.failures++;
    this.totalFailures++;
    this.successes = 0; // Reset consecutive successes

    metrics.recordRequest(this.name, 500, durationMs, {
      errorType: error.name,
    });

    logger.warn(`Circuit breaker ${this.name} recorded failure`, {
      failures: this.failures,
      threshold: this.config.failureThreshold,
      error: error.message,
    });

    if (
      this.state === CircuitState.CLOSED &&
      this.failures >= this.config.failureThreshold
    ) {
      this.transitionTo(CircuitState.OPEN);
    } else if (this.state === CircuitState.HALF_OPEN) {
      // Any failure in half-open returns to open
      this.transitionTo(CircuitState.OPEN);
    }
  }

  /**
   * Transition to a new state
   */
  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;

    if (newState === CircuitState.OPEN) {
      this.openCount++;
    }

    if (newState === CircuitState.CLOSED) {
      this.failures = 0;
      this.successes = 0;
    }

    if (newState === CircuitState.HALF_OPEN) {
      this.successes = 0;
    }

    logger.info(
      `Circuit ${this.name} transitioned: ${oldState} -> ${newState}`,
      {
        failures: this.failures,
        openCount: this.openCount,
      },
    );

    // Emit state change for monitoring
    this.emitStateChange(oldState, newState);
  }

  /**
   * Emit state change event for monitoring/alerting
   */
  private emitStateChange(from: CircuitState, to: CircuitState): void {
    // This could be enhanced to push to a message queue or webhook
    const event = {
      type: 'circuit_breaker_state_change',
      service: this.name,
      from,
      to,
      timestamp: Date.now(),
      stats: this.getStats(),
    };

    // Log as structured event for monitoring systems
    logger.info('Circuit breaker state change', event);
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get statistics
   */
  getStats(): CircuitStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
      totalTimeouts: this.totalTimeouts,
      openCount: this.openCount,
    };
  }

  /**
   * Force circuit to open (for manual intervention)
   */
  forceOpen(): void {
    logger.warn(`Circuit ${this.name} manually forced OPEN`);
    this.transitionTo(CircuitState.OPEN);
  }

  /**
   * Force circuit to close (for manual intervention)
   */
  forceClose(): void {
    logger.warn(`Circuit ${this.name} manually forced CLOSED`);
    this.transitionTo(CircuitState.CLOSED);
  }

  /**
   * Reset all statistics
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
    this.totalRequests = 0;
    this.totalFailures = 0;
    this.totalTimeouts = 0;
    this.openCount = 0;
    logger.info(`Circuit ${this.name} reset`);
  }
}

// =============================================================================
// CIRCUIT BREAKER REGISTRY
// =============================================================================

class CircuitBreakerRegistry {
  private circuits: Map<string, CircuitBreaker> = new Map();

  /**
   * Pre-configured circuit breaker settings for common services
   */
  private readonly defaultConfigs: Record<string, CircuitBreakerConfig> = {
    payment: {
      failureThreshold: 3,
      resetTimeoutMs: 30000, // 30 seconds
      successThreshold: 2,
      callTimeoutMs: 10000,
      dependencies: ['database'],
    },
    'payment-webhook': {
      failureThreshold: 5,
      resetTimeoutMs: 60000,
      successThreshold: 3,
      callTimeoutMs: 15000,
    },
    auth: {
      failureThreshold: 5,
      resetTimeoutMs: 15000,
      successThreshold: 2,
      callTimeoutMs: 5000,
    },
    kyc: {
      failureThreshold: 3,
      resetTimeoutMs: 60000, // KYC can be slow to recover
      successThreshold: 2,
      callTimeoutMs: 30000, // KYC verification can be slow
      dependencies: ['idenfy'],
    },
    email: {
      failureThreshold: 5,
      resetTimeoutMs: 30000,
      successThreshold: 3,
      callTimeoutMs: 10000,
      dependencies: ['sendgrid'],
    },
    sms: {
      failureThreshold: 5,
      resetTimeoutMs: 30000,
      successThreshold: 3,
      callTimeoutMs: 10000,
      dependencies: ['twilio'],
    },
    geocoding: {
      failureThreshold: 10,
      resetTimeoutMs: 15000,
      successThreshold: 5,
      callTimeoutMs: 5000,
    },
    'image-upload': {
      failureThreshold: 5,
      resetTimeoutMs: 30000,
      successThreshold: 3,
      callTimeoutMs: 30000, // Image uploads can be slow
      dependencies: ['cloudflare-images'],
    },
    database: {
      failureThreshold: 3,
      resetTimeoutMs: 10000,
      successThreshold: 2,
      callTimeoutMs: 5000,
    },
    'external-api': {
      failureThreshold: 5,
      resetTimeoutMs: 30000,
      successThreshold: 3,
      callTimeoutMs: 15000,
    },
  };

  /**
   * Get or create a circuit breaker for a service
   */
  get(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.circuits.has(name)) {
      const defaultConfig = this.defaultConfigs[name] || {
        failureThreshold: 5,
        resetTimeoutMs: 30000,
        successThreshold: 3,
        callTimeoutMs: 10000,
      };

      const mergedConfig = { ...defaultConfig, ...config };
      this.circuits.set(name, new CircuitBreaker(name, mergedConfig));
    }

    return this.circuits.get(name)!;
  }

  /**
   * Get all circuit states for monitoring dashboard
   */
  getAllStats(): Record<string, CircuitStats> {
    const stats: Record<string, CircuitStats> = {};
    for (const [name, circuit] of this.circuits) {
      stats[name] = circuit.getStats();
    }
    return stats;
  }

  /**
   * Get circuits in OPEN state (for alerting)
   */
  getOpenCircuits(): string[] {
    return Array.from(this.circuits.entries())
      .filter(([, circuit]) => circuit.getState() === CircuitState.OPEN)
      .map(([name]) => name);
  }

  /**
   * Get Prometheus metrics for circuit breakers
   */
  getPrometheusMetrics(): string {
    const lines: string[] = [];

    lines.push(
      '# HELP circuit_breaker_state Current state of circuit breaker (0=closed, 1=half_open, 2=open)',
    );
    lines.push('# TYPE circuit_breaker_state gauge');
    lines.push(
      '# HELP circuit_breaker_failures_total Total number of failures',
    );
    lines.push('# TYPE circuit_breaker_failures_total counter');
    lines.push(
      '# HELP circuit_breaker_requests_total Total number of requests',
    );
    lines.push('# TYPE circuit_breaker_requests_total counter');
    lines.push('# HELP circuit_breaker_open_total Total times circuit opened');
    lines.push('# TYPE circuit_breaker_open_total counter');

    for (const [name, circuit] of this.circuits) {
      const stats = circuit.getStats();
      const stateValue =
        stats.state === CircuitState.CLOSED
          ? 0
          : stats.state === CircuitState.HALF_OPEN
            ? 1
            : 2;

      lines.push(`circuit_breaker_state{service="${name}"} ${stateValue}`);
      lines.push(
        `circuit_breaker_failures_total{service="${name}"} ${stats.totalFailures}`,
      );
      lines.push(
        `circuit_breaker_requests_total{service="${name}"} ${stats.totalRequests}`,
      );
      lines.push(
        `circuit_breaker_open_total{service="${name}"} ${stats.openCount}`,
      );
    }

    return lines.join('\n');
  }

  /**
   * Check if a dependency chain is healthy
   */
  isDependencyChainHealthy(serviceName: string): boolean {
    const circuit = this.circuits.get(serviceName);
    if (!circuit) return true;

    const config = this.defaultConfigs[serviceName];
    if (!config?.dependencies) return circuit.getState() !== CircuitState.OPEN;

    // Check all dependencies recursively
    for (const dep of config.dependencies) {
      if (!this.isDependencyChainHealthy(dep)) {
        return false;
      }
    }

    return circuit.getState() !== CircuitState.OPEN;
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const circuitBreakerRegistry = new CircuitBreakerRegistry();

// =============================================================================
// GRACEFUL DEGRADATION HELPER
// =============================================================================

export interface DegradationLevel {
  level: 'normal' | 'degraded' | 'critical' | 'maintenance';
  affectedServices: string[];
  message: string;
  allowedOperations: string[];
}

/**
 * Assess system degradation level based on circuit breaker states
 */
export function assessDegradationLevel(): DegradationLevel {
  const openCircuits = circuitBreakerRegistry.getOpenCircuits();

  if (openCircuits.length === 0) {
    return {
      level: 'normal',
      affectedServices: [],
      message: 'All systems operational',
      allowedOperations: ['all'],
    };
  }

  // Critical services that affect core functionality
  const criticalServices = ['payment', 'auth', 'database'];
  const criticalAffected = openCircuits.filter((s) =>
    criticalServices.includes(s),
  );

  if (criticalAffected.length > 0) {
    if (criticalAffected.includes('database')) {
      return {
        level: 'critical',
        affectedServices: openCircuits,
        message:
          'Database connectivity issues. Limited functionality available.',
        allowedOperations: ['read-cache', 'static-content'],
      };
    }

    if (criticalAffected.includes('payment')) {
      return {
        level: 'degraded',
        affectedServices: openCircuits,
        message:
          'Payment processing temporarily unavailable. Other features work normally.',
        allowedOperations: ['browse', 'chat', 'view-moments', 'create-moments'],
      };
    }

    if (criticalAffected.includes('auth')) {
      return {
        level: 'degraded',
        affectedServices: openCircuits,
        message:
          'Authentication service experiencing issues. Existing sessions continue to work.',
        allowedOperations: ['existing-sessions', 'browse', 'read-only'],
      };
    }
  }

  // Non-critical services degraded
  return {
    level: 'degraded',
    affectedServices: openCircuits,
    message: `Some features temporarily unavailable: ${openCircuits.join(', ')}`,
    allowedOperations: ['core-features'],
  };
}

/**
 * Create a fallback response for degraded service
 */
export function createDegradedResponse(
  serviceName: string,
  context?: Record<string, unknown>,
): Response {
  const degradation = assessDegradationLevel();

  const body = {
    success: false,
    error: {
      code: 'SERVICE_DEGRADED',
      message: `${serviceName} is temporarily unavailable. Please try again later.`,
      retryAfter: 30,
    },
    degradation: {
      level: degradation.level,
      affectedServices: degradation.affectedServices,
      allowedOperations: degradation.allowedOperations,
    },
    context,
  };

  return new Response(JSON.stringify(body), {
    status: 503,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': '30',
      'X-Degradation-Level': degradation.level,
    },
  });
}
