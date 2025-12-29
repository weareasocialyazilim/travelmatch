/**
 * usePaymentCalculation Hook
 * Calculates payment amount with live exchange rates
 */

import { useState, useEffect, useCallback } from 'react';
import {
  calculatePaymentAmount,
  PaymentCalculation,
  getEscrowTier,
  EscrowTier,
  formatRateAge,
  isRateAcceptable,
  getBufferExplanation,
} from '@/services/exchangeRateService';
import { formatCurrency } from '@/utils/currencyFormatter';
import { CurrencyCode } from '@/constants/currencies';
import { useCurrency } from '@/context/CurrencyContext';
import { logger } from '@/utils/logger';

// ============================================
// Types
// ============================================

interface UsePaymentCalculationOptions {
  momentId?: string;
  amount?: number;
  currency?: CurrencyCode;
  autoRefresh?: boolean;
  refreshInterval?: number; // ms
}

interface PaymentCalculationState {
  // Loading & Error
  isLoading: boolean;
  error: string | null;

  // Calculation Result
  calculation: PaymentCalculation | null;
  escrowTier: EscrowTier | null;

  // Formatted values for UI
  formatted: {
    originalPrice: string; // "€50.00"
    userPays: string; // "₺1,966.13"
    exchangeRate: string; // "1 EUR = 37.45 TRY"
    bufferNote: string; // "Kur koruması dahil (%5)"
    rateAge: string; // "5 dk önce"
    escrowDescription: string; // "Escrow opsiyonel"
  };

  // Flags
  isStaleRate: boolean;
  needsEscrow: boolean;
  hasContributorLimit: boolean;
  maxContributors: number | null;

  // Actions
  refresh: () => Promise<void>;
}

// ============================================
// Hook
// ============================================

export const usePaymentCalculation = (
  options: UsePaymentCalculationOptions
): PaymentCalculationState => {
  const {
    momentId,
    amount,
    currency,
    autoRefresh = false,
    refreshInterval = 60000,
  } = options;
  const { userCurrency } = useCurrency();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calculation, setCalculation] = useState<PaymentCalculation | null>(null);
  const [escrowTier, setEscrowTier] = useState<EscrowTier | null>(null);

  // ==========================================
  // Fetch calculation
  // ==========================================

  const fetchCalculation = useCallback(async () => {
    // Need either momentId OR (amount + currency)
    if (!momentId && (!amount || !currency)) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (momentId) {
        // Full calculation from moment
        const calc = await calculatePaymentAmount(momentId, userCurrency);
        setCalculation(calc);

        // Get escrow tier
        const tier = await getEscrowTier(calc.momentPrice, calc.momentCurrency);
        setEscrowTier(tier);
      } else if (amount && currency) {
        // Just escrow tier for amount
        const tier = await getEscrowTier(amount, currency);
        setEscrowTier(tier);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Hesaplama başarısız';
      setError(message);
      logger.error('[usePaymentCalculation] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [momentId, amount, currency, userCurrency]);

  // ==========================================
  // Effects
  // ==========================================

  useEffect(() => {
    fetchCalculation();
  }, [fetchCalculation]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchCalculation, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchCalculation]);

  // ==========================================
  // Formatted values
  // ==========================================

  const formatted = {
    originalPrice: calculation
      ? formatCurrency(calculation.momentPrice, calculation.momentCurrency)
      : amount && currency
        ? formatCurrency(amount, currency)
        : '-',

    userPays: calculation
      ? formatCurrency(calculation.userPays, calculation.userCurrency)
      : '-',

    exchangeRate:
      calculation && calculation.exchangeRate !== 1
        ? `1 ${calculation.momentCurrency} = ${calculation.exchangeRate.toFixed(2)} ${calculation.userCurrency}`
        : '',

    bufferNote: calculation
      ? getBufferExplanation(calculation.bufferPercentage, 'tr')
      : '',

    rateAge: calculation ? formatRateAge(calculation.rateTimestamp) : '',

    escrowDescription: escrowTier ? escrowTier.descriptionTr : '',
  };

  // ==========================================
  // Flags
  // ==========================================

  const isStaleRate = calculation
    ? !isRateAcceptable(calculation.rateTimestamp)
    : false;

  const needsEscrow = escrowTier ? escrowTier.escrowType !== 'none' : false;

  const hasContributorLimit = escrowTier
    ? escrowTier.maxContributors !== null
    : false;

  const maxContributors = escrowTier?.maxContributors ?? null;

  // ==========================================
  // Return
  // ==========================================

  return {
    isLoading,
    error,
    calculation,
    escrowTier,
    formatted,
    isStaleRate,
    needsEscrow,
    hasContributorLimit,
    maxContributors,
    refresh: fetchCalculation,
  };
};

// ============================================
// Simple amount conversion hook
// ============================================

interface UseConvertedAmountOptions {
  amount: number;
  fromCurrency: CurrencyCode;
  toCurrency?: CurrencyCode;
}

export const useConvertedAmount = (options: UseConvertedAmountOptions) => {
  const { amount, fromCurrency, toCurrency } = options;
  const { userCurrency, convert } = useCurrency();

  const targetCurrency = toCurrency || userCurrency;
  const convertedAmount = convert(amount, fromCurrency, targetCurrency);
  const needsConversion = fromCurrency !== targetCurrency;

  return {
    originalAmount: amount,
    originalCurrency: fromCurrency,
    convertedAmount,
    targetCurrency,
    needsConversion,
    formatted: {
      original: formatCurrency(amount, fromCurrency),
      converted: formatCurrency(convertedAmount, targetCurrency),
      combined: needsConversion
        ? `${formatCurrency(convertedAmount, targetCurrency)} (~${formatCurrency(amount, fromCurrency)})`
        : formatCurrency(amount, fromCurrency),
    },
  };
};

export default usePaymentCalculation;
