/**
 * Hooks Index
 * Export all custom hooks for easy imports
 */

export { useMessages } from './useMessages';
export { useNotifications } from './useNotifications';
export { useMoments } from './useMoments';
export type { Moment, MomentFilters, CreateMomentData } from './useMoments';
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
export { usePagination, encodeCursor, decodeCursor, applyCursorToQuery } from './usePagination';
export type { 
  PaginationMeta, 
  PaginatedResponse, 
  PaginationFetcher,
  UsePaginationOptions,
  UsePaginationReturn 
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

// Performance hooks
export {
  usePerformanceMonitor,
  useInteractionManager,
  useWhyDidYouUpdate,
} from './usePerformanceMonitor';

// Accessibility hooks (DEFCON 3.2)
export {
  useReduceMotion,
  withReduceMotion,
} from './useReduceMotion';
export type { SpringConfig } from './useReduceMotion';

// Input hooks (DEFCON 3.1)
export { useInputMask } from './useInputMask';
export type { MaskType } from './useInputMask';

// Request cancellation hooks (DEFCON 2.7)
export {
  useAbortController,
  useAbortableFetch,
  useTimeoutPromise,
} from './useAbortController';

// Navigation gesture hooks (DEFCON 3.4)
export {
  useNavigationGesture,
  withDisabledGesture,
  GESTURE_DISABLED_SCREENS,
} from './useNavigationGesture';

// App Tracking Transparency hook (DEFCON 1.1)
export {
  useAppTrackingTransparency,
} from './useAppTrackingTransparency';
export type { TrackingStatus, ATTResult } from './useAppTrackingTransparency';
