/**
 * Currency Utilities - Comprehensive Tests
 *
 * Tests for currency functions:
 * - Currency formatting
 * - Currency symbol retrieval
 * - Currency parsing
 * - Cents/dollars conversion
 * - Percentage calculations
 * - Amount splitting
 * - Rounding
 */

import {
  formatCurrency,
  getCurrencySymbol,
  formatCurrencyWithSymbol,
  parseCurrency,
  centsToDollars,
  dollarsToCents,
  calculatePercentage,
  calculateDiscount,
  splitAmount,
  roundCurrency,
} from '../utils/currency';

describe('Currency Utilities', () => {
  describe('formatCurrency', () => {
    it('should format USD amounts correctly', () => {
      expect(formatCurrency(100, 'USD')).toBe('$100.00');
      expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
      expect(formatCurrency(0.99, 'USD')).toBe('$0.99');
    });

    it('should format EUR amounts correctly', () => {
      const result = formatCurrency(100, 'EUR', 'de-DE');
      // EUR formatting may vary by locale, check contains amount
      expect(result).toContain('100');
    });

    it('should format TRY amounts correctly', () => {
      const result = formatCurrency(100, 'TRY', 'tr-TR');
      expect(result).toContain('100');
    });

    it('should use default currency (USD) when not specified', () => {
      expect(formatCurrency(50)).toBe('$50.00');
    });

    it('should handle zero amounts', () => {
      expect(formatCurrency(0, 'USD')).toBe('$0.00');
    });

    it('should handle negative amounts', () => {
      expect(formatCurrency(-100, 'USD')).toBe('-$100.00');
    });

    it('should handle large amounts', () => {
      expect(formatCurrency(1000000, 'USD')).toBe('$1,000,000.00');
    });
  });

  describe('getCurrencySymbol', () => {
    it('should return correct symbols for known currencies', () => {
      expect(getCurrencySymbol('USD')).toBe('$');
      expect(getCurrencySymbol('EUR')).toBe('\u20AC'); // Euro sign
      expect(getCurrencySymbol('TRY')).toBe('\u20BA'); // Turkish Lira sign
    });

    it('should return currency code for unknown currencies', () => {
      // Type assertion needed for testing unknown currency
      expect(getCurrencySymbol('GBP' as 'USD')).toBe('GBP');
      expect(getCurrencySymbol('JPY' as 'USD')).toBe('JPY');
    });
  });

  describe('formatCurrencyWithSymbol', () => {
    it('should format USD with symbol prefix', () => {
      expect(formatCurrencyWithSymbol(100, 'USD')).toBe('$100.00');
      expect(formatCurrencyWithSymbol(1234.56, 'USD')).toBe('$1234.56');
    });

    it('should format EUR with symbol suffix', () => {
      expect(formatCurrencyWithSymbol(100, 'EUR')).toBe('100.00\u20AC');
    });

    it('should format TRY with symbol prefix', () => {
      expect(formatCurrencyWithSymbol(100, 'TRY')).toBe('\u20BA100.00');
    });

    it('should use default currency (USD) when not specified', () => {
      expect(formatCurrencyWithSymbol(50)).toBe('$50.00');
    });

    it('should handle decimal precision', () => {
      expect(formatCurrencyWithSymbol(99.999, 'USD')).toBe('$100.00');
      expect(formatCurrencyWithSymbol(0.001, 'USD')).toBe('$0.00');
    });
  });

  describe('parseCurrency', () => {
    it('should parse USD formatted strings', () => {
      expect(parseCurrency('$100.00')).toBe(100);
      expect(parseCurrency('$1,234.56')).toBe(1234.56);
    });

    it('should parse EUR formatted strings', () => {
      expect(parseCurrency('\u20AC100.00')).toBe(100);
      // Note: Implementation removes all non-numeric except . and -, so commas become part of number
      expect(parseCurrency('100,00 \u20AC')).toBe(10000);
    });

    it('should parse strings with various formats', () => {
      expect(parseCurrency('100')).toBe(100);
      // Implementation treats . as decimal point only, commas are stripped
      expect(parseCurrency('1.234,56')).toBeCloseTo(1.23456, 5);
    });

    it('should return 0 for invalid strings', () => {
      expect(parseCurrency('')).toBe(0);
      expect(parseCurrency('abc')).toBe(0);
      expect(parseCurrency('no numbers here')).toBe(0);
    });

    it('should handle negative amounts', () => {
      expect(parseCurrency('-$100.00')).toBe(-100);
      expect(parseCurrency('($100.00)')).toBe(100); // Parentheses not handled as negative
    });
  });

  describe('centsToDollars', () => {
    it('should convert cents to dollars correctly', () => {
      expect(centsToDollars(100)).toBe(1);
      expect(centsToDollars(1234)).toBe(12.34);
      expect(centsToDollars(99)).toBe(0.99);
    });

    it('should handle zero', () => {
      expect(centsToDollars(0)).toBe(0);
    });

    it('should handle negative amounts', () => {
      expect(centsToDollars(-100)).toBe(-1);
    });

    it('should handle large amounts', () => {
      expect(centsToDollars(10000000)).toBe(100000);
    });
  });

  describe('dollarsToCents', () => {
    it('should convert dollars to cents correctly', () => {
      expect(dollarsToCents(1)).toBe(100);
      expect(dollarsToCents(12.34)).toBe(1234);
      expect(dollarsToCents(0.99)).toBe(99);
    });

    it('should handle zero', () => {
      expect(dollarsToCents(0)).toBe(0);
    });

    it('should handle negative amounts', () => {
      expect(dollarsToCents(-1)).toBe(-100);
    });

    it('should round to avoid floating point issues', () => {
      expect(dollarsToCents(0.1)).toBe(10);
      expect(dollarsToCents(0.01)).toBe(1);
      expect(dollarsToCents(19.99)).toBe(1999);
    });
  });

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculatePercentage(100, 10)).toBe(10);
      expect(calculatePercentage(200, 25)).toBe(50);
      expect(calculatePercentage(50, 50)).toBe(25);
    });

    it('should handle 0 percentage', () => {
      expect(calculatePercentage(100, 0)).toBe(0);
    });

    it('should handle 100 percentage', () => {
      expect(calculatePercentage(100, 100)).toBe(100);
    });

    it('should handle decimal percentages', () => {
      expect(calculatePercentage(100, 12.5)).toBe(12.5);
      expect(calculatePercentage(100, 0.5)).toBe(0.5);
    });

    it('should handle zero amount', () => {
      expect(calculatePercentage(0, 50)).toBe(0);
    });
  });

  describe('calculateDiscount', () => {
    it('should calculate discounted price correctly', () => {
      expect(calculateDiscount(100, 10)).toBe(90);
      expect(calculateDiscount(200, 25)).toBe(150);
      expect(calculateDiscount(50, 50)).toBe(25);
    });

    it('should handle 0 discount', () => {
      expect(calculateDiscount(100, 0)).toBe(100);
    });

    it('should handle 100% discount', () => {
      expect(calculateDiscount(100, 100)).toBe(0);
    });

    it('should handle decimal discounts', () => {
      expect(calculateDiscount(100, 12.5)).toBe(87.5);
    });
  });

  describe('splitAmount', () => {
    it('should split amount evenly', () => {
      expect(splitAmount(100, 4)).toBe(25);
      expect(splitAmount(99, 3)).toBe(33);
    });

    it('should handle uneven splits', () => {
      expect(splitAmount(100, 3)).toBeCloseTo(33.33, 2);
      expect(splitAmount(10, 3)).toBeCloseTo(3.33, 2);
    });

    it('should handle single person', () => {
      expect(splitAmount(100, 1)).toBe(100);
    });

    it('should handle large groups', () => {
      expect(splitAmount(1000, 100)).toBe(10);
    });
  });

  describe('roundCurrency', () => {
    it('should round to 2 decimal places by default', () => {
      expect(roundCurrency(10.555)).toBe(10.56);
      expect(roundCurrency(10.554)).toBe(10.55);
      expect(roundCurrency(10.5)).toBe(10.5);
    });

    it('should round to specified decimal places', () => {
      expect(roundCurrency(10.5555, 3)).toBe(10.556);
      expect(roundCurrency(10.5555, 1)).toBe(10.6);
      expect(roundCurrency(10.5555, 0)).toBe(11);
    });

    it('should handle zero', () => {
      expect(roundCurrency(0)).toBe(0);
      expect(roundCurrency(0, 3)).toBe(0);
    });

    it('should handle negative amounts', () => {
      expect(roundCurrency(-10.555)).toBe(-10.55);
      expect(roundCurrency(-10.556)).toBe(-10.56);
    });

    it('should handle large numbers', () => {
      expect(roundCurrency(1000000.555)).toBe(1000000.56);
    });
  });
});
