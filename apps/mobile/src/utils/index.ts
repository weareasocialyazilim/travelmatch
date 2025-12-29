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
// Export motion except useShake (already exported from animations)
export {
  SPRING,
  TIMING,
  HAPTIC,
  usePressAnimation,
  useFadeSlideUp,
  useStaggeredItem,
  usePulse,
  useShimmer,
  useSuccessBounce,
  useCleanSpark,
  useSheetAnimation,
  useCardEntrance,
  useFABAnimation,
  useSkeletonPulse,
  getSpringConfig,
  createStaggeredDelay,
  // omitting useShake to avoid duplicate
} from './motion';

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

// Rate Limiter (RateLimiterError is local to rateLimiter, use RateLimitError from appErrors for app-wide usage)
export {
  checkRateLimit,
  withRateLimit,
  resetRateLimit,
  resetAllRateLimits,
  getRateLimitStatus,
  DebouncedRateLimiter,
  RateLimiterError,
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

// SSL Pinning
export {
  requiresPinning,
  isDomainPinned,
  getPinsForDomain,
  validateSSLCertificate,
  createPinnedFetch,
  addSecurityHeaders,
  logSSLEvent,
  PINNED_ENDPOINTS,
  SECURITY_HEADERS,
} from './sslPinning';

// Device Integrity
export {
  checkDeviceIntegrity,
  isDevicePotentiallyCompromised,
  handleCompromisedDevice,
  guardSensitiveOperation,
  logIntegrityEvent,
} from './deviceIntegrity';
export type { IntegrityCheckResult, CompromisedDeviceAction } from './deviceIntegrity';
