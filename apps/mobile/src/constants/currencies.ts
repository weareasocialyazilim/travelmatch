/**
 * Lovendo Currency Constants
 * ISO 4217 currency codes and display info
 */

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  nameTr: string;
  decimalPlaces: number;
  locale: string;
}

export const CURRENCIES: Record<string, Currency> = {
  TRY: {
    code: 'TRY',
    symbol: '₺',
    name: 'Turkish Lira',
    nameTr: 'Türk Lirası',
    decimalPlaces: 2,
    locale: 'tr-TR',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    nameTr: 'Euro',
    decimalPlaces: 2,
    locale: 'de-DE',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    nameTr: 'Amerikan Doları',
    decimalPlaces: 2,
    locale: 'en-US',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    nameTr: 'İngiliz Sterlini',
    decimalPlaces: 2,
    locale: 'en-GB',
  },
};

export const CURRENCY_LIST = Object.values(CURRENCIES);

export const DEFAULT_CURRENCY = 'TRY';
export const SETTLEMENT_CURRENCY = 'TRY'; // PayTR settlement

export type CurrencyCode = keyof typeof CURRENCIES;

/**
 * Get currency by code
 */
export const getCurrency = (code: string): Currency => {
  return CURRENCIES[code] || CURRENCIES[DEFAULT_CURRENCY];
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = (code: string): string => {
  return CURRENCIES[code]?.symbol || CURRENCIES[DEFAULT_CURRENCY].symbol;
};

/**
 * Check if currency is supported
 */
export const isSupportedCurrency = (code: string): boolean => {
  return code in CURRENCIES;
};

/**
 * Escrow thresholds (in USD)
 * These are the base thresholds - will be converted for display
 */
export const ESCROW_THRESHOLDS = {
  DIRECT_MAX: 30, // < 30 USD: direct pay
  OPTIONAL_MAX: 100, // 30-100 USD: optional escrow
  REQUIRED_MIN: 100, // >= 100 USD: required escrow
  MAX_CONTRIBUTORS: 3, // >= 100 USD: max 3 contributors
};

export default CURRENCIES;
