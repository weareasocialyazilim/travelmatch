/**
 * Intent Scoring Engine
 *
 * Analyzes user behavior to determine if they're genuinely looking for connections
 * or just browsing/wasting time.
 *
 * Features analyzed:
 * - Gifting frequency and patterns
 * - Message length and tone indicators
 * - Reply latency patterns
 * - Ghosting history
 * - Conversation depth progression
 *
 * Score: 0-100 (higher = more genuine intent)
 *
 * Updated: 2026-01-26
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Scoring weights for each factor
const WEIGHTS = {
  giftingConsistency: 0.25,      // Regular gifting = genuine interest
  messageDepth: 0.20,            // Longer, thoughtful messages
  replySpeed: 0.15,              // Quick replies = engagement
  ghostingHistory: 0.20,         // Low ghosting = reliable
  conversationProgression: 0.20, // Moving toward meetup
} as const;

// Thresholds for scoring
const THRESHOLDS = {
  goodGiftingRate: 0.3,          // 30%+ messages have gifts
  goodMessageLength: 50,         // 50+ chars average
  goodReplyMinutes: 60,          // <1 hour average reply
  maxGhostingRate: 0.4,          // 40% max acceptable ghosting
} as const;

export interface IntentScoreInput {
  userId: string;
  timeframeDays?: number;
}

export interface IntentScoreResult {
  userId: string;
  overallScore: number;           // 0-100
  grade: 'hot' | 'warm' | 'cold'; // A/B/C equivalent
  factors: {
    giftingConsistency: number;
    messageDepth: number;
    replySpeed: number;
    ghostingHistory: number;
    conversationProgression: number;
  };
  confidence: number;             // How reliable this score is
  lastUpdated: string;
  insights: string[];
}

/**
 * Calculate intent score for a user
 */
export async function calculateIntentScore(
  input: IntentScoreInput,
): Promise<IntentScoreResult> {
  const { userId } = input;
  const days = input.timeframeDays || 30;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  // Gather all behavioral data in parallel
  const [
    giftingData,
    messageData,
    replyData,
    ghostingData,
    conversationData,
  ] = await Promise.all([
    getGiftingMetrics(userId, startDate),
    getMessageMetrics(userId, startDate),
    getReplyLatency(userId, startDate),
    getGhostingMetrics(userId, startDate),
    getConversationProgression(userId, startDate),
  ]);

  // Calculate individual factor scores (0-100)
  const factors = {
    giftingConsistency: scoreGiftingConsistency(giftingData),
    messageDepth: scoreMessageDepth(messageData),
    replySpeed: scoreReplySpeed(replyData),
    ghostingHistory: scoreGhosting(ghostingData),
    conversationProgression: scoreConversationProgression(conversationData),
  };

  // Calculate weighted overall score
  let overallScore = 0;
  let weightSum = 0;

  for (const [key, weight] of Object.entries(WEIGHTS)) {
    overallScore += factors[key as keyof typeof factors] * weight;
    weightSum += weight;
  }

  overallScore = Math.round(overallScore / weightSum);

  // Calculate confidence based on data availability
  const dataPoints = giftingData.total +
    messageData.total +
    replyData.total +
    ghostingData.total +
    conversationData.total;
  const confidence = Math.min(100, Math.round((dataPoints / 50) * 100));

  // Generate insights
  const insights = generateInsights(factors, giftingData, messageData);

  // Determine grade
  const grade = getGrade(overallScore);

  return {
    userId,
    overallScore,
    grade,
    factors,
    confidence,
    lastUpdated: new Date().toISOString(),
    insights,
  };
}

// ============================================================================
// Individual Metric Functions
// ============================================================================

async function getGiftingMetrics(userId: string, startDate: string) {
  const { data } = await supabase
    .from('gifts')
    .select('id, created_at, receiver_id, moment_id')
    .eq('sender_id', userId)
    .gte('created_at', startDate);

  const total = data?.length || 0;

  // Count gifts per conversation
  const giftPerConversation: Record<string, number> = {};
  for (const gift of data || []) {
    const key = gift.receiver_id || gift.moment_id || 'unknown';
    giftPerConversation[key] = (giftPerConversation[key] || 0) + 1;
  }

  // Calculate gifting rate (gifts per day active)
  const uniqueDays = new Set(data?.map(g => g.created_at.split('T')[0])).size || 1;
  const giftsPerDay = total / uniqueDays;

  return {
    total,
    perConversation: giftPerConversation,
    giftsPerDay,
  };
}

async function getMessageMetrics(userId: string, startDate: string) {
  const { data } = await supabase
    .from('messages')
    .select('content, created_at, chat_id')
    .eq('sender_id', userId)
    .gte('created_at', startDate);

  const messages = data || [];
  const total = messages.length;

  // Calculate average message length
  const lengths = messages.map(m => m.content?.length || 0);
  const avgLength = lengths.length > 0
    ? lengths.reduce((a, b) => a + b, 0) / lengths.length
    : 0;

  // Count unique conversations
  const conversations = new Set(messages.map(m => m.chat_id)).size;

  return { total, avgLength, conversations };
}

async function getReplyLatency(userId: string, startDate: string) {
  // Get messages where user was receiver and there was a reply
  const { data: received } = await supabase
    .from('messages')
    .select('id, created_at, chat_id')
    .eq('receiver_id', userId)
    .gte('created_at', startDate);

  const { data: replies } = await supabase
    .from('messages')
    .select('created_at, chat_id, in_reply_to_id')
    .eq('sender_id', userId)
    .gte('created_at', startDate);

  // Calculate average reply time in minutes
  const replyTimes: number[] = [];

  for (const reply of replies || []) {
    if (reply.in_reply_to_id) {
      const original = received?.find(m => m.id === reply.in_reply_to_id);
      if (original) {
        const originalTime = new Date(original.created_at).getTime();
        const replyTime = new Date(reply.created_at).getTime();
        const diffMinutes = (replyTime - originalTime) / (1000 * 60);
        if (diffMinutes > 0 && diffMinutes < 10080) { // Max 7 days
          replyTimes.push(diffMinutes);
        }
      }
    }
  }

  const avgReplyMinutes = replyTimes.length > 0
    ? replyTimes.reduce((a, b) => a + b, 0) / replyTimes.length
    : 0;

  return {
    total: replyTimes.length,
    avgMinutes: avgReplyMinutes,
  };
}

async function getGhostingMetrics(userId: string, startDate: string) {
  // Ghosting = started conversation but stopped replying without notice
  // Check chats where user sent >3 messages then went silent >7 days

  const { data: chats } = await supabase
    .from('chats')
    .select('id, created_at, last_message_at')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .gte('created_at', startDate);

  let ghostedChats = 0;
  let totalChats = 0;

  for (const chat of chats || []) {
    const { data: messages } = await supabase
      .from('messages')
      .select('id, created_at, sender_id')
      .eq('chat_id', chat.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (messages && messages.length > 3) {
      const userMessages = messages.filter(m => m.sender_id === userId);
      const otherMessages = messages.filter(m => m.sender_id !== userId);

      // User sent messages, then stopped, other person also sent
      if (userMessages.length >= 2 && otherMessages.length >= 1) {
        const lastUserMsg = new Date(userMessages[0].created_at).getTime();
        const now = Date.now();
        const daysSince = (now - lastUserMsg) / (1000 * 60 * 60 * 24);

        if (daysSince > 7 && daysSince < 30) { // 7-30 days silence = ghost
          ghostedChats++;
        }
      }
    }
    totalChats++;
  }

  const ghostingRate = totalChats > 0 ? ghostedChats / totalChats : 0;

  return { total: totalChats, ghosted: ghostedChats, rate: ghostingRate };
}

async function getConversationProgression(userId: string, startDate: string) {
  // Check if conversations move toward meetup
  const { data: moments } = await supabase
    .from('moments')
    .select('id, gifting_count, unlocked_by')
    .eq('user_id', userId)
    .gte('created_at', startDate);

  const { data: chatMeetups } = await supabase
    .from('meetup_requests')
    .select('id, status, created_at')
    .eq('requester_id', userId)
    .gte('created_at', startDate);

  let successfulMeetups = 0;
  let meetupAttempts = 0;

  for (const meetup of chatMeetups || []) {
    meetupAttempts++;
    if (meetup.status === 'accepted' || meetup.status === 'completed') {
      successfulMeetups++;
    }
  }

  // Gifting + unlock pattern
  let unlocks = 0;
  for (const moment of moments || []) {
    if (moment.unlocked_by && moment.unlocked_by.length > 0) {
      unlocks++;
    }
  }

  return {
    total: moments?.length || 0,
    unlocks,
    meetupAttempts,
    successfulMeetups,
    meetupRate: meetupAttempts > 0 ? successfulMeetups / meetupAttempts : 0,
  };
}

// ============================================================================
// Scoring Functions (0-100)
// ============================================================================

function scoreGiftingConsistency(data: ReturnType<typeof getGiftingMetrics>) {
  const { total, giftsPerDay } = data;
  if (total === 0) return 30; // No gifting = low intent

  // Score based on consistency and diversity
  const consistencyScore = Math.min(100, giftsPerDay * 100); // More = better
  const diversityScore = Math.min(100, Object.keys(data.perConversation).length * 25);

  return Math.round(consistencyScore * 0.6 + diversityScore * 0.4);
}

function scoreMessageDepth(data: ReturnType<typeof getMessageMetrics>) {
  const { total, avgLength } = data;
  if (total === 0) return 40; // No messages = neutral
  if (total < 5) return 50; // Too little data

  // Length score
  let lengthScore = 0;
  if (avgLength < 10) lengthScore = 20;
  else if (avgLength < 30) lengthScore = 40;
  else if (avgLength < 50) lengthScore = 60;
  else if (avgLength < 100) lengthScore = 80;
  else lengthScore = 100;

  // Engagement score (conversations started)
  const engagementScore = Math.min(100, data.conversations * 20);

  return Math.round(lengthScore * 0.7 + engagementScore * 0.3);
}

function scoreReplySpeed(data: ReturnType<typeof getReplyLatency>) {
  if (data.total === 0) return 50; // No data = neutral

  let score = 100;
  if (data.avgMinutes > 5) score = 90;
  if (data.avgMinutes > 15) score = 80;
  if (data.avgMinutes > 30) score = 70;
  if (data.avgMinutes > 60) score = 60;
  if (data.avgMinutes > 120) score = 50;
  if (data.avgMinutes > 360) score = 35;
  if (data.avgMinutes > 1440) score = 20; // 24+ hours

  return score;
}

function scoreGhosting(data: ReturnType<typeof getGhostingMetrics>) {
  const { rate } = data;

  // Lower ghosting = higher score
  if (rate <= 0.1) return 100;
  if (rate <= 0.2) return 85;
  if (rate <= 0.3) return 70;
  if (rate <= 0.4) return 55;
  if (rate <= 0.5) return 40;
  if (rate <= 0.7) return 25;
  return 10;
}

function scoreConversationProgression(data: ReturnType<typeof getConversationProgression>) {
  const { meetupRate, unlocks, total } = data;

  // Meetup success is strongest signal
  let meetupScore = 0;
  if (meetupRate >= 0.5) meetupScore = 100;
  else if (meetupRate >= 0.3) meetupScore = 80;
  else if (meetupRate >= 0.1) meetupScore = 60;
  else if (meetupRate > 0) meetupScore = 40;
  else meetupScore = 50; // No attempts = unknown

  // Unlock ratio bonus
  const unlockScore = total > 0 ? Math.min(100, (unlocks / total) * 200) : 50;

  return Math.round(meetupScore * 0.7 + unlockScore * 0.3);
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateInsights(
  factors: IntentScoreResult['factors'],
  gifting: ReturnType<typeof getGiftingMetrics>,
  message: ReturnType<typeof getMessageMetrics>,
): string[] {
  const insights: string[] = [];

  if (factors.giftingConsistency < 40) {
    insights.push('Düşük gifting aktivitesi - niyet sinyali zayıf');
  } else if (factors.giftingConsistency > 70) {
    insights.push('Gifting davranışı güçlü niyet gösteriyor');
  }

  if (factors.messageDepth < 40) {
    insights.push('Mesajlar çok kısa - derinlik eksik');
  } else if (factors.messageDepth > 70) {
    insights.push('Mesaj kalitesi yüksek - gerçek ilgi var');
  }

  if (factors.replySpeed < 40) {
    insights.push('Geç yanıt verme alışkanlığı');
  }

  if (factors.ghostingHistory < 40) {
    insights.push('Yüksek ghosting oranı tespit edildi');
  }

  if (factors.conversationProgression > 70) {
    insights.push('Sohbetler genellikle buluşmaya dönüşüyor');
  }

  return insights;
}

function getGrade(score: number): 'hot' | 'warm' | 'cold' {
  if (score >= 70) return 'hot';
  if (score >= 45) return 'warm';
  return 'cold';
}

/**
 * Batch calculate intent scores for multiple users
 */
export async function batchCalculateIntentScores(
  userIds: string[],
): Promise<IntentScoreResult[]> {
  return Promise.all(userIds.map(id => calculateIntentScore({ userId: id })));
}

/**
 * Get intent score cached value or calculate fresh
 */
export async function getIntentScore(
  userId: string,
  maxAgeHours = 24,
): Promise<IntentScoreResult | null> {
  const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000).toISOString();

  // Try to get cached score
  const { data: cached } = await supabase
    .from('user_intent_scores')
    .select('*')
    .eq('user_id', userId)
    .gte('updated_at', cutoff)
    .single();

  if (cached) {
    return {
      userId: cached.user_id,
      overallScore: cached.overall_score,
      grade: cached.grade,
      factors: cached.factors,
      confidence: cached.confidence,
      lastUpdated: cached.updated_at,
      insights: cached.insights || [],
    };
  }

  // Calculate fresh
  const result = await calculateIntentScore({ userId });

  // Cache result
  await supabase.from('user_intent_scores').upsert({
    user_id: userId,
    overall_score: result.overallScore,
    grade: result.grade,
    factors: result.factors,
    confidence: result.confidence,
    insights: result.insights,
    updated_at: new Date().toISOString(),
  });

  return result;
}

export const INTENT_CONFIG = {
  weights: WEIGHTS,
  thresholds: THRESHOLDS,
};
