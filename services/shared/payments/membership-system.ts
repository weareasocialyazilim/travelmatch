/**
 * Membership System - Multi-Currency Edition
 *
 * Membership unlocks capabilities that improve quality, not quantity.
 * All prices are stored in TRY, displayed in user's preferred currency.
 */

import { createClient } from '@supabase/supabase-js';
import { convertFromTL, getExchangeRate, getUserCurrency, formatCurrency } from './currency-exchange';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================================
// MEMBERSHIP TIERS
// ============================================================================

export type MembershipTier = 'free' | 'premium' | 'platinum';

export interface MembershipTierConfig {
  tier: MembershipTier;
  name: string;
  monthlyPriceTRY: number;
  yearlyPriceTRY: number;
  features: string[];
  capabilities: MembershipCapabilities;
}

export interface MembershipCapabilities {
  dailyOffers: number;
  counterOffers: boolean;
  moderationPriority: 'standard' | 'fast' | 'priority';
  analyticsDepth: 'basic' | 'detailed' | 'full';
  momentTiers: string[];
  visibilityBoost: number;
  escrowDays: number;
  supportPriority: 'standard' | 'fast' | 'concierge';
}

export const MEMBERSHIP_TIERS: MembershipTierConfig[] = [
  {
    tier: 'free',
    name: 'Standart',
    monthlyPriceTRY: 0,
    yearlyPriceTRY: 0,
    features: [
      'Temel gifting',
      'Standart visibility',
      'Günlük 3 offer',
      'Basit analytics',
    ],
    capabilities: {
      dailyOffers: 3,
      counterOffers: false,
      moderationPriority: 'standard',
      analyticsDepth: 'basic',
      momentTiers: ['tier_0'],
      visibilityBoost: 1.0,
      escrowDays: 7,
      supportPriority: 'standard',
    },
  },
  {
    tier: 'premium',
    name: 'Premium',
    monthlyPriceTRY: 49,
    yearlyPriceTRY: 470, // 20% discount
    features: [
      'Tüm Standart özellikler',
      'Gelişmiş analytics',
      'Hızlı moderasyon',
      'Counter-offer yapabilme',
      '%10 offer indirimi',
      'Günlük 5 offer',
      'Tier-30 moment\'lere erişim',
    ],
    capabilities: {
      dailyOffers: 5,
      counterOffers: true,
      moderationPriority: 'fast',
      analyticsDepth: 'detailed',
      momentTiers: ['tier_0', 'tier_30'],
      visibilityBoost: 1.2,
      escrowDays: 3,
      supportPriority: 'fast',
    },
  },
  {
    tier: 'platinum',
    name: 'Platinum',
    monthlyPriceTRY: 99,
    yearlyPriceTRY: 950, // 20% discount
    features: [
      'Tüm Premium özellikler',
      'Full analytics & ML öngörüleri',
      'Öncelikli moderasyon',
      '%20 offer indirimi',
      'Günlük 8 offer',
      'Tier-100 moment\'lere erişim',
      'Concierge desteği',
      'VIP badge',
    ],
    capabilities: {
      dailyOffers: 8,
      counterOffers: true,
      moderationPriority: 'priority',
      analyticsDepth: 'full',
      momentTiers: ['tier_0', 'tier_30', 'tier_100'],
      visibilityBoost: 1.4,
      escrowDays: 1,
      supportPriority: 'concierge',
    },
  },
];

// ============================================================================
// MEMBERSHIP OPERATIONS
// ============================================================================

export interface MembershipStatus {
  tier: MembershipTier;
  status: 'active' | 'cancelled' | 'past_due' | 'trial';
  startedAt: string;
  expiresAt: string | null;
  trialUsed: boolean;
}

export interface MembershipCapabilities {
  dailyOffers: number;
  counterOffers: boolean;
  moderationPriority: string;
  analyticsDepth: string;
  visibilityBoost: number;
}

/**
 * Get user's membership status
 */
export async function getMembershipStatus(userId: string): Promise<{
  hasActive: boolean;
  membership?: MembershipStatus;
  capabilities?: MembershipCapabilities;
}> {
  const { data: membership, error } = await supabase
    .from('memberships')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['active', 'trial'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !membership) {
    return { hasActive: false };
  }

  // Check expiry
  if (membership.expires_at && new Date(membership.expires_at) < new Date()) {
    // Update expired
    await supabase
      .from('memberships')
      .update({ status: 'cancelled' })
      .eq('id', membership.id);

    return { hasActive: false };
  }

  const tierConfig = MEMBERSHIP_TIERS.find((t) => t.tier === membership.tier);
  if (!tierConfig) {
    return { hasActive: false };
  }

  return {
    hasActive: true,
    membership: {
      tier: membership.tier as MembershipTier,
      status: membership.status as MembershipStatus['status'],
      startedAt: membership.started_at,
      expiresAt: membership.expires_at,
      trialUsed: membership.trial_used,
    },
    capabilities: tierConfig.capabilities,
  };
}

/**
 * Get user's effective tier
 */
export async function getEffectiveTier(userId: string): Promise<MembershipTier> {
  const status = await getMembershipStatus(userId);
  return status.membership?.tier || 'free';
}

/**
 * Check if user has access to a feature
 */
export async function hasFeatureAccess(
  userId: string,
  feature: keyof MembershipCapabilities
): Promise<boolean> {
  const status = await getMembershipStatus(userId);

  if (!status.capabilities) {
    // Free tier defaults
    const freeTier = MEMBERSHIP_TIERS.find((t) => t.tier === 'free')!;
    return freeTier.capabilities[feature] as unknown as boolean;
  }

  const value = status.capabilities[feature];
  return !!value;
}

/**
 * Get numeric capability value
 */
export async function getNumericCapability(
  userId: string,
  capability: 'dailyOffers' | 'visibilityBoost' | 'escrowDays'
): Promise<number> {
  const status = await getMembershipStatus(userId);

  if (!status.capabilities) {
    const freeTier = MEMBERSHIP_TIERS.find((t) => t.tier === 'free')!;
    return freeTier.capabilities[capability] as number;
  }

  return status.capabilities[capability] as number;
}

// ============================================================================
// PURCHASE FLOW
// ============================================================================

export interface PurchaseMembershipRequest {
  userId: string;
  tier: MembershipTier;
  billingCycle: 'monthly' | 'yearly';
  paymentId: string;
  localAmount: number;
  localCurrency: string;
  exchangeRate: number;
}

export interface PurchaseMembershipResult {
  success: boolean;
  membershipId?: string;
  expiresAt?: string;
  displayPrice?: string;
  error?: string;
}

/**
 * Purchase membership
 */
export async function purchaseMembership(
  request: PurchaseMembershipRequest
): Promise<PurchaseMembershipResult> {
  const { userId, tier, billingCycle, paymentId, localAmount, localCurrency, exchangeRate } = request;

  const tierConfig = MEMBERSHIP_TIERS.find((t) => t.tier === tier);
  if (!tierConfig) {
    return { success: false, error: 'Invalid tier' };
  }

  const priceTRY = billingCycle === 'yearly' ? tierConfig.yearlyPriceTRY : tierConfig.monthlyPriceTRY;

  // Verify amount
  const expectedTL = convertToTL(localAmount, localCurrency, exchangeRate);
  const tolerance = expectedTL * 0.02;

  if (Math.abs(expectedTL - priceTRY) > tolerance) {
    return {
      success: false,
      error: `Price mismatch. Expected: ${priceTRY} TL`,
    };
  }

  // Calculate expiry
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + (billingCycle === 'yearly' ? 12 : 1));

  try {
    // Check for existing membership
    const { data: existing } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'trial'])
      .single();

    let membershipId: string;

    if (existing) {
      // Extend existing or upgrade
      const { data: updated, error } = await supabase
        .from('memberships')
        .update({
          tier,
          status: 'active',
          expires_at: expiresAt.toISOString(),
          payment_method_id: paymentId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      membershipId = updated.id;
    } else {
      // Create new membership
      const { data: created, error } = await supabase
        .from('memberships')
        .insert({
          user_id: userId,
          tier,
          status: 'active',
          started_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          payment_method_id: paymentId,
        })
        .select()
        .single();

      if (error) throw error;
      membershipId = created.id;
    }

    // Log transaction
    await supabase.from('membership_transactions').insert({
      user_id: userId,
      membership_id: membershipId,
      amount: Math.round(priceTRY * 100), // Store in kuruş
      currency: 'TRY',
      status: 'completed',
      provider_transaction_id: paymentId,
      metadata: {
        tier,
        billing_cycle: billingCycle,
        local_currency: localCurrency,
        local_amount: localAmount,
        exchange_rate: exchangeRate,
      },
    });

    const currency = await getUserCurrency(userId);
    const rate = await getExchangeRate(currency);

    return {
      success: true,
      membershipId,
      expiresAt: expiresAt.toISOString(),
      displayPrice: formatCurrency(priceTRY, currency, rate.rate),
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Activate trial membership
 */
export async function activateTrial(userId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  // Check if trial already used
  const { data: existing } = await supabase
    .from('memberships')
    .select('trial_used')
    .eq('user_id', userId)
    .eq('trial_used', true)
    .single();

  if (existing) {
    return { success: false, error: 'Trial already used' };
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7-day trial

  const { error } = await supabase.from('memberships').insert({
    user_id: userId,
    tier: 'premium',
    status: 'trial',
    started_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
    trial_used: true,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Cancel membership
 */
export async function cancelMembership(
  userId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const { data: membership, error } = await supabase
    .from('memberships')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (error || !membership) {
    return { success: false, error: 'No active membership' };
  }

  await supabase
    .from('memberships')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', membership.id);

  // Log cancellation reason
  await supabase.from('membership_cancellations').insert({
    user_id: userId,
    membership_id: membership.id,
    tier: membership.tier,
    reason,
    created_at: new Date().toISOString(),
  });

  return { success: true };
}

// ============================================================================
// DISPLAY HELPERS
// ============================================================================

/**
 * Get membership options with currency conversion
 */
export async function getMembershipOptions(userId: string): Promise<Array<{
  tier: MembershipTier;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  displayMonthlyPrice: string;
  displayYearlyPrice: string;
  features: string[];
  isCurrent: boolean;
  savingsPercent: number;
}>> {
  const currency = await getUserCurrency(userId);
  const exchangeRate = await getExchangeRate(currency);
  const currentTier = await getEffectiveTier(userId);

  return MEMBERSHIP_TIERS.map((tier) => ({
    tier: tier.tier,
    name: tier.name,
    monthlyPrice: tier.monthlyPriceTRY,
    yearlyPrice: tier.yearlyPriceTRY,
    displayMonthlyPrice: formatCurrency(tier.monthlyPriceTRY, currency, exchangeRate.rate),
    displayYearlyPrice: formatCurrency(tier.yearlyPriceTRY, currency, exchangeRate.rate),
    features: tier.features,
    isCurrent: currentTier === tier.tier,
    savingsPercent: Math.round((1 - tier.yearlyPriceTRY / (tier.monthlyPriceTRY * 12)) * 100),
  }));
}

/**
 * Get user's current membership display
 */
export async function getMembershipDisplay(userId: string): Promise<{
  tier: string;
  name: string;
  expiresAt: string | null;
  displayExpiresAt: string;
  features: string[];
} | null> {
  const status = await getMembershipStatus(userId);

  if (!status.membership) {
    return null;
  }

  const tierConfig = MEMBERSHIP_TIERS.find((t) => t.tier === status.membership!.tier);
  if (!tierConfig) {
    return null;
  }

  const currency = await getUserCurrency(userId);
  const exchangeRate = await getExchangeRate(currency);

  return {
    tier: status.membership.tier,
    name: tierConfig.name,
    expiresAt: status.membership.expiresAt,
    displayExpiresAt: status.membership.expiresAt
      ? new Date(status.membership.expiresAt).toLocaleDateString()
      : 'Süresiz',
    features: tierConfig.features,
  };
}

/**
 * Check membership benefits for a user
 */
export async function checkMembershipBenefits(userId: string): Promise<{
  offerDiscount: number;
  visibilityBoost: number;
  moderationPriority: string;
}> {
  const tier = await getEffectiveTier(userId);

  const discountMap: Record<MembershipTier, number> = {
    free: 0,
    premium: 0.1,
    platinum: 0.2,
  };

  const boostMap: Record<MembershipTier, number> = {
    free: 1.0,
    premium: 1.2,
    platinum: 1.4,
  };

  const priorityMap: Record<MembershipTier, string> = {
    free: 'standard',
    premium: 'fast',
    platinum: 'priority',
  };

  return {
    offerDiscount: discountMap[tier],
    visibilityBoost: boostMap[tier],
    moderationPriority: priorityMap[tier],
  };
}

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Get membership statistics
 */
export async function getMembershipStats(): Promise<{
  totalActive: number;
  tierBreakdown: Record<string, number>;
  trialConversionRate: number;
  churnRate: number;
  avgLTV: number;
}> {
  // Active memberships by tier
  const { data: activeMemberships } = await supabase
    .from('memberships')
    .select('tier')
    .eq('status', 'active');

  const tierBreakdown: Record<string, number> = {};
  for (const m of activeMemberships || []) {
    tierBreakdown[m.tier] = (tierBreakdown[m.tier] || 0) + 1;
  }

  // Trial conversion
  const { data: trials } = await supabase
    .from('memberships')
    .select('id')
    .eq('status', 'trial');

  const { data: converted } = await supabase
    .from('memberships')
    .select('id')
    .eq('trial_used', true)
    .eq('status', 'active');

  const trialConversionRate = trials?.length
    ? (converted?.length || 0) / trials.length
    : 0;

  // Churn rate (cancelled in last 30 days / average active)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { count: cancelled } = await supabase
    .from('memberships')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'cancelled')
    .gte('updated_at', thirtyDaysAgo);

  const churnRate = activeMemberships?.length
    ? (cancelled || 0) / activeMemberships.length
    : 0;

  // Average LTV
  const { data: transactions } = await supabase
    .from('membership_transactions')
    .select('amount')
    .eq('status', 'completed');

  const avgLTV = transactions?.length
    ? (transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length) / 100 // Convert from kuruş
    : 0;

  return {
    totalActive: activeMemberships?.length || 0,
    tierBreakdown,
    trialConversionRate,
    churnRate,
    avgLTV,
  };
}

/**
 * Membership Configuration
 */
export const MEMBERSHIP_CONFIG = {
  trialDays: 7,
  trialOnePerUser: true,
  gracePeriodDays: 3,
  yearlyDiscountPercent: 20,
};
