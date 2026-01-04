/**
 * Gamification Feature Module
 *
 * Achievements, badges, and reward system for TravelMatch
 *
 * ELEVATED: Moved from profile feature to dedicated gamification module
 * as achievements span the entire platform (gifting, proofs, trust, hosting)
 */

// Screens
export { AchievementsScreen } from './screens/AchievementsScreen';

// Components
export { AchievementCard } from './components/AchievementCard';

// Types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  isEarned: boolean;
  xp: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'social' | 'explorer' | 'host' | 'trust' | 'gift';
  earnedAt?: string;
}

// Achievement IDs (must match database)
export const ACHIEVEMENT_IDS = {
  FIRST_GIFT_SENT: 'first_gift_sent',
  GENEROUS_GIVER_5: 'generous_giver_5',
  GENEROUS_GIVER_10: 'generous_giver_10',
  PROOF_MASTER_5: 'proof_master_5',
  TRUST_BUILDER: 'trust_builder',
  MOMENT_CREATOR: 'moment_creator',
  SUPER_HOST_50: 'super_host_50',
} as const;

// Rarity colors
export const RARITY_COLORS = {
  common: '#9CA3AF',
  rare: '#7B61FF',
  epic: '#F472B6',
  legendary: '#FFB800',
} as const;
