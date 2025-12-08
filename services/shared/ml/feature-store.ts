/**
 * Feature Store
 * Centralized feature management for ML models
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_KEY') ?? ''
);

/**
 * User features for ML models
 */
export interface UserFeatures {
  userId: string;
  
  // Demographic
  accountAge: number; // days
  kycVerified: boolean;
  trustScore: number;
  
  // Engagement
  totalMoments: number;
  totalGiftsGiven: number;
  totalGiftsReceived: number;
  avgSessionDuration: number;
  daysActive: number;
  
  // Behavioral
  preferredCategories: string[];
  avgGiftAmount: number;
  responseRate: number;
  completionRate: number;
  
  // Temporal
  lastActiveAt: string;
  peakActivityHours: number[];
  
  // Social
  totalConnections: number;
  trustNotesReceived: number;
  avgRating: number;
}

/**
 * Moment features for recommendations
 */
export interface MomentFeatures {
  momentId: string;
  
  // Basic
  category: string;
  amount: number;
  currency: string;
  
  // Content
  titleEmbedding?: number[];
  descriptionEmbedding?: number[];
  imageFeatures?: number[];
  
  // Performance
  views: number;
  likes: number;
  gifts: number;
  completionRate: number;
  
  // Temporal
  createdAt: string;
  trendingScore: number;
  
  // Social
  creatorTrustScore: number;
  receiverRating: number;
}

/**
 * Extract user features from database
 */
export async function extractUserFeatures(
  userId: string
): Promise<UserFeatures> {
  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!profile) {
    throw new Error('User not found');
  }

  // Get user statistics
  const { data: stats } = await supabase
    .rpc('get_user_statistics', { user_id: userId })
    .single();

  // Get interaction history
  const { data: interactions } = await supabase
    .from('user_interactions')
    .select('type, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1000);

  // Calculate features
  const accountAge = Math.floor(
    (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  const peakHours = calculatePeakActivityHours(interactions || []);

  return {
    userId,
    accountAge,
    kycVerified: profile.kyc_status === 'Verified',
    trustScore: profile.trust_score || 0,
    totalMoments: stats?.total_moments || 0,
    totalGiftsGiven: stats?.total_gifts_given || 0,
    totalGiftsReceived: stats?.total_gifts_received || 0,
    avgSessionDuration: stats?.avg_session_duration || 0,
    daysActive: stats?.days_active || 0,
    preferredCategories: stats?.preferred_categories || [],
    avgGiftAmount: stats?.avg_gift_amount || 0,
    responseRate: stats?.response_rate || 0,
    completionRate: stats?.completion_rate || 0,
    lastActiveAt: profile.last_active_at || new Date().toISOString(),
    peakActivityHours: peakHours,
    totalConnections: stats?.total_connections || 0,
    trustNotesReceived: stats?.trust_notes_received || 0,
    avgRating: stats?.avg_rating || 0,
  };
}

/**
 * Extract moment features from database
 */
export async function extractMomentFeatures(
  momentId: string
): Promise<MomentFeatures> {
  const { data: moment } = await supabase
    .from('moments')
    .select('*')
    .eq('id', momentId)
    .single();

  if (!moment) {
    throw new Error('Moment not found');
  }

  // Get moment statistics
  const { data: stats } = await supabase
    .rpc('get_moment_statistics', { moment_id: momentId })
    .single();

  return {
    momentId,
    category: moment.category,
    amount: moment.total_amount,
    currency: moment.currency,
    views: stats?.views || 0,
    likes: stats?.likes || 0,
    gifts: stats?.gifts || 0,
    completionRate: stats?.completion_rate || 0,
    createdAt: moment.created_at,
    trendingScore: calculateTrendingScore(stats),
    creatorTrustScore: stats?.creator_trust_score || 0,
    receiverRating: stats?.receiver_rating || 0,
  };
}

/**
 * Calculate peak activity hours
 */
function calculatePeakActivityHours(
  interactions: Array<{ created_at: string }>
): number[] {
  const hourCounts = new Array(24).fill(0);

  interactions.forEach((interaction) => {
    const hour = new Date(interaction.created_at).getHours();
    hourCounts[hour]++;
  });

  // Get top 3 hours
  return hourCounts
    .map((count, hour) => ({ hour, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((h) => h.hour);
}

/**
 * Calculate trending score
 */
function calculateTrendingScore(stats: any): number {
  const hoursSinceCreation = stats?.hours_since_creation || 1;
  const views = stats?.views || 0;
  const gifts = stats?.gifts || 0;

  // Simple trending algorithm (can be improved)
  return (views + gifts * 10) / Math.log(hoursSinceCreation + 2);
}

/**
 * Batch extract user features
 */
export async function batchExtractUserFeatures(
  userIds: string[]
): Promise<Map<string, UserFeatures>> {
  const features = new Map<string, UserFeatures>();

  await Promise.all(
    userIds.map(async (userId) => {
      try {
        const userFeatures = await extractUserFeatures(userId);
        features.set(userId, userFeatures);
      } catch (error) {
        console.error(`Failed to extract features for user ${userId}:`, error);
      }
    })
  );

  return features;
}

/**
 * Cache features in Redis (for production)
 */
export async function cacheFeatures(
  key: string,
  features: UserFeatures | MomentFeatures,
  ttlSeconds = 3600
): Promise<void> {
  // TODO: Implement Redis caching
  // await redis.setex(key, ttlSeconds, JSON.stringify(features));
}

/**
 * Get cached features
 */
export async function getCachedFeatures(
  key: string
): Promise<UserFeatures | MomentFeatures | null> {
  // TODO: Implement Redis cache retrieval
  // const cached = await redis.get(key);
  // return cached ? JSON.parse(cached) : null;
  return null;
}
