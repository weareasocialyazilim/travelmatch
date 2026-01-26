/**
 * Conversation Health Monitor (AI-lite)
 *
 * Analyzes conversations for health indicators without using heavy ML.
 * Focuses on behavioral patterns that indicate:
 * - One-sided conversations
 * - Negative/toxic tone
 * - Manipulation patterns
 * - Excessive intensity
 *
 * Outputs health score (0-100) and flags for admin review.
 *
 * Updated: 2026-01-26
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Negative patterns to detect
const TOXIC_PATTERNS = [
  /\b(siktir|amk|oç|sikt|yarak|piç|pezevenk|hıyar|şerefsiz)\b/i,
  /\b(seni|senin).{0,20}(sikeyim|öldürecek|bıçak)\b/i,
];

const MANIPULATION_PATTERNS = [
  /{3,}/, // Excessive punctuation
  /^[A-Z\s]{20,}$/, // ALL CAPS sentences
  /(((?!you|him|her).)*){0,10}(love|hate).{0,10}(me|him|her|us)(?!.{0,30}(sorry|apology))/i,
];

const NEEDINESS_PATTERNS = [
  /(.{0,20})(why|when).{0,20}(not|don't).{0,20}(reply|answer|text)/i,
  /miss you/i,
  /{2,}/, // Multiple question marks
];

export interface ConversationHealthInput {
  chatId: string;
}

export interface ConversationHealthResult {
  chatId: string;
  overallScore: number; // 0-100 (higher = healthier)
  healthGrade: 'healthy' | 'warning' | 'concern' | 'critical';
  indicators: HealthIndicator[];
  flags: HealthFlag[];
  riskLevel: 'low' | 'medium' | 'high';
  lastAnalyzed: string;
}

export interface HealthIndicator {
  name: string;
  score: number; // 0-100
  details: string;
}

export interface HealthFlag {
  type: 'toxicity' | 'one_sided' | 'manipulation' | 'intensity' | 'ghosting_risk';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestedAction: string;
}

/**
 * Analyze conversation health
 */
export async function analyzeConversationHealth(
  input: ConversationHealthInput,
): Promise<ConversationHealthResult> {
  const { chatId } = input;

  // Get conversation messages
  const { data: messages } = await supabase
    .from('messages')
    .select('id, content, sender_id, created_at')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })
    .limit(100);

  if (!messages || messages.length === 0) {
    return {
      chatId,
      overallScore: 50,
      healthGrade: 'warning',
      indicators: [
        { name: 'no_data', score: 50, details: 'Yetersiz veri' },
      ],
      flags: [],
      riskLevel: 'low',
      lastAnalyzed: new Date().toISOString(),
    };
  }

  // Analyze each dimension
  const balance = analyzeBalance(messages);
  const toxicity = analyzeToxicity(messages);
  const engagement = analyzeEngagement(messages);
  const pace = analyzePace(messages);
  const manipulation = analyzeManipulation(messages);

  // Calculate overall score
  const overallScore = Math.round(
    (balance.score * 0.25 +
      toxicity.score * 0.25 +
      engagement.score * 0.2 +
      pace.score * 0.15 +
      manipulation.score * 0.15)
  );

  // Generate flags
  const flags: HealthFlag[] = [];
  if (toxicity.score < 40) {
    flags.push({
      type: 'toxicity',
      severity: toxicity.score < 20 ? 'high' : 'medium',
      description: 'Olumsuz içerik tespit edildi',
      suggestedAction: 'İçeriği manuel incele',
    });
  }
  if (balance.score < 30) {
    flags.push({
      type: 'one_sided',
      severity: 'high',
      description: 'Tek taraflı sohbet - bir kişi çoğunlukla yazıyor',
      suggestedAction: 'Kullanıcıya fark ettirmeden izle',
    });
  }
  if (manipulation.score < 40) {
    flags.push({
      type: 'manipulation',
      severity: 'medium',
      description: 'Manipülatif dil kalıpları tespit edildi',
      suggestedAction: 'Gifting opsiyonlarını kısıtla',
    });
  }
  if (pace.score > 80) {
    flags.push({
      type: 'intensity',
      severity: 'medium',
      description: 'Aşırı yoğun mesajlaşma',
      suggestedAction: 'Kullanıcıya ara verme öner',
    });
  }

  // Determine risk level
  const riskLevel = overallScore < 40 ? 'high' : overallScore < 60 ? 'medium' : 'low';

  // Determine grade
  const healthGrade = overallScore >= 80 ? 'healthy'
    : overallScore >= 60 ? 'warning'
    : overallScore >= 40 ? 'concern'
    : 'critical';

  return {
    chatId,
    overallScore,
    healthGrade,
    indicators: [balance, toxicity, engagement, pace, manipulation],
    flags,
    riskLevel,
    lastAnalyzed: new Date().toISOString(),
  };
}

// ============================================================================
// Analysis Functions
// ============================================================================

function analyzeBalance(messages: Array<{ sender_id: string }>) {
  const counts: Record<string, number> = {};
  for (const msg of messages) {
    counts[msg.sender_id] = (counts[msg.sender_id] || 0) + 1;
  }

  const values = Object.values(counts);
  const total = values.reduce((a, b) => a + b, 0);
  const max = Math.max(...values);
  const balanceRatio = total > 0 ? (total - max) / total : 0;

  const score = Math.round(balanceRatio * 100);
  const dominantUser = Object.entries(counts).find(([_, v]) => v === max)?.[0];

  return {
    name: 'balance',
    score,
    details: `${values.length > 1 ? `Kullanıcılar arası dağılım: ${Math.round(values[0]/total*100)}% / ${Math.round(values[1]/total*100)}%` : 'Tek kullanıcı'}`
  };
}

function analyzeToxicity(messages: Array<{ content: string | null }>) {
  let toxicCount = 0;
  let flaggedMessages: string[] = [];

  for (const msg of messages) {
    if (!msg.content) continue;

    for (const pattern of TOXIC_PATTERNS) {
      if (pattern.test(msg.content)) {
        toxicCount++;
        flaggedMessages.push(msg.content.substring(0, 50));
        break;
      }
    }
  }

  const toxicityRate = messages.length > 0 ? (toxicCount / messages.length) * 100 : 0;
  const score = Math.max(0, 100 - (toxicityRate * 50)); // Heavy penalty for any toxicity

  return {
    name: 'toxicity',
    score,
    details: toxicCount > 0
      ? `${toxicCount} mesajda olumsuz içerik tespit edildi`
      : 'Temiz içerik',
  };
}

function analyzeEngagement(messages: Array<{ created_at: string }>) {
  if (messages.length < 5) {
    return { name: 'engagement', score: 50, details: 'Yetersiz mesaj sayısı' };
  }

  // Calculate reply rate (consecutive messages from different senders)
  let replies = 0;
  for (let i = 1; i < messages.length; i++) {
    if (messages[i].sender_id !== messages[i-1].sender_id) {
      replies++;
    }
  }

  const replyRate = messages.length > 1 ? (replies / (messages.length - 1)) * 100 : 0;
  const score = Math.round(replyRate);

  return {
    name: 'engagement',
    score,
    details: `${Math.round(replyRate)}% yanıt oranı`,
  };
}

function analyzePace(messages: Array<{ created_at: string }>) {
  if (messages.length < 2) {
    return { name: 'pace', score: 50, details: 'Yetersiz veri' };
  }

  // Calculate message frequency
  const firstMessage = new Date(messages[0].created_at).getTime();
  const lastMessage = new Date(messages[messages.length - 1].created_at).getTime();
  const durationHours = (lastMessage - firstMessage) / (1000 * 60 * 60);

  if (durationHours < 0.1) {
    // Less than 6 minutes - very high intensity
    return {
      name: 'pace',
      score: 20,
      details: 'Çok yoğun mesajlaşma (>100 mesaj/saat)',
    };
  }

  const messagesPerHour = messages.length / Math.max(durationHours, 0.1);
  let score = 100;

  if (messagesPerHour > 50) score = 30;
  else if (messagesPerHour > 20) score = 50;
  else if (messagesPerHour > 10) score = 70;
  else if (messagesPerHour > 5) score = 85;

  return {
    name: 'pace',
    score,
    details: `${Math.round(messagesPerHour)} mesaj/saat yoğunluk`,
  };
}

function analyzeManipulation(messages: Array<{ content: string | null }>) {
  let manipulationCount = 0;

  for (const msg of messages) {
    if (!msg.content) continue;

    // Check for excessive punctuation
    if (MANIPULATION_PATTERNS[0].test(msg.content)) manipulationCount++;

    // Check for ALL CAPS
    if (MANIPULATION_PATTERNS[1].test(msg.content)) manipulationCount++;

    // Check for neediness patterns
    for (const pattern of NEEDINESS_PATTERNS) {
      if (pattern.test(msg.content)) {
        manipulationCount++;
        break;
      }
    }
  }

  const manipulationRate = messages.length > 0
    ? (manipulationCount / messages.length) * 100
    : 0;
  const score = Math.max(0, 100 - (manipulationRate * 20));

  return {
    name: 'manipulation',
    score,
    details: manipulationCount > 0
      ? `${manipulationCount} mesajda potansiyel manipülatif içerik`
      : 'Sağlıklı iletişim kalıpları',
  };
}

// ============================================================================
// Admin Actions
// ============================================================================

/**
 * Get all unhealthy conversations for admin review
 */
export async function getUnhealthyConversations(
  limit = 50,
): Promise<ConversationHealthResult[]> {
  const { data: chats } = await supabase
    .from('chats')
    .select('id')
    .order('last_message_at', { ascending: false })
    .limit(limit * 2); // Fetch more to filter

  const results: ConversationHealthResult[] = [];

  for (const chat of chats || []) {
    const health = await analyzeConversationHealth({ chatId: chat.id });
    if (health.riskLevel === 'medium' || health.riskLevel === 'high') {
      results.push(health);
    }
    if (results.length >= limit) break;
  }

  return results.sort((a, b) => a.overallScore - b.overallScore);
}

/**
 * Get conversation health for a user (their perspective)
 */
export async function getUserConversationHealth(
  userId: string,
): Promise<{
  avgScore: number;
  flaggedCount: number;
  recommendations: string[];
}> {
  const { data: chats } = await supabase
    .from('chats')
    .select('id')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

  let totalScore = 0;
  let flaggedCount = 0;
  const recommendations: string[] = [];

  for (const chat of chats || []) {
    const health = await analyzeConversationHealth({ chatId: chat.id });
    totalScore += health.overallScore;

    if (health.riskLevel === 'high') {
      flaggedCount++;
    }

    // Generate recommendations
    if (health.indicators.find(i => i.name === 'pace' && i.score < 50)) {
      recommendations.push('Çok yoğun sohbetler için ara vermeyi düşünün');
    }
    if (health.indicators.find(i => i.name === 'balance' && i.score < 50)) {
      recommendations.push('Karşı tarafa da söz hakkı verin');
    }
  }

  const avgScore = chats && chats.length > 0
    ? Math.round(totalScore / chats.length)
    : 50;

  return {
    avgScore,
    flaggedCount,
    recommendations: recommendations.slice(0, 3),
  };
}

/**
 * Record health analysis result
 */
export async function recordHealthAnalysis(
  result: ConversationHealthResult,
): Promise<void> {
  await supabase.from('conversation_health_logs').insert({
    chat_id: result.chatId,
    overall_score: result.overallScore,
    health_grade: result.healthGrade,
    risk_level: result.riskLevel,
    flags: result.flags,
    metadata: result,
    analyzed_at: new Date().toISOString(),
  });
}

export const HEALTH_CONFIG = {
  thresholds: {
    healthy: 80,
    warning: 60,
    concern: 40,
  },
  minMessages: 5,
};
