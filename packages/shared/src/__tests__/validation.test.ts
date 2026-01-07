/**
 * Validation Utilities - Comprehensive Tests
 *
 * Tests for validation functions:
 * - Email validation
 * - Phone validation
 * - URL validation
 * - UUID validation
 * - Password strength check
 * - String sanitization
 * - Credit card validation (Luhn algorithm)
 */

import {
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isValidUuid,
  checkPasswordStrength,
  sanitizeString,
  isValidCreditCard,
} from '../utils/validation';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.org')).toBe(true);
      expect(isValidEmail('user+tag@example.co.uk')).toBe(true);
      expect(isValidEmail('123@numbers.com')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user@domain')).toBe(false);
      expect(isValidEmail('user domain@example.com')).toBe(false);
      expect(isValidEmail('user@@domain.com')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidEmail('a@b.co')).toBe(true);
      expect(isValidEmail('very.long.email.address@subdomain.domain.com')).toBe(
        true,
      );
    });
  });

  describe('isValidPhone', () => {
    it('should return true for valid phone numbers', () => {
      expect(isValidPhone('+14155551234')).toBe(true);
      expect(isValidPhone('+905551234567')).toBe(true);
      expect(isValidPhone('14155551234')).toBe(true);
      expect(isValidPhone('+1234567890123')).toBe(true);
    });

    it('should return false for invalid phone numbers', () => {
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone('abc1234567890')).toBe(false);
      expect(isValidPhone('+0123456789')).toBe(false); // Can't start with 0
      expect(isValidPhone('++1234567890')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidPhone('+123456789012345')).toBe(true); // Max 15 digits
      expect(isValidPhone('+1234567890123456')).toBe(false); // More than 15 digits
    });
  });

  describe('isValidUrl', () => {
    it('should return true for valid URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('https://sub.domain.com/path?query=1')).toBe(true);
      expect(isValidUrl('ftp://files.example.com')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false); // Missing protocol
      expect(isValidUrl('://example.com')).toBe(false);
    });
  });

  describe('isValidUuid', () => {
    it('should return true for valid UUIDs', () => {
      expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(isValidUuid('6ba7b810-9dad-41d4-80b4-00c04fd430c8')).toBe(true);
      expect(isValidUuid('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(true);
    });

    it('should return false for invalid UUIDs', () => {
      expect(isValidUuid('')).toBe(false);
      expect(isValidUuid('not-a-uuid')).toBe(false);
      expect(isValidUuid('550e8400-e29b-51d4-a716-446655440000')).toBe(false); // Version 5, not 4
      expect(isValidUuid('550e8400-e29b-41d4-c716-446655440000')).toBe(false); // Invalid variant
      expect(isValidUuid('550e8400e29b41d4a716446655440000')).toBe(false); // Missing dashes
    });

    it('should be case insensitive', () => {
      expect(isValidUuid('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
      expect(isValidUuid('550e8400-E29B-41d4-A716-446655440000')).toBe(true);
    });
  });

  describe('checkPasswordStrength', () => {
    describe('valid passwords', () => {
      it('should return valid for strong passwords', () => {
        const result = checkPasswordStrength('Password1');
        expect(result.isValid).toBe(true);
        expect(result.score).toBe(4);
        expect(result.feedback).toHaveLength(0);
      });

      it('should return valid for passwords with special chars', () => {
        const result = checkPasswordStrength('Password1!@#');
        expect(result.isValid).toBe(true);
        expect(result.score).toBe(4);
      });
    });

    describe('password validation edge cases', () => {
      it('should return invalid for short passwords', () => {
        const result = checkPasswordStrength('Pass1');
        expect(result.isValid).toBe(false);
        expect(result.feedback).toContain(
          'Password must be at least 8 characters',
        );
      });

      it('should provide feedback for passwords without uppercase', () => {
        const result = checkPasswordStrength('password1');
        // Valid because score >= 3 (length + lowercase + number) and length >= 8
        expect(result.isValid).toBe(true);
        expect(result.feedback).toContain('Add uppercase letters');
      });

      it('should provide feedback for passwords without lowercase', () => {
        const result = checkPasswordStrength('PASSWORD1');
        // Valid because score >= 3 (length + uppercase + number) and length >= 8
        expect(result.isValid).toBe(true);
        expect(result.feedback).toContain('Add lowercase letters');
      });

      it('should provide feedback for passwords without numbers', () => {
        const result = checkPasswordStrength('Password');
        // Valid because score >= 3 (length + uppercase + lowercase) and length >= 8
        expect(result.isValid).toBe(true);
        expect(result.feedback).toContain('Add numbers');
      });

      it('should return invalid when only one criteria met besides length', () => {
        const result = checkPasswordStrength('12345678');
        // Score = 2 (length + numbers), so isValid = false
        expect(result.isValid).toBe(false);
        expect(result.score).toBe(2);
      });
    });

    describe('score calculation', () => {
      it('should give score 0 for empty password', () => {
        const result = checkPasswordStrength('');
        expect(result.score).toBe(0);
        expect(result.isValid).toBe(false);
      });

      it('should give score 1 for password with only length', () => {
        const result = checkPasswordStrength('12345678');
        expect(result.score).toBe(2); // length + numbers
        expect(result.isValid).toBe(false);
      });

      it('should accumulate score for each criteria met', () => {
        expect(checkPasswordStrength('password').score).toBe(2); // length + lowercase
        expect(checkPasswordStrength('PASSWORD').score).toBe(2); // length + uppercase
        expect(checkPasswordStrength('12345678').score).toBe(2); // length + numbers
        expect(checkPasswordStrength('Password').score).toBe(3); // length + upper + lower
      });
    });
  });

  describe('sanitizeString', () => {
    it('should remove dangerous HTML characters', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe(
        'scriptalert(xss)/script',
      );
      expect(sanitizeString('Hello <b>World</b>')).toBe('Hello bWorld/b');
    });

    it('should remove quotes', () => {
      expect(sanitizeString("Hello 'World'")).toBe('Hello World');
      expect(sanitizeString('Hello "World"')).toBe('Hello World');
    });

    it('should preserve safe characters', () => {
      expect(sanitizeString('Hello World!')).toBe('Hello World!');
      expect(sanitizeString('Test 123 @#$%')).toBe('Test 123 @#$%');
    });

    it('should handle empty strings', () => {
      expect(sanitizeString('')).toBe('');
    });
  });

  describe('isValidCreditCard', () => {
    describe('valid card numbers (Luhn algorithm)', () => {
      it('should validate Visa test cards', () => {
        expect(isValidCreditCard('4111111111111111')).toBe(true);
        expect(isValidCreditCard('4012888888881881')).toBe(true);
      });

      it('should validate Mastercard test cards', () => {
        expect(isValidCreditCard('5500000000000004')).toBe(true);
        expect(isValidCreditCard('5105105105105100')).toBe(true);
      });

      it('should validate American Express test cards', () => {
        expect(isValidCreditCard('378282246310005')).toBe(true);
        expect(isValidCreditCard('371449635398431')).toBe(true);
      });

      it('should handle spaces in card number', () => {
        expect(isValidCreditCard('4111 1111 1111 1111')).toBe(true);
        expect(isValidCreditCard('4111  1111  1111  1111')).toBe(true);
      });
    });

    describe('invalid card numbers', () => {
      it('should reject invalid Luhn checksum', () => {
        expect(isValidCreditCard('4111111111111112')).toBe(false);
        expect(isValidCreditCard('1234567890123456')).toBe(false);
      });

      it('should reject non-numeric characters', () => {
        expect(isValidCreditCard('4111-1111-1111-1111')).toBe(false);
        expect(isValidCreditCard('411111111111111a')).toBe(false);
      });

      it('should reject too short numbers', () => {
        expect(isValidCreditCard('411111111111')).toBe(false);
        expect(isValidCreditCard('123')).toBe(false);
      });

      it('should reject too long numbers', () => {
        expect(isValidCreditCard('41111111111111111111')).toBe(false);
      });

      it('should reject empty strings', () => {
        expect(isValidCreditCard('')).toBe(false);
      });
    });
  });
});
