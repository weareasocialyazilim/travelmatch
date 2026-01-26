/**
 * Creator/VIP System - Multi-Currency Edition
 *
 * Creators are curators of moments and experiences.
 * NOT content sellers - no subscription, no parasocial monetization.
 *
 * All values are stored in LVND/TL, displayed in user's currency.
 */

import { createClient } from '@supabase/supabase-js';
import { convertFromTL, getExchangeRate, getUserCurrency, formatCurrency } from './currency-exchange';
import { getUserBalance, creditLVND, debitLVND } from './lvnd-economy';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================================
// CREATOR TYPES
// ============================================================================

export type CreatorTier = 'bronze' | 'silver' | 'gold';
export type CreatorStatus = 'pending' | 'active' | 'suspended' | 'revoked';

export interface CreatorProfile {
  userId: string;
  tier: CreatorTier;
  status: CreatorStatus;
  cqsScore: number; // Creator Quality Score
  totalEarned: number;
  pendingPayout: number;
  totalMoments: number;
  fulfilledOffers: number;
  rejectedOffers: number;
  avgResponseTime: number;
  lastCalculatedAt: string;
}

export interface CreatorApplication {
  id: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  portfolioLinks: string[];
  applicationText: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

// ============================================================================
// CREATOR ELIGIBILITY
// ============================================================================

export interface EligibilityResult {
  eligible: boolean;
  requirements: {
    name: string;
    required: number;
    current: number;
    met: boolean;
  }[];
  recommendations: string[];
}

/**
 * Check creator eligibility
 */
export async function checkCreatorEligibility(userId: string): Promise<EligibilityResult> {
  const requirements = [
    {
      name: 'Hesap Yaşı',
      required: 90,
      current: await getAccountAge(userId),
      met: false,
    },
    {
      name: 'Oluşturulan Moment',
      required: 20,
      current: await getMomentCount(userId),
      met: false,
    },
    {
      name: 'Moment Kalite Skoru',
      required: 75,
      current: await getAvgMomentQuality(userId),
      met: false,
    },
    {
      name: 'Trust Score',
      required: 0.8,
      current: await getTrustScore(userId),
      met: false,
    },
    {
      name: 'Report Oranı (max)',
      required: 0.05,
      current: await getReportRate(userId),
      met: false,
    },
    {
      name: 'Fulfillment Rate (min)',
      required: 0.9,
      current: await getFulfillmentRate(userId),
      met: false,
    },
  ];

  // Update met status
  for (const req of requirements) {
    req.met = req.current >= req.required;
  }

  const eligible = requirements.filter((r) => r.met).length >= 5; // Need at least 5/6

  const recommendations = requirements
    .filter((r) => !r.met)
    .map((r) => `${r.name} için ${r.required - r.current} daha fazla gerekiyor`);

  return { eligible, requirements, recommendations };
}

/**
 * Calculate Creator Quality Score (CQS)
 */
export async function calculateCQS(userId: string): Promise<number> {
  // Get metrics
  const fulfillment = await getFulfillmentRate(userId);
  const quality = await getAvgMomentQuality(userId);
  const rating = await getAvgRating(userId);
  const consistency = await getConsistencyScore(userId);
  const safety = await getSafetyScore(userId);

  // Weights
  const weights = {
    fulfillment: 0.25,
    quality: 0.25,
    rating: 0.20,
    consistency: 0.15,
    safety: 0.15,
  };

  const cqs =
    fulfillment * weights.fulfillment +
    quality * weights.quality +
    rating * weights.rating +
    consistency * weights.consistency +
    safety * weights.safety;

  return Math.round(cqs * 100) / 100; // 0-100 scale
}

/**
 * Update creator status based on CQS
 */
export async function updateCreatorStatus(userId: string): Promise<{
  updated: boolean;
  newTier?: CreatorTier;
  message?: string;
}> {
  const cqs = await calculateCQS(userId);

  // Determine tier
  let newTier: CreatorTier;
  if (cqs >= 85) newTier = 'gold';
  else if (cqs >= 70) newTier = 'silver';
  else if (cqs >= 60) newTier = 'bronze';
  else {
    return { updated: false, message: 'CQS too low for creator status' };
  }

  // Update or create creator record
  const { error } = await supabase.from('creator_status').upsert({
    user_id: userId,
    tier: newTier,
    cqs_score: cqs,
    moment_count: await getMomentCount(userId),
    fulfilled_offers: await getFulfilledOffers(userId),
    rejected_offers: await getRejectedOffers(userId),
    avg_response_time_hours: await getAvgResponseTime(userId),
    last_calculated_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return { updated: false, message: error.message };
  }

  return { updated: true, newTier };
}

// ============================================================================
// CREATOR APPLICATION
// ============================================================================

export interface SubmitApplicationResult {
  success: boolean;
  applicationId?: string;
  error?: string;
}

/**
 * Submit creator application
 */
export async function submitCreatorApplication(
  userId: string,
  applicationText: string,
  portfolioLinks: string[]
): Promise<SubmitApplicationResult> {
  // Check eligibility
  const eligibility = await checkCreatorEligibility(userId);
  if (!eligibility.eligible) {
    return {
      success: false,
      error: `Creator başvurusu için önce gereksinimleri karşılamalısınız. ${eligibility.recommendations[0] || ''}`,
    };
  }

  // Check for existing application
  const { data: existing } = await supabase
    .from('creator_applications')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['pending', 'approved'])
    .single();

  if (existing) {
    return {
      success: false,
      error: 'Zaten aktif bir başvurunuz var',
    };
  }

  const { data: application, error } = await supabase
    .from('creator_applications')
    .insert({
      user_id: userId,
      status: 'pending',
      application_text: applicationText,
      portfolio_links: portfolioLinks,
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, applicationId: application.id };
}

/**
 * Review creator application (Admin)
 */
export async function reviewCreatorApplication(
  applicationId: string,
  adminId: string,
  decision: 'approved' | 'rejected',
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const { data: application, error: fetchError } = await supabase
    .from('creator_applications')
    .select('*')
    .eq('id', applicationId)
    .single();

  if (fetchError || !application) {
    return { success: false, error: 'Application not found' };
  }

  if (application.status !== 'pending') {
    return { success: false, error: 'Application already reviewed' };
  }

  // Update application
  await supabase
    .from('creator_applications')
    .update({
      status: decision,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      review_notes: notes,
    })
    .eq('id', applicationId);

  // If approved, create creator record
  if (decision === 'approved') {
    await supabase.from('creator_status').insert({
      user_id: application.user_id,
      tier: 'bronze',
      cqs_score: await calculateCQS(application.user_id),
      moment_count: await getMomentCount(application.user_id),
      fulfilled_offers: 0,
      rejected_offers: 0,
      avg_response_time_hours: 24,
      created_at: new Date().toISOString(),
    });
  }

  // Log admin action
  await supabase.from('admin_audit_logs').insert({
    admin_id: adminId,
    action: 'creator_application_review',
    resource_type: 'creator_application',
    resource_id: applicationId,
    new_value: decision,
    reason: notes,
    created_at: new Date().toISOString(),
  });

  return { success: true };
}

// ============================================================================
// CREATOR EARNINGS AND PAYOUTS
// ============================================================================

export interface CreatorEarnings {
  totalEarned: number;
  pendingPayout: number;
  availablePayout: number;
  displayTotal: string;
  displayPending: string;
  displayAvailable: string;
}

/**
 * Get creator earnings
 */
export async function getCreatorEarnings(userId: string): Promise<CreatorEarnings> {
  const { data: status } = await supabase
    .from('creator_status')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!status) {
    return {
      totalEarned: 0,
      pendingPayout: 0,
      availablePayout: 0,
      displayTotal: '0 LVND',
      displayPending: '0 LVND',
      displayAvailable: '0 LVND',
    };
  }

  const currency = await getUserCurrency(userId);
  const exchangeRate = await getExchangeRate(currency);

  return {
    totalEarned: status.total_earned || 0,
    pendingPayout: status.pending_payout || 0,
    availablePayout: Math.max(0, (status.total_earned || 0) - (status.pending_payout || 0)),
    displayTotal: formatCurrency(status.total_earned || 0, currency, exchangeRate.rate),
    displayPending: formatCurrency(status.pending_payout || 0, currency, exchangeRate.rate),
    displayAvailable: formatCurrency(
      Math.max(0, (status.total_earned || 0) - (status.pending_payout || 0)),
      currency,
      exchangeRate.rate
    ),
  };
}

/**
 * Request payout
 */
export async function requestPayout(
  userId: string,
  amount?: number
): Promise<{ success: boolean; payoutId?: string; error?: string }> {
  const earnings = await getCreatorEarnings(userId);

  const payoutAmount = amount || earnings.availablePayout;

  if (payoutAmount < 1000) {
    return { success: false, error: 'Minimum payout is 1000 LVND' };
  }

  if (payoutAmount > earnings.availablePayout) {
    return { success: false, error: 'Insufficient available balance' };
  }

  const payoutId = `payout_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  // Create payout record
  const { error } = await supabase.from('creator_payouts').insert({
    id: payoutId,
    creator_id: userId,
    amount: payoutAmount,
    status: 'pending',
    requested_at: new Date().toISOString(),
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Update pending balance
  await supabase.rpc('add_creator_payout_hold', {
    creator_id: userId,
    amount: payoutAmount,
  });

  return { success: true, payoutId };
}

/**
 * Process accepted offer (credit creator)
 */
export async function creditCreatorForOffer(
  creatorUserId: string,
  offerAmount: number
): Promise<void> {
  const platformFee = 0.15; // 15% platform fee
  const creatorShare = offerAmount * (1 - platformFee);

  const { data: status } = await supabase
    .from('creator_status')
    .select('*')
    .eq('user_id', creatorUserId)
    .single();

  if (!status) return;

  // Update totals
  await supabase.rpc('creator_earn', {
    creator_id: creatorUserId,
    amount: creatorShare,
    offer_amount: offerAmount,
  });

  // Credit LVND balance
  await creditLVND(creatorUserId, creatorShare, 'earn_creator', `offer_${Date.now()}`);
}

// ============================================================================
// CREATOR CONSTRAINTS (CRITICAL)
// ============================================================================

export const CREATOR_CONSTRAINTS = {
  maxOfferValue: 5000, // LVND
  minResponseTimeHours: 4,
  maxRejectRate: 0.15,
  platformFeePercent: 0.15,
  payoutHoldDays: 7,
  maxActiveMoments: {
    bronze: 10,
    silver: 20,
    gold: 30,
  },
  momentReviewRequired: true,
  noSubscriptionModel: true,
  noDirectPayment: true,
};

/**
 * Check if creator can perform action
 */
export async function canCreatorPerform(
  userId: string,
  action: 'create_moment' | 'accept_offer' | 'request_payout'
): Promise<{ allowed: boolean; reason?: string }> {
  const { data: status } = await supabase
    .from('creator_status')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!status) {
    return { allowed: false, reason: 'Not a creator' };
  }

  if (status.status !== 'active') {
    return { allowed: false, reason: 'Creator status is not active' };
  }

  // Check reject rate
  const rejectRate = status.rejected_offers / (status.fulfilled_offers + status.rejected_offers + 1);
  if (rejectRate > CREATOR_CONSTRAINTS.maxRejectRate) {
    return { allowed: false, reason: 'Reject rate too high' };
  }

  // Check CQS decay (if too low, suspend)
  if (status.cqs_score < 60) {
    await supabase
      .from('creator_status')
      .update({ status: 'suspended' })
      .eq('user_id', userId);
    return { allowed: false, reason: 'CQS score too low' };
  }

  return { allowed: true };
}

// ============================================================================
// ADMIN FUNCTIONS
// ============================================================================

/**
 * Revoke creator status (Admin)
 */
export async function revokeCreator(
  userId: string,
  adminId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  await supabase
    .from('creator_status')
    .update({
      status: 'revoked',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  // Log admin action
  await supabase.from('admin_audit_logs').insert({
    admin_id: adminId,
    action: 'revoke_creator',
    resource_type: 'creator_status',
    resource_id: userId,
    new_value: 'revoked',
    reason,
    created_at: new Date().toISOString(),
  });

  return { success: true };
}

/**
 * Adjust creator tier (Admin)
 */
export async function adjustCreatorTier(
  userId: string,
  adminId: string,
  newTier: CreatorTier,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('creator_status')
    .update({
      tier: newTier,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  await supabase.from('admin_audit_logs').insert({
    admin_id: adminId,
    action: 'adjust_creator_tier',
    resource_type: 'creator_status',
    resource_id: userId,
    new_value: newTier,
    reason,
    created_at: new Date().toISOString(),
  });

  return { success: true };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getAccountAge(userId: string): Promise<number> {
  const { data: user } = await supabase
    .from('users')
    .select('created_at')
    .eq('id', userId)
    .single();

  if (!user) return 0;

  const created = new Date(user.created_at).getTime();
  return (Date.now() - created) / (1000 * 60 * 60 * 24);
}

async function getMomentCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from('moments')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  return count || 0;
}

async function getAvgMomentQuality(userId: string): Promise<number> {
  // Would use ML quality score if available
  return 80; // Placeholder
}

async function getTrustScore(userId: string): Promise<number> {
  // From trust-layer service
  return 0.85; // Placeholder
}

async function getReportRate(userId: string): Promise<number> {
  const { count: reports } = await supabase
    .from('reports')
    .select('id', { count: 'exact', head: true })
    .eq('reported_user_id', userId);

  const { count: interactions } = await supabase
    .from('chats')
    .select('id', { count: 'exact', head: true })
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

  return interactions ? reports! / interactions : 0;
}

async function getFulfillmentRate(userId: string): Promise<number> {
  const fulfilled = await getFulfilledOffers(userId);
  const rejected = await getRejectedOffers(userId);
  return fulfilled + rejected > 0 ? fulfilled / (fulfilled + rejected) : 0.9;
}

async function getFulfilledOffers(userId: string): Promise<number> {
  const { count } = await supabase
    .from('offers')
    .select('id', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .eq('state', 'accepted');

  return count || 0;
}

async function getRejectedOffers(userId: string): Promise<number> {
  const { count } = await supabase
    .from('offers')
    .select('id', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .eq('state', 'rejected');

  return count || 0;
}

async function getAvgRating(userId: string): Promise<number> {
  return 4.5; // Placeholder
}

async function getConsistencyScore(userId: string): Promise<number> {
  return 0.8; // Placeholder
}

async function getSafetyScore(userId: string): Promise<number> {
  return 0.9; // Placeholder
}

async function getAvgResponseTime(userId: string): Promise<number> {
  return 12; // Hours, placeholder
}

/**
 * Creator System Configuration
 */
export const CREATOR_CONFIG = {
  ...CREATOR_CONSTRAINTS,
  cqsThresholds: {
    gold: 85,
    silver: 70,
    bronze: 60,
  },
  reviewQueuePriority: true,
};
