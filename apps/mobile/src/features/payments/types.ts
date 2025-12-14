/**
 * Payments Feature Types
 * Re-exports from global types for feature-level access
 */

export type {
  Moment,
  MomentData,
  MomentUser,
  MomentLocation,
  User,
  Transaction,
  TransactionType,
  TransactionStatus,
} from '@/types';

// UserProfile is an alias for User in this context
export type UserProfile = import('@/types').User;
