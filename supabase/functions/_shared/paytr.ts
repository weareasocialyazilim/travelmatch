/**
 * PayTR Integration Utilities - Payout Only
 *
 * PayTR is used ONLY for platform-to-user transfers (payouts/withdrawals).
 * All user payments are handled via IAP (Apple App Store / Google Play Store).
 *
 * This file contains ONLY payout-related functions.
 *
 * Documentation: https://dev.paytr.com/
 */

import {
  createHmac,
  timingSafeEqual,
} from 'https://deno.land/std@0.177.0/node/crypto.ts';

// =============================================================================
// CONSTANTS
// =============================================================================

const PAYTR_API_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000; // 1 second

// =============================================================================
// RETRY UTILITY
// =============================================================================

interface RetryOptions {
  maxRetries?: number;
  initialBackoff?: number;
  maxBackoff?: number;
  retryOn?: (error: Error) => boolean;
}

async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxRetries = MAX_RETRIES,
    initialBackoff = INITIAL_BACKOFF_MS,
    maxBackoff = 16000,
    retryOn = (e) =>
      e.message.includes('network') || e.message.includes('timeout'),
  } = options;

  let lastError: Error | null = null;
  let backoff = initialBackoff;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (!retryOn(lastError)) {
        throw lastError;
      }

      if (attempt < maxRetries) {
        const jitter = Math.random() * 0.3 * backoff;
        await new Promise((resolve) => setTimeout(resolve, backoff + jitter));
        backoff = Math.min(backoff * 2, maxBackoff);
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {},
): Promise<Response> {
  const { timeout = PAYTR_API_TIMEOUT, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - PayTR API did not respond in time');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// =============================================================================
// TYPES
// =============================================================================

export interface PayTRConfig {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  testMode: boolean;
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
}

export interface PayTRTransferRequest {
  platformTransferId: string;
  subMerchantOid: string;
  amount: number; // Amount in kuruş (cents)
  iban: string;
  accountHolderName: string;
}

export interface PayTRBasketItem {
  name: string;
  price: string;
  quantity: number;
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
// HASH GENERATION (For Payouts)
// =============================================================================

export function generateTransferHash(
  config: PayTRConfig,
  params: {
    platformTransferId: string;
    subMerchantOid: string;
    amount: number;
  },
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

export function verifyWebhookHash(
  config: PayTRConfig,
  payload: PayTRWebhookPayload,
): boolean {
  const hashStr =
    payload.merchant_oid +
    config.merchantSalt +
    payload.status +
    payload.total_amount;

  const hmac = createHmac('sha256', config.merchantKey);
  hmac.update(hashStr);
  const calculatedHash = hmac.digest('base64');

  if (calculatedHash.length !== payload.hash.length) {
    return false;
  }

  const encoder = new TextEncoder();
  const a = encoder.encode(calculatedHash);
  const b = encoder.encode(payload.hash);

  return timingSafeEqual(a, b);
}

// =============================================================================
// PAYOUT API CALLS
// =============================================================================

const PAYTR_API_BASE = 'https://www.paytr.com';

/**
 * Initiate platform transfer to receiver (PAYOUT ONLY)
 * Uses PayTR Platform Transfer API for sending money to user bank accounts.
 */
export async function initiateTransfer(
  config: PayTRConfig,
  request: PayTRTransferRequest,
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

  return withRetry(
    async () => {
      const response = await fetchWithTimeout(
        `${PAYTR_API_BASE}/odeme/platform/transfer`,
        {
          method: 'POST',
          body: formData,
        },
      );

      const result = await response.json();

      if (result.status === 'success') {
        return { success: true };
      } else {
        const error = new Error(result.err_msg || 'Transfer failed');
        (error as any).noRetry = true;
        throw error;
      }
    },
    {
      retryOn: (e) =>
        !(e as any).noRetry &&
        (e.message.includes('timeout') || e.message.includes('network')),
    },
  ).catch((error) => ({
    success: false,
    error: error.message,
  }));
}

// =============================================================================
// HELPERS
// =============================================================================

export function toKurus(amount: number): number {
  return Math.round(amount * 100);
}

export function fromKurus(kurus: number): number {
  return kurus / 100;
}

export function generateMerchantOid(prefix = 'LV'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
}

export function formatPrice(amount: number): string {
  return amount.toFixed(2);
}

export function createBasketItem(
  name: string,
  price: number,
  quantity = 1,
): PayTRBasketItem {
  return {
    name: name.substring(0, 100),
    price: formatPrice(price),
    quantity,
  };
}
