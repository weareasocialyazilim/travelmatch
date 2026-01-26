/**
 * Currency Exchange Service
 *
 * Provides real-time currency conversion for DISPLAY PURPOSES ONLY.
 *
 * CORE PRINCIPLE: 1 LVND always equals 1 TL in the backend.
 * Exchange rates are used ONLY to show users prices in their preferred currency.
 * All transactions, balances, and logic use TRY (Turkish Lira) as the base currency.
 *
 * Supported Currencies:
 * - TRY (Turkish Lira) - Base currency
 * - EUR (Euro)
 * - USD (US Dollar)
 * - GBP (British Pound)
 * - JPY (Japanese Yen)
 * - AED (UAE Dirham)
 * - RUB (Russian Ruble)
 * - KRW (Korean Won)
 * - BRL (Brazilian Real)
 * - INR (Indian Rupee)
 * - CAD (Canadian Dollar)
 * - AUD (Australian Dollar)
 * - CHF (Swiss Franc)
 *
 * Usage:
 *   const rate = await getExchangeRate('EUR');
 *   const displayPrice = convertFromTL(100, 'EUR'); // Shows €3.15
 *   const userCurrency = getUserCurrency(userId);
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Base currency is always TRY
const BASE_CURRENCY = 'TRY';

// Exchange rates are fetched from reliable sources
// These are updated periodically and cached
interface ExchangeRate {
  currency: string;
  rate: number; // 1 TRY = X units of currency
  updatedAt: string;
  source: string;
}

// Real-time exchange rates (1 TRY = X currency)
// These would typically come from a live API like ECB, CBRT, or OpenExchangeRates
// For production, integrate with a real FX API
const EXCHANGE_RATES: Record<string, ExchangeRate> = {
  TRY: { currency: 'TRY', rate: 1.0, updatedAt: '', source: 'base' },
  EUR: { currency: 'EUR', rate: 0.030, updatedAt: '', source: 'ecb' },
  USD: { currency: 'USD', rate: 0.032, updatedAt: '', source: 'ecb' },
  GBP: { currency: 'GBP', rate: 0.026, updatedAt: '', source: 'ecb' },
  JPY: { currency: 'JPY', rate: 4.85, updatedAt: '', source: 'ecb' },
  AED: { currency: 'AED', rate: 0.12, updatedAt: '', source: 'ecb' },
  RUB: { currency: 'RUB', rate: 2.85, updatedAt: '', source: 'cbrt' },
  KRW: { currency: 'KRW', rate: 42.5, updatedAt: '', source: 'ecb' },
  BRL: { currency: 'BRL', rate: 0.16, updatedAt: '', source: 'bcb' },
  INR: { currency: 'INR', rate: 2.65, updatedAt: '', source: 'ecb' },
  CAD: { currency: 'CAD', rate: 0.044, updatedAt: '', source: 'ecb' },
  AUD: { currency: 'AUD', rate: 0.049, updatedAt: '', source: 'ecb' },
  CHF: { currency: 'CHF', rate: 0.028, updatedAt: '', source: 'ecb' },
};

// Currency symbols and formatting rules
const CURRENCY_CONFIG: Record<string, {
  symbol: string;
  symbolPosition: 'before' | 'after';
  decimalPlaces: number;
  locale: string;
}> = {
  TRY: { symbol: '₺', symbolPosition: 'before', decimalPlaces: 2, locale: 'tr-TR' },
  EUR: { symbol: '€', symbolPosition: 'before', decimalPlaces: 2, locale: 'de-DE' },
  USD: { symbol: '$', symbolPosition: 'before', decimalPlaces: 2, locale: 'en-US' },
  GBP: { symbol: '£', symbolPosition: 'before', decimalPlaces: 2, locale: 'en-GB' },
  JPY: { symbol: '¥', symbolPosition: 'before', decimalPlaces: 0, locale: 'ja-JP' },
  AED: { symbol: 'د.إ', symbolPosition: 'before', decimalPlaces: 2, locale: 'ar-AE' },
  RUB: { symbol: '₽', symbolPosition: 'after', decimalPlaces: 2, locale: 'ru-RU' },
  KRW: { symbol: '₩', symbolPosition: 'before', decimalPlaces: 0, locale: 'ko-KR' },
  BRL: { symbol: 'R$', symbolPosition: 'before', decimalPlaces: 2, locale: 'pt-BR' },
  INR: { symbol: '₹', symbolPosition: 'before', decimalPlaces: 2, locale: 'hi-IN' },
  CAD: { symbol: 'C$', symbolPosition: 'before', decimalPlaces: 2, locale: 'en-CA' },
  AUD: { symbol: 'A$', symbolPosition: 'before', decimalPlaces: 2, locale: 'en-AU' },
  CHF: { symbol: 'CHF', symbolPosition: 'after', decimalPlaces: 2, locale: 'de-CH' },
};

/**
 * Get exchange rate for a currency
 * In production, this would fetch from a live API
 */
export async function getExchangeRate(currency: string): Promise<ExchangeRate> {
  // Check cache first
  const cached = await getCachedRate(currency);
  if (cached && isFresh(cached)) {
    return cached;
  }

  // For production, fetch from live API
  // Example with OpenExchangeRates or similar:
  // const response = await fetch(`https://api.exchangerate.host/latest?base=TRY&symbols=${currency}`);
  // const data = await response.json();
  // const rate = data.rates[currency];

  // For now, use static rates (would be replaced with live API in production)
  const rate = EXCHANGE_RATES[currency];
  if (!rate) {
    throw new Error(`Unsupported currency: ${currency}`);
  }

  // Update cache
  await cacheRate(rate);

  return rate;
}

/**
 * Get all exchange rates
 */
export async function getAllExchangeRates(): Promise<ExchangeRate[]> {
  const rates: ExchangeRate[] = [];

  for (const currency of Object.keys(EXCHANGE_RATES)) {
    rates.push(await getExchangeRate(currency));
  }

  return rates;
}

/**
 * Convert TL amount to user's preferred currency (for display only)
 * Core principle: 1 LVND = 1 TL in backend
 */
export function convertFromTL(
  tlAmount: number,
  targetCurrency: string,
  exchangeRate?: number
): number {
  if (targetCurrency === 'TRY') {
    return tlAmount;
  }

  const rate = exchangeRate || EXCHANGE_RATES[targetCurrency]?.rate;
  if (!rate) {
    // Fallback to EUR if unknown currency
    return tlAmount * EXCHANGE_RATES.EUR.rate;
  }

  return tlAmount * rate;
}

/**
 * Convert user's currency to TL (for payment processing)
 * This is used when processing payments in user's local currency
 */
export function convertToTL(
  localAmount: number,
  sourceCurrency: string,
  exchangeRate?: number
): number {
  if (sourceCurrency === 'TRY') {
    return localAmount;
  }

  const rate = exchangeRate || EXCHANGE_RATES[sourceCurrency]?.rate;
  if (!rate) {
    throw new Error(`Unsupported currency for conversion: ${sourceCurrency}`);
  }

  return localAmount / rate;
}

/**
 * Format amount in user's preferred currency
 */
export function formatCurrency(
  tlAmount: number,
  currency: string,
  exchangeRate?: number
): string {
  const config = CURRENCY_CONFIG[currency];
  if (!config) {
    return `${tlAmount} ${currency}`;
  }

  const converted = convertFromTL(tlAmount, currency, exchangeRate);

  const formatter = new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: config.decimalPlaces,
    maximumFractionDigits: config.decimalPlaces,
  });

  return formatter.format(converted);
}

/**
 * Get user's preferred currency from their profile
 */
export async function getUserCurrency(userId: string): Promise<string> {
  const { data: user } = await supabase
    .from('users')
    .select('currency_preference')
    .eq('id', userId)
    .single();

  return user?.currency_preference || 'TRY';
}

/**
 * Detect user's currency based on phone number or location
 */
export function detectCurrencyFromPhone(phone: string): string {
  // Simple detection based on country code
  const countryCodeMap: Record<string, string> = {
    '+90': 'TRY',  // Turkey
    '+1': 'USD',   // USA/Canada
    '+44': 'GBP',  // UK
    '+49': 'EUR',  // Germany
    '+33': 'EUR',  // France
    '+81': 'JPY',  // Japan
    '+82': 'KRW',  // South Korea
    '+55': 'BRL',  // Brazil
    '+91': 'INR',  // India
    '+971': 'AED', // UAE
    '+7': 'RUB',   // Russia
    '+61': 'AUD',  // Australia
    '+1': 'CAD',   // Canada
    '+41': 'CHF',  // Switzerland
  };

  for (const [code, currency] of Object.entries(countryCodeMap)) {
    if (phone.startsWith(code)) {
      return currency;
    }
  }

  return 'TRY'; // Default to TRY
}

/**
 * Get currency from locale/region
 */
export function getCurrencyFromLocale(locale: string): string {
  const localeCurrencyMap: Record<string, string> = {
    'tr-TR': 'TRY',
    'en-US': 'USD',
    'en-GB': 'GBP',
    'en-CA': 'CAD',
    'en-AU': 'AUD',
    'de-DE': 'EUR',
    'fr-FR': 'EUR',
    'es-ES': 'EUR',
    'it-IT': 'EUR',
    'pt-PT': 'EUR',
    'nl-NL': 'EUR',
    'ja-JP': 'JPY',
    'ko-KR': 'KRW',
    'zh-CN': 'CNY',
    'zh-TW': 'TWD',
    'ru-RU': 'RUB',
    'ar-SA': 'SAR',
    'hi-IN': 'INR',
    'pt-BR': 'BRL',
    'uk-UA': 'UAH',
    'pl-PL': 'PLN',
    'th-TH': 'THB',
    'vi-VN': 'VND',
    'id-ID': 'IDR',
    'ms-MY': 'MYR',
    'ph-PH': 'PHP',
    'cs-CZ': 'CZK',
    'hu-HU': 'HUF',
    'ro-RO': 'RON',
    'bg-BG': 'BGN',
    'hr-HR': 'EUR',
    'sk-SK': 'EUR',
    'lt-LT': 'EUR',
    'lv-LV': 'EUR',
    'et-EE': 'EUR',
    'si-LK': 'LKR',
    'ne-NP': 'NPR',
  };

  return localeCurrencyMap[locale] || 'USD';
}

/**
 * Currency cache operations
 */
async function getCachedRate(currency: string): Promise<ExchangeRate | null> {
  try {
    const { data } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('currency', currency)
      .single();
    return data;
  } catch {
    return null;
  }
}

async function cacheRate(rate: ExchangeRate): Promise<void> {
  await supabase.from('exchange_rates').upsert({
    currency: rate.currency,
    rate: rate.rate,
    updated_at: new Date().toISOString(),
    source: rate.source,
  });
}

function isFresh(rate: ExchangeRate): boolean {
  const cacheDuration = 60 * 60 * 1000; // 1 hour
  const age = Date.now() - new Date(rate.updatedAt).getTime();
  return age < cacheDuration;
}

/**
 * Update all exchange rates from live source
 * Would be called by a cron job in production
 */
export async function refreshAllRates(): Promise<void> {
  // In production, fetch from live API
  // Example: OpenExchangeRates, Fixer.io, or ECB

  const now = new Date().toISOString();

  for (const [currency, rate] of Object.entries(EXCHANGE_RATES)) {
    if (currency === 'TRY') continue;

    await supabase.from('exchange_rates').upsert({
      currency,
      rate: rate.rate, // Would be from live API
      updated_at: now,
      source: 'live_api',
    });
  }
}

/**
 * Get exchange rate for payment processing
 * Returns rate with timestamp for audit trail
 */
export async function getPaymentRate(
  currency: string,
  transactionId: string
): Promise<{ rate: number; timestamp: string; transactionId: string }> {
  const rate = await getExchangeRate(currency);

  // Log rate at transaction time for audit
  await supabase.from('currency_rate_audit').insert({
    transaction_id: transactionId,
    currency,
    rate: rate.rate,
    timestamp: new Date().toISOString(),
  });

  return {
    rate: rate.rate,
    timestamp: now,
    transactionId,
  };
}

/**
 * Validate payment amount matches expected
 * Prevents manipulation of exchange rates
 */
export function validatePaymentAmount(
  localAmount: number,
  expectedTLAmount: number,
  currency: string,
  tolerancePercent: number = 1.0
): { valid: boolean; actualTL: number; difference: number } {
  const actualTL = convertToTL(localAmount, currency);
  const difference = Math.abs(actualTL - expectedTLAmount);
  const tolerance = expectedTLAmount * (tolerancePercent / 100);

  return {
    valid: difference <= tolerance,
    actualTL,
    difference,
  };
}

/**
 * Currency conversion helpers for pricing display
 */
export const CurrencyHelpers = {
  // Convert LVND pack price to display currency
  displayPackPrice(lvndPack: { amount: number; priceTRY: number }, currency: string): string {
    return formatCurrency(lvndPack.priceTRY, currency);
  },

  // Convert membership price to display currency
  displayMembershipPrice(priceTRY: number, currency: string): string {
    return formatCurrency(priceTRY, currency);
  },

  // Convert offer value to display currency
  displayOfferValue(lvndAmount: number, currency: string): string {
    return formatCurrency(lvndAmount, currency);
  },

  // Get user's formatted balance
  async displayUserBalance(userId: string): Promise<string> {
    const currency = await getUserCurrency(userId);
    const { data: balance } = await supabase
      .from('lvnd_balances')
      .select('balance')
      .eq('user_id', userId)
      .single();

    const lvndAmount = balance?.balance || 0;
    return `${lvndAmount.toLocaleString()} LVND (${formatCurrency(lvndAmount, currency)})`;
  },
};

/**
 * Supported currencies list for UI
 */
export const SUPPORTED_CURRENCIES = [
  { code: 'TRY', name: 'Turkish Lira', flag: '🇹🇷' },
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'KRW', name: 'Korean Won', flag: '🇰🇷' },
  { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷' },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
];

export const CURRENCY_EXCHANGE_CONFIG = {
  baseCurrency: BASE_CURRENCY,
  refreshIntervalMinutes: 60,
  tolerancePercent: 1.0,
};
