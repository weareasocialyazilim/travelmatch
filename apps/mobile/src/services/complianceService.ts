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
 * @param currency - Currency code (default: TRY)
 */
export const checkUserLimits = async (
  category: 'send' | 'receive' | 'withdraw' | 'moment_create' | 'gift_per_moment',
  amount?: number,
  currency: CurrencyCode = 'TRY'
): Promise<LimitCheckResult> => {
  const { data, error } = await supabase.rpc('check_user_limits', {
    p_user_id: (await supabase.auth.getUser()).data.user?.id,
    p_category: category,
    p_amount: amount ?? null,
    p_currency: currency,
  });

  if (error) {
    console.error('Error checking user limits:', error);
    throw new Error(error.message);
  }

  return data as LimitCheckResult;
};

/**
 * Check contribution limit for a specific moment
 * @param momentId - The moment UUID
 * @param amount - Contribution amount
 */
export const checkMomentContributionLimit = async (
  momentId: string,
  amount: number
): Promise<ContributionLimitResult> => {
  const { data, error } = await supabase.rpc('check_moment_contribution_limit', {
    p_moment_id: momentId,
    p_user_id: (await supabase.auth.getUser()).data.user?.id,
    p_amount: amount,
  });

  if (error) {
    console.error('Error checking contribution limit:', error);
    throw new Error(error.message);
  }

  return data as ContributionLimitResult;
};

/**
 * Check if user can create a new moment
 */
export const checkMomentCreationLimit = async (): Promise<MomentCreationLimitResult> => {
  const { data, error } = await supabase.rpc('check_moment_creation_limit', {
    p_user_id: (await supabase.auth.getUser()).data.user?.id,
  });

  if (error) {
    console.error('Error checking moment creation limit:', error);
    throw new Error(error.message);
  }

  return data as MomentCreationLimitResult;
};

// ============================================
// Transaction Compliance (AML/Fraud)
// ============================================

/**
 * Full compliance check for a transaction (AML + Fraud + Limits)
 * Should be called before processing any payment
 */
export const checkTransactionCompliance = async (
  amount: number,
  currency: CurrencyCode,
  transactionType: 'send' | 'receive' | 'withdraw',
  recipientId?: string
): Promise<ComplianceCheckResult> => {
  const { data, error } = await supabase.rpc('check_transaction_compliance', {
    p_user_id: (await supabase.auth.getUser()).data.user?.id,
    p_amount: amount,
    p_currency: currency,
    p_transaction_type: transactionType,
    p_recipient_id: recipientId ?? null,
    p_metadata: {},
  });

  if (error) {
    console.error('Error checking transaction compliance:', error);
    throw new Error(error.message);
  }

  return data as ComplianceCheckResult;
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
  scan_ref: string | null;
  document_country: string | null;
  document_type: string | null;
}

/**
 * Get user's KYC verification status
 */
export const getKycStatus = async (): Promise<KycStatus | null> => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from('kyc_verifications')
    .select('status, scan_ref, document_country, document_type')
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
  return result.kyc_required || result.warnings.some((w) => w.type === 'kyc_prompt');
};
