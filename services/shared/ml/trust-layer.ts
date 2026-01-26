/**
 * Trust Layer (Internal Reputation System)
 *
 * Hidden trust score for algorithmic decisions.
 * NOT shown to users - used for:
 * - Risk assessment for matches
 * - Admin escalation decisions
 * - Content moderation prioritization
 * - Anti-fraud detection
 *
 * Score is composite of:
 * - Behavioral consistency
 * - Moderation history
 * - Gifting patterns
 * - Report rate
 * - Account age + activity
 *
 * Updated: 2026-01-26
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Component weights
const WEIGHTS = {
  behavioralConsistency: 0.25,
  moderationHistory: 0.30,
  giftingPatterns: 0.15,
  reportRate: 0.20,
  accountActivity: 0.10,
} as const;

export interface TrustScoreInput {
  userId: string;
}

export interface TrustScoreResult {
  userId: string;
  overallScore: number; // 0-100
  grade: 'excellent' | 'good' | 'average' | 'low' | 'risk';
  components: {
    behavioralConsistency: number;
    moderationHistory: number;
    giftingPatterns: number;
    reportRate: number;
    accountActivity: number;
  };
  riskFactors: string[];
  trustLevel: 'high' | 'medium' | 'low' | 'flagged';
  lastUpdated: string;
  recommendation: string;
}

/**
 * Calculate comprehensive trust score
 */
export async function calculateTrustScore(
  input: TrustScoreInput,
): Promise<TrustScoreResult> {
  const { userId } = input;

  // Gather all components in parallel
  const [
    behavioral,
    moderation,
    gifting,
    reports,
    account,
  ] = await Promise.all([
    getBehavioralScore(userId),
    getModerationScore(userId),
    getGiftingScore(userId),
    getReportScore(userId),
    getAccountScore(userId),
  ]);

  // Calculate weighted overall score
  const components = {
    behavioralConsistency: behavioral.score,
    moderationHistory: moderation.score,
    giftingPatterns: gifting.score,
    reportRate: reports.score,
    accountActivity: account.score,
  };

  let overallScore = 0;
  let weightSum = 0;

  for (const [key, weight] of Object.entries(WEIGHTS)) {
    overallScore += components[key as keyof typeof components] * weight;
    weightSum += weight;
  }

  overallScore = Math.round(overallScore / weightSum);

  // Collect risk factors
  const riskFactors: string[] = [];
  if (behavioral.score < 40) riskFactors.push('Tutarsız davranış kalıpları');
  if (moderation.score < 40) riskFactors.push('Moderasyon geçmişi sorunlu');
  if (reports.score < 40) riskFactors.push('Yüksek report oranı');
  if (gifting.score < 30) riskFactors.push('Gifting tutarsızlığı');

  // Determine trust level
  const trustLevel = overallScore >= 80 ? 'high'
    : overallScore >= 60 ? 'medium'
    : overallScore >= 40 ? 'low'
    : 'flagged';

  // Generate recommendation
  const recommendation = getRecommendation(overallScore, trustLevel, riskFactors);

  // Determine grade
  const grade = overallScore >= 90 ? 'excellent'
    : overallScore >= 70 ? 'good'
    : overallScore >= 50 ? 'average'
    : overallScore >= 30 ? 'low'
    : 'risk';

  return {
    userId,
    overallScore,
    grade,
    components,
    riskFactors,
    trustLevel,
    lastUpdated: new Date().toISOString(),
    recommendation,
  };
}

// ============================================================================
// Component Score Functions
// ============================================================================

async function getBehavioralScore(userId: string) {
  // Check for behavioral consistency:
  // - Regular login patterns
  - Message consistency over time
  // - Not creating many accounts

  const { data: logins } = await supabase
    .from('authaudit_logs')
    .select('created_at')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const { data: messages } = await supabase
    .from('messages')
    .select('id, created_at')
    .eq('sender_id', userId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  // Login consistency (spread over time = good)
  const loginDays = new Set(logins?.map(l => l.created_at.split('T')[0])).size;
  const loginScore = Math.min(100, loginDays * 7); // 10+ days = high score

  // Message consistency
  const messageDays = new Set(messages?.map(m => m.created_at.split('T')[0])).size;
  const messageScore = Math.min(100, messageDays * 8);

  const score = Math.round(loginScore * 0.4 + messageScore * 0.6);

  return {
    score,
    details: `${loginDays} gün aktif, ${messageDays} gün mesaj`,
  };
}

async function getModerationScore(userId: string) {
  // Check moderation history
  const { data: modLogs } = await supabase
    .from('moderation_logs')
    .select('action_taken, severity')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

  let score = 100;
  const issues: string[] = [];

  for (const log of modLogs || []) {
    if (log.action_taken === 'rejected') {
      score -= 15;
      issues.push('İçerik reddedildi');
    }
    if (log.severity === 'high') {
      score -= 20;
      issues.push('Yüksek şiddetli ihlal');
    }
  }

  // Check moments table for rejected/hidden
  const { data: rejectedMoments } = await supabase
    .from('moments')
    .select('id')
    .eq('user_id', userId)
    .eq('is_hidden', true)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  score -= rejectedMoments?.length ? rejectedMoments.length * 10 : 0;

  return {
    score: Math.max(0, score),
    details: `${modLogs?.length || 0} moderasyon kaydı, ${rejectedMoments?.length || 0} gizli anı`,
  };
}

async function getGiftingScore(userId: string) {
  // Gifting consistency and reciprocity
  const { data: sentGifts } = await supabase
    .from('gifts')
    .select('id, created_at')
    .eq('sender_id', userId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const { data: receivedGifts } = await supabase
    .from('gifts')
    .select('id')
    .eq('receiver_id', userId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  // Gift frequency
  const giftDays = new Set(sentGifts?.map(g => g.created_at.split('T')[0])).size;
  const giftScore = Math.min(100, giftDays * 10);

  // Reciprocity (receiving gifts is trust signal)
  const receivedCount = receivedGifts?.length || 0;
  const reciprocityScore = Math.min(100, receivedCount * 20);

  const score = Math.round(giftScore * 0.5 + reciprocityScore * 0.5);

  return {
    score,
    details: `${sentGifts?.length || 0} gift gönderildi, ${receivedCount} alındı`,
  };
}

async function getReportScore(userId: string) {
  // Report rate calculation
  const { data: reportsAgainst } = await supabase
    .from('reports')
    .select('id, status')
    .eq('reported_user_id', userId)
    .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

  const { data: totalInteractions } = await supabase
    .from('chats')
    .select('id')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

  const reportCount = reportsAgainst?.length || 0;
  const interactionCount = totalInteractions?.length || 1;
  const reportRate = (reportCount / interactionCount) * 100;

  // Score: lower report rate = higher score
  let score = 100;
  if (reportRate > 5) score = 80;
  if (reportRate > 10) score = 60;
  if (reportRate > 20) score = 40;
  if (reportRate > 30) score = 20;

  // Check report outcomes
  const validReports = reportsAgainst?.filter(r => r.status === 'valid').length || 0;
  if (validReports > 2) score -= 15;

  return {
    score: Math.max(0, score),
    details: `${reportCount} report (${Math.round(reportRate)}% oran)`,
  };
}

async function getAccountScore(userId: string) {
  // Account age and completeness
  const { data: account } = await supabase
    .from('users')
    .select('created_at, profile_completed_at, avatar_url')
    .eq('id', userId)
    .single();

  if (!account) {
    return { score: 0, details: 'Hesap bulunamadı' };
  }

  const created = new Date(account.created_at).getTime();
  const ageDays = (Date.now() - created) / (1000 * 60 * 60 * 24);

  // Age score
  const ageScore = Math.min(100, ageDays * 5); // 20 days = max

  // Completeness score
  let completenessScore = 50;
  if (account.profile_completed_at) completenessScore += 25;
  if (account.avatar_url) completenessScore += 25;

  const score = Math.round(ageScore * 0.6 + completenessScore * 0.4);

  return {
    score,
    details: `${Math.round(ageDays)} günlük hesap, profil ${account.profile_completed_at ? 'tamamlandı' : 'eksik'}`,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function getRecommendation(
  score: number,
  level: TrustScoreResult['trustLevel'],
  risks: string[],
): string {
  if (level === 'high') {
    return 'Düşük risk - normal algoritmik işlem';
  }
  if (level === 'medium') {
    return 'Orta risk - dikkatli eşleştirme önerilir';
  }
  if (level === 'low') {
    return 'Yüksek risk - admin incelemesi gerekebilir';
  }
  return 'Riskli - manuel değerlendirme şart';
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get cached trust score or calculate fresh
 */
export async function getTrustScore(
  userId: string,
  maxAgeHours = 24,
): Promise<TrustScoreResult | null> {
  const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000).toISOString();

  const { data: cached } = await supabase
    .from('trust_scores')
    .select('*')
    .eq('user_id', userId)
    .gte('updated_at', cutoff)
    .single();

  if (cached) {
    return {
      userId: cached.user_id,
      overallScore: cached.overall_score,
      grade: cached.grade,
      components: cached.components,
      riskFactors: cached.risk_factors || [],
      trustLevel: cached.trust_level,
      lastUpdated: cached.updated_at,
      recommendation: cached.recommendation,
    };
  }

  const result = await calculateTrustScore({ userId });

  // Cache result
  await supabase.from('trust_scores').upsert({
    user_id: userId,
    overall_score: result.overallScore,
    grade: result.grade,
    components: result.components,
    risk_factors: result.riskFactors,
    trust_level: result.trustLevel,
    recommendation: result.recommendation,
    updated_at: new Date().toISOString(),
  });

  return result;
}

/**
 * Get trust score for matching decisions
 */
export async function getMatchTrustLevel(
  user1Id: string,
  user2Id: string,
): Promise<{
  level: 'safe' | 'caution' | 'review';
  reasons: string[];
}> {
  const [trust1, trust2] = await Promise.all([
    getTrustScore(user1Id),
    getTrustScore(user2Id),
  ]);

  if (!trust1 || !trust2) {
    return { level: 'caution', reasons: ['Güven verisi yetersiz'] };
  }

  const avgScore = (trust1.overallScore + trust2.overallScore) / 2;
  const risks = [...trust1.riskFactors, ...trust2.riskFactors];

  let level: 'safe' | 'caution' | 'review' = 'safe';
  if (avgScore < 50 || risks.length > 2) level = 'review';
  else if (avgScore < 70) level = 'caution';

  return { level, reasons: risks.slice(0, 3) };
}

/**
 * Get users requiring admin review
 */
export async function getFlaggedUsers(): Promise<TrustScoreResult[]> {
  const { data: flagged } = await supabase
    .from('trust_scores')
    .select('*')
    .eq('trust_level', 'flagged')
    .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('overall_score', { ascending: true })
    .limit(50);

  return (flagged || []).map(f => ({
    userId: f.user_id,
    overallScore: f.overall_score,
    grade: f.grade,
    components: f.components,
    riskFactors: f.risk_factors || [],
    trustLevel: f.trust_level,
    lastUpdated: f.updated_at,
    recommendation: f.recommendation,
  }));
}

export const TRUST_CONFIG = {
  weights: WEIGHTS,
  thresholds: {
    high: 80,
    medium: 60,
    low: 40,
  },
};
