/**
 * Currency Utilities
 * Currency formatting and conversion functions
 */

import type { Currency } from '../constants/config';

/**
 * Currency symbols
 */
const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  TRY: '₺',
};

/**
 * Format currency
 */
export const formatCurrency = (
  amount: number,
  currency: Currency = 'USD',
  locale = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = (currency: Currency): string => {
  return CURRENCY_SYMBOLS[currency] || currency;
};

/**
 * Format currency with symbol
 */
export const formatCurrencyWithSymbol = (
  amount: number,
  currency: Currency = 'USD'
): string => {
  const symbol = getCurrencySymbol(currency);
  const formatted = amount.toFixed(2);
  
  // Place symbol based on currency
  if (currency === 'EUR') {
    return `${formatted}${symbol}`;
  }
  return `${symbol}${formatted}`;
};

/**
 * Parse currency string to number
 */
export const parseCurrency = (currencyString: string): number => {
  // Remove all non-numeric characters except decimal point
  const cleaned = currencyString.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
};

/**
 * Convert cents to dollars
 */
export const centsToDollars = (cents: number): number => {
  return cents / 100;
};

/**
 * Convert dollars to cents
 */
export const dollarsToCents = (dollars: number): number => {
  return Math.round(dollars * 100);
};

/**
 * Calculate percentage of amount
 */
export const calculatePercentage = (amount: number, percentage: number): number => {
  return (amount * percentage) / 100;
};

/**
 * Calculate discount amount
 */
export const calculateDiscount = (
  originalPrice: number,
  discountPercentage: number
): number => {
  return originalPrice - calculatePercentage(originalPrice, discountPercentage);
};

/**
 * Split amount among people
 */
export const splitAmount = (amount: number, people: number): number => {
  return amount / people;
};

/**
 * Round to nearest currency unit
 */
export const roundCurrency = (amount: number, decimals = 2): number => {
  return Math.round(amount * Math.pow(10, decimals)) / Math.pow(10, decimals);
};
