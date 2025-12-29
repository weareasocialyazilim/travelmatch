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
  toCurrency: CurrencyCode = 'TRY',
): Promise<LiveExchangeRate> => {
  try {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('rate, buffer_percentage, updated_at')
      .eq('from_currency', fromCurrency)
      .eq('to_currency', toCurrency)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    if (!data) {
      throw new Error(`No rate found for ${fromCurrency}/${toCurrency}`);
    }

    const rateData = data as {
      buffer_percentage?: number;
      updated_at: string;
      rate: number;
    };
    const bufferPct = rateData.buffer_percentage || 3;
    const rateTimestamp = new Date(rateData.updated_at);
    const ageMinutes = (Date.now() - rateTimestamp.getTime()) / 60000;

    return {
      rate: rateData.rate,
      rateWithBuffer: rateData.rate * (1 + bufferPct / 100),
      bufferPercentage: bufferPct,
      rateTimestamp,
      isStale: ageMinutes > 120, // Stale if older than 2 hours
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
  fromCurrency: CurrencyCode,
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

    // Get live rate and calculate conversion
    const liveRate = await getLiveExchangeRate(fromCurrency, 'TRY');

    return {
      originalAmount: amount,
      originalCurrency: fromCurrency,
      tryAmount: amount * liveRate.rate,
      tryAmountWithBuffer: amount * liveRate.rateWithBuffer,
      exchangeRate: liveRate.rate,
      bufferPercentage: liveRate.bufferPercentage,
      rateTimestamp: liveRate.rateTimestamp,
      isStale: liveRate.isStale,
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
  currency: CurrencyCode,
): Promise<EscrowTier> => {
  try {
    // Convert to USD for tier calculation if needed
    let amountUsd = amount;
    if (currency !== 'USD') {
      try {
        const rate = await getLiveExchangeRate(currency, 'USD');
        amountUsd = amount * rate.rate;
      } catch {
        // Use approximate conversion if rate fetch fails
        const fallbackRates: Record<string, number> = {
          TRY: 0.031,
          EUR: 1.08,
          GBP: 1.27,
          USD: 1,
        };
        amountUsd = amount * (fallbackRates[currency] || 0.031);
      }
    }

    // Determine tier based on USD equivalent
    if (amountUsd < 30) {
      return {
        tierName: 'direct',
        escrowType: 'none',
        maxContributors: null,
        amountUsd,
        descriptionTr: 'Küçük hediyeler anında iletilir',
        descriptionEn: 'Small gifts are delivered instantly',
      };
    } else if (amountUsd < 100) {
      return {
        tierName: 'optional',
        escrowType: 'optional',
        maxContributors: null,
        amountUsd,
        descriptionTr: 'Kanıt talep edebilirsiniz',
        descriptionEn: 'You can request proof',
      };
    } else {
      return {
        tierName: 'required',
        escrowType: 'required',
        maxContributors: 3,
        amountUsd,
        descriptionTr: 'Kanıt zorunludur',
        descriptionEn: 'Proof is required',
      };
    }
  } catch (error) {
    logger.error('[ExchangeRate] Failed to get escrow tier:', error);
    // Default to required tier on error
    return {
      tierName: 'required',
      escrowType: 'required',
      maxContributors: 3,
      amountUsd: amount,
      descriptionTr: 'Escrow zorunlu',
      descriptionEn: 'Escrow required',
    };
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
  userCurrency: CurrencyCode = 'TRY',
): Promise<PaymentCalculation> => {
  try {
    // Fetch moment price from database
    const { data: moment, error: momentError } = await supabase
      .from('moments')
      .select('price, currency')
      .eq('id', momentId)
      .single();

    if (momentError) throw momentError;
    if (!moment) throw new Error(`Moment ${momentId} not found`);

    const momentPrice = moment.price || 0;
    const momentCurrency = (moment.currency || 'TRY') as CurrencyCode;

    // Get escrow tier
    const tier = await getEscrowTier(momentPrice, momentCurrency);

    // Convert to user's currency if different
    let userPays = momentPrice;
    let exchangeRate = 1;
    let bufferPercentage = 0;
    let rateTimestamp = new Date();
    let rateIsStale = false;

    if (momentCurrency !== userCurrency) {
      const conversion = await convertToTryWithBuffer(
        momentPrice,
        momentCurrency,
      );
      userPays = conversion.tryAmountWithBuffer;
      exchangeRate = conversion.exchangeRate;
      bufferPercentage = conversion.bufferPercentage;
      rateTimestamp = conversion.rateTimestamp;
      rateIsStale = conversion.isStale;
    }

    return {
      momentPrice,
      momentCurrency,
      userPays,
      userCurrency,
      exchangeRate,
      bufferPercentage,
      escrowTier: tier.tierName as 'direct' | 'optional' | 'required',
      escrowType: tier.escrowType,
      maxContributors: tier.maxContributors,
      rateTimestamp,
      rateIsStale,
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
  cachedRates: Record<string, number>,
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
  maxAgeMinutes: number = 120,
): boolean => {
  const ageMinutes = (Date.now() - timestamp.getTime()) / 60000;
  return ageMinutes <= maxAgeMinutes;
};

/**
 * Get buffer explanation text
 */
export const getBufferExplanation = (
  bufferPercentage: number,
  language: 'tr' | 'en' = 'tr',
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
  escrowType: 'none' | 'optional' | 'required',
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
