/**
 * Core Types - Mobile App
 *
 * Re-exports canonical types from @travelmatch/shared package.
 * Use adapters.ts to normalize API responses to these types.
 *
 * @see {@link @travelmatch/shared/types/core} for canonical definitions
 * @see {@link ./adapters} for API normalization functions
 */

// Re-export all core types from shared package
export type {
  Role,
  KYCStatus,
  UserLocation,
  User,
  GiftItem,
  GestureStatus,
  GestureTier,
  GestureProof,
  Gesture,
  Place,
} from '@travelmatch/shared';

/**
 * Legacy type aliases for backward compatibility
 * @deprecated Use types from @travelmatch/shared instead
 */

// UserLocation with lat/lng aliases (still supported in shared)
// No need to redefine

// Legacy Gesture state type (now consolidated in GestureStatus)
// No need to redefine
