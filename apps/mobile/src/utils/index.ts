/**
 * Utils Index
 * Export all utility modules
 */

export * from './appErrors';
export * from './logger';
export * from './secureStorage';
export * from './validation';
export * from './accessibility';
export * from './animations';

// Error Handling (excluding duplicates from appErrors)
export {
  ErrorHandler,
  standardizeError,
  useErrorHandler,
  withErrorHandling,
  retryWithErrorHandling,
  ErrorSeverity,
  USER_FRIENDLY_MESSAGES,
  ERROR_RECOVERY_SUGGESTIONS,
} from './errorHandler';
export type { StandardizedError, UseErrorHandlerReturn } from './errorHandler';

// Performance
export * from './performance';

// Rate Limiter (RateLimitError excluded - use from appErrors instead)
export {
  checkRateLimit,
  withRateLimit,
  resetRateLimit,
  resetAllRateLimits,
  getRateLimitStatus,
  DebouncedRateLimiter,
  RATE_LIMIT_CONFIGS,
} from './rateLimiter';

// Circuit Breaker
export {
  CircuitBreaker,
  CircuitBreakerError,
  CircuitState,
  circuitBreakerRegistry,
  ServiceBreakers,
} from './circuitBreaker';
export type { CircuitBreakerConfig } from './circuitBreaker';
