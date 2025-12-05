/**
 * Security Utilities Tests
 * Comprehensive tests for security-related functions
 */

import {
  sanitizeInput,
  isValidEmail,
  isValidPhone,
  validatePassword,
  isValidUsername,
  isValidUrl,
  maskEmail,
  maskPhone,
  checkRateLimit,
  generateId,
} from '../security';

describe('Security Utilities', () => {
  // ==================== SANITIZE INPUT ====================
  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('alert("xss")');
      expect(sanitizeInput('<div>Hello</div>')).toBe('Hello');
    });

    it('should remove javascript: protocol', () => {
      expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
    });

    it('should remove event handlers', () => {
      expect(sanitizeInput('onclick=alert(1)')).toBe('alert(1)');
      expect(sanitizeInput('onmouseover=hack()')).toBe('hack()');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
    });

    it('should handle empty input', () => {
      expect(sanitizeInput('')).toBe('');
    });

    it('should preserve normal text', () => {
      expect(sanitizeInput('Hello World!')).toBe('Hello World!');
    });
  });

  // ==================== EMAIL VALIDATION ====================
  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('test@domain')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  // ==================== PHONE VALIDATION ====================
  describe('isValidPhone', () => {
    it('should validate correct phone numbers', () => {
      expect(isValidPhone('+14155552671')).toBe(true);
      expect(isValidPhone('+905551234567')).toBe(true);
      expect(isValidPhone('14155552671')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc')).toBe(false);
      expect(isValidPhone('')).toBe(false);
    });

    it('should handle formatted phone numbers', () => {
      expect(isValidPhone('+1 (415) 555-2671')).toBe(true);
      expect(isValidPhone('(415) 555-2671')).toBe(true);
    });
  });

  // ==================== PASSWORD VALIDATION ====================
  describe('validatePassword', () => {
    it('should accept strong passwords', () => {
      const result = validatePassword('SecurePass123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return strong strength for long complex passwords', () => {
      const result = validatePassword('VerySecurePassword123!@#');
      expect(result.strength).toBe('strong');
    });

    it('should return medium strength for moderate passwords', () => {
      const result = validatePassword('Password1');
      expect(result.strength).toBe('medium');
    });

    it('should return weak strength for poor passwords', () => {
      const result = validatePassword('weak');
      expect(result.strength).toBe('weak');
    });

    it('should detect missing uppercase', () => {
      const result = validatePassword('lowercase123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain an uppercase letter');
    });

    it('should detect missing lowercase', () => {
      const result = validatePassword('UPPERCASE123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain a lowercase letter');
    });

    it('should detect missing number', () => {
      const result = validatePassword('NoNumbers!@#');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain a number');
    });

    it('should detect missing special character', () => {
      const result = validatePassword('NoSpecial123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain a special character');
    });

    it('should detect short passwords', () => {
      const result = validatePassword('Ab1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
    });
  });

  // ==================== USERNAME VALIDATION ====================
  describe('isValidUsername', () => {
    it('should accept valid usernames', () => {
      expect(isValidUsername('user123')).toBe(true);
      expect(isValidUsername('john_doe')).toBe(true);
      expect(isValidUsername('Jane_Doe_2023')).toBe(true);
    });

    it('should reject invalid usernames', () => {
      expect(isValidUsername('ab')).toBe(false); // Too short
      expect(isValidUsername('user@name')).toBe(false); // Invalid char
      expect(isValidUsername('user name')).toBe(false); // Space
      expect(isValidUsername('verylongusernamethatexceedslimit')).toBe(false); // Too long
    });
  });

  // ==================== URL VALIDATION ====================
  describe('isValidUrl', () => {
    it('should accept valid URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('https://example.com/path?query=1')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  // ==================== DATA MASKING ====================
  describe('maskEmail', () => {
    it('should mask email addresses correctly', () => {
      expect(maskEmail('john@example.com')).toBe('j**n@example.com');
      expect(maskEmail('testuser@domain.org')).toBe('t******r@domain.org');
    });

    it('should handle short local parts', () => {
      expect(maskEmail('ab@example.com')).toBe('ab@example.com');
    });

    it('should handle invalid emails gracefully', () => {
      expect(maskEmail('invalid')).toBe('invalid');
    });
  });

  describe('maskPhone', () => {
    it('should mask phone numbers correctly', () => {
      expect(maskPhone('+14155552671')).toBe('*******2671');
      expect(maskPhone('5551234567')).toBe('******4567');
    });

    it('should handle short phone numbers', () => {
      expect(maskPhone('123')).toBe('123');
    });
  });

  // ==================== RATE LIMITING ====================
  describe('checkRateLimit', () => {
    beforeEach(() => {
      // Clear any existing rate limits by using a unique action name
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should allow requests within limit', () => {
      const action = `test-action-${Date.now()}`;
      expect(checkRateLimit(action, 3, 1000)).toBe(true);
      expect(checkRateLimit(action, 3, 1000)).toBe(true);
      expect(checkRateLimit(action, 3, 1000)).toBe(true);
    });

    it('should block requests exceeding limit', () => {
      const action = `test-action-block-${Date.now()}`;
      expect(checkRateLimit(action, 2, 1000)).toBe(true);
      expect(checkRateLimit(action, 2, 1000)).toBe(true);
      expect(checkRateLimit(action, 2, 1000)).toBe(false); // Should be blocked
    });

    it('should reset after window expires', () => {
      const action = `test-action-reset-${Date.now()}`;
      expect(checkRateLimit(action, 1, 1000)).toBe(true);
      expect(checkRateLimit(action, 1, 1000)).toBe(false);
      
      // Advance time past window
      jest.advanceTimersByTime(1001);
      
      expect(checkRateLimit(action, 1, 1000)).toBe(true);
    });
  });

  // ==================== ID GENERATION ====================
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('should generate IDs with expected format', () => {
      const id = generateId();
      expect(id).toMatch(/^\d+-[a-z0-9]{9}$/);
    });
  });
});
