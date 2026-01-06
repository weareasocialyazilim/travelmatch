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
