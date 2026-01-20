/**
 * Type Adapters
 *
 * Utility functions to convert between different type definitions
 * used by admin panel, mobile app, and database.
 *
 * These adapters ensure data consistency when passing data between
 * different parts of the Lovendo platform.
 */

import type {
  UserStatus,
  KYCStatus,
  LegacyKYCStatus,
  MomentLifecycleStatus,
  MomentModerationStatus,
  TransactionStatus,
  ProofType,
} from '../types/enums';
import { mapLegacyKYCStatus, mapKYCStatusToLegacy } from '../types/enums';

// ============================================
// USER TYPE ADAPTERS
// ============================================

/**
 * Admin User interface (from admin panel)
 */
export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  display_name: string | null;
  avatar_url: string | null;
  status: UserStatus;
  kyc_status: KYCStatus;
  balance: number;
  total_trips: number;
  rating: number;
  created_at: string;
  last_active_at: string | null;
}

/**
 * Mobile User interface (legacy format)
 */
export interface MobileUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string | null;
  kyc: LegacyKYCStatus;
  kycStatus?: KYCStatus;
  status?: UserStatus;
  isBanned?: boolean;
  isSuspended?: boolean;
  banReason?: string;
  suspensionReason?: string;
  suspensionEndsAt?: string;
  trustScore?: number | null;
  isVerified?: boolean | null;
}

/**
 * Database User Row
 */
export interface DbUserRow {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  kyc_status: string | null;
  status: string | null;
  is_banned: boolean | null;
  is_suspended: boolean | null;
  ban_reason: string | null;
  suspension_reason: string | null;
  suspension_ends_at: string | null;
  verified: boolean | null;
  rating: number | null;
  balance: number | null;
}

/**
 * Convert admin user to mobile user format
 */
export function adminUserToMobileUser(adminUser: AdminUser): MobileUser {
  return {
    id: adminUser.id,
    name: adminUser.full_name,
    email: adminUser.email,
    avatar: adminUser.avatar_url,
    kyc: mapKYCStatusToLegacy(adminUser.kyc_status),
    kycStatus: adminUser.kyc_status,
    status: adminUser.status,
    isBanned: adminUser.status === 'banned',
    isSuspended: adminUser.status === 'suspended',
    trustScore: adminUser.rating,
    isVerified: adminUser.kyc_status === 'verified',
  };
}

/**
 * Convert mobile user to admin user format
 */
export function mobileUserToAdminUser(
  mobileUser: MobileUser,
  defaults?: Partial<AdminUser>,
): AdminUser {
  return {
    id: mobileUser.id,
    email: mobileUser.email || '',
    full_name: mobileUser.name,
    display_name: null,
    avatar_url: mobileUser.avatar || null,
    status:
      mobileUser.status ||
      (mobileUser.isBanned
        ? 'banned'
        : mobileUser.isSuspended
          ? 'suspended'
          : 'active'),
    kyc_status: mobileUser.kycStatus || mapLegacyKYCStatus(mobileUser.kyc),
    balance: defaults?.balance || 0,
    total_trips: defaults?.total_trips || 0,
    rating: mobileUser.trustScore || defaults?.rating || 0,
    created_at: defaults?.created_at || new Date().toISOString(),
    last_active_at: defaults?.last_active_at || null,
  };
}

/**
 * Convert database user row to mobile user format
 */
export function dbUserToMobileUser(dbUser: DbUserRow): MobileUser {
  const kycStatus = (dbUser.kyc_status as KYCStatus) || 'not_started';
  return {
    id: dbUser.id,
    name: dbUser.full_name,
    email: dbUser.email,
    avatar: dbUser.avatar_url,
    kyc: mapKYCStatusToLegacy(kycStatus),
    kycStatus: kycStatus,
    status: (dbUser.status as UserStatus) || 'active',
    isBanned: dbUser.is_banned || false,
    isSuspended: dbUser.is_suspended || false,
    banReason: dbUser.ban_reason || undefined,
    suspensionReason: dbUser.suspension_reason || undefined,
    suspensionEndsAt: dbUser.suspension_ends_at || undefined,
    trustScore: dbUser.rating,
    isVerified: dbUser.verified,
  };
}

/**
 * Convert database user row to admin user format
 */
export function dbUserToAdminUser(dbUser: DbUserRow): AdminUser {
  return {
    id: dbUser.id,
    email: dbUser.email,
    full_name: dbUser.full_name,
    display_name: null,
    avatar_url: dbUser.avatar_url,
    status: (dbUser.status as UserStatus) || 'active',
    kyc_status: (dbUser.kyc_status as KYCStatus) || 'not_started',
    balance: dbUser.balance || 0,
    total_trips: 0, // Not in DB row, needs separate query
    rating: dbUser.rating || 0,
    created_at: '', // Not in partial type
    last_active_at: null,
  };
}

// ============================================
// MOMENT TYPE ADAPTERS
// ============================================

/**
 * Admin Moment interface
 */
export interface AdminMoment {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: MomentLifecycleStatus;
  moderation_status: MomentModerationStatus;
  moderation_notes: string | null;
  moderated_by: string | null;
  moderated_at: string | null;
  created_at: string;
}

/**
 * Mobile Moment interface (legacy format)
 */
export interface MobileMoment {
  id: string;
  userId?: string;
  title: string;
  story?: string;
  description?: string;
  status?: MomentLifecycleStatus;
  moderationStatus?: MomentModerationStatus;
}

/**
 * Convert admin moment to mobile format
 */
export function adminMomentToMobileMoment(
  adminMoment: AdminMoment,
): MobileMoment {
  return {
    id: adminMoment.id,
    userId: adminMoment.user_id,
    title: adminMoment.title,
    description: adminMoment.description || undefined,
    story: adminMoment.description || undefined,
    status: adminMoment.status,
    moderationStatus: adminMoment.moderation_status,
  };
}

/**
 * Get combined moment status for display
 * Moderation status takes precedence over lifecycle status
 */
export function getMomentDisplayStatus(
  lifecycleStatus: MomentLifecycleStatus,
  moderationStatus: MomentModerationStatus,
): string {
  // If not approved, show moderation status
  if (moderationStatus === 'rejected') {
    return 'rejected';
  }
  if (moderationStatus === 'pending_review') {
    return 'pending_review';
  }
  if (moderationStatus === 'flagged') {
    return 'flagged';
  }

  // Otherwise show lifecycle status
  return lifecycleStatus;
}

// ============================================
// TRANSACTION TYPE ADAPTERS
// ============================================

/**
 * Admin Transaction interface
 */
export interface AdminTransaction {
  id: string;
  user_id: string;
  type: 'payment' | 'payout' | 'refund' | 'fee';
  amount: number;
  currency: string;
  status: TransactionStatus;
  provider_id: string | null;
  created_at: string;
}

/**
 * Mobile Transaction interface
 */
export interface MobileTransaction {
  id: string;
  type: 'gift' | 'withdrawal' | 'refund' | 'deposit';
  status: TransactionStatus;
  amount: number;
  currency?: string | null;
  createdAt: string | null;
}

/**
 * Map admin transaction type to mobile type
 */
export function mapAdminToMobileTransactionType(
  adminType: AdminTransaction['type'],
): MobileTransaction['type'] {
  const mapping: Record<AdminTransaction['type'], MobileTransaction['type']> = {
    payment: 'gift',
    payout: 'withdrawal',
    refund: 'refund',
    fee: 'deposit', // Fee doesn't have a direct mapping, default to deposit
  };
  return mapping[adminType];
}

/**
 * Map mobile transaction type to admin type
 */
export function mapMobileToAdminTransactionType(
  mobileType: MobileTransaction['type'],
): AdminTransaction['type'] {
  const mapping: Record<MobileTransaction['type'], AdminTransaction['type']> = {
    gift: 'payment',
    withdrawal: 'payout',
    refund: 'refund',
    deposit: 'payment',
  };
  return mapping[mobileType];
}

/**
 * Convert admin transaction to mobile format
 */
export function adminTransactionToMobileTransaction(
  adminTx: AdminTransaction,
): MobileTransaction {
  return {
    id: adminTx.id,
    type: mapAdminToMobileTransactionType(adminTx.type),
    status: adminTx.status,
    amount: adminTx.amount,
    currency: adminTx.currency,
    createdAt: adminTx.created_at,
  };
}

// ============================================
// PROOF TYPE ADAPTERS
// ============================================

/**
 * Map extended mobile proof types to shared proof types
 */
export function mapMobileToSharedProofType(mobileType: string): ProofType {
  // Mobile-specific types map to generic types
  const mapping: Record<string, ProofType> = {
    photo: 'photo',
    receipt: 'receipt',
    geo: 'custom',
    ticket_qr: 'custom',
    delivery: 'custom',
    experience: 'verified-experience',
    'micro-kindness': 'micro-kindness',
    'verified-experience': 'verified-experience',
    'community-proof': 'community-proof',
    milestone: 'milestone',
    custom: 'custom',
  };
  return mapping[mobileType] || 'custom';
}

// ============================================
// KYC STATUS ADAPTERS (Re-export for convenience)
// ============================================

export { mapLegacyKYCStatus, mapKYCStatusToLegacy };

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Type guard to check if user is MobileUser
 */
function isMobileUser(user: MobileUser | DbUserRow): user is MobileUser {
  return 'isBanned' in user || 'name' in user;
}

/**
 * Check if a user is restricted (banned or suspended)
 */
export function isUserRestricted(user: MobileUser | DbUserRow): boolean {
  if (isMobileUser(user)) {
    return user.isBanned === true || user.isSuspended === true;
  }
  return user.is_banned === true || user.is_suspended === true;
}

/**
 * Get restriction reason for a user
 */
export function getRestrictionReason(
  user: MobileUser | DbUserRow,
): string | undefined {
  if (isMobileUser(user)) {
    if (user.isBanned) return user.banReason;
    if (user.isSuspended) return user.suspensionReason;
    return undefined;
  }
  if (user.is_banned) return user.ban_reason || undefined;
  if (user.is_suspended) return user.suspension_reason || undefined;
  return undefined;
}

/**
 * Get restriction end date (for suspensions)
 */
export function getRestrictionEndDate(
  user: MobileUser | DbUserRow,
): string | undefined {
  if (isMobileUser(user)) {
    return user.isSuspended ? user.suspensionEndsAt : undefined;
  }
  return user.is_suspended ? user.suspension_ends_at || undefined : undefined;
}
