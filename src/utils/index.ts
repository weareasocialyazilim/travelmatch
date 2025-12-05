/**
 * Utils Index
 * Export all utility modules
 */

export * from './api';
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

// Accessibility Audit
export {
  AccessibilityAuditor,
  useAccessibilityAudit,
  A11ySeverity,
  A11yIssueType,
} from './accessibilityAudit';
export type { A11yIssue, A11yAuditResult } from './accessibilityAudit';

// Bundle Optimization
export {
  BundleSizeAnalyzer,
  useDynamicImport,
  DEFAULT_IMAGE_CONFIG,
  HIGH_QUALITY_IMAGE_CONFIG,
  THUMBNAIL_IMAGE_CONFIG,
} from './bundleOptimization';
export type {
  BundleSizeMetrics,
  OptimizationRecommendation,
  ImageOptimizationConfig,
} from './bundleOptimization';

// Rate Limiter
export {
  checkRateLimit,
  withRateLimit,
  resetRateLimit,
  resetAllRateLimits,
  getRateLimitStatus,
  RateLimitError,
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
