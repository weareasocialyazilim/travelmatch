/**
 * TrustScore Service
 * Handles TrustScore calculations, limits, and financial advantages.
 * 
 * "TrustScore is no longer just a social score; it's a Credit Note that determines limits and commissions."
 */

import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';

export type UserTier = 'Free' | 'Pro' | 'Elite';

export interface TrustScoreBenefits {
  withdrawalCommission: number; // Percentage (e.g., 15, 10, 5)
  dailyLimit: number; // LVND
  canWithdraw: boolean;
  autoApproval: boolean;
}

class TrustScoreService {
  /**
   * Calculate TrustScore using the official formula:
   * TrustScore = (KYC_status * 100) + (Sub_level * 50) + sum(SuccessfulTransactions * 0.1)
   */
  async calculateTrustScore(userId: string): Promise<number> {
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('verified, coins_balance')
        .eq('id', userId)
        .single();
      
      if (userError) throw userError;

      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('plan_id, status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      const { count: transactionCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed');

      let score = 0;

      // 1. KYC status (100 if verified)
      if (user.verified) {
        score += 100;
      }

      // 2. Subscription level (Pro/Elite)
      // Note: We need to map plan_id to level. Assuming plan names for now.
      if (subscription) {
        // This mapping should be dynamic in production
        const level = await this.getSubscriptionTier(userId);
        if (level === 'Elite') score += 50;
        else if (level === 'Pro') score += 25; // Assumption for Pro
      }

      // 3. Transactions contribution (0.1 per successful txn)
      score += (transactionCount || 0) * 0.1;

      return Math.floor(score);
    } catch (error) {
      logger.error('[TrustScore] Calculation error:', error);
      return 0;
    }
  }

  /**
   * Get subscription tier for user
   */
  async getSubscriptionTier(userId: string): Promise<UserTier> {
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('status, plan:subscription_plans(name)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!subscription || !subscription.plan) return 'Free';
    
    const planName = (subscription.plan as any).name;
    if (planName.toLowerCase().includes('platinum') || planName.toLowerCase().includes('elite')) return 'Elite';
    if (planName.toLowerCase().includes('premium') || planName.toLowerCase().includes('pro')) return 'Pro';
    return 'Free';
  }

  /**
   * Get benefits based on TrustScore and tier
   */
  async getBenefits(userId: string): Promise<TrustScoreBenefits> {
    const score = await this.calculateTrustScore(userId);
    const tier = await this.getSubscriptionTier(userId);
    const { data: user } = await supabase.from('users').select('verified').eq('id', userId).single();

    let commission = 15; // Free: 15%
    if (tier === 'Elite') commission = 5; // Elite: 5%
    else if (tier === 'Pro') commission = 10; // Pro: 10%

    let dailyLimit = 1000;
    if (score > 500) dailyLimit = 10000;
    else if (score > 100) dailyLimit = 5000;

    return {
      withdrawalCommission: commission,
      dailyLimit,
      canWithdraw: !!user?.verified,
      autoApproval: score > 500 && !!user?.verified,
    };
  }

  /**
   * Update TrustScore in DB
   */
  async syncTrustScore(userId: string): Promise<void> {
    const score = await this.calculateTrustScore(userId);
    await supabase
      .from('users')
      .update({ trust_score: score })
      .eq('id', userId);
  }
}

export const trustScoreService = new TrustScoreService();
export default trustScoreService;
