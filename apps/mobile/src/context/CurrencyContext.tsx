/**
 * Currency Context
 * Manages user currency preference and exchange rates
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/config/supabase';
import {
  CurrencyCode,
  DEFAULT_CURRENCY,
  CURRENCIES,
  isSupportedCurrency,
} from '@/constants/currencies';
import { useAuth } from './AuthContext';
import { logger } from '@/utils/logger';

// ============================================
// Types
// ============================================

interface ExchangeRates {
  [key: string]: number; // e.g., "EUR_TRY": 37.45
}

interface CurrencyContextType {
  /** User's preferred currency */
  userCurrency: CurrencyCode;

  /** Update user's preferred currency */
  setUserCurrency: (code: CurrencyCode) => Promise<void>;

  /** Current exchange rates */
  exchangeRates: ExchangeRates;

  /** Convert amount from one currency to another (or to user currency) */
  convert: (amount: number, from: CurrencyCode, to?: CurrencyCode) => number;

  /** Loading state */
  isLoading: boolean;

  /** Last rates update time */
  lastUpdated: Date | null;

  /** Manually refresh rates */
  refreshRates: () => Promise<void>;

  /** Check if conversion is needed */
  needsConversion: (currency: CurrencyCode) => boolean;
}

// ============================================
// Constants
// ============================================

const STORAGE_KEY = '@travelmatch/user_currency';
const RATES_CACHE_KEY = '@travelmatch/exchange_rates';
const RATES_CACHE_TTL = 60 * 60 * 1000; // 1 hour

// ============================================
// Context
// ============================================

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// ============================================
// Provider
// ============================================

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [userCurrency, setUserCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // ==========================================
  // Load user preference
  // ==========================================

  useEffect(() => {
    const loadPreference = async () => {
      try {
        // 1. Check user DB preference first (if logged in)
        if (user?.id) {
          const { data, error } = await supabase
            .from('users')
            .select('preferred_currency')
            .eq('id', user.id)
            .single();

          if (!error && data?.preferred_currency && isSupportedCurrency(data.preferred_currency)) {
            setUserCurrencyState(data.preferred_currency as CurrencyCode);
            await AsyncStorage.setItem(STORAGE_KEY, data.preferred_currency);
            logger.info('[Currency] Loaded from DB:', data.preferred_currency);
            return;
          }
        }

        // 2. Fallback to local storage
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored && isSupportedCurrency(stored)) {
          setUserCurrencyState(stored as CurrencyCode);
          logger.info('[Currency] Loaded from storage:', stored);
          return;
        }

        // 3. Default
        logger.info('[Currency] Using default:', DEFAULT_CURRENCY);
      } catch (error) {
        logger.error('[Currency] Failed to load preference:', error);
      }
    };

    loadPreference();
  }, [user?.id]);

  // ==========================================
  // Load exchange rates
  // ==========================================

  const loadExchangeRates = useCallback(async () => {
    setIsLoading(true);

    try {
      // 1. Try cache first
      const cached = await AsyncStorage.getItem(RATES_CACHE_KEY);
      if (cached) {
        const { rates, timestamp } = JSON.parse(cached);
        const cacheAge = Date.now() - timestamp;

        if (cacheAge < RATES_CACHE_TTL) {
          setExchangeRates(rates);
          setLastUpdated(new Date(timestamp));
          setIsLoading(false);
          logger.info('[Currency] Loaded rates from cache');
          return;
        }
      }

      // 2. Fetch fresh rates from DB
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('exchange_rates')
        .select('base_currency, target_currency, rate')
        .gte('rate_date', today)
        .order('rate_date', { ascending: false });

      if (error) {
        // Try getting latest available rates
        const { data: latestData, error: latestError } = await supabase
          .from('exchange_rates')
          .select('base_currency, target_currency, rate')
          .order('rate_date', { ascending: false })
          .limit(20);

        if (latestError) throw latestError;

        if (latestData && latestData.length > 0) {
          processRates(latestData);
          return;
        }

        throw error;
      }

      if (data && data.length > 0) {
        processRates(data);
      } else {
        // Use cached rates if no fresh data
        logger.warn('[Currency] No fresh rates, using cached');
      }
    } catch (error) {
      logger.error('[Currency] Failed to load exchange rates:', error);
      // Keep using cached/existing rates
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processRates = async (
    data: Array<{ base_currency: string; target_currency: string; rate: number }>
  ) => {
    const rates: ExchangeRates = {};

    data.forEach((row) => {
      const key = `${row.base_currency}_${row.target_currency}`;
      rates[key] = row.rate;
    });

    // Cache rates
    const cacheData = {
      rates,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(RATES_CACHE_KEY, JSON.stringify(cacheData));

    setExchangeRates(rates);
    setLastUpdated(new Date());
    logger.info('[Currency] Loaded', Object.keys(rates).length, 'exchange rates');
  };

  useEffect(() => {
    loadExchangeRates();
  }, [loadExchangeRates]);

  // ==========================================
  // Set user currency
  // ==========================================

  const setUserCurrency = async (code: CurrencyCode) => {
    if (!isSupportedCurrency(code)) {
      logger.warn('[Currency] Unsupported currency:', code);
      return;
    }

    setUserCurrencyState(code);
    await AsyncStorage.setItem(STORAGE_KEY, code);

    // Update DB if logged in
    if (user?.id) {
      const { error } = await supabase
        .from('users')
        .update({ preferred_currency: code })
        .eq('id', user.id);

      if (error) {
        logger.error('[Currency] Failed to save preference to DB:', error);
      } else {
        logger.info('[Currency] Saved preference to DB:', code);
      }
    }
  };

  // ==========================================
  // Convert currency
  // ==========================================

  const convert = useCallback(
    (amount: number, from: CurrencyCode, to?: CurrencyCode): number => {
      const target = to || userCurrency;

      // Same currency
      if (from === target) return amount;

      // Direct rate
      const directKey = `${from}_${target}`;
      if (exchangeRates[directKey]) {
        return Math.round(amount * exchangeRates[directKey] * 100) / 100;
      }

      // Reverse rate
      const reverseKey = `${target}_${from}`;
      if (exchangeRates[reverseKey]) {
        return Math.round((amount / exchangeRates[reverseKey]) * 100) / 100;
      }

      // Cross-rate through TRY
      if (from !== 'TRY' && target !== 'TRY') {
        const fromToTry =
          exchangeRates[`${from}_TRY`] || 1 / (exchangeRates[`TRY_${from}`] || 1);
        const tryToTarget =
          exchangeRates[`TRY_${target}`] || 1 / (exchangeRates[`${target}_TRY`] || 1);

        if (fromToTry && tryToTarget) {
          return Math.round(amount * fromToTry * tryToTarget * 100) / 100;
        }
      }

      logger.warn('[Currency] No rate found for', from, 'to', target);
      return amount; // Return original if no rate found
    },
    [exchangeRates, userCurrency]
  );

  // ==========================================
  // Check if conversion needed
  // ==========================================

  const needsConversion = useCallback(
    (currency: CurrencyCode): boolean => {
      return currency !== userCurrency;
    },
    [userCurrency]
  );

  // ==========================================
  // Context value
  // ==========================================

  const value: CurrencyContextType = {
    userCurrency,
    setUserCurrency,
    exchangeRates,
    convert,
    isLoading,
    lastUpdated,
    refreshRates: loadExchangeRates,
    needsConversion,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

// ============================================
// Hook
// ============================================

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }

  return context;
};

// ============================================
// Convenience Hooks
// ============================================

/**
 * Hook to get converted price
 */
export const useConvertedPrice = (
  amount: number,
  currency: CurrencyCode
): {
  displayAmount: number;
  displayCurrency: CurrencyCode;
  isConverted: boolean;
  originalAmount: number;
  originalCurrency: CurrencyCode;
} => {
  const { userCurrency, convert, needsConversion } = useCurrency();

  const isConverted = needsConversion(currency);
  const displayAmount = isConverted ? convert(amount, currency) : amount;

  return {
    displayAmount,
    displayCurrency: userCurrency,
    isConverted,
    originalAmount: amount,
    originalCurrency: currency,
  };
};

export default CurrencyContext;
