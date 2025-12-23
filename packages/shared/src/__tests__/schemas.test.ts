/**
 * Schemas - Comprehensive Tests
 *
 * Tests for Zod validation schemas:
 * - Common schemas (email, password, phone, UUID, etc.)
 * - Auth schemas (login, register, password reset, etc.)
 * - Pagination schemas
 * - Location schemas
 */

import {
  emailSchema,
  passwordSchema,
  phoneSchema,
  uuidSchema,
  urlSchema,
  usernameSchema,
  currencySchema,
  amountSchema,
  paginationSchema,
  cursorPaginationSchema,
  dateRangeSchema,
  coordinatesSchema,
  locationSearchSchema,
} from '../schemas/common';

import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema,
  verifyOtpSchema,
} from '../schemas/auth';

describe('Common Schemas', () => {
  describe('emailSchema', () => {
    it('should accept valid emails', () => {
      expect(() => emailSchema.parse('test@example.com')).not.toThrow();
      expect(() => emailSchema.parse('user.name@domain.org')).not.toThrow();
      expect(() => emailSchema.parse('user+tag@example.co.uk')).not.toThrow();
    });

    it('should reject invalid emails', () => {
      expect(() => emailSchema.parse('')).toThrow();
      expect(() => emailSchema.parse('notanemail')).toThrow();
      expect(() => emailSchema.parse('@domain.com')).toThrow();
      expect(() => emailSchema.parse('user@')).toThrow();
    });

    it('should lowercase emails', () => {
      const result = emailSchema.parse('TEST@EXAMPLE.COM');
      expect(result).toBe('test@example.com');
    });
  });

  describe('passwordSchema', () => {
    it('should accept valid passwords', () => {
      expect(() => passwordSchema.parse('Password1')).not.toThrow();
      expect(() => passwordSchema.parse('StrongPass123')).not.toThrow();
      expect(() => passwordSchema.parse('MyP@ssw0rd!')).not.toThrow();
    });

    it('should reject passwords without uppercase', () => {
      expect(() => passwordSchema.parse('password1')).toThrow();
    });

    it('should reject passwords without lowercase', () => {
      expect(() => passwordSchema.parse('PASSWORD1')).toThrow();
    });

    it('should reject passwords without numbers', () => {
      expect(() => passwordSchema.parse('Password')).toThrow();
    });

    it('should reject short passwords', () => {
      expect(() => passwordSchema.parse('Pass1')).toThrow();
    });

    it('should reject too long passwords', () => {
      const longPassword = 'A'.repeat(129) + '1a';
      expect(() => passwordSchema.parse(longPassword)).toThrow();
    });
  });

  describe('phoneSchema', () => {
    it('should accept valid phone numbers', () => {
      expect(() => phoneSchema.parse('+14155551234')).not.toThrow();
      expect(() => phoneSchema.parse('+905551234567')).not.toThrow();
      expect(() => phoneSchema.parse('14155551234')).not.toThrow();
    });

    it('should reject invalid phone numbers', () => {
      expect(() => phoneSchema.parse('')).toThrow();
      expect(() => phoneSchema.parse('abc1234567890')).toThrow();
      expect(() => phoneSchema.parse('0123456789')).toThrow(); // Can't start with 0
    });
  });

  describe('uuidSchema', () => {
    it('should accept valid UUIDs', () => {
      expect(() => uuidSchema.parse('550e8400-e29b-41d4-a716-446655440000')).not.toThrow();
      expect(() => uuidSchema.parse('f47ac10b-58cc-4372-a567-0e02b2c3d479')).not.toThrow();
    });

    it('should reject invalid UUIDs', () => {
      expect(() => uuidSchema.parse('')).toThrow();
      expect(() => uuidSchema.parse('not-a-uuid')).toThrow();
      expect(() => uuidSchema.parse('550e8400e29b41d4a716446655440000')).toThrow();
    });
  });

  describe('urlSchema', () => {
    it('should accept valid URLs', () => {
      expect(() => urlSchema.parse('https://example.com')).not.toThrow();
      expect(() => urlSchema.parse('http://localhost:3000')).not.toThrow();
      expect(() => urlSchema.parse('https://sub.domain.com/path?query=1')).not.toThrow();
    });

    it('should reject invalid URLs', () => {
      expect(() => urlSchema.parse('')).toThrow();
      expect(() => urlSchema.parse('not a url')).toThrow();
      expect(() => urlSchema.parse('example.com')).toThrow();
    });
  });

  describe('usernameSchema', () => {
    it('should accept valid usernames', () => {
      expect(() => usernameSchema.parse('john_doe')).not.toThrow();
      expect(() => usernameSchema.parse('user123')).not.toThrow();
      expect(() => usernameSchema.parse('JohnDoe')).not.toThrow();
    });

    it('should reject usernames with special characters', () => {
      expect(() => usernameSchema.parse('john-doe')).toThrow();
      expect(() => usernameSchema.parse('user@name')).toThrow();
      expect(() => usernameSchema.parse('user name')).toThrow();
    });

    it('should reject too short usernames', () => {
      expect(() => usernameSchema.parse('ab')).toThrow();
    });

    it('should reject too long usernames', () => {
      expect(() => usernameSchema.parse('a'.repeat(31))).toThrow();
    });
  });

  describe('currencySchema', () => {
    it('should accept valid currencies', () => {
      expect(() => currencySchema.parse('TRY')).not.toThrow();
      expect(() => currencySchema.parse('USD')).not.toThrow();
      expect(() => currencySchema.parse('EUR')).not.toThrow();
    });

    it('should reject invalid currencies', () => {
      expect(() => currencySchema.parse('GBP')).toThrow();
      expect(() => currencySchema.parse('JPY')).toThrow();
      expect(() => currencySchema.parse('')).toThrow();
    });
  });

  describe('amountSchema', () => {
    it('should accept valid amounts', () => {
      expect(() => amountSchema.parse(100)).not.toThrow();
      expect(() => amountSchema.parse(0.01)).not.toThrow();
      expect(() => amountSchema.parse(99.99)).not.toThrow();
    });

    it('should reject non-positive amounts', () => {
      expect(() => amountSchema.parse(0)).toThrow();
      expect(() => amountSchema.parse(-10)).toThrow();
    });

    it('should reject amounts with too many decimals', () => {
      expect(() => amountSchema.parse(10.001)).toThrow();
    });
  });

  describe('paginationSchema', () => {
    it('should accept valid pagination', () => {
      const result = paginationSchema.parse({ page: 1, limit: 20 });
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should use default values', () => {
      const result = paginationSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should reject invalid page numbers', () => {
      expect(() => paginationSchema.parse({ page: 0 })).toThrow();
      expect(() => paginationSchema.parse({ page: -1 })).toThrow();
    });

    it('should reject limit over 100', () => {
      expect(() => paginationSchema.parse({ limit: 101 })).toThrow();
    });
  });

  describe('cursorPaginationSchema', () => {
    it('should accept valid cursor pagination', () => {
      const result = cursorPaginationSchema.parse({ cursor: 'abc123', limit: 10 });
      expect(result.cursor).toBe('abc123');
      expect(result.limit).toBe(10);
    });

    it('should make cursor optional', () => {
      const result = cursorPaginationSchema.parse({ limit: 10 });
      expect(result.cursor).toBeUndefined();
    });
  });

  describe('dateRangeSchema', () => {
    it('should accept valid date ranges', () => {
      expect(() => dateRangeSchema.parse({
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
      })).not.toThrow();
    });

    it('should reject end date before start date', () => {
      expect(() => dateRangeSchema.parse({
        startDate: '2024-12-31T00:00:00Z',
        endDate: '2024-01-01T00:00:00Z',
      })).toThrow();
    });

    it('should accept same start and end date', () => {
      expect(() => dateRangeSchema.parse({
        startDate: '2024-06-15T00:00:00Z',
        endDate: '2024-06-15T00:00:00Z',
      })).not.toThrow();
    });
  });

  describe('coordinatesSchema', () => {
    it('should accept valid coordinates', () => {
      expect(() => coordinatesSchema.parse({ latitude: 40.7128, longitude: -74.0060 })).not.toThrow();
      expect(() => coordinatesSchema.parse({ latitude: 0, longitude: 0 })).not.toThrow();
      expect(() => coordinatesSchema.parse({ latitude: -90, longitude: 180 })).not.toThrow();
    });

    it('should reject invalid latitude', () => {
      expect(() => coordinatesSchema.parse({ latitude: 91, longitude: 0 })).toThrow();
      expect(() => coordinatesSchema.parse({ latitude: -91, longitude: 0 })).toThrow();
    });

    it('should reject invalid longitude', () => {
      expect(() => coordinatesSchema.parse({ latitude: 0, longitude: 181 })).toThrow();
      expect(() => coordinatesSchema.parse({ latitude: 0, longitude: -181 })).toThrow();
    });
  });

  describe('locationSearchSchema', () => {
    it('should accept valid location search', () => {
      const result = locationSearchSchema.parse({
        latitude: 40.7128,
        longitude: -74.0060,
        radiusKm: 25,
      });
      expect(result.radiusKm).toBe(25);
    });

    it('should use default radius', () => {
      const result = locationSearchSchema.parse({
        latitude: 40.7128,
        longitude: -74.0060,
      });
      expect(result.radiusKm).toBe(50);
    });

    it('should reject radius over 500km', () => {
      expect(() => locationSearchSchema.parse({
        latitude: 40.7128,
        longitude: -74.0060,
        radiusKm: 501,
      })).toThrow();
    });
  });
});

describe('Auth Schemas', () => {
  describe('loginSchema', () => {
    it('should accept valid login credentials', () => {
      expect(() => loginSchema.parse({
        email: 'user@example.com',
        password: 'password123',
      })).not.toThrow();
    });

    it('should reject empty password', () => {
      expect(() => loginSchema.parse({
        email: 'user@example.com',
        password: '',
      })).toThrow();
    });

    it('should reject invalid email', () => {
      expect(() => loginSchema.parse({
        email: 'notanemail',
        password: 'password123',
      })).toThrow();
    });
  });

  describe('registerSchema', () => {
    it('should accept valid registration data', () => {
      expect(() => registerSchema.parse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
      })).not.toThrow();
    });

    it('should reject mismatched passwords', () => {
      expect(() => registerSchema.parse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password1',
        confirmPassword: 'Password2',
      })).toThrow();
    });

    it('should reject short name', () => {
      expect(() => registerSchema.parse({
        name: 'J',
        email: 'john@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
      })).toThrow();
    });

    it('should reject long name', () => {
      expect(() => registerSchema.parse({
        name: 'J'.repeat(51),
        email: 'john@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
      })).toThrow();
    });

    it('should accept optional phone', () => {
      expect(() => registerSchema.parse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
        phone: '+14155551234',
      })).not.toThrow();
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should accept valid email', () => {
      expect(() => forgotPasswordSchema.parse({
        email: 'user@example.com',
      })).not.toThrow();
    });

    it('should reject invalid email', () => {
      expect(() => forgotPasswordSchema.parse({
        email: 'notanemail',
      })).toThrow();
    });
  });

  describe('resetPasswordSchema', () => {
    it('should accept valid password reset', () => {
      expect(() => resetPasswordSchema.parse({
        password: 'NewPassword1',
        confirmPassword: 'NewPassword1',
      })).not.toThrow();
    });

    it('should reject mismatched passwords', () => {
      expect(() => resetPasswordSchema.parse({
        password: 'NewPassword1',
        confirmPassword: 'NewPassword2',
      })).toThrow();
    });

    it('should validate password strength', () => {
      expect(() => resetPasswordSchema.parse({
        password: 'weak',
        confirmPassword: 'weak',
      })).toThrow();
    });
  });

  describe('changePasswordSchema', () => {
    it('should accept valid password change', () => {
      expect(() => changePasswordSchema.parse({
        currentPassword: 'OldPassword1',
        newPassword: 'NewPassword1',
        confirmPassword: 'NewPassword1',
      })).not.toThrow();
    });

    it('should reject same old and new password', () => {
      expect(() => changePasswordSchema.parse({
        currentPassword: 'Password1',
        newPassword: 'Password1',
        confirmPassword: 'Password1',
      })).toThrow();
    });

    it('should reject mismatched confirm password', () => {
      expect(() => changePasswordSchema.parse({
        currentPassword: 'OldPassword1',
        newPassword: 'NewPassword1',
        confirmPassword: 'NewPassword2',
      })).toThrow();
    });
  });

  describe('verifyEmailSchema', () => {
    it('should accept valid token', () => {
      expect(() => verifyEmailSchema.parse({
        token: 'verification-token-123',
      })).not.toThrow();
    });

    it('should reject empty token', () => {
      expect(() => verifyEmailSchema.parse({
        token: '',
      })).toThrow();
    });
  });

  describe('verifyOtpSchema', () => {
    it('should accept valid OTP', () => {
      expect(() => verifyOtpSchema.parse({
        email: 'user@example.com',
        otp: '123456',
      })).not.toThrow();
    });

    it('should reject OTP with wrong length', () => {
      expect(() => verifyOtpSchema.parse({
        email: 'user@example.com',
        otp: '12345',
      })).toThrow();

      expect(() => verifyOtpSchema.parse({
        email: 'user@example.com',
        otp: '1234567',
      })).toThrow();
    });

    it('should reject OTP with non-numeric characters', () => {
      expect(() => verifyOtpSchema.parse({
        email: 'user@example.com',
        otp: '12345a',
      })).toThrow();
    });
  });
});
