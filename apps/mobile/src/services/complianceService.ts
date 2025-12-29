/**
 * Compliance Service
 *
 * Handles all compliance-related checks:
 * - User limits (plan-based)
 * - Transaction compliance (AML/fraud)
 * - Moment contribution limits
 * - Moment creation limits
 */

import { supabase } from './supabase';
import type { CurrencyCode } from '../constants/currencies';

// ============================================
// Types
// ============================================

export interface LimitCheckResult {
  allowed: boolean;
  plan_id: string;
  user_type: 'new' | 'standard' | 'verified';
  kyc_status: string;
  kyc_required: boolean;
  kyc_reason: string | null;
  block_reason: string | null;
  warnings: Array<{ type: string; message: string }>;
  upgrade_available: boolean;
}

export interface ContributionLimitResult {
  allowed: boolean;
  reason?: string;
  current_count: number;
  current_total: number;
  max_count?: number;
  max_total?: number;
  remaining_count?: number;
  remaining_amount?: number;
}

export interface MomentCreationLimitResult {
  allowed: boolean;
  reason?: string;
  daily_count: number;
  daily_limit: number | null;
  monthly_count: number;
  monthly_limit: number | null;
  plan_id: string;
}

export interface ComplianceCheckResult {
  allowed: boolean;
  user_plan: string;
  kyc_status: string;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  requires_kyc: boolean;
  requires_review: boolean;
  block_reasons: string[];
  warnings: string[];
}

// ============================================
// Limit Checks
// ============================================

/**
 * Check user limits before a transaction
 * @param category - 'send', 'receive', 'withdraw', 'moment_create', 'gift_per_moment'
 * @param amount - Transaction amount (optional for count-only checks)
 * @param _currency - Currency code (default: TRY) - unused until RPC is available
 *
 * Note: This is a placeholder implementation until the RPC function is created.
 * The actual check_user_limits function needs to be created in the database.
 */
export const checkUserLimits = async (
  category:
    | 'send'
    | 'receive'
    | 'withdraw'
    | 'moment_create'
    | 'gift_per_moment',
  amount?: number,
  _currency: CurrencyCode = 'TRY',
): Promise<LimitCheckResult> => {
  // Placeholder: Return allowed with no warnings until RPC is implemented
  // TODO: Implement check_user_limits RPC function in database
  console.warn(
    '[ComplianceService] check_user_limits RPC not yet implemented, allowing all',
  );

  // Basic client-side checks as fallback
  const defaultLimits: Record<typeof category, number> = {
    send: 50000,
    receive: 100000,
    withdraw: 25000,
    moment_create: 10,
    gift_per_moment: 5000,
  };

  const limit = defaultLimits[category];
  const effectiveAmount = amount ?? 0;

  return {
    allowed: effectiveAmount <= limit,
    plan_id: 'free',
    user_type: 'standard',
    kyc_status: 'none',
    kyc_required: false,
    kyc_reason: null,
    block_reason: null,
    warnings:
      effectiveAmount > limit * 0.8
        ? [{ type: 'limit_warning', message: `Approaching ${category} limit` }]
        : [],
    upgrade_available: true,
  };
};

/**
 * Check contribution limit for a specific moment
 * @param momentId - The moment UUID
 * @param amount - Contribution amount
 */
export const checkMomentContributionLimit = async (
  _momentId: string,
  amount: number,
): Promise<ContributionLimitResult> => {
  // TODO: Implement actual contribution limit check when RPC is available
  // For now, return a placeholder that allows contributions up to 50,000 TRY
  const limit = 50000;
  return {
    allowed: amount <= limit,
    current_count: 0,
    current_total: 0,
    max_count: 10,
    max_total: limit,
    remaining_count: 10,
    remaining_amount: limit,
  };
};

/**
 * Check if user can create a new moment
 */
export const checkMomentCreationLimit =
  async (): Promise<MomentCreationLimitResult> => {
    // TODO: Implement actual moment creation limit check when RPC is available
    // For now, allow users to create moments
    return {
      allowed: true,
      daily_count: 0,
      daily_limit: 10,
      monthly_count: 0,
      monthly_limit: 100,
      plan_id: 'free',
    };
  };

// ============================================
// Transaction Compliance (AML/Fraud)
// ============================================

/**
 * Full compliance check for a transaction (AML + Fraud + Limits)
 * Should be called before processing any payment
 */
export const checkTransactionCompliance = async (
  _amount: number,
  _currency: CurrencyCode,
  _transactionType: 'send' | 'receive' | 'withdraw',
  _recipientId?: string,
): Promise<ComplianceCheckResult> => {
  // TODO: Implement actual transaction compliance check when RPC is available
  // For now, return a placeholder that allows transactions
  return {
    allowed: true,
    user_plan: 'free',
    kyc_status: 'none',
    risk_score: 0,
    risk_level: 'low',
    requires_kyc: false,
    requires_review: false,
    block_reasons: [],
    warnings: [],
  };
};

// ============================================
// User Risk Profile
// ============================================

export interface UserRiskProfile {
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  flags: string[];
  is_blocked: boolean;
  block_reason: string | null;
}

/**
 * Get current user's risk profile
 */
export const getUserRiskProfile = async (): Promise<UserRiskProfile | null> => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from('user_risk_profiles')
    .select('risk_score, risk_level, flags, is_blocked, block_reason')
    .eq('user_id', userId)
    .single();

  if (error) {
    // Profile might not exist yet
    if (error.code === 'PGRST116') {
      return {
        risk_score: 0,
        risk_level: 'low',
        flags: [],
        is_blocked: false,
        block_reason: null,
      };
    }
    console.error('Error fetching risk profile:', error);
    return null;
  }

  return data as UserRiskProfile;
};

// ============================================
// KYC Status
// ============================================

export interface KycStatus {
  status: 'pending' | 'processing' | 'approved' | 'denied' | 'expired';
  provider: string | null;
  provider_id: string | null;
  confidence: number | null;
}

/**
 * Get user's KYC verification status
 */
export const getKycStatus = async (): Promise<KycStatus | null> => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from('kyc_verifications')
    .select('status, provider, provider_id, confidence')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No KYC verification yet
    }
    console.error('Error fetching KYC status:', error);
    return null;
  }

  return data as KycStatus;
};

// ============================================
// Helper Functions
// ============================================

/**
 * Format a limit check result into a user-friendly message
 */
export const formatLimitMessage = (result: LimitCheckResult): string => {
  if (result.allowed) {
    return '';
  }

  if (result.kyc_required && result.kyc_reason) {
    return result.kyc_reason;
  }

  if (result.block_reason) {
    return result.block_reason;
  }

  return 'İşlem limiti aşıldı';
};

/**
 * Check if user should be prompted for plan upgrade
 */
export const shouldPromptUpgrade = (result: LimitCheckResult): boolean => {
  return !result.allowed && result.upgrade_available && !result.kyc_required;
};

/**
 * Check if user should be prompted for KYC
 */
export const shouldPromptKyc = (result: LimitCheckResult): boolean => {
  return (
    result.kyc_required || result.warnings.some((w) => w.type === 'kyc_prompt')
  );
};
