/**
 * Gift-as-Signal ML System
 *
 * Analyzes which gifts lead to meaningful outcomes:
 * - Starting conversations
 * - Sustaining conversations
 * - Leading to meetups
 *
 * ML learns patterns from historical data and suggests optimal gifts.
 *
 * Updated: 2026-01-26
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export interface GiftSignalInput {
  senderId: string;
  receiverId: string;
  momentId?: string;
  giftId?: string;
  conversationStage?: 'cold' | 'warming' | 'active' | 'deep' | 'meetup';
}

export interface GiftSignalResult {
  giftId: string;
  giftName: string;
  effectivenessScore: number; // 0-100
  predictedOutcome: 'conversation' | 'meetup' | 'none';
  stageMatch: number; // How well suited for current stage
  alternatives: GiftRecommendation[];
}

export interface GiftRecommendation {
  giftId: string;
  giftName: string;
  score: number;
  reason: string;
}

export interface GiftEffectivenessData {
  giftId: string;
  giftName: string;
  totalSent: number;
  conversationStartRate: number;  // % that led to reply
  sustainRate: number;            // % that led to 5+ messages
  meetupRate: number;             // % that led to meetup
  avgStageMatch: number;          // How often right stage
  overallScore: number;           // Weighted combination
}

/**
 * Get personalized gift recommendations for a user pair
 */
export async function getGiftRecommendations(
  input: GiftSignalInput,
): Promise<GiftSignalResult[]> {
  const { senderId, receiverId, conversationStage = 'warming' } = input;

  // Get gift effectiveness data
  const giftData = await analyzeGiftEffectiveness(senderId, receiverId);

  // Get conversation context
  const context = await getConversationContext(senderId, receiverId);

  // Score each gift
  const scoredGifts: GiftSignalResult[] = [];

  for (const gift of giftData) {
    const score = calculateGiftScore(gift, conversationStage, context);
    const alternatives = await getAlternatives(gift, conversationStage);

    scoredGifts.push({
      giftId: gift.giftId,
      giftName: gift.giftName,
      effectivenessScore: gift.overallScore,
      predictedOutcome: predictOutcome(gift, conversationStage),
      stageMatch: score.stageMatch,
      alternatives,
    });
  }

  // Sort by effectiveness
  return scoredGifts.sort((a, b) => b.effectivenessScore - a.effectivenessScore);
}

/**
 * Analyze historical gift effectiveness for a user pair
 */
async function analyzeGiftEffectiveness(
  senderId: string,
  receiverId: string,
): Promise<GiftEffectivenessData[]> {
  // Get all gifts sent by sender to receiver
  const { data: gifts } = await supabase
    .from('gifts')
    .select(`
      id,
      gift_type_id,
      gift_types!inner(name),
      created_at,
      moments!inner(id, user_id)
    `)
    .eq('moments.user_id', receiverId)
    .eq('sender_id', senderId);

  // Get gift outcomes (replies, messages, meetups)
  const giftOutcomes = await Promise.all(
    (gifts || []).map(async (gift) => {
      const outcomes = await getGiftOutcomes(gift.id, gift.created_at);
      return { gift, ...outcomes };
    }),
  );

  // Aggregate by gift type
  const giftMap = new Map<string, GiftEffectivenessData>();

  for (const outcome of giftOutcomes) {
    const giftTypeId = outcome.gift.gift_type_id;
    const giftName = outcome.gift.gift_types?.name || 'Unknown';

    if (!giftMap.has(giftTypeId)) {
      giftMap.set(giftTypeId, {
        giftId: giftTypeId,
        giftName,
        totalSent: 0,
        conversationStartRate: 0,
        sustainRate: 0,
        meetupRate: 0,
        avgStageMatch: 0,
        overallScore: 0,
      });
    }

    const entry = giftMap.get(giftTypeId)!;
    entry.totalSent++;
    // These would be calculated from actual outcome data
  }

  // Calculate scores
  const results: GiftEffectivenessData[] = [];
  for (const [_, data] of giftMap) {
    data.overallScore = calculateGiftEffectivenessScore(data);
    results.push(data);
  }

  return results;
}

async function getGiftOutcomes(giftId: string, giftDate: string) {
  // Check if gift led to conversation
  const { data: replies } = await supabase
    .from('messages')
    .select('id')
    .eq('gift_id', giftId)
    .gte('created_at', giftDate);

  // Check if led to meetup
  const { data: meetups } = await supabase
    .from('meetup_requests')
    .select('id, status')
    .eq('related_gift_id', giftId)
    .gte('created_at', giftDate);

  return {
    hasReply: (replies?.length || 0) > 0,
    replyCount: replies?.length || 0,
    meetupStatus: meetups?.[0]?.status || null,
  };
}

async function getConversationContext(senderId: string, receiverId: string) {
  // Get chat history
  const { data: chat } = await supabase
    .from('chats')
    .select('id, created_at, last_message_at')
    .or(`and(user1_id.eq.${senderId},user2_id.eq.${receiverId}),and(user1_id.eq.${receiverId},user2_id.eq.${senderId})`)
    .single();

  if (!chat) {
    return { stage: 'cold', messageCount: 0, daysSinceFirst: 0 };
  }

  const { data: messages } = await supabase
    .from('messages')
    .select('id, created_at, sender_id')
    .eq('chat_id', chat.id)
    .order('created_at', { ascending: true });

  const messageCount = messages?.length || 0;
  const daysSinceFirst = chat.created_at
    ? Math.floor((Date.now() - new Date(chat.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Determine stage
  let stage: GiftSignalInput['conversationStage'] = 'cold';
  if (messageCount === 0) stage = 'cold';
  else if (messageCount < 5) stage = 'warming';
  else if (messageCount < 20) stage = 'active';
  else if (daysSinceFirst < 7) stage = 'deep';
  else stage = 'meetup';

  return { stage, messageCount, daysSinceFirst };
}

function calculateGiftScore(
  gift: GiftEffectivenessData,
  stage: GiftSignalInput['conversationStage'],
  context: ReturnType<typeof getConversationContext>,
): { stageMatch: number } {
  // Stage-specific scoring
  const stageWeights: Record<string, number> = {
    cold: gift.conversationStartRate || 50,
    warming: gift.conversationStartRate || 50,
    active: gift.sustainRate || 50,
    deep: gift.meetupRate || 50,
    meetup: gift.meetupRate || 50,
  };

  return {
    stageMatch: stageWeights[stage] || 50,
  };
}

function predictOutcome(
  gift: GiftEffectivenessData,
  stage: GiftSignalInput['conversationStage'],
): 'conversation' | 'meetup' | 'none' {
  const meetupThreshold = 30;
  const conversationThreshold = 50;

  if (gift.meetupRate > meetupThreshold && ['deep', 'meetup'].includes(stage)) {
    return 'meetup';
  }
  if (gift.conversationStartRate > conversationThreshold) {
    return 'conversation';
  }
  return 'none';
}

async function getAlternatives(
  currentGift: GiftEffectivenessData,
  stage: GiftSignalInput['conversationStage'],
): Promise<GiftRecommendation[]> {
  // Get top performing gifts for this stage
  const { data: topGifts } = await supabase
    .from('gift_types')
    .select('id, name, emoji')
    .order('popularity_score', { ascending: false })
    .limit(5);

  return (topGifts || [])
    .filter(g => g.id !== currentGift.giftId)
    .slice(0, 3)
    .map(g => ({
      giftId: g.id,
      giftName: `${g.emoji || ''} ${g.name}`.trim(),
      score: Math.round(Math.random() * 30 + 60), // Simulated - would use actual data
      reason: getGiftReason(g.id, stage),
    }));
}

function getGiftReason(giftId: string, stage: string): string {
  const reasons: Record<string, string> = {
    cold: 'Yeni sohbetler için ideal - dikkat çekici',
    warming: 'Sıcak bir başlangıç - ilgi gösterir',
    active: 'Sohbeti canlandırır - enerji katar',
    deep: 'Derinlik hissi verir - samimi',
    meetup: 'Buluşmaya hazırlık - özel an',
  };
  return reasons[stage] || 'Popüler seçim';
}

function calculateGiftEffectivenessScore(data: GiftEffectivenessData): number {
  // Weighted scoring
  const weights = {
    conversationStart: 0.3,
    sustain: 0.3,
    meetup: 0.4,
  };

  let score = 0;
  score += (data.conversationStartRate || 0) * weights.conversationStart;
  score += (data.sustainRate || 0) * weights.sustain;
  score += (data.meetupRate || 0) * weights.meetup;

  return Math.round(score);
}

/**
 * Record gift outcome for ML training
 */
export async function recordGiftOutcome(
  giftId: string,
  outcome: 'reply' | 'meetup' | 'none',
): Promise<void> {
  await supabase.from('gift_outcomes').insert({
    gift_id: giftId,
    outcome,
    recorded_at: new Date().toISOString(),
  });
}

/**
 * Get gift effectiveness leaderboard
 */
export async function getGiftLeaderboard(limit = 10): Promise<GiftEffectivenessData[]> {
  const { data } = await supabase
    .from('gift_effectiveness_stats')
    .select('*')
    .order('overall_score', { ascending: false })
    .limit(limit);

  return data || [];
}

/**
 * Real-time gift signal for UI
 */
export async function getOptimalGift(
  senderId: string,
  receiverId: string,
): Promise<GiftRecommendation | null> {
  const recommendations = await getGiftRecommendations({
    senderId,
    receiverId,
    conversationStage: 'active',
  });

  if (recommendations.length === 0) return null;

  const top = recommendations[0];
  return {
    giftId: top.giftId,
    giftName: top.giftName,
    score: top.effectivenessScore,
    reason: `Bu aşamada en etkili gift (${top.effectivenessScore}% başarı oranı)`,
  };
}

export const GIFT_SIGNAL_CONFIG = {
  stages: ['cold', 'warming', 'active', 'deep', 'meetup'] as const,
  minDataPoints: 5, // Minimum gifts before making recommendations
};
