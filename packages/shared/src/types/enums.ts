/**
 * Unified Status Enums
 *
 * SINGLE SOURCE OF TRUTH for status types across admin, mobile, and backend.
 * These enums ensure consistency between all applications in the TravelMatch platform.
 *
 * IMPORTANT: When updating these enums, ensure database migrations are created
 * to add/modify corresponding CHECK constraints.
 */

// ============================================
// USER STATUS TYPES
// ============================================

/**
 * User account status
 * Used by admin panel for user management actions
 */
export type UserStatus = 'active' | 'suspended' | 'banned' | 'pending' | 'deleted';

/**
 * User account status values (for runtime validation)
 */
export const USER_STATUS_VALUES: readonly UserStatus[] = [
  'active',
  'suspended',
  'banned',
  'pending',
  'deleted',
] as const;

/**
 * KYC verification status
 * Used for identity verification state
 *
 * NOTE: Database uses lowercase values ('not_started', 'pending', 'verified', 'rejected')
 * Mobile legacy types use PascalCase ('Unverified', 'Pending', 'Verified')
 * New code should use these lowercase values.
 */
export type KYCStatus = 'not_started' | 'pending' | 'verified' | 'rejected';

/**
 * KYC status values (for runtime validation)
 */
export const KYC_STATUS_VALUES: readonly KYCStatus[] = [
  'not_started',
  'pending',
  'verified',
  'rejected',
] as const;

/**
 * Legacy KYC status mapping (mobile compatibility)
 * @deprecated Use KYCStatus directly
 */
export type LegacyKYCStatus = 'Unverified' | 'Pending' | 'Verified';

/**
 * Map legacy KYC status to new format
 */
export function mapLegacyKYCStatus(legacy: LegacyKYCStatus): KYCStatus {
  const mapping: Record<LegacyKYCStatus, KYCStatus> = {
    'Unverified': 'not_started',
    'Pending': 'pending',
    'Verified': 'verified',
  };
  return mapping[legacy];
}

/**
 * Map new KYC status to legacy format (for mobile backward compatibility)
 */
export function mapKYCStatusToLegacy(status: KYCStatus): LegacyKYCStatus {
  const mapping: Record<KYCStatus, LegacyKYCStatus> = {
    'not_started': 'Unverified',
    'pending': 'Pending',
    'verified': 'Verified',
    'rejected': 'Unverified', // No direct mapping, treat as unverified
  };
  return mapping[status];
}

// ============================================
// MOMENT STATUS TYPES
// ============================================

/**
 * Moment lifecycle status
 * Tracks the lifecycle state of a moment
 */
export type MomentLifecycleStatus = 'draft' | 'active' | 'full' | 'paused' | 'completed' | 'cancelled' | 'deleted';

/**
 * Moment lifecycle status values
 */
export const MOMENT_LIFECYCLE_STATUS_VALUES: readonly MomentLifecycleStatus[] = [
  'draft',
  'active',
  'full',
  'paused',
  'completed',
  'cancelled',
  'deleted',
] as const;

/**
 * Moment moderation status
 * Used by admin panel for content moderation
 */
export type MomentModerationStatus = 'pending_review' | 'approved' | 'rejected' | 'flagged';

/**
 * Moment moderation status values
 */
export const MOMENT_MODERATION_STATUS_VALUES: readonly MomentModerationStatus[] = [
  'pending_review',
  'approved',
  'rejected',
  'flagged',
] as const;

// ============================================
// TRANSACTION TYPES
// ============================================

/**
 * Transaction type
 * Unified transaction type across all platforms
 */
export type TransactionType =
  | 'gift'       // User-to-user gift
  | 'deposit'    // Money added to wallet
  | 'withdrawal' // Money withdrawn from wallet
  | 'refund'     // Refund of a previous transaction
  | 'payment'    // Direct payment (admin view)
  | 'payout'     // Payout to creator (admin view)
  | 'fee'        // Platform fee
  | 'commission'; // Creator commission

/**
 * Transaction type values
 */
export const TRANSACTION_TYPE_VALUES: readonly TransactionType[] = [
  'gift',
  'deposit',
  'withdrawal',
  'refund',
  'payment',
  'payout',
  'fee',
  'commission',
] as const;

/**
 * Transaction status
 * Unified transaction status across all platforms
 */
export type TransactionStatus =
  | 'pending'     // Awaiting processing
  | 'processing'  // Currently being processed
  | 'completed'   // Successfully completed
  | 'failed'      // Failed to process
  | 'cancelled'   // Cancelled by user/admin
  | 'refunded';   // Refunded (subset of completed)

/**
 * Transaction status values
 */
export const TRANSACTION_STATUS_VALUES: readonly TransactionStatus[] = [
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
  'refunded',
] as const;

// ============================================
// PROOF TYPES
// ============================================

/**
 * Proof type
 * Unified proof type across all platforms
 */
export type ProofType =
  | 'photo'              // Photo evidence
  | 'receipt'            // Receipt/invoice
  | 'geo'                // Geolocation proof
  | 'ticket_qr'          // QR code ticket
  | 'delivery'           // Delivery confirmation
  | 'experience'         // Experience completion
  | 'micro-kindness'     // Micro-kindness act
  | 'verified-experience'// Verified experience
  | 'community-proof'    // Community-verified
  | 'milestone'          // Milestone achievement
  | 'custom';            // Custom proof type

/**
 * Proof type values
 */
export const PROOF_TYPE_VALUES: readonly ProofType[] = [
  'photo',
  'receipt',
  'geo',
  'ticket_qr',
  'delivery',
  'experience',
  'micro-kindness',
  'verified-experience',
  'community-proof',
  'milestone',
  'custom',
] as const;

/**
 * Proof verification status
 */
export type ProofStatus = 'pending' | 'verified' | 'rejected' | 'failed' | 'expired';

/**
 * Proof status values
 */
export const PROOF_STATUS_VALUES: readonly ProofStatus[] = [
  'pending',
  'verified',
  'rejected',
  'failed',
  'expired',
] as const;

// ============================================
// ESCROW TYPES
// ============================================

/**
 * Escrow status
 */
export type EscrowStatus =
  | 'pending'        // Payment received, awaiting action
  | 'held'           // Funds held in escrow
  | 'released'       // Funds released to recipient
  | 'refunded'       // Funds refunded to sender
  | 'disputed'       // Under dispute
  | 'cancelled';     // Cancelled before completion

/**
 * Escrow status values
 */
export const ESCROW_STATUS_VALUES: readonly EscrowStatus[] = [
  'pending',
  'held',
  'released',
  'refunded',
  'disputed',
  'cancelled',
] as const;

// ============================================
// DISPUTE TYPES
// ============================================

/**
 * Dispute status
 */
export type DisputeStatus =
  | 'open'          // Newly opened
  | 'investigating' // Being investigated
  | 'resolved'      // Resolved
  | 'dismissed'     // Dismissed (no action)
  | 'escalated';    // Escalated to higher authority

/**
 * Dispute status values
 */
export const DISPUTE_STATUS_VALUES: readonly DisputeStatus[] = [
  'open',
  'investigating',
  'resolved',
  'dismissed',
  'escalated',
] as const;

/**
 * Dispute type
 */
export type DisputeType =
  | 'scam'
  | 'harassment'
  | 'inappropriate'
  | 'spam'
  | 'payment'
  | 'quality'
  | 'other';

/**
 * Dispute type values
 */
export const DISPUTE_TYPE_VALUES: readonly DisputeType[] = [
  'scam',
  'harassment',
  'inappropriate',
  'spam',
  'payment',
  'quality',
  'other',
] as const;

// ============================================
// NOTIFICATION TYPES
// ============================================

/**
 * Admin-triggered notification types
 */
export type AdminNotificationType =
  | 'account_banned'
  | 'account_suspended'
  | 'account_reinstated'
  | 'moment_approved'
  | 'moment_rejected'
  | 'proof_verified'
  | 'proof_rejected'
  | 'refund_processed'
  | 'dispute_opened'
  | 'dispute_resolved'
  | 'kyc_approved'
  | 'kyc_rejected'
  | 'payout_completed'
  | 'payout_failed'
  | 'thank_you_message';

/**
 * Admin notification type values
 */
export const ADMIN_NOTIFICATION_TYPE_VALUES: readonly AdminNotificationType[] = [
  'account_banned',
  'account_suspended',
  'account_reinstated',
  'moment_approved',
  'moment_rejected',
  'proof_verified',
  'proof_rejected',
  'refund_processed',
  'dispute_opened',
  'dispute_resolved',
  'kyc_approved',
  'kyc_rejected',
  'payout_completed',
  'payout_failed',
  'thank_you_message',
] as const;

// ============================================
// TYPE GUARDS
// ============================================

export function isUserStatus(value: string): value is UserStatus {
  return USER_STATUS_VALUES.includes(value as UserStatus);
}

export function isKYCStatus(value: string): value is KYCStatus {
  return KYC_STATUS_VALUES.includes(value as KYCStatus);
}

export function isMomentLifecycleStatus(value: string): value is MomentLifecycleStatus {
  return MOMENT_LIFECYCLE_STATUS_VALUES.includes(value as MomentLifecycleStatus);
}

export function isMomentModerationStatus(value: string): value is MomentModerationStatus {
  return MOMENT_MODERATION_STATUS_VALUES.includes(value as MomentModerationStatus);
}

export function isTransactionType(value: string): value is TransactionType {
  return TRANSACTION_TYPE_VALUES.includes(value as TransactionType);
}

export function isTransactionStatus(value: string): value is TransactionStatus {
  return TRANSACTION_STATUS_VALUES.includes(value as TransactionStatus);
}

export function isProofType(value: string): value is ProofType {
  return PROOF_TYPE_VALUES.includes(value as ProofType);
}

export function isProofStatus(value: string): value is ProofStatus {
  return PROOF_STATUS_VALUES.includes(value as ProofStatus);
}

export function isEscrowStatus(value: string): value is EscrowStatus {
  return ESCROW_STATUS_VALUES.includes(value as EscrowStatus);
}

export function isDisputeStatus(value: string): value is DisputeStatus {
  return DISPUTE_STATUS_VALUES.includes(value as DisputeStatus);
}
