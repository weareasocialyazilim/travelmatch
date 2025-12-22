/**
 * Formatter Utilities - Comprehensive Tests
 *
 * Tests for string formatting functions:
 * - Name formatting
 * - Initials extraction
 * - Text truncation
 * - Phone number formatting
 * - Number formatting
 * - Percentage formatting
 * - Pluralization
 * - File size formatting
 * - Capitalization
 * - Slug generation
 */

import {
  formatName,
  getInitials,
  truncate,
  formatPhoneNumber,
  formatNumber,
  formatPercentage,
  pluralize,
  formatFileSize,
  capitalize,
  slugify,
} from '../utils/formatters';

describe('Formatter Utilities', () => {
  describe('formatName', () => {
    it('should capitalize first letter of each word', () => {
      expect(formatName('john doe')).toBe('John Doe');
      expect(formatName('JANE SMITH')).toBe('Jane Smith');
      expect(formatName('mIxEd CaSe')).toBe('Mixed Case');
    });

    it('should handle single names', () => {
      expect(formatName('john')).toBe('John');
      expect(formatName('JOHN')).toBe('John');
    });

    it('should handle multiple names', () => {
      expect(formatName('john middle doe')).toBe('John Middle Doe');
    });

    it('should handle empty strings', () => {
      expect(formatName('')).toBe('');
    });

    it('should handle names with extra spaces', () => {
      expect(formatName('john  doe')).toBe('John  Doe');
    });
  });

  describe('getInitials', () => {
    it('should get initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD');
      expect(getInitials('Jane Smith')).toBe('JS');
    });

    it('should get single initial from single name', () => {
      expect(getInitials('John')).toBe('J');
    });

    it('should use first and last name for multiple names', () => {
      expect(getInitials('John Michael Doe')).toBe('JD');
      expect(getInitials('Mary Jane Watson Parker')).toBe('MP');
    });

    it('should handle empty strings', () => {
      expect(getInitials('')).toBe('');
    });

    it('should handle whitespace-only strings', () => {
      expect(getInitials('   ')).toBe('');
    });

    it('should uppercase initials', () => {
      expect(getInitials('john doe')).toBe('JD');
    });

    it('should handle leading/trailing spaces', () => {
      expect(getInitials('  John Doe  ')).toBe('JD');
    });
  });

  describe('truncate', () => {
    it('should truncate long text with ellipsis', () => {
      expect(truncate('Hello, World!', 10)).toBe('Hello, ...');
      expect(truncate('This is a long text', 15)).toBe('This is a lo...');
    });

    it('should not truncate text shorter than maxLength', () => {
      expect(truncate('Hello', 10)).toBe('Hello');
      expect(truncate('Hi', 5)).toBe('Hi');
    });

    it('should handle exact length', () => {
      expect(truncate('Hello', 5)).toBe('Hello');
    });

    it('should handle empty strings', () => {
      expect(truncate('', 10)).toBe('');
    });

    it('should handle very short maxLength', () => {
      expect(truncate('Hello World', 5)).toBe('He...');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format 10-digit US phone numbers', () => {
      expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
      expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
    });

    it('should strip non-digit characters before formatting', () => {
      expect(formatPhoneNumber('(555) 123-4567')).toBe('(555) 123-4567');
      expect(formatPhoneNumber('555-123-4567')).toBe('(555) 123-4567');
      expect(formatPhoneNumber('555.123.4567')).toBe('(555) 123-4567');
    });

    it('should return original for non-standard lengths', () => {
      expect(formatPhoneNumber('12345')).toBe('12345');
      expect(formatPhoneNumber('123456789012345')).toBe('123456789012345');
    });

    it('should handle empty strings', () => {
      expect(formatPhoneNumber('')).toBe('');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with thousands separators', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(1234567890)).toBe('1,234,567,890');
    });

    it('should handle small numbers', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(999)).toBe('999');
    });

    it('should handle negative numbers', () => {
      expect(formatNumber(-1000)).toBe('-1,000');
    });

    it('should handle decimal numbers', () => {
      expect(formatNumber(1234.56)).toBe('1,234.56');
    });
  });

  describe('formatPercentage', () => {
    it('should format decimal as percentage', () => {
      expect(formatPercentage(0.5)).toBe('50%');
      expect(formatPercentage(0.123)).toBe('12%');
      expect(formatPercentage(1)).toBe('100%');
    });

    it('should respect decimal places', () => {
      expect(formatPercentage(0.5, 1)).toBe('50.0%');
      expect(formatPercentage(0.123, 2)).toBe('12.30%');
      expect(formatPercentage(0.12345, 3)).toBe('12.345%');
    });

    it('should handle zero', () => {
      expect(formatPercentage(0)).toBe('0%');
    });

    it('should handle values over 100%', () => {
      expect(formatPercentage(1.5)).toBe('150%');
      expect(formatPercentage(2)).toBe('200%');
    });
  });

  describe('pluralize', () => {
    it('should return singular for count of 1', () => {
      expect(pluralize(1, 'item')).toBe('item');
      expect(pluralize(1, 'person', 'people')).toBe('person');
    });

    it('should return plural for count other than 1', () => {
      expect(pluralize(0, 'item')).toBe('items');
      expect(pluralize(2, 'item')).toBe('items');
      expect(pluralize(100, 'item')).toBe('items');
    });

    it('should use custom plural when provided', () => {
      expect(pluralize(2, 'person', 'people')).toBe('people');
      expect(pluralize(0, 'child', 'children')).toBe('children');
      expect(pluralize(5, 'mouse', 'mice')).toBe('mice');
    });

    it('should add "s" by default for plural', () => {
      expect(pluralize(2, 'cat')).toBe('cats');
      expect(pluralize(2, 'dog')).toBe('dogs');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(0)).toBe('0.0 B');
      expect(formatFileSize(500)).toBe('500.0 B');
      expect(formatFileSize(1023)).toBe('1023.0 B');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(10240)).toBe('10.0 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1.0 MB');
      expect(formatFileSize(5242880)).toBe('5.0 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1.0 GB');
      expect(formatFileSize(5368709120)).toBe('5.0 GB');
    });

    it('should format terabytes', () => {
      expect(formatFileSize(1099511627776)).toBe('1.0 TB');
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter and lowercase rest', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('HELLO')).toBe('Hello');
      expect(capitalize('hELLO')).toBe('Hello');
    });

    it('should handle single character', () => {
      expect(capitalize('h')).toBe('H');
      expect(capitalize('H')).toBe('H');
    });

    it('should handle empty strings', () => {
      expect(capitalize('')).toBe('');
    });

    it('should handle strings with spaces', () => {
      expect(capitalize('hello world')).toBe('Hello world');
    });
  });

  describe('slugify', () => {
    it('should convert to lowercase', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('UPPERCASE')).toBe('uppercase');
    });

    it('should replace spaces with hyphens', () => {
      expect(slugify('hello world')).toBe('hello-world');
      expect(slugify('multiple   spaces')).toBe('multiple-spaces');
    });

    it('should remove special characters', () => {
      expect(slugify('hello@world!')).toBe('helloworld');
      expect(slugify('test#$%string')).toBe('teststring');
    });

    it('should handle underscores', () => {
      expect(slugify('hello_world')).toBe('hello-world');
    });

    it('should trim leading/trailing hyphens', () => {
      expect(slugify('-hello-world-')).toBe('hello-world');
      expect(slugify('---hello---')).toBe('hello');
    });

    it('should handle empty strings', () => {
      expect(slugify('')).toBe('');
    });

    it('should handle complex strings', () => {
      expect(slugify('  Hello, World! This is a TEST  ')).toBe('hello-world-this-is-a-test');
    });

    it('should collapse multiple hyphens', () => {
      expect(slugify('hello---world')).toBe('hello-world');
      expect(slugify('a - b - c')).toBe('a-b-c');
    });
  });
});
