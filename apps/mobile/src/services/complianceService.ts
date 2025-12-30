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
import { logger } from '../utils/production-logger';
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
 *
 * Calls the check_user_limits RPC function in the database which checks:
 * - Plan-based limits (passport/first_class/concierge)
 * - User type limits (new/standard/verified)
 * - KYC thresholds
 */
export const checkUserLimits = async (
  category:
    | 'send'
    | 'receive'
    | 'withdraw'
    | 'moment_create'
    | 'gift_per_moment',
  amount?: number,
  currency: CurrencyCode = 'TRY',
): Promise<LimitCheckResult> => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) {
    return {
      allowed: false,
      plan_id: 'passport',
      user_type: 'new',
      kyc_status: 'none',
      kyc_required: false,
      kyc_reason: null,
      block_reason: 'User not authenticated',
      warnings: [],
      upgrade_available: false,
    };
  }

  try {
    const { data, error } = await supabase.rpc('check_user_limits', {
      p_user_id: userId,
      p_category: category,
      p_amount: amount ?? null,
      p_currency: currency,
    });

    if (error) {
      logger.error('check_user_limits RPC error', error);
      // Return permissive fallback on error to not block transactions
      return {
        allowed: true,
        plan_id: 'passport',
        user_type: 'standard',
        kyc_status: 'none',
        kyc_required: false,
        kyc_reason: null,
        block_reason: null,
        warnings: [{ type: 'rpc_error', message: 'Could not verify limits' }],
        upgrade_available: true,
      };
    }

    return {
      allowed: data.allowed ?? true,
      plan_id: data.plan_id ?? 'passport',
      user_type: data.user_type ?? 'standard',
      kyc_status: data.kyc_status ?? 'none',
      kyc_required: data.kyc_required ?? false,
      kyc_reason: data.kyc_reason ?? null,
      block_reason: data.block_reason ?? null,
      warnings: data.warnings ?? [],
      upgrade_available: data.upgrade_available ?? true,
    };
  } catch (err) {
    logger.error('check_user_limits unexpected error', err);
    return {
      allowed: true,
      plan_id: 'passport',
      user_type: 'standard',
      kyc_status: 'none',
      kyc_required: false,
      kyc_reason: null,
      block_reason: null,
      warnings: [],
      upgrade_available: true,
    };
  }
};

/**
 * Check contribution limit for a specific moment
 * @param momentId - The moment UUID
 * @param amount - Contribution amount
 *
 * Calls check_moment_contribution_limit RPC function which checks:
 * - Per-user contribution count to this moment
 * - Per-user total contribution amount to this moment
 * - Plan-based limits (passport/first_class/concierge)
 */
export const checkMomentContributionLimit = async (
  momentId: string,
  amount: number,
): Promise<ContributionLimitResult> => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) {
    return {
      allowed: false,
      reason: 'User not authenticated',
      current_count: 0,
      current_total: 0,
    };
  }

  try {
    const { data, error } = await supabase.rpc('check_moment_contribution_limit', {
      p_moment_id: momentId,
      p_user_id: userId,
      p_amount: amount,
    });

    if (error) {
      logger.error('check_moment_contribution_limit RPC error', error);
      // Allow on error to not block transactions
      return {
        allowed: true,
        current_count: 0,
        current_total: 0,
      };
    }

    return {
      allowed: data.allowed ?? true,
      reason: data.reason,
      current_count: data.current_count ?? 0,
      current_total: data.current_total ?? 0,
      max_count: data.max_count,
      max_total: data.max_total,
      remaining_count: data.remaining_count,
      remaining_amount: data.remaining ?? data.remaining_amount,
    };
  } catch (err) {
    logger.error('check_moment_contribution_limit unexpected error', err);
    return {
      allowed: true,
      current_count: 0,
      current_total: 0,
    };
  }
};

/**
 * Check if user can create a new moment
 *
 * Calls check_moment_creation_limit RPC function which checks:
 * - Daily moment creation count
 * - Monthly moment creation count
 * - Plan-based limits (passport: 3/month, first_class: 15/month, concierge: unlimited)
 */
export const checkMomentCreationLimit =
  async (): Promise<MomentCreationLimitResult> => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) {
      return {
        allowed: false,
        reason: 'User not authenticated',
        daily_count: 0,
        daily_limit: 0,
        monthly_count: 0,
        monthly_limit: 0,
        plan_id: 'passport',
      };
    }

    try {
      const { data, error } = await supabase.rpc('check_moment_creation_limit', {
        p_user_id: userId,
      });

      if (error) {
        logger.error('check_moment_creation_limit RPC error', error);
        // Allow on error to not block moment creation
        return {
          allowed: true,
          daily_count: 0,
          daily_limit: 10,
          monthly_count: 0,
          monthly_limit: 100,
          plan_id: 'passport',
        };
      }

      return {
        allowed: data.allowed ?? true,
        reason: data.reason,
        daily_count: data.daily_count ?? 0,
        daily_limit: data.daily_limit,
        monthly_count: data.monthly_count ?? 0,
        monthly_limit: data.monthly_limit,
        plan_id: data.plan_id ?? 'passport',
      };
    } catch (err) {
      logger.error('check_moment_creation_limit unexpected error', err);
      return {
        allowed: true,
        daily_count: 0,
        daily_limit: 10,
        monthly_count: 0,
        monthly_limit: 100,
        plan_id: 'passport',
      };
    }
  };

// ============================================
// Transaction Compliance (AML/Fraud)
// ============================================

/**
 * Full compliance check for a transaction (AML + Fraud + Limits)
 * Should be called before processing any payment
 *
 * Combines:
 * - User limit checks via check_user_limits RPC
 * - User risk profile check
 * - KYC status verification
 */
export const checkTransactionCompliance = async (
  amount: number,
  currency: CurrencyCode,
  transactionType: 'send' | 'receive' | 'withdraw',
  _recipientId?: string,
): Promise<ComplianceCheckResult> => {
  // Check user limits first
  const limitsResult = await checkUserLimits(transactionType, amount, currency);

  // Get user risk profile
  const riskProfile = await getUserRiskProfile();

  // Combine results
  const blockReasons: string[] = [];
  const warnings: string[] = [];

  if (!limitsResult.allowed && limitsResult.block_reason) {
    blockReasons.push(limitsResult.block_reason);
  }

  if (riskProfile?.is_blocked && riskProfile.block_reason) {
    blockReasons.push(riskProfile.block_reason);
  }

  // Add warnings from limit check
  for (const warning of limitsResult.warnings) {
    warnings.push(warning.message);
  }

  // Determine overall risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (riskProfile) {
    riskLevel = riskProfile.risk_level;
  }
  if (limitsResult.kyc_required && !limitsResult.allowed) {
    riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
  }

  return {
    allowed: limitsResult.allowed && !riskProfile?.is_blocked,
    user_plan: limitsResult.plan_id,
    kyc_status: limitsResult.kyc_status,
    risk_score: riskProfile?.risk_score ?? 0,
    risk_level: riskLevel,
    requires_kyc: limitsResult.kyc_required,
    requires_review: riskLevel === 'high' || riskLevel === 'critical',
    block_reasons: blockReasons,
    warnings: warnings,
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
    logger.error('Error fetching risk profile', error);
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
    logger.error('Error fetching KYC status', error);
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
