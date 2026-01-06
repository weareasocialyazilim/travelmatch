/**
 * Currency Formatter Utility
 * Handles all currency formatting across the app
 */

import {
  CurrencyCode,
  DEFAULT_CURRENCY,
  getCurrency,
  getCurrencySymbol as getSymbol,
} from '@/constants/currencies';

export interface FormatCurrencyOptions {
  showSymbol?: boolean;
  showCode?: boolean;
  locale?: string;
  compact?: boolean;
}

/**
 * Format amount with currency
 *
 * @example
 * formatCurrency(100, 'TRY') → "₺100,00"
 * formatCurrency(100, 'EUR') → "€100,00"
 * formatCurrency(100, 'USD') → "$100.00"
 * formatCurrency(1500, 'TRY', { compact: true }) → "₺1,5K"
 */
export const formatCurrency = (
  amount: number,
  currencyCode: CurrencyCode = DEFAULT_CURRENCY,
  options: FormatCurrencyOptions = {},
): string => {
  const {
    showSymbol = true,
    showCode = false,
    locale,
    compact = false,
  } = options;

  const currency = getCurrency(currencyCode);

  try {
    const formatOptions: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: compact ? 0 : currency.decimalPlaces,
      maximumFractionDigits: currency.decimalPlaces,
    };

    if (compact && amount >= 1000) {
      formatOptions.notation = 'compact';
      formatOptions.compactDisplay = 'short';
    }

    const formatter = new Intl.NumberFormat(
      locale || currency.locale,
      formatOptions,
    );
    let formatted = formatter.format(amount);

    if (!showSymbol) {
      formatted = formatted.replace(currency.symbol, '').trim();
    }

    if (showCode && !formatted.includes(currency.code)) {
      formatted = `${formatted} ${currency.code}`;
    }

    return formatted;
  } catch (_formatError) {
    // Fallback for older JS engines
    const symbol = showSymbol ? currency.symbol : '';
    const code = showCode ? ` ${currency.code}` : '';
    return `${symbol}${amount.toFixed(currency.decimalPlaces)}${code}`;
  }
};

/**
 * Format amount without currency symbol (just number)
 */
export const formatAmount = (
  amount: number,
  currencyCode: CurrencyCode = DEFAULT_CURRENCY,
  locale?: string,
): string => {
  const currency = getCurrency(currencyCode);

  try {
    const formatter = new Intl.NumberFormat(locale || currency.locale, {
      minimumFractionDigits: currency.decimalPlaces,
      maximumFractionDigits: currency.decimalPlaces,
    });
    return formatter.format(amount);
  } catch (_formatError) {
    return amount.toFixed(currency.decimalPlaces);
  }
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = getSymbol;

/**
 * Parse currency string to number
 * Handles both comma and dot as decimal separator
 */
export const parseCurrencyInput = (input: string): number => {
  if (!input) return 0;

  // Remove currency symbols and whitespace
  let cleaned = input.replace(/[₺€$£\s]/g, '');

  // Handle thousand separators and decimal separators
  // If there's both comma and dot, determine which is decimal
  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');

  if (hasComma && hasDot) {
    // If comma comes after dot, comma is decimal (e.g., 1.000,50)
    if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      // Dot is decimal (e.g., 1,000.50)
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (hasComma) {
    // Check if comma is thousand separator or decimal
    const parts = cleaned.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      // Comma is decimal separator (e.g., 100,50)
      cleaned = cleaned.replace(',', '.');
    } else {
      // Comma is thousand separator (e.g., 1,000)
      cleaned = cleaned.replace(/,/g, '');
    }
  }

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Format price range
 * @example formatPriceRange(10, 50, 'EUR') → "€10 - €50"
 */
export const formatPriceRange = (
  min: number,
  max: number,
  currencyCode: CurrencyCode = DEFAULT_CURRENCY,
): string => {
  const symbol = getCurrencySymbol(currencyCode);
  const minFormatted = formatAmount(min, currencyCode);
  const maxFormatted = formatAmount(max, currencyCode);
  return `${symbol}${minFormatted} - ${symbol}${maxFormatted}`;
};

/**
 * Format converted price with original
 * @example formatConvertedPrice(100, 'USD', 3520, 'TRY')
 *          → "₺3.520 (~$100)"
 */
export const formatConvertedPrice = (
  originalAmount: number,
  originalCurrency: CurrencyCode,
  convertedAmount: number,
  displayCurrency: CurrencyCode,
): string => {
  const displayFormatted = formatCurrency(convertedAmount, displayCurrency);

  if (originalCurrency === displayCurrency) {
    return displayFormatted;
  }

  const originalFormatted = formatCurrency(originalAmount, originalCurrency);
  return `${displayFormatted} (~${originalFormatted})`;
};

/**
 * Format price for display with optional conversion indicator
 */
export const formatPriceDisplay = (
  amount: number,
  currency: CurrencyCode,
  userCurrency: CurrencyCode,
  convertedAmount?: number,
): { primary: string; secondary?: string } => {
  if (currency === userCurrency || !convertedAmount) {
    return { primary: formatCurrency(amount, currency) };
  }

  return {
    primary: formatCurrency(convertedAmount, userCurrency),
    secondary: `~${formatCurrency(amount, currency)}`,
  };
};

/**
 * Get display-friendly currency name
 */
export const getCurrencyName = (
  code: CurrencyCode,
  language: 'en' | 'tr' = 'tr',
): string => {
  const currency = getCurrency(code);
  return language === 'tr' ? currency.nameTr : currency.name;
};

/**
 * Validate currency amount
 */
export const isValidAmount = (
  amount: number,
  min: number = 0,
  max: number = Infinity,
): boolean => {
  return !isNaN(amount) && amount >= min && amount <= max;
};

/**
 * Round to currency decimal places
 */
export const roundToCurrency = (
  amount: number,
  currencyCode: CurrencyCode = DEFAULT_CURRENCY,
): number => {
  const currency = getCurrency(currencyCode);
  const multiplier = Math.pow(10, currency.decimalPlaces);
  return Math.round(amount * multiplier) / multiplier;
};

export default {
  formatCurrency,
  formatAmount,
  getCurrencySymbol,
  parseCurrencyInput,
  formatPriceRange,
  formatConvertedPrice,
  formatPriceDisplay,
  getCurrencyName,
  isValidAmount,
  roundToCurrency,
};
