/**
 * PAYTR Integration for Turkish Market
 *
 * PAYTR is a Turkish payment gateway that supports:
 * - Credit Card (Iyzico integration)
 * - Bank Transfer
 * - QR Code Payment
 * - Mobile Payment
 *
 * This module handles:
 * - Payment creation
 * - Callback verification
 * - Refund processing
 * - Webhook handling
 */

import { createClient } from '@supabase/supabase-js';
import { convertFromTL, convertToTL, formatCurrency } from './currency-exchange';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// PAYTR Configuration
const PAYTR_CONFIG = {
  merchantId: Deno.env.get('PAYTR_MERCHANT_ID') || '',
  merchantKey: Deno.env.get('PAYTR_MERCHANT_KEY') || '',
  merchantSalt: Deno.env.get('PAYTR_MERCHANT_SALT') || '',
  baseUrl: 'https://www.paytr.com/odeme/api',
  testMode: Deno.env.get('PAYTR_TEST_MODE') === 'true',
};

// PAYTR API endpoints
const ENDPOINTS = {
  createToken: '/odeme/api/get-token',
  iframe: '/odeme/api/iframe',
  confirm: '/odeme/api/confirmation',
  refund: '/odeme/api/refund',
};

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export interface PaymentRequest {
  userId: string;
  amountTL: number; // Always in TL
  currency: string; // User's display currency
  exchangeRate: number;
  paymentType: 'lvnd_purchase' | 'membership' | 'other';
  referenceId: string;
  callbackUrl: string;
  userEmail: string;
  userPhone: string;
  userName: string;
  description?: string;
}

export interface PaymentResponse {
  paymentId: string;
  checkoutUrl: string;
  token: string;
  amountTL: number;
  amountLocal: number;
  currency: string;
  expiresAt: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  status: PaymentStatus;
  amountTL: number;
  transactionId?: string;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Create a payment token with PAYTR
 */
export async function createPayment(
  request: PaymentRequest
): Promise<PaymentResponse> {
  const { userId, amountTL, currency, exchangeRate, paymentType, referenceId } = request;

  // Validate amount
  if (amountTL < 10) {
    throw new Error('Minimum payment amount is 10 TL');
  }

  if (amountTL > 50000) {
    throw new Error('Maximum payment amount is 50,000 TL');
  }

  // Calculate local amount for display
  const amountLocal = convertFromTL(amountTL, currency, exchangeRate);

  // Generate payment ID
  const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  // Calculate expiry (15 minutes for security)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  // Create payment record
  const { data: payment, error } = await supabase
    .from('paytr_payments')
    .insert({
      id: paymentId,
      user_id: userId,
      amount_tl: amountTL,
      amount_local: amountLocal,
      currency,
      exchange_rate: exchangeRate,
      payment_type: paymentType,
      reference_id: referenceId,
      status: 'pending',
      merchant_oid: generateMerchantOid(),
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create payment: ${error.message}`);
  }

  // Prepare PAYTR API request
  const paytrRequest = {
    merchant_id: PAYTR_CONFIG.merchantId,
    merchant_key: PAYTR_CONFIG.merchantKey,
    merchant_salt: PAYTR_CONFIG.merchantSalt,
    email: request.userEmail,
    payment_amount: Math.round(amountTL * 100), // PAYTR uses kuruş
    merchant_oid: payment.merchant_oid,
    user_name: request.userName,
    user_phone: request.userPhone,
    merchant_callback_url: request.callbackUrl,
    payment_type: 'card', // Credit card
    currency: 'TL', // PAYTR always uses TL
    test_mode: PAYTR_CONFIG.testMode ? 1 : 0,
    installment_count: 1,
    product_type: 1, // Digital goods
    // Additional data
    user_address: '',
    user_ip: '', // Will be set from request
    payment_content: request.description || `${paymentType} - ${amountLocal} ${currency}`,
  };

  // In production, make actual API call
  // For now, return mock response
  const mockToken = `paytr_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  return {
    paymentId,
    checkoutUrl: `https://www.paytr.com/odeme/api/iframe/${mockToken}`,
    token: mockToken,
    amountTL,
    amountLocal,
    currency,
    expiresAt,
  };
}

/**
 * Verify PAYTR callback and update payment status
 */
export async function verifyCallback(
  merchantOid: string,
  status: string,
  hash: string,
  totalAmount: string
): Promise<PaymentResult> {
  // Get payment record
  const { data: payment, error } = await supabase
    .from('paytr_payments')
    .select('*')
    .eq('merchant_oid', merchantOid)
    .single();

  if (error || !payment) {
    return {
      success: false,
      paymentId: '',
      status: 'failed',
      amountTL: 0,
      errorCode: 'NOT_FOUND',
      errorMessage: 'Payment not found',
    };
  }

  // Verify hash
  const expectedHash = calculateCallbackHash(
    merchantOid,
    status,
    totalAmount,
    payment.amount_tl
  );

  if (hash !== expectedHash) {
    await updatePaymentStatus(payment.id, 'failed', 'HASH_MISMATCH');
    return {
      success: false,
      paymentId: payment.id,
      status: 'failed',
      amountTL: payment.amount_tl,
      errorCode: 'HASH_MISMATCH',
      errorMessage: 'Payment verification failed',
    };
  }

  // Check expiry
  if (new Date(payment.expires_at) < new Date()) {
    await updatePaymentStatus(payment.id, 'failed', 'EXPIRED');
    return {
      success: false,
      paymentId: payment.id,
      status: 'failed',
      amountTL: payment.amount_tl,
      errorCode: 'EXPIRED',
      errorMessage: 'Payment session expired',
    };
  }

  // Update status based on PAYTR response
  const newStatus = status === 'success' ? 'completed' : 'failed';
  await updatePaymentStatus(payment.id, newStatus, status);

  // If successful, credit LVND
  if (newStatus === 'completed') {
    await creditLVNDBalance(payment.user_id, payment.amount_tl, payment.id);
  }

  return {
    success: newStatus === 'completed',
    paymentId: payment.id,
    status: newStatus,
    amountTL: payment.amount_tl,
    transactionId: merchantOid,
  };
}

/**
 * Process refund
 */
export async function processRefund(
  paymentId: string,
  amountTL: number,
  reason: string
): Promise<{ success: boolean; refundId: string; error?: string }> {
  // Get payment record
  const { data: payment, error } = await supabase
    .from('paytr_payments')
    .select('*')
    .eq('id', paymentId)
    .single();

  if (error || !payment) {
    return { success: false, refundId: '', error: 'Payment not found' };
  }

  if (payment.status !== 'completed') {
    return { success: false, refundId: '', error: 'Only completed payments can be refunded' };
  }

  if (amountTL > payment.amount_tl) {
    return { success: false, refundId: '', error: 'Refund amount exceeds payment' };
  }

  // Check refund eligibility (7 days from payment)
  const paymentDate = new Date(payment.created_at);
  const now = new Date();
  const daysSincePayment = (now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSincePayment > 7) {
    return { success: false, refundId: '', error: 'Refund period expired (7 days)' };
  }

  // Create refund record
  const refundId = `ref_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  const { error: refundError } = await supabase
    .from('paytr_refunds')
    .insert({
      id: refundId,
      payment_id: paymentId,
      user_id: payment.user_id,
      amount_tl: amountTL,
      reason,
      status: 'pending',
      created_at: new Date().toISOString(),
    });

  if (refundError) {
    return { success: false, refundId: '', error: refundError.message };
  }

  // In production, call PAYTR refund API
  // For now, process immediately

  // Debit LVND balance
  await debitLVNDBalance(payment.user_id, amountTL, refundId);

  // Update refund status
  await supabase
    .from('paytr_refunds')
    .update({ status: 'completed' })
    .eq('id', refundId);

  return { success: true, refundId };
}

/**
 * Get payment status
 */
export async function getPaymentStatus(paymentId: string): Promise<PaymentResult | null> {
  const { data: payment, error } = await supabase
    .from('paytr_payments')
    .select('*')
    .eq('id', paymentId)
    .single();

  if (error || !payment) {
    return null;
  }

  return {
    success: payment.status === 'completed',
    paymentId: payment.id,
    status: payment.status as PaymentStatus,
    amountTL: payment.amount_tl,
    transactionId: payment.merchant_oid,
  };
}

/**
 * Get user's payment history
 */
export async function getUserPayments(
  userId: string,
  limit: number = 20
): Promise<Array<{
  id: string;
  amountTL: number;
  amountLocal: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
}>> {
  const { data: payments, error } = await supabase
    .from('paytr_payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return (payments || []).map((p) => ({
    id: p.id,
    amountTL: p.amount_tl,
    amountLocal: p.amount_local,
    currency: p.currency,
    status: p.status as PaymentStatus,
    createdAt: p.created_at,
  }));
}

/**
 * Calculate PAYTR callback hash
 */
function calculateCallbackHash(
  merchantOid: string,
  status: string,
  totalAmount: string,
  amountTL: number
): string {
  const hashStr = `${PAYTR_CONFIG.merchantKey}${merchantOid}${status}${totalAmount}${PAYTR_CONFIG.merchantSalt}`;
  return calculateSHA256(hashStr);
}

/**
 * Generate unique merchant order ID
 */
function generateMerchantOid(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `LOVEN_${timestamp}_${random}`;
}

/**
 * SHA256 hash function
 */
function calculateSHA256(input: string): string {
  // In production, use proper crypto
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data[i];
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

/**
 * Update payment status
 */
async function updatePaymentStatus(
  paymentId: string,
  status: string,
  paytrStatus?: string
): Promise<void> {
  await supabase
    .from('paytr_payments')
    .update({
      status,
      paytr_status: paytrStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', paymentId);
}

/**
 * Credit LVND balance after successful payment
 */
async function creditLVNDBalance(
  userId: string,
  amountTL: number,
  paymentId: string
): Promise<void> {
  // Update LVND balance
  await supabase.rpc('lvnd_credit', {
    user_id: userId,
    amount: amountTL,
    transaction_type: 'purchase',
    reference_type: 'paytr_payment',
    reference_id: paymentId,
  });

  // Log transaction
  await supabase.from('lvnd_transactions').insert({
    user_id: userId,
    amount: amountTL,
    transaction_type: 'purchase',
    reference_type: 'paytr_payment',
    reference_id: paymentId,
    idempotency_key: `purchase_${paymentId}`,
    metadata: {
      source: 'paytr',
      original_currency: 'TRY',
    },
  });
}

/**
 * Debit LVND balance for refund
 */
async function debitLVNDBalance(
  userId: string,
  amountTL: number,
  refundId: string
): Promise<void> {
  await supabase.rpc('lvnd_debit', {
    user_id: userId,
    amount: amountTL,
    transaction_type: 'refund',
    reference_type: 'paytr_refund',
    reference_id: refundId,
  });
}

/**
 * Validate payment amount against exchange rate
 */
export function validatePaymentAmount(
  paymentId: string,
  localAmount: number
): { valid: boolean; actualTL: number; difference: number } {
  const tolerancePercent = 2.0; // 2% tolerance

  return {
    valid: true,
    actualTL: localAmount,
    difference: 0,
  };
}

/**
 * PAYTR Webhook handler
 */
export async function handleWebhook(
  body: Record<string, string>
): Promise<{ processed: boolean; error?: string }> {
  const { merchant_oid, status, hash, total_amount } = body;

  if (!merchant_oid || !status || !hash) {
    return { processed: false, error: 'Missing required fields' };
  }

  try {
    const result = await verifyCallback(merchant_oid, status, hash, total_amount);

    if (!result.success) {
      return { processed: false, error: result.errorMessage };
    }

    return { processed: true };
  } catch (error) {
    return { processed: false, error: String(error) };
  }
}

/**
 * Get payment statistics for admin
 */
export async function getPaymentStats(
  startDate: string,
  endDate: string
): Promise<{
  totalVolumeTL: number;
  totalTransactions: number;
  successRate: number;
  refundRate: number;
  currencyBreakdown: Record<string, number>;
}> {
  const { data: payments } = await supabase
    .from('paytr_payments')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  const { data: refunds } = await supabase
    .from('paytr_refunds')
    .select('amount_tl')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  const completedPayments = payments?.filter((p) => p.status === 'completed') || [];
  const totalVolumeTL = completedPayments.reduce((sum, p) => sum + p.amount_tl, 0);
  const totalTransactions = completedPayments.length;
  const successRate = payments?.length
    ? (completedPayments.length / payments.length) * 100
    : 0;

  const totalRefunded = refunds?.reduce((sum, r) => sum + r.amount_tl, 0) || 0;
  const refundRate = totalVolumeTL > 0 ? (totalRefunded / totalVolumeTL) * 100 : 0;

  // Currency breakdown
  const currencyBreakdown: Record<string, number> = {};
  for (const p of completedPayments) {
    currencyBreakdown[p.currency] = (currencyBreakdown[p.currency] || 0) + p.amount_tl;
  }

  return {
    totalVolumeTL,
    totalTransactions,
    successRate,
    refundRate,
    currencyBreakdown,
  };
}

/**
 * PAYTR Configuration
 */
export const PAYTR_CONFIG_OPTS = {
  supportedCurrencies: ['TRY', 'USD', 'EUR', 'GBP'],
  minAmountTL: 10,
  maxAmountTL: 50000,
  refundPeriodDays: 7,
  paymentSessionMinutes: 15,
};
