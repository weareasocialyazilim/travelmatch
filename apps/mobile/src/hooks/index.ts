/**
 * Hooks Index
 * Export all custom hooks for easy imports
 */

export { useMessages } from './useMessages';

// Email verification hooks
export { useEmailVerification } from './useEmailVerification';
export type { EmailVerificationState } from './useEmailVerification';
export { useRequireEmailVerification } from './useRequireEmailVerification';
export { useNotifications } from './useNotifications';
export { useMoments } from './useMoments';
export type { Moment, MomentFilters, CreateMomentData } from './useMoments';
export { useDiscoverMoments } from './useDiscoverMoments';
export { useRequests } from './useRequests';
export { usePayments } from './usePayments';
export { useReviews } from './useReviews';
export { useNetwork } from './useNetwork';
export {
  useOfflineSupabase,
  withOfflineCheck,
  OfflineError,
} from './useOfflineSupabase';
export {
  useOfflineData,
  useOfflineMutation,
  useOfflineQueue,
} from './useOfflineData';

// Pagination hooks
export {
  usePagination,
  encodeCursor,
  decodeCursor,
  applyCursorToQuery,
} from './usePagination';
export type {
  PaginationMeta,
  PaginatedResponse,
  PaginationFetcher,
  UsePaginationOptions,
  UsePaginationReturn,
} from './usePagination';

// Bottom Sheet hooks
export {
  useBottomSheet,
  useMultipleBottomSheets,
  useConfirmation,
} from './useBottomSheet';
export type {
  UseBottomSheetOptions,
  UseBottomSheetReturn,
  ConfirmationOptions,
} from './useBottomSheet';

// Utility hooks
export {
  useDebounce,
  useDebouncedCallback,
  useDebounceState,
} from './useDebounce';
export {
  useThrottle,
  useThrottledCallback,
  useThrottleState,
} from './useThrottle';
export { useAsync, useAsyncCallback } from './useAsync';
export {
  usePrevious,
  usePreviousWithInitial,
  useValueChange,
  useDeepCompare,
} from './usePrevious';

// Animation hooks (Awwwards Design System)
export {
  // Spring & timing configurations
  SPRINGS,
  TIMINGS,
  // Press animations
  usePressAnimation,
  usePressOpacityAnimation,
  // Entrance animations
  useFadeIn,
  useFadeSlideUp,
  useBounceIn,
  useStaggeredItem,
  // Continuous animations
  usePulse,
  useBreathing,
  useFloating,
  useRotation,
  // Feedback animations
  useShake,
  useSuccessBounce,
  // Scroll-based animations
  useParallax,
  useFloatingAnimation,
  useSkeletonAnimation,
  // Utility functions
  createStaggerDelays,
  getSpringConfig,
  getTimingConfig,
} from './useAnimations';
export type { SpringConfig, TimingConfig } from './useAnimations';

// Legacy animation hooks (backwards compatibility)
export {
  usePressAnimation as useLegacyPressAnimation,
  useBounceAnimation,
} from './usePressAnimation';

// Feedback prompt hook
export { useFeedbackPrompt } from './useFeedbackPrompt';
