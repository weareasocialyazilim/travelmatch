/**
 * PayTR Integration Utilities
 *
 * PayTR is a Turkish payment gateway that provides:
 * - iFrame payment flow (3D Secure)
 * - Platform/Marketplace transfers
 * - Card storage (tokenization)
 * - Refunds
 *
 * Documentation: https://dev.paytr.com/
 */

import { createHmac } from 'https://deno.land/std@0.177.0/node/crypto.ts';

// =============================================================================
// TYPES
// =============================================================================

export interface PayTRConfig {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  testMode: boolean;
}

export interface PayTRTokenRequest {
  // User info
  userIp: string;
  userEmail: string;
  userName: string;
  userPhone?: string;

  // Order info
  merchantOid: string; // Unique order ID
  paymentAmount: number; // Amount in kuruş (cents) - 100 = 1 TL
  currency: 'TL' | 'USD' | 'EUR';

  // Product/Basket info
  basket: PayTRBasketItem[];

  // Callbacks
  merchantOkUrl: string;
  merchantFailUrl: string;

  // Optional
  userAddress?: string;
  noInstallment?: boolean; // Disable installments
  maxInstallment?: number; // Max installment count
  debug?: boolean;

  // Card storage
  storeCard?: boolean; // Save card for future
  userToken?: string; // Existing user token for saved cards
}

export interface PayTRBasketItem {
  name: string;
  price: string; // Formatted price string
  quantity: number;
}

export interface PayTRTokenResponse {
  status: 'success' | 'failed';
  token?: string;
  reason?: string;
}

export interface PayTRWebhookPayload {
  merchant_oid: string;
  status: 'success' | 'failed';
  total_amount: string;
  hash: string;
  failed_reason_code?: string;
  failed_reason_msg?: string;
  test_mode?: string;
  payment_type?: string;
  currency?: string;
  payment_amount?: string;

  // Card info (if save card was enabled)
  utoken?: string; // User token
  ctoken?: string; // Card token
  card_last_four?: string;
  card_brand?: string;
  card_bank?: string;
}

export interface PayTRTransferRequest {
  platformTransferId: string;
  subMerchantOid: string; // Receiver's merchant oid
  amount: number; // Amount in kuruş
  iban: string;
  accountHolderName: string;
}

export interface PayTRChargeRequest {
  userToken: string;
  cardToken: string;
  merchantOid: string;
  paymentAmount: number;
  currency: 'TL' | 'USD' | 'EUR';
  userIp: string;
  cvv?: string; // Required if card requires CVV
}

// =============================================================================
// CONFIGURATION
// =============================================================================

export function getPayTRConfig(): PayTRConfig {
  const merchantId = Deno.env.get('PAYTR_MERCHANT_ID');
  const merchantKey = Deno.env.get('PAYTR_MERCHANT_KEY');
  const merchantSalt = Deno.env.get('PAYTR_MERCHANT_SALT');
  const testMode = Deno.env.get('PAYTR_TEST_MODE') === 'true';

  if (!merchantId || !merchantKey || !merchantSalt) {
    throw new Error('PayTR credentials not configured');
  }

  return {
    merchantId,
    merchantKey,
    merchantSalt,
    testMode,
  };
}

// =============================================================================
// HASH GENERATION
// =============================================================================

/**
 * Generate PayTR hash for token request
 */
export function generateTokenHash(
  config: PayTRConfig,
  params: {
    merchantOid: string;
    paymentAmount: number;
    basketJson: string;
    noInstallment: number;
    maxInstallment: number;
    currency: string;
    testMode: number;
  }
): string {
  const hashStr =
    config.merchantId +
    params.merchantOid +
    params.paymentAmount +
    params.merchantOid + // Also used as user_basket reference
    params.noInstallment +
    params.maxInstallment +
    params.currency +
    params.testMode;

  const hashWithSalt = hashStr + config.merchantSalt;

  const hmac = createHmac('sha256', config.merchantKey);
  hmac.update(hashWithSalt);
  return hmac.digest('base64');
}

/**
 * Verify webhook hash from PayTR
 */
export function verifyWebhookHash(
  config: PayTRConfig,
  payload: PayTRWebhookPayload
): boolean {
  const hashStr =
    payload.merchant_oid +
    config.merchantSalt +
    payload.status +
    payload.total_amount;

  const hmac = createHmac('sha256', config.merchantKey);
  hmac.update(hashStr);
  const calculatedHash = hmac.digest('base64');

  return calculatedHash === payload.hash;
}

/**
 * Generate hash for platform transfer
 */
export function generateTransferHash(
  config: PayTRConfig,
  params: {
    platformTransferId: string;
    subMerchantOid: string;
    amount: number;
  }
): string {
  const hashStr =
    config.merchantId +
    params.platformTransferId +
    params.subMerchantOid +
    params.amount;

  const hashWithSalt = hashStr + config.merchantSalt;

  const hmac = createHmac('sha256', config.merchantKey);
  hmac.update(hashWithSalt);
  return hmac.digest('base64');
}

/**
 * Generate hash for saved card charge
 */
export function generateChargeHash(
  config: PayTRConfig,
  params: {
    userToken: string;
    cardToken: string;
    merchantOid: string;
    paymentAmount: number;
    currency: string;
  }
): string {
  const hashStr =
    config.merchantId +
    params.userToken +
    params.cardToken +
    params.merchantOid +
    params.paymentAmount +
    params.currency;

  const hashWithSalt = hashStr + config.merchantSalt;

  const hmac = createHmac('sha256', config.merchantKey);
  hmac.update(hashWithSalt);
  return hmac.digest('base64');
}

// =============================================================================
// API CALLS
// =============================================================================

const PAYTR_API_BASE = 'https://www.paytr.com';

/**
 * Get iFrame token for payment
 */
export async function getPaymentToken(
  config: PayTRConfig,
  request: PayTRTokenRequest
): Promise<PayTRTokenResponse> {
  // Convert basket to PayTR format
  const basketJson = JSON.stringify(
    request.basket.map((item) => [item.name, item.price, item.quantity])
  );
  const basketBase64 = btoa(unescape(encodeURIComponent(basketJson)));

  // Prepare params
  const noInstallment = request.noInstallment ? 1 : 0;
  const maxInstallment = request.maxInstallment || 0;
  const testMode = config.testMode ? 1 : 0;

  // Generate hash
  const hash = generateTokenHash(config, {
    merchantOid: request.merchantOid,
    paymentAmount: request.paymentAmount,
    basketJson: basketBase64,
    noInstallment,
    maxInstallment,
    currency: request.currency,
    testMode,
  });

  // Build form data
  const formData = new FormData();
  formData.append('merchant_id', config.merchantId);
  formData.append('merchant_key', config.merchantKey);
  formData.append('merchant_salt', config.merchantSalt);
  formData.append('email', request.userEmail);
  formData.append('payment_amount', request.paymentAmount.toString());
  formData.append('merchant_oid', request.merchantOid);
  formData.append('user_name', request.userName);
  formData.append('user_address', request.userAddress || 'Türkiye');
  formData.append('user_phone', request.userPhone || '');
  formData.append('merchant_ok_url', request.merchantOkUrl);
  formData.append('merchant_fail_url', request.merchantFailUrl);
  formData.append('user_basket', basketBase64);
  formData.append('user_ip', request.userIp);
  formData.append('currency', request.currency);
  formData.append('no_installment', noInstallment.toString());
  formData.append('max_installment', maxInstallment.toString());
  formData.append('test_mode', testMode.toString());
  formData.append('debug_on', request.debug ? '1' : '0');
  formData.append('paytr_token', hash);
  formData.append('timeout_limit', '30'); // 30 minutes

  // Card storage
  if (request.storeCard) {
    formData.append('non_3d_test_failed', '0');
    formData.append('store_card', '1');
  }
  if (request.userToken) {
    formData.append('utoken', request.userToken);
  }

  // Make request
  const response = await fetch(`${PAYTR_API_BASE}/odeme/api/get-token`, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();

  if (result.status === 'success') {
    return {
      status: 'success',
      token: result.token,
    };
  } else {
    return {
      status: 'failed',
      reason: result.reason || 'Unknown error',
    };
  }
}

/**
 * Initiate platform transfer to receiver
 */
export async function initiateTransfer(
  config: PayTRConfig,
  request: PayTRTransferRequest
): Promise<{ success: boolean; error?: string }> {
  const hash = generateTransferHash(config, {
    platformTransferId: request.platformTransferId,
    subMerchantOid: request.subMerchantOid,
    amount: request.amount,
  });

  const formData = new FormData();
  formData.append('merchant_id', config.merchantId);
  formData.append('platform_transfer_id', request.platformTransferId);
  formData.append('sub_merchant_oid', request.subMerchantOid);
  formData.append('transfer_amount', request.amount.toString());
  formData.append('iban', request.iban);
  formData.append('account_holder_name', request.accountHolderName);
  formData.append('paytr_token', hash);

  const response = await fetch(`${PAYTR_API_BASE}/odeme/platform/transfer`, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();

  if (result.status === 'success') {
    return { success: true };
  } else {
    return { success: false, error: result.err_msg || 'Transfer failed' };
  }
}

/**
 * Charge a saved card
 */
export async function chargeSavedCard(
  config: PayTRConfig,
  request: PayTRChargeRequest
): Promise<{ success: boolean; error?: string }> {
  const hash = generateChargeHash(config, {
    userToken: request.userToken,
    cardToken: request.cardToken,
    merchantOid: request.merchantOid,
    paymentAmount: request.paymentAmount,
    currency: request.currency,
  });

  const formData = new FormData();
  formData.append('merchant_id', config.merchantId);
  formData.append('utoken', request.userToken);
  formData.append('ctoken', request.cardToken);
  formData.append('merchant_oid', request.merchantOid);
  formData.append('payment_amount', request.paymentAmount.toString());
  formData.append('currency', request.currency);
  formData.append('user_ip', request.userIp);
  formData.append('paytr_token', hash);
  formData.append('test_mode', config.testMode ? '1' : '0');

  if (request.cvv) {
    formData.append('cvc', request.cvv);
  }

  const response = await fetch(`${PAYTR_API_BASE}/odeme/api/charge`, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();

  if (result.status === 'success') {
    return { success: true };
  } else {
    return { success: false, error: result.err_msg || 'Charge failed' };
  }
}

/**
 * Refund a payment
 */
export async function refundPayment(
  config: PayTRConfig,
  merchantOid: string,
  amount: number // Amount in kuruş
): Promise<{ success: boolean; error?: string }> {
  const hashStr = config.merchantId + merchantOid + amount.toString();
  const hashWithSalt = hashStr + config.merchantSalt;

  const hmac = createHmac('sha256', config.merchantKey);
  hmac.update(hashWithSalt);
  const hash = hmac.digest('base64');

  const formData = new FormData();
  formData.append('merchant_id', config.merchantId);
  formData.append('merchant_oid', merchantOid);
  formData.append('return_amount', amount.toString());
  formData.append('paytr_token', hash);

  const response = await fetch(`${PAYTR_API_BASE}/odeme/iade`, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();

  if (result.status === 'success') {
    return { success: true };
  } else {
    return { success: false, error: result.err_msg || 'Refund failed' };
  }
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Format amount to kuruş (cents)
 * 100.50 TL -> 10050 kuruş
 */
export function toKurus(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Format kuruş to TL
 * 10050 kuruş -> 100.50 TL
 */
export function fromKurus(kurus: number): number {
  return kurus / 100;
}

/**
 * Generate unique merchant order ID
 */
export function generateMerchantOid(prefix = 'TM'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
}

/**
 * Format price for basket (2 decimal places)
 */
export function formatPrice(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Create basket item for PayTR
 */
export function createBasketItem(
  name: string,
  price: number,
  quantity = 1
): PayTRBasketItem {
  return {
    name: name.substring(0, 100), // Max 100 chars
    price: formatPrice(price),
    quantity,
  };
}
