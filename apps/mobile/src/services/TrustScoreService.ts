/**
 * Trust Score Service
 *
 * Canonical source: DB function `get_detailed_trust_stats`
 * Uses RPC call to Supabase Edge Function for trust score data.
 *
 * Trust Levels: Sprout → Adventurer → Explorer → Voyager → Ambassador
 */

import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';

export type TrustLevel =
  | 'Sprout'
  | 'Adventurer'
  | 'Explorer'
  | 'Voyager'
  | 'Ambassador';

export interface TrustScoreData {
  totalScore: number;
  level: TrustLevel;
  levelProgress: number; // 0.0 to 1.0
  breakdown: {
    paymentScore: number;
    proofScore: number;
    trustNotesScore: number;
    kycScore: number;
    socialScore: number;
  };
}

class TrustScoreService {
  /**
   * Get trust score from canonical DB function
   */
  async getTrustScore(userId: string): Promise<TrustScoreData | null> {
    try {
      const { data, error } = await (supabase.rpc as any)(
        'get_detailed_trust_stats',
        { p_user_id: userId },
      );

      if (error) {
        logger.error('[TrustScore] RPC error:', error);
        return null;
      }

      if (!data) return null;

      return {
        totalScore: data.total_score || 0,
        level: (data.level as TrustLevel) || 'Sprout',
        levelProgress: data.level_progress || 0,
        breakdown: {
          paymentScore: data.breakdown?.payment_score || 0,
          proofScore: data.breakdown?.proof_score || 0,
          trustNotesScore: data.breakdown?.trust_notes_score || 0,
          kycScore: data.breakdown?.kyc_score || 0,
          socialScore: data.breakdown?.social_score || 0,
        },
      };
    } catch (error) {
      logger.error('[TrustScore] Error fetching trust score:', error);
      return null;
    }
  }

  /**
   * Sync trust score to users table (for caching)
   */
  async syncTrustScore(userId: string): Promise<void> {
    try {
      const score = await this.getTrustScore(userId);
      if (score) {
        await supabase
          .from('users')
          .update({ trust_score: score.totalScore })
          .eq('id', userId);
      }
    } catch (error) {
      logger.error('[TrustScore] Sync error:', error);
    }
  }

  /**
   * Get trust level badge info
   */
  getLevelBadge(level: TrustLevel): { icon: string; color: string } {
    const badges: Record<TrustLevel, { icon: string; color: string }> = {
      Sprout: { icon: 'leaf-outline', color: '#4ADE80' },
      Adventurer: { icon: 'footsteps', color: '#22D3EE' },
      Explorer: { icon: 'map-outline', color: '#818CF8' },
      Voyager: { icon: 'airplane-outline', color: '#C084FC' },
      Ambassador: { icon: 'star', color: '#FCD34D' },
    };
    return badges[level] || badges.Sprout;
  }
}

export const trustScoreService = new TrustScoreService();
export default trustScoreService;
