/**
 * Exchange Rate Service
 * Handles live exchange rates with buffer for TravelMatch
 */

import { supabase } from '@/config/supabase';
import { CurrencyCode } from '@/constants/currencies';
import { logger } from '@/utils/logger';

// ============================================
// Types
// ============================================

export interface LiveExchangeRate {
  rate: number;
  rateWithBuffer: number;
  bufferPercentage: number;
  rateTimestamp: Date;
  isStale: boolean;
}

export interface ConversionResult {
  originalAmount: number;
  originalCurrency: CurrencyCode;
  tryAmount: number;
  tryAmountWithBuffer: number;
  exchangeRate: number;
  bufferPercentage: number;
  rateTimestamp: Date;
  isStale: boolean;
}

export interface PaymentCalculation {
  momentPrice: number;
  momentCurrency: CurrencyCode;
  userPays: number;
  userCurrency: CurrencyCode;
  exchangeRate: number;
  bufferPercentage: number;
  escrowTier: 'direct' | 'optional' | 'required';
  escrowType: 'none' | 'optional' | 'required';
  maxContributors: number | null;
  rateTimestamp: Date;
  rateIsStale: boolean;
}

export interface EscrowTier {
  tierName: string;
  escrowType: 'none' | 'optional' | 'required';
  maxContributors: number | null;
  amountUsd: number;
  descriptionTr: string;
  descriptionEn: string;
}

// ============================================
// Get Live Exchange Rate
// ============================================

/**
 * Get live exchange rate with buffer
 */
export const getLiveExchangeRate = async (
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode = 'TRY'
): Promise<LiveExchangeRate> => {
  try {
    const { data, error } = await supabase.rpc('get_live_exchange_rate', {
      p_from_currency: fromCurrency,
      p_to_currency: toCurrency,
    });

    if (error) throw error;

    if (!data || data.length === 0) {
      throw new Error(`No rate found for ${fromCurrency}/${toCurrency}`);
    }

    const row = data[0];
    return {
      rate: parseFloat(row.rate),
      rateWithBuffer: parseFloat(row.rate_with_buffer),
      bufferPercentage: parseFloat(row.buffer_percentage),
      rateTimestamp: new Date(row.rate_timestamp),
      isStale: row.is_stale,
    };
  } catch (error) {
    logger.error('[ExchangeRate] Failed to get live rate:', error);
    throw error;
  }
};

// ============================================
// Convert to TRY with Buffer
// ============================================

/**
 * Convert any currency to TRY with inflation buffer
 */
export const convertToTryWithBuffer = async (
  amount: number,
  fromCurrency: CurrencyCode
): Promise<ConversionResult> => {
  try {
    // TRY is already TRY
    if (fromCurrency === 'TRY') {
      return {
        originalAmount: amount,
        originalCurrency: 'TRY',
        tryAmount: amount,
        tryAmountWithBuffer: amount,
        exchangeRate: 1,
        bufferPercentage: 0,
        rateTimestamp: new Date(),
        isStale: false,
      };
    }

    const { data, error } = await supabase.rpc('convert_to_try_with_buffer', {
      p_amount: amount,
      p_from_currency: fromCurrency,
    });

    if (error) throw error;

    if (!data || data.length === 0) {
      throw new Error(`Conversion failed for ${amount} ${fromCurrency}`);
    }

    const row = data[0];
    return {
      originalAmount: parseFloat(row.original_amount),
      originalCurrency: row.original_currency as CurrencyCode,
      tryAmount: parseFloat(row.try_amount),
      tryAmountWithBuffer: parseFloat(row.try_amount_with_buffer),
      exchangeRate: parseFloat(row.exchange_rate),
      bufferPercentage: parseFloat(row.buffer_percentage),
      rateTimestamp: new Date(row.rate_timestamp),
      isStale: row.is_stale,
    };
  } catch (error) {
    logger.error('[ExchangeRate] Conversion failed:', error);
    throw error;
  }
};

// ============================================
// Get Escrow Tier
// ============================================

/**
 * Get escrow tier for a given amount
 * Tiers are USD-based: 0-30 direct, 30-100 optional, 100+ required
 */
export const getEscrowTier = async (
  amount: number,
  currency: CurrencyCode
): Promise<EscrowTier> => {
  try {
    const { data, error } = await supabase.rpc('get_escrow_tier_for_amount', {
      p_amount: amount,
      p_currency: currency,
    });

    if (error) throw error;

    if (!data || data.length === 0) {
      // Default to required if no tier found
      return {
        tierName: 'required',
        escrowType: 'required',
        maxContributors: 3,
        amountUsd: amount,
        descriptionTr: 'Escrow zorunlu',
        descriptionEn: 'Escrow required',
      };
    }

    const row = data[0];
    return {
      tierName: row.tier_name,
      escrowType: row.escrow_type as 'none' | 'optional' | 'required',
      maxContributors: row.max_contributors,
      amountUsd: parseFloat(row.amount_usd),
      descriptionTr: row.description_tr,
      descriptionEn: row.description_en,
    };
  } catch (error) {
    logger.error('[ExchangeRate] Failed to get escrow tier:', error);
    throw error;
  }
};

// ============================================
// Calculate Payment Amount
// ============================================

/**
 * Calculate full payment details for a moment
 * Returns what user will pay in their currency
 */
export const calculatePaymentAmount = async (
  momentId: string,
  userCurrency: CurrencyCode = 'TRY'
): Promise<PaymentCalculation> => {
  try {
    const { data, error } = await supabase.rpc('calculate_payment_amount', {
      p_moment_id: momentId,
      p_user_currency: userCurrency,
    });

    if (error) throw error;

    if (!data || data.length === 0) {
      throw new Error(`Payment calculation failed for moment ${momentId}`);
    }

    const row = data[0];
    return {
      momentPrice: parseFloat(row.moment_price),
      momentCurrency: row.moment_currency as CurrencyCode,
      userPays: parseFloat(row.user_pays),
      userCurrency: row.user_currency as CurrencyCode,
      exchangeRate: parseFloat(row.exchange_rate),
      bufferPercentage: parseFloat(row.buffer_percentage),
      escrowTier: row.escrow_tier as 'direct' | 'optional' | 'required',
      escrowType: row.escrow_type as 'none' | 'optional' | 'required',
      maxContributors: row.max_contributors,
      rateTimestamp: new Date(row.rate_timestamp),
      rateIsStale: row.rate_is_stale,
    };
  } catch (error) {
    logger.error('[ExchangeRate] Payment calculation failed:', error);
    throw error;
  }
};

// ============================================
// Quick Convert (Client-side with cached rates)
// ============================================

/**
 * Quick conversion using cached rates
 * Use for display only, not for actual payments
 */
export const quickConvert = (
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  cachedRates: Record<string, number>
): number => {
  if (fromCurrency === toCurrency) return amount;

  const key = `${fromCurrency}_${toCurrency}`;
  const rate = cachedRates[key];

  if (rate) {
    return Math.round(amount * rate * 100) / 100;
  }

  // Try reverse
  const reverseKey = `${toCurrency}_${fromCurrency}`;
  const reverseRate = cachedRates[reverseKey];

  if (reverseRate) {
    return Math.round((amount / reverseRate) * 100) / 100;
  }

  logger.warn('[ExchangeRate] No cached rate for', key);
  return amount;
};

// ============================================
// Format Helpers
// ============================================

/**
 * Format rate age for display
 */
export const formatRateAge = (timestamp: Date): string => {
  const ageMinutes = Math.floor((Date.now() - timestamp.getTime()) / 60000);

  if (ageMinutes < 1) return 'Az önce';
  if (ageMinutes < 60) return `${ageMinutes} dk önce`;

  const ageHours = Math.floor(ageMinutes / 60);
  if (ageHours < 24) return `${ageHours} saat önce`;

  return `${Math.floor(ageHours / 24)} gün önce`;
};

/**
 * Check if rate is acceptable for payment
 */
export const isRateAcceptable = (
  timestamp: Date,
  maxAgeMinutes: number = 120
): boolean => {
  const ageMinutes = (Date.now() - timestamp.getTime()) / 60000;
  return ageMinutes <= maxAgeMinutes;
};

/**
 * Get buffer explanation text
 */
export const getBufferExplanation = (
  bufferPercentage: number,
  language: 'tr' | 'en' = 'tr'
): string => {
  if (bufferPercentage === 0) return '';

  if (language === 'tr') {
    return `Kur koruması dahil (%${bufferPercentage})`;
  }
  return `Includes exchange rate protection (${bufferPercentage}%)`;
};

// ============================================
// Escrow Tier Helpers
// ============================================

/**
 * Check if escrow is required for amount
 */
export const isEscrowRequired = (tier: EscrowTier): boolean => {
  return tier.escrowType === 'required';
};

/**
 * Check if max contributors limit applies
 */
export const hasContributorLimit = (tier: EscrowTier): boolean => {
  return tier.maxContributors !== null && tier.maxContributors > 0;
};

/**
 * Get escrow tier color for UI
 */
export const getEscrowTierColor = (
  escrowType: 'none' | 'optional' | 'required'
): string => {
  switch (escrowType) {
    case 'none':
      return '#10B981'; // Green - direct pay
    case 'optional':
      return '#F59E0B'; // Yellow - optional
    case 'required':
      return '#3B82F6'; // Blue - protected
    default:
      return '#6B7280'; // Gray
  }
};

export default {
  getLiveExchangeRate,
  convertToTryWithBuffer,
  getEscrowTier,
  calculatePaymentAmount,
  quickConvert,
  formatRateAge,
  isRateAcceptable,
  getBufferExplanation,
  isEscrowRequired,
  hasContributorLimit,
  getEscrowTierColor,
};
