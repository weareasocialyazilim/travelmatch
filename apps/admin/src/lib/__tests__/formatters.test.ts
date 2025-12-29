/**
 * Admin Formatters - Comprehensive Tests
 *
 * Tests for formatting functions:
 * - Currency formatting (Turkish Lira)
 * - Number formatting
 * - Percentage formatting
 * - Date formatting (Turkish locale)
 * - Relative time formatting
 * - File size formatting
 * - Phone number formatting
 * - Text utilities (truncate, initials, compact numbers)
 */

import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatFileSize,
  formatPhoneNumber,
  truncate,
  getInitials,
  formatCompactNumber,
  formatDuration,
} from '../formatters';

describe('Admin Formatters', () => {
  describe('formatCurrency', () => {
    it('should format amounts in Turkish Lira by default', () => {
      const result = formatCurrency(1000);
      expect(result).toContain('1');
      expect(result).toContain('000');
    });

    it('should format with different currencies', () => {
      const usdResult = formatCurrency(100, 'USD');
      expect(usdResult.includes('$') || usdResult.includes('US')).toBe(true);

      const eurResult = formatCurrency(100, 'EUR');
      expect(eurResult.includes('\u20AC') || eurResult.includes('EUR')).toBe(
        true,
      );
    });

    it('should handle zero amounts', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0');
    });

    it('should handle negative amounts', () => {
      const result = formatCurrency(-1000);
      expect(result).toContain('1');
      expect(result).toContain('000');
    });

    it('should handle decimal amounts', () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain('1');
      expect(result).toContain('234');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with Turkish locale separators', () => {
      expect(formatNumber(1000)).toContain('1');
      expect(formatNumber(1000000)).toContain('1');
    });

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('should handle negative numbers', () => {
      const result = formatNumber(-1000);
      expect(result).toContain('1');
      expect(result).toContain('000');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages with default decimals', () => {
      expect(formatPercentage(50)).toBe('50.0%');
      expect(formatPercentage(75.5)).toBe('75.5%');
    });

    it('should respect custom decimal places', () => {
      expect(formatPercentage(50.123, 2)).toBe('50.12%');
      expect(formatPercentage(50, 0)).toBe('50%');
    });

    it('should handle zero percentage', () => {
      expect(formatPercentage(0)).toBe('0.0%');
    });

    it('should handle percentages over 100', () => {
      expect(formatPercentage(150)).toBe('150.0%');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      // Test with a fixed date - January 15, 2024
      const result = formatDate('2024-01-15');
      // Turkish locale should format as "15 Oca 2024"
      expect(result).toMatch(/15.*2024/);
    });

    it('should accept Date object', () => {
      const date = new Date(2024, 0, 15); // January 15, 2024
      const result = formatDate(date);
      expect(result).toMatch(/15.*2024/);
    });

    it('should accept custom format string', () => {
      const result = formatDate('2024-01-15', 'yyyy-MM-dd');
      expect(result).toBe('2024-01-15');
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time correctly', () => {
      // Test with a Date object to avoid timezone issues
      const date = new Date(2024, 0, 15, 14, 30, 0);
      const result = formatDateTime(date);
      // Should include date and time
      expect(result).toMatch(/15.*2024.*\d{1,2}:\d{2}/);
    });

    it('should accept Date object', () => {
      const date = new Date(2024, 0, 15, 14, 30);
      const result = formatDateTime(date);
      expect(result).toMatch(/15.*2024/);
    });
  });

  describe('formatRelativeTime', () => {
    it('should format recent time', () => {
      const recentDate = new Date(Date.now() - 60000); // 1 minute ago
      const result = formatRelativeTime(recentDate);
      // Should contain Turkish relative time suffix
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should handle ISO date string', () => {
      const isoDate = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
      const result = formatRelativeTime(isoDate);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(500)).toBe('500 B');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(5242880)).toBe('5 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should format terabytes', () => {
      expect(formatFileSize(1099511627776)).toBe('1 TB');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format 10-digit Turkish numbers', () => {
      expect(formatPhoneNumber('5551234567')).toBe('(555) 123 45 67');
    });

    it('should format numbers with country code', () => {
      expect(formatPhoneNumber('905551234567')).toBe('+90 (555) 123 45 67');
    });

    it('should preserve unrecognized formats', () => {
      expect(formatPhoneNumber('12345')).toBe('12345');
    });

    it('should strip non-digit characters', () => {
      expect(formatPhoneNumber('555-123-4567')).toBe('(555) 123 45 67');
    });
  });

  describe('truncate', () => {
    it('should truncate long text', () => {
      expect(truncate('Hello, World!', 10)).toBe('Hello, ...');
    });

    it('should not truncate short text', () => {
      expect(truncate('Hello', 10)).toBe('Hello');
    });

    it('should handle exact length', () => {
      expect(truncate('Hello', 5)).toBe('Hello');
    });

    it('should handle empty strings', () => {
      expect(truncate('', 10)).toBe('');
    });
  });

  describe('getInitials', () => {
    it('should extract initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD');
      expect(getInitials('Jane Smith')).toBe('JS');
    });

    it('should handle single name', () => {
      expect(getInitials('John')).toBe('J');
    });

    it('should handle multiple names', () => {
      expect(getInitials('John Michael Doe')).toBe('JM');
    });

    it('should uppercase initials', () => {
      expect(getInitials('john doe')).toBe('JD');
    });

    it('should limit to 2 characters', () => {
      expect(getInitials('A B C D').length).toBeLessThanOrEqual(2);
    });
  });

  describe('formatCompactNumber', () => {
    it('should format thousands as K', () => {
      expect(formatCompactNumber(1000)).toBe('1.0K');
      expect(formatCompactNumber(1500)).toBe('1.5K');
      expect(formatCompactNumber(10000)).toBe('10.0K');
    });

    it('should format millions as M', () => {
      expect(formatCompactNumber(1000000)).toBe('1.0M');
      expect(formatCompactNumber(2500000)).toBe('2.5M');
    });

    it('should not format small numbers', () => {
      expect(formatCompactNumber(100)).toBe('100');
      expect(formatCompactNumber(999)).toBe('999');
    });
  });

  describe('formatDuration', () => {
    it('should format seconds', () => {
      expect(formatDuration(30)).toBe('30 saniye');
      expect(formatDuration(59)).toBe('59 saniye');
    });

    it('should format minutes', () => {
      expect(formatDuration(60)).toBe('1 dakika');
      expect(formatDuration(120)).toBe('2 dakika');
      expect(formatDuration(3599)).toBe('59 dakika');
    });

    it('should format hours', () => {
      expect(formatDuration(3600)).toBe('1 saat');
      expect(formatDuration(7200)).toBe('2 saat');
      expect(formatDuration(86399)).toBe('23 saat');
    });

    it('should format days', () => {
      expect(formatDuration(86400)).toBe('1 gün');
      expect(formatDuration(172800)).toBe('2 gün');
    });
  });
});
