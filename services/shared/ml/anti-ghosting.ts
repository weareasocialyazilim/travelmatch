/**
 * Anti-Ghosting Prediction System
 *
 * Predicts when a conversation is heading toward ghosting
 * before it happens, enabling proactive UX interventions.
 *
 * Warning indicators:
 * - Reply time increasing
 * - Message length decreasing
 * - Gift frequency dropping
 * - Interest signals fading
 *
 * Updated: 2026-01-26
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export interface GhostingRiskInput {
  chatId: string;
  userId: string; // The user to analyze (are THEY going to ghost?)
}

export interface GhostingRiskResult {
  chatId: string;
  userId: string;
  riskScore: number; // 0-100 (higher = more likely to ghost)
  riskLevel: 'low' | 'medium' | 'high' | 'ghosting';
  warningSignals: WarningSignal[];
  suggestedActions: string[];
  lastAnalyzed: string;
}

export interface WarningSignal {
  type: 'reply_time' | 'message_length' | 'gift_drop' | 'engagement' | 'online_presence';
  trend: 'improving' | 'stable' | 'declining' | 'critical';
  currentValue: number;
  previousValue: number;
  changePercent: number;
  description: string;
}

/**
 * Analyze ghosting risk for a user in a conversation
 */
export async function analyzeGhostingRisk(
  input: GhostingRiskInput,
): Promise<GhostingRiskResult> {
  const { chatId, userId } = input;

  // Get conversation data
  const { data: chat } = await supabase
    .from('chats')
    .select('*')
    .eq('id', chatId)
    .single();

  const messages = await getUserMessages(chatId, userId);
  const giftData = await getGiftActivity(chatId, userId);
  const onlineData = await getOnlinePresence(chatId, userId);

  // Analyze each signal
  const replyTime = analyzeReplyTimeTrend(messages);
  const messageLength = analyzeMessageLengthTrend(messages);
  const giftTrend = analyzeGiftTrend(giftData);
  const engagement = analyzeEngagementTrend(messages, chat);
  const presence = analyzeOnlinePresence(onlineData);

  const signals = [replyTime, messageLength, giftTrend, engagement, presence];

  // Calculate overall risk score
  const riskScore = calculateRiskScore(signals);

  // Determine risk level
  const riskLevel = getRiskLevel(riskScore);

  // Generate suggested actions (UX interventions)
  const suggestedActions = generateActions(riskLevel, signals);

  return {
    chatId,
    userId,
    riskScore,
    riskLevel,
    warningSignals: signals,
    suggestedActions,
    lastAnalyzed: new Date().toISOString(),
  };
}

// ============================================================================
// Signal Analysis Functions
// ============================================================================

async function getUserMessages(chatId: string, userId: string) {
  const { data } = await supabase
    .from('messages')
    .select('id, content, created_at, sender_id')
    .eq('chat_id', chatId)
    .eq('sender_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  return data || [];
}

async function getGiftActivity(chatId: string, userId: string) {
  // Get gifts sent in this chat by this user
  const { data } = await supabase
    .from('gifts')
    .select('id, created_at, moments!inner(id)')
    .eq('sender_id', userId)
    .eq('moments.chat_id', chatId)
    .order('created_at', { ascending: false })
    .limit(20);

  return data || [];
}

async function getOnlinePresence(chatId: string, userId: string) {
  // Check last online status
  const { data: status } = await supabase
    .from('user_status')
    .select('is_online, last_seen_at')
    .eq('user_id', userId)
    .single();

  return status || { is_online: false, last_seen_at: null };
}

function analyzeReplyTimeTrend(messages: Array<{ created_at: string }>) {
  if (messages.length < 5) {
    return createSignal('reply_time', 'stable', 0, 0, 'Yetersiz veri');
  }

  // Split into halves
  const recent = messages.slice(0, Math.floor(messages.length / 2));
  const older = messages.slice(Math.floor(messages.length / 2));

  const recentAvg = calculateAvgReplyTime(recent);
  const olderAvg = calculateAvgReplyTime(older);

  if (recentAvg === 0 || olderAvg === 0) {
    return createSignal('reply_time', 'stable', recentAvg, olderAvg, 0, 'Veri eksik');
  }

  const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;

  let trend: WarningSignal['trend'] = 'stable';
  if (changePercent > 50) trend = 'critical';
  else if (changePercent > 25) trend = 'declining';
  else if (changePercent < -25) trend = 'improving';

  return {
    type: 'reply_time',
    trend,
    currentValue: Math.round(recentAvg),
    previousValue: Math.round(olderAvg),
    changePercent: Math.round(changePercent),
    description: trend === 'declining' || trend === 'critical'
      ? 'Yanıt süresi artıyor'
      : 'Yanıt süresi normal',
  };
}

function calculateAvgReplyTime(messages: Array<{ created_at: string }>): number {
  if (messages.length < 2) return 0;

  let totalDiff = 0;
  let count = 0;

  for (let i = 0; i < messages.length - 1; i++) {
    const curr = new Date(messages[i].created_at).getTime();
    const prev = new Date(messages[i + 1].created_at).getTime();
    const diff = curr - prev;
    if (diff > 0 && diff < 86400000) { // Max 24 hours
      totalDiff += diff;
      count++;
    }
  }

  return count > 0 ? (totalDiff / count) / (1000 * 60) : 0; // Minutes
}

function analyzeMessageLengthTrend(messages: Array<{ content: string | null }>) {
  if (messages.length < 5) {
    return createSignal('message_length', 'stable', 0, 0, 'Yetersiz veri');
  }

  const recent = messages.slice(0, Math.floor(messages.length / 2));
  const older = messages.slice(Math.floor(messages.length / 2));

  const recentAvg = calcAvgLength(recent);
  const olderAvg = calcAvgLength(older);

  const changePercent = olderAvg > 0
    ? ((recentAvg - olderAvg) / olderAvg) * 100
    : 0;

  let trend: WarningSignal['trend'] = 'stable';
  if (changePercent < -40) trend = 'critical';
  else if (changePercent < -20) trend = 'declining';
  else if (changePercent > 20) trend = 'improving';

  return {
    type: 'message_length',
    trend,
    currentValue: Math.round(recentAvg),
    previousValue: Math.round(olderAvg),
    changePercent: Math.round(changePercent),
    description: trend === 'declining' || trend === 'critical'
      ? 'Mesaj uzunluğu azalıyor'
      : 'Mesaj uzunluğu normal',
  };
}

function calcAvgLength(messages: Array<{ content: string | null }>): number {
  const lengths = messages.map(m => m.content?.length || 0);
  return lengths.length > 0
    ? lengths.reduce((a, b) => a + b, 0) / lengths.length
    : 0;
}

function analyzeGiftTrend(gifts: Array<{ created_at: string }>) {
  if (gifts.length < 2) {
    return createSignal('gift_drop', 'stable', 0, 0, 'Yetersiz gift verisi');
  }

  // Check if recent gift activity dropped
  const recent = gifts.slice(0, Math.floor(gifts.length / 2));
  const older = gifts.slice(Math.floor(gifts.length / 2));

  let trend: WarningSignal['trend'] = 'stable';
  const description = 'Gift aktivitesi normal';

  if (recent.length === 0 && older.length > 0) {
    trend = 'critical';
    description = 'Gift aktivitesi durdu';
  } else if (recent.length < older.length * 0.5) {
    trend = 'declining';
    description = 'Gift aktivitesi azalıyor';
  }

  return {
    type: 'gift_drop',
    trend,
    currentValue: recent.length,
    previousValue: older.length,
    changePercent: older.length > 0
      ? Math.round(((recent.length - older.length) / older.length) * 100)
      : 0,
    description,
  };
}

function analyzeEngagementTrend(
  messages: Array<{ created_at: string }>,
  chat: { created_at: string; last_message_at: string | null },
) {
  const daysActive = chat.last_message_at
    ? (Date.now() - new Date(chat.created_at).getTime()) / (1000 * 60 * 60 * 24)
    : 1;

  const messagesPerDay = messages.length / Math.max(daysActive, 0.1);

  let trend: WarningSignal['trend'] = 'stable';
  let description = 'Aktivite seviyesi normal';

  if (messagesPerDay < 0.5) {
    trend = 'critical';
    description = 'Aktivite neredeyse durdu';
  } else if (messagesPerDay < 2) {
    trend = 'declining';
    description = 'Aktivite düşüyor';
  }

  return {
    type: 'engagement',
    trend,
    currentValue: Math.round(messagesPerDay * 10) / 10,
    previousValue: Math.round(messagesPerDay * 10) / 10, // Same as current for now
    changePercent: 0,
    description,
  };
}

function analyzeOnlinePresence(status: { is_online: boolean; last_seen_at: string | null }) {
  if (!status.last_seen_at) {
    return createSignal('online_presence', 'stable', 0, 0, 'Veri yok');
  }

  const lastSeen = new Date(status.last_seen_at).getTime();
  const hoursSince = (Date.now() - lastSeen) / (1000 * 60 * 60);

  let trend: WarningSignal['trend'] = 'stable';
  let description = 'Online durumu normal';

  if (hoursSince > 72) {
    trend = 'critical';
    description = '3+ gündür online değil';
  } else if (hoursSince > 48) {
    trend = 'declining';
    description = '2+ gündür online değil';
  }

  return {
    type: 'online_presence',
    trend,
    currentValue: Math.round(hoursSince * 10) / 10,
    previousValue: 0,
    changePercent: 0,
    description,
  };
}

function createSignal(
  type: WarningSignal['type'],
  trend: WarningSignal['trend'],
  current: number,
  previous: number,
  description: string,
): WarningSignal {
  return {
    type,
    trend,
    currentValue: current,
    previousValue: previous,
    changePercent: previous > 0
      ? Math.round(((current - previous) / previous) * 100)
      : 0,
    description,
  };
}

// ============================================================================
// Risk Calculation
// ============================================================================

function calculateRiskScore(signals: WarningSignal[]): number {
  const weights: Record<string, number> = {
    reply_time: 0.25,
    message_length: 0.2,
    gift_drop: 0.2,
    engagement: 0.2,
    online_presence: 0.15,
  };

  let score = 0;
  let weightSum = 0;

  for (const signal of signals) {
    const weight = weights[signal.type] || 0.1;
    const signalScore = trendToScore(signal.trend);
    score += signalScore * weight;
    weightSum += weight;
  }

  return Math.round(score / weightSum);
}

function trendToScore(trend: WarningSignal['trend']): number {
  const scores: Record<WarningSignal['trend'], number> = {
    improving: 10,
    stable: 30,
    declining: 60,
    critical: 90,
  };
  return scores[trend];
}

function getRiskLevel(score: number): GhostingRiskResult['riskLevel'] {
  if (score >= 80) return 'ghosting';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function generateActions(
  riskLevel: GhostingRiskResult['riskLevel'],
  signals: WarningSignal[],
): string[] {
  const actions: string[] = [];

  if (riskLevel === 'ghosting' || riskLevel === 'high') {
    // Gift suggestions - positive framing
    const giftSignal = signals.find(s => s.type === 'gift_drop');
    if (giftSignal?.trend === 'declining' || giftSignal?.trend === 'critical') {
      actions.push('Karşılıklı etkileşim arttığında gift atmak için harika bir zaman olacak');
    }

    // Engagement signals - positive framing
    const engagementSignal = signals.find(s => s.type === 'engagement');
    if (engagementSignal?.trend === 'critical') {
      actions.push('Yeni bir sohbet başlatmak için bekleyin - yanıt geldiğinde daha anlamlı olacak');
    }

    // Online absence - neutral info
    const onlineSignal = signals.find(s => s.type === 'online_presence');
    if (onlineSignal?.trend === 'critical') {
      actions.push('Kişi şu an çevrimiçi değil - enerjinizi koruyun');
    }
  }

  if (riskLevel === 'medium') {
    actions.push('Sohbete yeni bir bakış açısı katabilirsiniz');
    actions.push('Karşılıklı etkileşim için doğru anı bekleyin');
  }

  return actions;
}

// ============================================================================
// High-Risk Conversations for Admin
// ============================================================================

/**
 * Get all high-risk ghosting conversations
 */
export async function getHighRiskConversations(): Promise<GhostingRiskResult[]> {
  const { data: chats } = await supabase
    .from('chats')
    .select('id, user1_id, user2_id')
    .gte('last_message_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const results: GhostingRiskResult[] = [];

  for (const chat of chats || []) {
    // Check both users
    for (const userId of [chat.user1_id, chat.user2_id]) {
      const risk = await analyzeGhostingRisk({ chatId: chat.id, userId });
      if (risk.riskLevel === 'high' || risk.riskLevel === 'ghosting') {
        results.push(risk);
      }
    }
  }

  return results.sort((a, b) => b.riskScore - a.riskScore);
}

/**
 * Get ghosting risk for UI (user-facing, softened)
 */
export async function getSoftGhostingWarning(
  chatId: string,
  userId: string,
): Promise<{
  showWarning: boolean;
  message: string;
  suggestion: string;
}> {
  const risk = await analyzeGhostingRisk({ chatId, userId });

  if (risk.riskLevel === 'low') {
    return { showWarning: false, message: '', suggestion: '' };
  }

  // Softened messages for UI
  const messages: Record<string, { message: string; suggestion: string }> = {
    ghosting: {
      message: 'Bu sohbet bir süredir aktif değil',
      suggestion: 'Yeni bir anı keşfetmeyi deneyin',
    },
    high: {
      message: 'Karşı taraf yoğun görünüyor',
      suggestion: 'Ara vermek iyi bir fikir olabilir',
    },
    medium: {
      message: 'Sohbet tempo kaybediyor olabilir',
      suggestion: 'Farklı bir konu açmayı deneyin',
    },
  };

  return {
    showWarning: true,
    ...messages[risk.riskLevel],
  };
}

export const GHOSTING_CONFIG = {
  thresholds: {
    low: 40,
    medium: 60,
    high: 80,
  },
  minMessages: 5,
};
