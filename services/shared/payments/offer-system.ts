/**
 * Offer System - Multi-Currency Edition
 *
 * Offers are structured gestures that create intent pressure.
 * All monetary values are stored in TRY (TL) as the base currency.
 * Users see amounts in their preferred currency via Currency Exchange Service.
 */

import { createClient } from '@supabase/supabase-js';
import { convertFromTL, getExchangeRate, getUserCurrency, formatCurrency } from './currency-exchange';
import { getUserBalance, creditLVND, debitLVND, LVND_ECONOMY_CONFIG } from './lvnd-economy';
import { getTrustScore, getRiskScore, getIntentScore } from '../ml/trust-layer';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================================
// OFFER TYPES AND INTERFACES
// ============================================================================

export enum OfferState {
  CREATED = 'created',
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  ESCALATED = 'escalated',
}

export enum OfferEvent {
  SUBMIT = 'submit',
  ACCEPT = 'accept',
  REJECT = 'reject',
  EXPIRE = 'expire',
  CANCEL = 'cancel',
  COUNTER = 'counter',
  WITHDRAW = 'withdraw',
}

export enum RelationshipStage {
  FIRST_CONTACT = 'first_contact',
  WARMING = 'warming',
  ACTIVE = 'active',
  DEEP = 'deep',
  MEETUP = 'meetup',
}

export interface Offer {
  id: string;
  sender_id: string;
  receiver_id: string;
  moment_id?: string;
  lvnd_amount: number;
  currency: string; // User's display currency
  exchange_rate: number;
  state: OfferState;
  stage: RelationshipStage;
  expires_at: string;
  counter_from_offer_id?: string;
  counter_count: number;
  created_at: string;
  updated_at: string;
}

export interface OfferLimits {
  maxOffersPerDay: number;
  remainingToday: number;
  cooldownHours: number;
  canCounter: boolean;
  minAmount: number;
  maxAmount: number;
}

// ============================================================================
// OFFER CREATION
// ============================================================================

export interface CreateOfferRequest {
  senderId: string;
  receiverId: string;
  momentId?: string;
  lvndAmount: number;
  stage: RelationshipStage;
}

export interface CreateOfferResult {
  success: boolean;
  offerId?: string;
  error?: string;
  displayAmount?: string;
  expiresAt?: string;
}

/**
 * Create a new offer
 * All internal calculations use TL, display uses user's currency
 */
export async function createOffer(request: CreateOfferRequest): Promise<CreateOfferResult> {
  const { senderId, receiverId, momentId, lvndAmount, stage } = request;

  // 1. Check limits
  const limits = await getOfferLimits(senderId);
  if (limits.remainingToday <= 0) {
    return { success: false, error: 'Daily offer limit reached' };
  }

  if (lvndAmount < limits.minAmount) {
    return {
      success: false,
      error: `Minimum offer amount is ${limits.minAmount} LVND`,
    };
  }

  if (lvndAmount > limits.maxAmount) {
    return {
      success: false,
      error: `Maximum offer amount is ${limits.maxAmount} LVND`,
    };
  }

  // 2. Check balance
  const balance = await getUserBalance(senderId);
  if (!balance.success) {
    return { success: false, error: balance.error };
  }

  if (balance.balance < lvndAmount) {
    return {
      success: false,
      error: `Insufficient balance. Required: ${lvndAmount}, Available: ${balance.balance}`,
    };
  }

  // 3. Get user's preferred currency for display
  const currency = await getUserCurrency(senderId);
  const exchangeRate = await getExchangeRate(currency);

  // 4. Calculate offer pressure index
  const opi = await calculateOfferPressureIndex(senderId, lvndAmount, stage);
  if (opi > 2.5) {
    return {
      success: false,
      error: 'Offer value is too high for current context. Consider a smaller offer.',
    };
  }

  // 5. Create offer
  const offerId = `offer_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

  try {
    // Create offer record
    const { data: offer, error } = await supabase
      .from('offers')
      .insert({
        id: offerId,
        sender_id: senderId,
        receiver_id: receiverId,
        moment_id: momentId,
        lvnd_amount: lvndAmount,
        currency,
        exchange_rate: exchangeRate.rate,
        state: OfferState.PENDING,
        stage,
        expires_at: expiresAt,
        counter_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Debit LVND from sender
    const debitResult = await debitLVND(
      senderId,
      lvndAmount,
      'offer_sent',
      offerId,
      {
        receiver_id: receiverId,
        moment_id: momentId,
        stage,
      }
    );

    if (!debitResult.success) {
      // Rollback offer creation
      await supabase.from('offers').delete().eq('id', offerId);
      return { success: false, error: debitResult.error };
    }

    // Log state change
    await logStateChange(offerId, null, OfferState.PENDING, 'sender');

    return {
      success: true,
      offerId,
      displayAmount: formatCurrency(lvndAmount, currency, exchangeRate.rate),
      expiresAt,
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// ============================================================================
// OFFER ACTIONS
// ============================================================================

export interface OfferActionResult {
  success: boolean;
  error?: string;
  displayAmount?: string;
}

/**
 * Accept an offer
 */
export async function acceptOffer(
  offerId: string,
  userId: string
): Promise<OfferActionResult> {
  const offer = await getOffer(offerId);
  if (!offer) {
    return { success: false, error: 'Offer not found' };
  }

  if (offer.receiver_id !== userId) {
    return { success: false, error: 'Not authorized' };
  }

  if (offer.state !== OfferState.PENDING && offer.state !== OfferState.ESCALATED) {
    return { success: false, error: 'Offer is not pending' };
  }

  try {
    // Calculate platform fee (5%)
    const platformFee = Math.floor(offer.lvnd_amount * 0.05);
    const creatorShare = offer.lvnd_amount - platformFee;

    // Update offer state
    await supabase
      .from('offers')
      .update({
        state: OfferState.ACCEPTED,
        updated_at: new Date().toISOString(),
      })
      .eq('id', offerId);

    // Credit LVND to receiver
    await creditLVND(
      userId,
      creatorShare,
      'offer_accepted',
      offerId,
      {
        sender_id: offer.sender_id,
        platform_fee: platformFee,
        original_amount: offer.lvnd_amount,
      }
    );

    // Log state change
    await logStateChange(offerId, offer.state, OfferState.ACCEPTED, 'receiver');

    // Update accept stats for sender
    await updateSenderStats(offer.sender_id, 'accept');

    const currency = await getUserCurrency(userId);
    const exchangeRate = await getExchangeRate(currency);

    return {
      success: true,
      displayAmount: formatCurrency(creatorShare, currency, exchangeRate.rate),
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Reject an offer
 */
export async function rejectOffer(
  offerId: string,
  userId: string
): Promise<OfferActionResult> {
  const offer = await getOffer(offerId);
  if (!offer) {
    return { success: false, error: 'Offer not found' };
  }

  if (offer.receiver_id !== userId) {
    return { success: false, error: 'Not authorized' };
  }

  try {
    // Refund LVND to sender
    await creditLVND(
      offer.sender_id,
      offer.lvnd_amount,
      'offer_rejected_refund',
      offerId,
      {
        receiver_id: userId,
      }
    );

    // Update offer state
    await supabase
      .from('offers')
      .update({
        state: OfferState.REJECTED,
        updated_at: new Date().toISOString(),
      })
      .eq('id', offerId);

    // Log state change
    await logStateChange(offerId, offer.state, OfferState.REJECTED, 'receiver');

    // Update reject stats
    await updateSenderStats(offer.sender_id, 'reject');

    const currency = await getUserCurrency(userId);
    const exchangeRate = await getExchangeRate(currency);

    return {
      success: true,
      displayAmount: formatCurrency(offer.lvnd_amount, currency, exchangeRate.rate),
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Counter-offer
 */
export async function counterOffer(
  offerId: string,
  userId: string,
  newAmount: number
): Promise<CreateOfferResult> {
  const offer = await getOffer(offerId);
  if (!offer) {
    return { success: false, error: 'Offer not found' };
  }

  // Determine who can counter
  const isReceiver = offer.receiver_id === userId;
  const isSender = offer.sender_id === userId;

  if (!isReceiver && !isSender) {
    return { success: false, error: 'Not authorized' };
  }

  if (offer.counter_count >= 2) {
    return { success: false, error: 'Maximum counter limit reached' };
  }

  // Minimum counter increment: 25%
  const minCounter = Math.floor(offer.lvnd_amount * 1.25);
  if (newAmount < minCounter) {
    return {
      success: false,
      error: `Counter offer must be at least ${minCounter} LVND (25% increase)`,
    };
  }

  // Update original offer
  await supabase
    .from('offers')
    .update({
      state: OfferState.ESCALATED,
      counter_count: offer.counter_count + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', offerId);

  await logStateChange(offerId, offer.state, OfferState.ESCALATED, isReceiver ? 'receiver' : 'sender');

  // Create new offer as counter
  return createOffer({
    senderId: userId,
    receiverId: isReceiver ? offer.sender_id : offer.receiver_id,
    momentId: offer.moment_id,
    lvndAmount: newAmount,
    stage: offer.stage,
  });
}

/**
 * Cancel/withdraw offer
 */
export async function cancelOffer(
  offerId: string,
  userId: string
): Promise<OfferActionResult> {
  const offer = await getOffer(offerId);
  if (!offer) {
    return { success: false, error: 'Offer not found' };
  }

  if (offer.sender_id !== userId) {
    return { success: false, error: 'Only sender can cancel' };
  }

  if (offer.state !== OfferState.PENDING) {
    return { success: false, error: 'Can only cancel pending offers' };
  }

  // Check cooldown (can only cancel after 1 hour)
  const createdAt = new Date(offer.created_at);
  const hoursSince = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  if (hoursSince < 1) {
    return {
      success: false,
      error: 'Can only cancel after 1 hour. Consider waiting.',
    };
  }

  try {
    // Refund to sender
    await creditLVND(
      userId,
      offer.lvnd_amount,
      'offer_cancelled_refund',
      offerId,
      {
        receiver_id: offer.receiver_id,
      }
    );

    await supabase
      .from('offers')
      .update({
        state: OfferState.CANCELLED,
        updated_at: new Date().toISOString(),
      })
      .eq('id', offerId);

    await logStateChange(offerId, offer.state, OfferState.CANCELLED, 'sender');

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// ============================================================================
// OFFER LIMITS AND CALCULATIONS
// ============================================================================

/**
 * Get offer limits for a user
 */
export async function getOfferLimits(userId: string): Promise<OfferLimits> {
  // Get membership
  const { data: membership } = await supabase
    .from('memberships')
    .select('tier')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  const tier = membership?.tier || 'free';

  // Get trust score
  const trustScore = await getTrustScore(userId);

  // Get today's usage
  const today = new Date().toISOString().split('T')[0];
  const { count: todayCount } = await supabase
    .from('offers')
    .select('id', { count: 'exact', head: true })
    .eq('sender_id', userId)
    .gte('created_at', today)
    .in('state', [OfferState.PENDING, OfferState.ACCEPTED]);

  // Calculate limits
  const baseLimit = { free: 3, premium: 5, platinum: 8 }[tier] || 3;

  const trustMultiplier = trustScore >= 0.8 ? 1.0 : trustScore >= 0.6 ? 0.8 : 0.5;

  const maxOffers = Math.floor(baseLimit * trustMultiplier);
  const remainingToday = Math.max(0, maxOffers - (todayCount || 0));

  // Calculate cooldown
  const recentDeclines = await getRecentDeclineCount(userId);
  const cooldownHours = recentDeclines >= 5 ? 2 : recentDeclines >= 3 ? 1 : 0.5;

  // Check risk score
  const riskScore = await getRiskScore(userId);
  const canCounter = riskScore < 0.5 && tier !== 'free';

  // Calculate min/max amounts
  const minAmount = 30; // Base minimum
  const maxAmount = { free: 500, premium: 2000, platinum: 5000 }[tier] || 500;

  return {
    maxOffersPerDay: maxOffers,
    remainingToday,
    cooldownHours,
    canCounter,
    minAmount,
    maxAmount,
  };
}

/**
 * Calculate Offer Pressure Index
 */
export async function calculateOfferPressureIndex(
  userId: string,
  offerAmount: number,
  stage: RelationshipStage
): Promise<number> {
  const balance = await getUserBalance(userId);
  const balanceForCalc = balance.balance || 1;

  const amountRatio = offerAmount / balanceForCalc;

  const stageMultipliers: Record<RelationshipStage, number> = {
    [RelationshipStage.FIRST_CONTACT]: 1.5,
    [RelationshipStage.WARMING]: 1.2,
    [RelationshipStage.ACTIVE]: 1.0,
    [RelationshipStage.DEEP]: 0.8,
    [RelationshipStage.MEETUP]: 0.5,
  };

  const stageMultiplier = stageMultipliers[stage];

  // Recent offer frequency
  const today = new Date().toISOString().split('T')[0];
  const { count: recentOffers } = await supabase
    .from('offers')
    .select('id', { count: 'exact', head: true })
    .eq('sender_id', userId)
    .gte('created_at', today);

  const freqFactor = Math.min(1, (recentOffers || 0) / 3);

  const opi = amountRatio * stageMultiplier * (1 + freqFactor * 0.5);

  return opi;
}

/**
 * Get recent decline count
 */
async function getRecentDeclineCount(userId: string): Promise<number> {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  const { count } = await supabase
    .from('offers')
    .select('id', { count: 'exact', head: true })
    .eq('sender_id', userId)
    .eq('state', OfferState.REJECTED)
    .gte('created_at', threeDaysAgo);

  return count || 0;
}

/**
 * Update sender statistics
 */
async function updateSenderStats(
  userId: string,
  action: 'accept' | 'reject'
): Promise<void> {
  const statField = action === 'accept' ? 'accepts' : 'rejects';
  await supabase.rpc('increment_offer_stat', {
    user_id: userId,
    stat_name: statField,
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getOffer(offerId: string): Promise<Offer | null> {
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('id', offerId)
    .single();

  return data as Offer || null;
}

async function logStateChange(
  offerId: string,
  fromState: OfferState | null,
  toState: OfferState,
  triggeredBy: string
): Promise<void> {
  await supabase.from('offer_state_history').insert({
    offer_id: offerId,
    from_state: fromState,
    to_state: toState,
    triggered_by: triggeredBy,
    created_at: new Date().toISOString(),
  });
}

/**
 * Get user's offers (sent and received)
 */
export async function getUserOffers(
  userId: string,
  type: 'sent' | 'received' | 'all' = 'all',
  limit: number = 20
): Promise<Array<{
  id: string;
  amount: number;
  displayAmount: string;
  currency: string;
  state: OfferState;
  stage: RelationshipStage;
  otherUser: { id: string; name: string; avatar?: string };
  createdAt: string;
  expiresAt: string;
}>> {
  let query = supabase
    .from('offers')
    .select(`
      *,
      sender:sender_id(id, full_name, avatar_url),
      receiver:receiver_id(id, full_name, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (type === 'sent') {
    query = query.eq('sender_id', userId);
  } else if (type === 'received') {
    query = query.eq('receiver_id', userId);
  }

  const { data: offers, error } = await query;

  if (error || !offers) {
    return [];
  }

  // Get exchange rates for each offer's currency
  const results = await Promise.all(
    offers.map(async (offer: any) => {
      const exchangeRate = await getExchangeRate(offer.currency);
      const otherUser = offer.sender_id === userId ? offer.receiver : offer.sender;

      return {
        id: offer.id,
        amount: offer.lvnd_amount,
        displayAmount: formatCurrency(offer.lvnd_amount, offer.currency, offer.exchange_rate),
        currency: offer.currency,
        state: offer.state,
        stage: offer.stage,
        otherUser: {
          id: otherUser.id,
          name: otherUser.full_name || 'User',
          avatar: otherUser.avatar_url,
        },
        createdAt: offer.created_at,
        expiresAt: offer.expires_at,
      };
    })
  );

  return results;
}

// ============================================================================
// OFFER DISPLAY FORMATTING
// ============================================================================

export async function formatOfferForDisplay(offer: Offer): Promise<{
  amount: string;
  stage: string;
  expiresIn: string;
  status: string;
}> {
  const exchangeRate = await getExchangeRate(offer.currency);

  return {
    amount: formatCurrency(offer.lvnd_amount, offer.currency, exchangeRate.rate),
    stage: formatStage(offer.stage),
    expiresIn: formatExpiresIn(offer.expires_at),
    status: formatStatus(offer.state),
  };
}

function formatStage(stage: RelationshipStage): string {
  const labels: Record<RelationshipStage, string> = {
    [RelationshipStage.FIRST_CONTACT]: 'İlk temas',
    [RelationshipStage.WARMING]: 'Isınma',
    [RelationshipStage.ACTIVE]: 'Aktif',
    [RelationshipStage.DEEP]: 'Derin sohbet',
    [RelationshipStage.MEETUP]: 'Buluşma',
  };
  return labels[stage] || stage;
}

function formatExpiresIn(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Süresi doldu';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} gün`;
  }

  if (hours > 0) {
    return `${hours}s ${minutes}d`;
  }

  return `${minutes} dakika`;
}

function formatStatus(state: OfferState): string {
  const labels: Record<OfferState, string> = {
    [OfferState.CREATED]: 'Oluşturuldu',
    [OfferState.PENDING]: 'Beklemede',
    [OfferState.ACCEPTED]: 'Kabul edildi',
    [OfferState.REJECTED]: 'Reddedildi',
    [OfferState.EXPIRED]: 'Süresi doldu',
    [OfferState.CANCELLED]: 'İptal edildi',
    [OfferState.ESCALATED]: 'Yükseltildi',
  };
  return labels[state] || state;
}

/**
 * Offer System Configuration
 */
export const OFFER_CONFIG = {
  defaultExpiryHours: 24,
  maxCounterCount: 2,
  minCounterIncrement: 1.25, // 25%
  platformFeePercent: 0.05,
  cooldownHours: {
    firstContact: 2,
    warming: 1.5,
    active: 1,
    deep: 0.75,
    meetup: 0.5,
  },
  pressureIndexThreshold: 2.5,
  declineThresholdForCooldown: 3,
};
