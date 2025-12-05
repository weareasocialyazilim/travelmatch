/**
 * Helpers Utils Tests
 * Testing format and validation helpers
 */

import {
  formatDate,
  formatTime,
  formatCurrency,
  truncateText,
  validateEmail,
  validatePhone,
} from '../helpers';

describe('formatDate', () => {
  it('should format date in Turkish locale', () => {
    const date = new Date('2024-03-15');
    const result = formatDate(date);

    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    // Contains year
    expect(result).toContain('2024');
  });

  it('should handle different dates', () => {
    const date1 = new Date('2024-01-01');
    const date2 = new Date('2024-12-31');

    const result1 = formatDate(date1);
    const result2 = formatDate(date2);

    expect(result1).not.toBe(result2);
  });
});

describe('formatTime', () => {
  it('should format time in HH:mm format', () => {
    const date = new Date('2024-03-15T14:30:00');
    const result = formatTime(date);

    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    // Should contain colon for time separator
    expect(result).toContain(':');
  });

  it('should handle different times', () => {
    const morning = new Date('2024-03-15T08:00:00');
    const evening = new Date('2024-03-15T20:00:00');

    const result1 = formatTime(morning);
    const result2 = formatTime(evening);

    expect(result1).not.toBe(result2);
  });
});

describe('formatCurrency', () => {
  it('should format USD currency', () => {
    const result = formatCurrency(99.99, 'USD');

    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    // Should contain currency symbol or code
    expect(result.replace(/[^\d.,]/g, '')).toContain('99');
  });

  it('should format EUR currency', () => {
    const result = formatCurrency(50, 'EUR');

    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should format TRY currency', () => {
    const result = formatCurrency(1000, 'TRY');

    expect(result).toBeTruthy();
  });

  it('should default to USD', () => {
    const result = formatCurrency(100);

    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should handle decimal amounts', () => {
    const result = formatCurrency(123.45, 'USD');

    expect(result).toBeTruthy();
  });

  it('should handle zero', () => {
    const result = formatCurrency(0, 'USD');

    expect(result).toBeTruthy();
  });

  it('should handle large numbers', () => {
    const result = formatCurrency(1000000, 'USD');

    expect(result).toBeTruthy();
  });
});

describe('truncateText', () => {
  it('should not truncate text shorter than maxLength', () => {
    const result = truncateText('Hello', 10);

    expect(result).toBe('Hello');
  });

  it('should truncate text longer than maxLength', () => {
    const result = truncateText('Hello World', 5);

    expect(result).toBe('Hello...');
    expect(result.length).toBe(8); // 5 chars + '...'
  });

  it('should handle text equal to maxLength', () => {
    const result = truncateText('Hello', 5);

    expect(result).toBe('Hello');
  });

  it('should handle empty string', () => {
    const result = truncateText('', 10);

    expect(result).toBe('');
  });

  it('should handle maxLength of 0', () => {
    const result = truncateText('Hello', 0);

    expect(result).toBe('...');
  });

  it('should handle long text', () => {
    const longText =
      'This is a very long text that should definitely be truncated because it exceeds the maximum length';
    const result = truncateText(longText, 20);

    expect(result.length).toBe(23); // 20 chars + '...'
    expect(result.endsWith('...')).toBe(true);
  });
});

describe('validateEmail', () => {
  it('should validate correct email addresses', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.co')).toBe(true);
    expect(validateEmail('user+tag@example.org')).toBe(true);
    expect(validateEmail('a@b.co')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('invalid@')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('user name@domain.com')).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(validateEmail('user@domain')).toBe(false);
    expect(validateEmail('user@.com')).toBe(false);
  });
});

describe('validatePhone', () => {
  it('should validate correct phone numbers', () => {
    expect(validatePhone('5551234567')).toBe(true);
    expect(validatePhone('+1 555 123 4567')).toBe(true);
    expect(validatePhone('(555) 123-4567')).toBe(true);
    expect(validatePhone('+90 532 123 45 67')).toBe(true);
  });

  it('should reject invalid phone numbers', () => {
    expect(validatePhone('123')).toBe(false); // Too short
    expect(validatePhone('')).toBe(false);
    expect(validatePhone('abcdefghij')).toBe(false);
  });

  it('should handle phone numbers with different formats', () => {
    expect(validatePhone('555-123-4567')).toBe(true);
    expect(validatePhone('555.123.4567')).toBe(false); // Dots not allowed
  });

  it('should require minimum 10 digits', () => {
    expect(validatePhone('123456789')).toBe(false); // 9 digits
    expect(validatePhone('1234567890')).toBe(true); // 10 digits
  });
});
