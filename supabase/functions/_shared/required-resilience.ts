/**
 * Required Resilience Middleware
 *
 * This module enforces resilience patterns on all Edge Function handlers.
 * Circuit breaker, timeout, and graceful degradation are MANDATORY.
 *
 * Usage:
 * ```ts
 * import { createResilientHandler } from '../_shared/required-resilience.ts';
 *
 * // Instead of:
 * serve(async (req) => { ... });
 *
 * // Use:
 * serve(createResilientHandler('my-function', async (req, ctx) => {
 *   // Your handler logic
 * }));
 * ```
 *
 * @module required-resilience
 */

import {
  withResilience,
  ResilienceOptions,
  SystemDashboard,
} from './resilience.ts';
import { circuitBreakerRegistry } from './circuit-breaker.ts';
import { createLogger } from './logger.ts';
import { handleCors } from './cors.ts';
import { rateLimit } from './rateLimit.ts';
import { securityHeaders } from './security-middleware.ts';

const logger = createLogger('required-resilience');

// =============================================================================
// TYPES
// =============================================================================

export interface HandlerContext {
  /** Unique request ID */
  requestId: string;
  /** Request start time */
  startTime: number;
  /** Service name (for circuit breaker) */
  serviceName: string;
  /** Original request */
  request: Request;
}

export type ResilientHandler = (
  req: Request,
  ctx: HandlerContext,
) => Promise<Response>;

export interface ResilientHandlerOptions {
  /** Timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Enable rate limiting (default: true) */
  enableRateLimit?: boolean;
  /** Rate limit per minute (default: 100) */
  rateLimitPerMinute?: number;
  /** Fallback response when service is unavailable */
  fallbackResponse?: Response;
  /** Circuit breaker config */
  circuitConfig?: {
    failureThreshold?: number;
    resetTimeoutMs?: number;
  };
  /** Skip resilience for health checks */
  skipResilienceForPaths?: string[];
}

// =============================================================================
// DEFAULT OPTIONS
// =============================================================================

const DEFAULT_OPTIONS: Required<ResilientHandlerOptions> = {
  timeout: 30000,
  enableRateLimit: true,
  rateLimitPerMinute: 100,
  fallbackResponse: new Response(
    JSON.stringify({
      error: 'Service temporarily unavailable',
      message: 'Please try again later',
      retryAfter: 30,
    }),
    {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '30',
      },
    },
  ),
  circuitConfig: {
    failureThreshold: 5,
    resetTimeoutMs: 30000,
  },
  skipResilienceForPaths: ['/health', '/ready', '/metrics'],
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function isHealthCheckPath(url: URL, skipPaths: string[]): boolean {
  return skipPaths.some((path) => url.pathname.endsWith(path));
}

// =============================================================================
// MAIN EXPORT: createResilientHandler
// =============================================================================

/**
 * Create a resilient Edge Function handler with mandatory protections:
 * - Circuit breaker
 * - Timeout
 * - Rate limiting
 * - CORS handling
 * - Security headers
 * - Request logging
 *
 * @param serviceName - Name for circuit breaker tracking
 * @param handler - Your handler function
 * @param options - Configuration options
 */
export function createResilientHandler(
  serviceName: string,
  handler: ResilientHandler,
  options: ResilientHandlerOptions = {},
): (req: Request) => Promise<Response> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Ensure circuit breaker is registered
  circuitBreakerRegistry.get(serviceName);

  return async (req: Request): Promise<Response> => {
    const requestId = generateRequestId();
    const startTime = Date.now();
    const url = new URL(req.url);

    // Add request ID to logs
    logger.info(`[${requestId}] ${req.method} ${url.pathname}`, {
      service: serviceName,
    });

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return handleCors(req) || new Response(null, { status: 204 });
    }

    // Skip resilience for health checks
    if (isHealthCheckPath(url, opts.skipResilienceForPaths)) {
      return handler(req, { requestId, startTime, serviceName, request: req });
    }

    // Rate limiting check
    if (opts.enableRateLimit) {
      const rateLimitResult = await rateLimit(req, {
        limit: opts.rateLimitPerMinute,
        window: 60,
      });
      if (rateLimitResult) {
        logger.warn(`[${requestId}] Rate limited`, { service: serviceName });
        return rateLimitResult;
      }
    }

    // Create context
    const ctx: HandlerContext = {
      requestId,
      startTime,
      serviceName,
      request: req,
    };

    try {
      // Execute with resilience wrapper
      const response = await withResilience<Response>(
        serviceName,
        () => handler(req, ctx),
        {
          timeout: opts.timeout,
          fallback: () => opts.fallbackResponse,
          context: { requestId, path: url.pathname },
          circuitConfig: opts.circuitConfig,
        },
      );

      // Add security headers and request ID
      const finalResponse = new Response(response.body, response);
      finalResponse.headers.set('X-Request-ID', requestId);

      // Apply security headers
      const securedResponse = securityHeaders(finalResponse);

      // Log completion
      const duration = Date.now() - startTime;
      logger.info(`[${requestId}] Completed in ${duration}ms`, {
        service: serviceName,
        status: securedResponse.status,
        duration,
      });

      return securedResponse;
    } catch (error) {
      // This should rarely happen as withResilience handles errors
      logger.error(`[${requestId}] Unhandled error`, error as Error, {
        service: serviceName,
      });

      return new Response(
        JSON.stringify({
          error: 'Internal server error',
          requestId,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': requestId,
          },
        },
      );
    }
  };
}

// =============================================================================
// HEALTH CHECK HANDLER
// =============================================================================

/**
 * Standard health check handler that reports circuit breaker states
 */
export function createHealthHandler(
  serviceName: string,
): (req: Request) => Promise<Response> {
  return async (_req: Request): Promise<Response> => {
    const circuitStats = circuitBreakerRegistry.get(serviceName).getStats();

    const health = {
      status: circuitStats.state === 'CLOSED' ? 'healthy' : 'degraded',
      service: serviceName,
      timestamp: new Date().toISOString(),
      circuit: {
        state: circuitStats.state,
        failures: circuitStats.failures,
        successes: circuitStats.successes,
      },
    };

    return new Response(JSON.stringify(health), {
      status: health.status === 'healthy' ? 200 : 503,
      headers: { 'Content-Type': 'application/json' },
    });
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  withResilience,
  circuitBreakerRegistry,
  type SystemDashboard,
  type ResilienceOptions,
};
