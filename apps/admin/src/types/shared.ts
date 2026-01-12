/**
 * Re-export shared types from @travelmatch/shared
 *
 * This file provides a single import point for all shared types
 * used across the admin dashboard.
 *
 * Usage:
 * import { UserStatus, TransactionType, ... } from '@/types/shared';
 */

// Status Enums - Single Source of Truth
export {
  // User
  type UserStatus,
  USER_STATUS_VALUES,
  type KYCStatus,
  KYC_STATUS_VALUES,
  type LegacyKYCStatus,
  mapLegacyKYCStatus,
  mapKYCStatusToLegacy,

  // Moment
  type MomentLifecycleStatus,
  MOMENT_LIFECYCLE_STATUS_VALUES,
  type MomentModerationStatus,
  MOMENT_MODERATION_STATUS_VALUES,

  // Transaction
  type TransactionType,
  TRANSACTION_TYPE_VALUES,
  type TransactionStatus,
  TRANSACTION_STATUS_VALUES,

  // Proof
  type ProofType,
  PROOF_TYPE_VALUES,
  type ProofStatus,
  PROOF_STATUS_VALUES,

  // Escrow
  type EscrowStatus,
  ESCROW_STATUS_VALUES,

  // Dispute
  type DisputeStatus,
  DISPUTE_STATUS_VALUES,
  type DisputeType,
  DISPUTE_TYPE_VALUES,

  // Notifications
  type AdminNotificationType,
  ADMIN_NOTIFICATION_TYPE_VALUES,

  // Type Guards
  isUserStatus,
  isKYCStatus,
  isMomentLifecycleStatus,
  isMomentModerationStatus,
  isTransactionType,
  isTransactionStatus,
  isProofType,
  isProofStatus,
  isEscrowStatus,
  isDisputeStatus,
} from '@travelmatch/shared/types';

// Core Domain Types
export {
  type User,
  type Moment,
  type Gesture,
  type GiftItem,
  type Place,
  type MomentLocation,
  type MomentUser,
} from '@travelmatch/shared/types';

// Domain Types
export {
  type Message,
  type Proof,
  type Transaction,
  type ProofStory,
} from '@travelmatch/shared/types';
