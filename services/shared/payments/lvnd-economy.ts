/**
 * LVND Economy System - Multi-Currency Edition
 *
 * Core Principles:
 * 1. 1 LVND always equals 1 TL in the backend
 * 2. Users see prices in their preferred currency (via Currency Exchange Service)
 * 3. All transactions use TL as the base currency
 * 4. Currency conversion is for DISPLAY ONLY
 *
 * Economy Flow:
 * - User purchases LVND (pays in local currency, receives TL-equivalent LVND)
 * - User spends LVND on Offers, boosts, etc.
 * - Platform collects LVND as fee
 * - LVND circulates through the economy
 */

import { createClient } from '@supabase/supabase-js';
import { convertFromTL, convertToTL, getExchangeRate, getUserCurrency, formatCurrency } from './currency-exchange';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================================
// LVND PACK DEFINITIONS (Prices in TRY)
// ============================================================================

export interface LVNDPack {
  id: string;
  lvndAmount: number;
  priceTRY: number;
  bonusLVND: number;
  bonusPercent: number;
  popular?: boolean;
}

export const LVND_PACKS: LVNDPack[] = [
  {
    id: 'starter',
    lvndAmount: 100,
    priceTRY: 100,
    bonusLVND: 0,
    bonusPercent: 0,
  },
  {
    id: 'standard',
    lvndAmount: 500,
    priceTRY: 475,
    bonusLVND: 25,
    bonusPercent: 5,
  },
  {
    id: 'popular',
    lvndAmount: 1000,
    priceTRY: 900,
    bonusLVND: 100,
    bonusPercent: 10,
    popular: true,
  },
  {
    id: 'premium',
    lvndAmount: 2500,
    priceTRY: 2125,
    bonusLVND: 375,
    bonusPercent: 15,
  },
  {
    id: 'ultimate',
    lvndAmount: 5000,
    priceTRY: 4000,
    bonusLVND: 1000,
    bonusPercent: 20,
  },
  {
    id: 'megapack',
    lvndAmount: 10000,
    priceTRY: 7500,
    bonusLVND: 2500,
    bonusPercent: 25,
  },
];

// ============================================================================
// USER BALANCE OPERATIONS
// ============================================================================

export interface BalanceResult {
  success: boolean;
  balance: number;
  pendingBalance: number;
  error?: string;
}

/**
 * Get user's LVND balance
 */
export async function getUserBalance(userId: string): Promise<BalanceResult> {
  const { data: balance, error } = await supabase
    .from('lvnd_balances')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !balance) {
    return {
      success: false,
      balance: 0,
      pendingBalance: 0,
      error: error?.message || 'Balance not found',
    };
  }

  return {
    success: true,
    balance: balance.balance,
    pendingBalance: balance.pending_balance,
  };
}

/**
 * Credit LVND to user balance
 * Used for purchases, bonuses, and refunds
 */
export async function creditLVND(
  userId: string,
  amount: number,
  transactionType: string,
  referenceId: string,
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; transactionId: string; error?: string }> {
  const idempotencyKey = `${transactionType}_${referenceId}_${Date.now()}`;

  try {
    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from('lvnd_transactions')
      .insert({
        user_id: userId,
        amount,
        transaction_type: transactionType,
        reference_type: getReferenceType(transactionType),
        reference_id: referenceId,
        idempotency_key: idempotencyKey,
        metadata: {
          ...metadata,
          currency: 'TRY',
          rate: 1.0,
        },
      })
      .select()
      .single();

    if (txError) {
      throw new Error(txError.message);
    }

    // Update balance
    const { error: balanceError } = await supabase.rpc('lvnd_credit', {
      user_id: userId,
      amount,
      transaction_id: transaction.id,
    });

    if (balanceError) {
      throw new Error(balanceError.message);
    }

    return {
      success: true,
      transactionId: transaction.id,
    };
  } catch (error) {
    return {
      success: false,
      transactionId: '',
      error: String(error),
    };
  }
}

/**
 * Debit LVND from user balance
 * Used for spending, fees, and penalties
 */
export async function debitLVND(
  userId: string,
  amount: number,
  transactionType: string,
  referenceId: string,
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; transactionId: string; error?: string }> {
  // First check balance
  const balance = await getUserBalance(userId);
  if (!balance.success) {
    return { success: false, transactionId: '', error: balance.error };
  }

  if (balance.balance < amount) {
    return {
      success: false,
      transactionId: '',
      error: `Insufficient balance. Required: ${amount}, Available: ${balance.balance}`,
    };
  }

  const idempotencyKey = `${transactionType}_${referenceId}_${Date.now()}`;

  try {
    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from('lvnd_transactions')
      .insert({
        user_id: userId,
        amount: -amount,
        transaction_type: transactionType,
        reference_type: getReferenceType(transactionType),
        reference_id: referenceId,
        idempotency_key: idempotencyKey,
        metadata: {
          ...metadata,
          currency: 'TRY',
          rate: 1.0,
        },
      })
      .select()
      .single();

    if (txError) {
      throw new Error(txError.message);
    }

    // Update balance
    const { error: balanceError } = await supabase.rpc('lvnd_debit', {
      user_id: userId,
      amount,
      transaction_id: transaction.id,
    });

    if (balanceError) {
      throw new Error(balanceError.message);
    }

    return {
      success: true,
      transactionId: transaction.id,
    };
  } catch (error) {
    return {
      success: false,
      transactionId: '',
      error: String(error),
    };
  }
}

// ============================================================================
// PURCHASE FLOW
// ============================================================================

export interface PurchaseResult {
  success: boolean;
  paymentId?: string;
  lvndAmount?: number;
  bonusLVND?: number;
  totalLVND?: number;
  error?: string;
}

/**
 * Process LVND purchase
 * Converts local currency to TL-equivalent LVND
 */
export async function purchaseLVND(
  userId: string,
  packId: string,
  localAmount: number,
  localCurrency: string,
  exchangeRate: number,
  paymentId: string
): Promise<PurchaseResult> {
  // Find pack
  const pack = LVND_PACKS.find((p) => p.id === packId);
  if (!pack) {
    return { success: false, error: 'Invalid pack ID' };
  }

  // Convert to TL for verification
  const expectedTL = convertToTL(localAmount, localCurrency, exchangeRate);
  const tolerance = expectedTL * 0.02; // 2% tolerance

  if (Math.abs(expectedTL - pack.priceTRY) > tolerance) {
    return {
      success: false,
      error: `Price mismatch. Expected: ${pack.priceTRY} TL, Got: ${expectedTL.toFixed(2)} TL`,
    };
  }

  // Calculate total LVND (including bonus)
  const totalLVND = pack.lvndAmount + pack.bonusLVND;

  // Credit LVND balance
  const result = await creditLVND(
    userId,
    totalLVND,
    'purchase',
    paymentId,
    {
      pack_id: packId,
      original_amount: pack.lvndAmount,
      bonus_amount: pack.bonusLVND,
      local_currency: localCurrency,
      local_amount: localAmount,
      exchange_rate: exchangeRate,
    }
  );

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return {
    success: true,
    paymentId,
    lvndAmount: pack.lvndAmount,
    bonusLVND: pack.bonusLVND,
    totalLVND,
  };
}

/**
 * Get formatted balance for display
 */
export async function getFormattedBalance(userId: string): Promise<string> {
  const currency = await getUserCurrency(userId);
  const balance = await getUserBalance(userId);

  if (!balance.success) {
    return '0 LVND';
  }

  const displayAmount = formatCurrency(balance.balance, currency);
  return `${balance.balance.toLocaleString()} LVND (${displayAmount})`;
}

/**
 * Get purchase options with currency conversion
 */
export async function getPurchaseOptions(userId: string): Promise<Array<{
  id: string;
  lvndAmount: number;
  priceLocal: number;
  currency: string;
  bonusLVND: number;
  bonusPercent: number;
  popular: boolean;
  displayPrice: string;
}>> {
  const currency = await getUserCurrency(userId);
  const exchangeRate = await getExchangeRate(currency);

  return LVND_PACKS.map((pack) => ({
    id: pack.id,
    lvndAmount: pack.lvndAmount,
    priceLocal: Math.round(convertFromTL(pack.priceTRY, currency, exchangeRate.rate) * 100) / 100,
    currency,
    bonusLVND: pack.bonusLVND,
    bonusPercent: pack.bonusPercent,
    popular: pack.popular || false,
    displayPrice: formatCurrency(pack.priceTRY, currency, exchangeRate.rate),
  }));
}

// ============================================================================
// ECONOMY MONITORING
// ============================================================================

export interface EconomyStats {
  totalSupply: number;
  totalBurned: number;
  activeUsers: number;
  dailyVolume: number;
  stabilityRatio: number;
}

/**
 * Get economy statistics
 */
export async function getEconomyStats(): Promise<EconomyStats> {
  // Get total supply (sum of all balances)
  const { data: balances } = await supabase
    .from('lvnd_balances')
    .select('balance');

  const totalSupply = balances?.reduce((sum, b) => sum + b.balance, 0) || 0;

  // Get total burned (sum of negative transactions)
  const { data: burned } = await supabase
    .from('lvnd_transactions')
    .select('amount')
    .lt('amount', 0);

  const totalBurned = Math.abs(burned?.reduce((sum, b) => sum + b.amount, 0) || 0);

  // Get active users (used LVND in last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count: activeUsers } = await supabase
    .from('lvnd_transactions')
    .select('user_id', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo);

  // Get daily volume
  const today = new Date().toISOString().split('T')[0];
  const { data: todayTx } = await supabase
    .from('lvnd_transactions')
    .select('amount')
    .gte('created_at', today);

  const dailyVolume = todayTx?.reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;

  // Calculate stability ratio
  const totalMinted = totalSupply + totalBurned;
  const stabilityRatio = totalMinted > 0 ? totalBurned / totalMinted : 0;

  return {
    totalSupply,
    totalBurned,
    activeUsers: activeUsers || 0,
    dailyVolume,
    stabilityRatio,
  };
}

/**
 * Get user transaction history
 */
export async function getTransactionHistory(
  userId: string,
  limit: number = 50
): Promise<Array<{
  id: string;
  amount: number;
  type: string;
  createdAt: string;
  displayAmount: string;
}>> {
  const currency = await getUserCurrency(userId);
  const exchangeRate = await getExchangeRate(currency);

  const { data: transactions, error } = await supabase
    .from('lvnd_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !transactions) {
    return [];
  }

  return transactions.map((t) => ({
    id: t.id,
    amount: t.amount,
    type: t.transaction_type,
    createdAt: t.created_at,
    displayAmount: formatCurrency(Math.abs(t.amount), currency, exchangeRate.rate),
  }));
}

// ============================================================================
// HELPERS
// ============================================================================

function getReferenceType(transactionType: string): string {
  const typeMap: Record<string, string> = {
    purchase: 'lvnd_purchase',
    refund: 'lvnd_refund',
    offer_sent: 'offer',
    offer_accepted_fee: 'offer',
    boost: 'boost',
    gift_premium: 'gift',
    fee_platform: 'fee',
    earn_activity: 'earn',
    earn_creator: 'earn',
    bonus: 'bonus',
    adjustment: 'adjustment',
  };

  return typeMap[transactionType] || 'other';
}

/**
 * Anti-fraud checks for LVND operations
 */
export async function checkLVNDFraudRisk(userId: string): Promise<{
  riskLevel: 'low' | 'medium' | 'high';
  reasons: string[];
}> {
  const reasons: string[] = [];
  let riskScore = 0;

  // Check for rapid consecutive transactions
  const recentTx = await supabase
    .from('lvnd_transactions')
    .select('created_at')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false });

  if (recentTx.data && recentTx.data.length > 10) {
    riskScore += 30;
    reasons.push('High transaction frequency detected');
  }

  // Check for unusual purchase patterns
  const todayPurchases = await supabase
    .from('lvnd_transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('transaction_type', 'purchase')
    .gte('created_at', new Date().toISOString().split('T')[0]);

  const totalPurchase = todayPurchases.data?.reduce((sum, t) => sum + t.amount, 0) || 0;
  if (totalPurchase > 10000) {
    riskScore += 20;
    reasons.push('Large purchase amount');
  }

  // Check balance against average
  const { data: avgBalance } = await supabase
    .from('lvnd_balances')
    .select('balance');

  const userBalance = await getUserBalance(userId);
  if (avgBalance && avgBalance.length > 0) {
    const avg = avgBalance.reduce((sum, b) => sum + b.balance, 0) / avgBalance.length;
    if (userBalance.balance > avg * 100) {
      riskScore += 20;
      reasons.push('Abnormally high balance');
    }
  }

  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (riskScore >= 50) riskLevel = 'high';
  else if (riskScore >= 25) riskLevel = 'medium';

  return { riskLevel, reasons };
}

/**
 * Economy configuration
 */
export const LVND_ECONOMY_CONFIG = {
  packs: LVND_PACKS,
  minPurchase: 100, // LVND
  maxPurchase: 10000, // LVND per transaction
  monthlyPurchaseCap: 50000, // LVND per month
  maxBalance: {
    free: 5000,
    premium: 15000,
    platinum: 50000,
    creator: 100000,
  },
  hoarderThreshold: 10000, // LVND
  hoarderPenalty: 0.05, // 5% monthly decay after threshold
  targetStabilityRatio: { min: 0.8, max: 1.2 },
};
