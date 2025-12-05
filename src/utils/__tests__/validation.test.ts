/**
 * Validation Utilities Tests
 * Comprehensive tests for all Zod validation schemas
 */

import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  createMomentSchema,
  sendMessageSchema,
  addCardSchema,
  addBankAccountSchema,
  createReviewSchema,
  searchSchema,
} from '../validation';

describe('Validation Schemas', () => {
  // ==================== AUTH SCHEMAS ====================
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('email');
      }
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'short',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty email', () => {
      const invalidData = {
        email: '',
        password: 'Password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing fields', () => {
      const result = loginSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123',
        confirmPassword: 'DifferentPass456',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without uppercase', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securepass123',
        confirmPassword: 'securepass123',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without lowercase', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SECUREPASS123',
        confirmPassword: 'SECUREPASS123',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without number', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePassword',
        confirmPassword: 'SecurePassword',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short name', () => {
      const invalidData = {
        name: 'J',
        email: 'john@example.com',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject long name', () => {
      const invalidData = {
        name: 'a'.repeat(51),
        email: 'john@example.com',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should validate correct email', () => {
      const validData = { email: 'test@example.com' };

      const result = forgotPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = { email: 'invalid' };

      const result = forgotPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty email', () => {
      const invalidData = { email: '' };

      const result = forgotPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('resetPasswordSchema', () => {
    it('should validate correct reset password data', () => {
      const validData = {
        password: 'NewSecure123',
        confirmPassword: 'NewSecure123',
      };

      const result = resetPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const invalidData = {
        password: 'NewSecure123',
        confirmPassword: 'Different123',
      };

      const result = resetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject weak password', () => {
      const invalidData = {
        password: 'weak',
        confirmPassword: 'weak',
      };

      const result = resetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  // ==================== PROFILE SCHEMAS ====================
  describe('updateProfileSchema', () => {
    it('should validate correct profile data', () => {
      const validData = {
        name: 'Jane Smith',
        bio: 'Travel enthusiast',
        location: 'Istanbul',
      };

      const result = updateProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject bio longer than 500 characters', () => {
      const invalidData = {
        name: 'Jane Smith',
        bio: 'a'.repeat(501),
        location: 'Istanbul',
      };

      const result = updateProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate empty object (all optional)', () => {
      const result = updateProfileSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject invalid phone number', () => {
      const invalidData = {
        phone: 'invalid-phone',
      };

      const result = updateProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept valid phone number', () => {
      const validData = {
        phone: '+905551234567',
      };

      const result = updateProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject location longer than 100 characters', () => {
      const invalidData = {
        location: 'a'.repeat(101),
      };

      const result = updateProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject future date of birth', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const invalidData = {
        dateOfBirth: futureDate,
      };

      const result = updateProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept past date of birth', () => {
      const pastDate = new Date('1990-01-01');

      const validData = {
        dateOfBirth: pastDate,
      };

      const result = updateProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  // ==================== MOMENT SCHEMAS ====================
  describe('createMomentSchema', () => {
    const validMoment = {
      title: 'Beautiful Sunset',
      description: 'A beautiful sunset at the beach with amazing colors',
      category: 'nature',
      location: {
        latitude: 41.0082,
        longitude: 28.9784,
        address: 'Sultanahmet Square',
        city: 'Istanbul',
        country: 'Turkey',
      },
      images: ['https://example.com/image1.jpg'],
    };

    it('should validate correct moment data', () => {
      const result = createMomentSchema.safeParse(validMoment);
      expect(result.success).toBe(true);
    });

    it('should accept optional price', () => {
      const withPrice = { ...validMoment, price: 50 };
      const result = createMomentSchema.safeParse(withPrice);
      expect(result.success).toBe(true);
    });

    it('should accept optional tags', () => {
      const withTags = { ...validMoment, tags: ['sunset', 'beach'] };
      const result = createMomentSchema.safeParse(withTags);
      expect(result.success).toBe(true);
    });

    it('should reject short title', () => {
      const invalidData = { ...validMoment, title: 'Hi' };
      const result = createMomentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject long title', () => {
      const invalidData = { ...validMoment, title: 'a'.repeat(101) };
      const result = createMomentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short description', () => {
      const invalidData = { ...validMoment, description: 'Short' };
      const result = createMomentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject long description', () => {
      const invalidData = { ...validMoment, description: 'a'.repeat(1001) };
      const result = createMomentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid latitude', () => {
      const invalidData = {
        ...validMoment,
        location: { ...validMoment.location, latitude: 100 },
      };
      const result = createMomentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid longitude', () => {
      const invalidData = {
        ...validMoment,
        location: { ...validMoment.location, longitude: 200 },
      };
      const result = createMomentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty images array', () => {
      const invalidData = { ...validMoment, images: [] };
      const result = createMomentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject more than 10 images', () => {
      const invalidData = {
        ...validMoment,
        images: Array(11)
          .fill(0)
          .map((_, i) => `https://example.com/image${i}.jpg`),
      };
      const result = createMomentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid image URL', () => {
      const invalidData = { ...validMoment, images: ['not-a-url'] };
      const result = createMomentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject more than 10 tags', () => {
      const invalidData = {
        ...validMoment,
        tags: Array(11)
          .fill(0)
          .map((_, i) => `tag${i}`),
      };
      const result = createMomentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative price', () => {
      const invalidData = { ...validMoment, price: -10 };
      const result = createMomentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing location fields', () => {
      const invalidData = {
        ...validMoment,
        location: { latitude: 41, longitude: 28 },
      };
      const result = createMomentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  // ==================== MESSAGE SCHEMAS ====================
  describe('sendMessageSchema', () => {
    const validMessage = {
      recipientId: 'user-123',
      content: 'Hello! How are you?',
    };

    it('should validate correct message data', () => {
      const result = sendMessageSchema.safeParse(validMessage);
      expect(result.success).toBe(true);
    });

    it('should accept optional attachments', () => {
      const withAttachments = {
        ...validMessage,
        attachments: ['https://example.com/file.pdf'],
      };
      const result = sendMessageSchema.safeParse(withAttachments);
      expect(result.success).toBe(true);
    });

    it('should reject empty content', () => {
      const invalidData = { ...validMessage, content: '' };
      const result = sendMessageSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject long content', () => {
      const invalidData = { ...validMessage, content: 'a'.repeat(1001) };
      const result = sendMessageSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty recipientId', () => {
      const invalidData = { ...validMessage, recipientId: '' };
      const result = sendMessageSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject more than 5 attachments', () => {
      const invalidData = {
        ...validMessage,
        attachments: Array(6)
          .fill(0)
          .map((_, i) => `https://example.com/file${i}.pdf`),
      };
      const result = sendMessageSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid attachment URL', () => {
      const invalidData = {
        ...validMessage,
        attachments: ['not-a-url'],
      };
      const result = sendMessageSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  // ==================== PAYMENT SCHEMAS ====================
  describe('addCardSchema', () => {
    const validCard = {
      cardNumber: '4111111111111111',
      cardholderName: 'John Doe',
      expiryMonth: 12,
      expiryYear: new Date().getFullYear() + 1,
      cvv: '123',
    };

    it('should validate correct card data', () => {
      const result = addCardSchema.safeParse(validCard);
      expect(result.success).toBe(true);
    });

    it('should accept 4-digit CVV', () => {
      const withAmexCvv = { ...validCard, cvv: '1234' };
      const result = addCardSchema.safeParse(withAmexCvv);
      expect(result.success).toBe(true);
    });

    it('should reject invalid card number (not 16 digits)', () => {
      const invalidData = { ...validCard, cardNumber: '411111111111' };
      const result = addCardSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject card number with letters', () => {
      const invalidData = { ...validCard, cardNumber: '4111111111111abc' };
      const result = addCardSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid expiry month (0)', () => {
      const invalidData = { ...validCard, expiryMonth: 0 };
      const result = addCardSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid expiry month (13)', () => {
      const invalidData = { ...validCard, expiryMonth: 13 };
      const result = addCardSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject expired card (past year)', () => {
      const invalidData = {
        ...validCard,
        expiryYear: new Date().getFullYear() - 1,
      };
      const result = addCardSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid CVV (2 digits)', () => {
      const invalidData = { ...validCard, cvv: '12' };
      const result = addCardSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid CVV (5 digits)', () => {
      const invalidData = { ...validCard, cvv: '12345' };
      const result = addCardSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty cardholder name', () => {
      const invalidData = { ...validCard, cardholderName: '' };
      const result = addCardSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject long cardholder name', () => {
      const invalidData = { ...validCard, cardholderName: 'a'.repeat(51) };
      const result = addCardSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('addBankAccountSchema', () => {
    const validBankAccount = {
      accountHolderName: 'John Doe',
      iban: 'TR320010009999901234567890',
      bankName: 'Test Bank',
    };

    it('should validate correct bank account data', () => {
      const result = addBankAccountSchema.safeParse(validBankAccount);
      expect(result.success).toBe(true);
    });

    it('should reject invalid IBAN format', () => {
      const invalidData = { ...validBankAccount, iban: 'invalid-iban' };
      const result = addBankAccountSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject IBAN starting with numbers', () => {
      const invalidData = {
        ...validBankAccount,
        iban: '12320010009999901234567890',
      };
      const result = addBankAccountSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty account holder name', () => {
      const invalidData = { ...validBankAccount, accountHolderName: '' };
      const result = addBankAccountSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject long account holder name', () => {
      const invalidData = {
        ...validBankAccount,
        accountHolderName: 'a'.repeat(51),
      };
      const result = addBankAccountSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty bank name', () => {
      const invalidData = { ...validBankAccount, bankName: '' };
      const result = addBankAccountSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  // ==================== REVIEW SCHEMAS ====================
  describe('createReviewSchema', () => {
    it('should validate correct review data', () => {
      const validData = {
        rating: 5,
        comment: 'This was an amazing experience!',
      };

      const result = createReviewSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate review without comment (optional)', () => {
      const validData = { rating: 4 };

      const result = createReviewSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject rating below 1', () => {
      const invalidData = { rating: 0 };

      const result = createReviewSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject rating above 5', () => {
      const invalidData = { rating: 6 };

      const result = createReviewSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short comment', () => {
      const invalidData = { rating: 5, comment: 'Short' };

      const result = createReviewSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject long comment', () => {
      const invalidData = { rating: 5, comment: 'a'.repeat(501) };

      const result = createReviewSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept decimal rating', () => {
      const validData = { rating: 3.5 };

      const result = createReviewSchema.safeParse(validData);
      // Zod number allows decimals by default
      expect(result.success).toBe(true);
    });
  });

  // ==================== SEARCH SCHEMAS ====================
  describe('searchSchema', () => {
    it('should validate correct search data', () => {
      const validData = {
        query: 'sunset beach',
        category: 'nature',
        location: 'Istanbul',
      };

      const result = searchSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate with price range', () => {
      const validData = {
        query: 'tour',
        minPrice: 50,
        maxPrice: 200,
      };

      const result = searchSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate with date range', () => {
      const validData = {
        query: 'tour',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      };

      const result = searchSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty query', () => {
      const invalidData = { query: '' };

      const result = searchSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject long query', () => {
      const invalidData = { query: 'a'.repeat(101) };

      const result = searchSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject min price greater than max price', () => {
      const invalidData = {
        query: 'tour',
        minPrice: 200,
        maxPrice: 50,
      };

      const result = searchSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative prices', () => {
      const invalidData = {
        query: 'tour',
        minPrice: -10,
      };

      const result = searchSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject start date after end date', () => {
      const invalidData = {
        query: 'tour',
        startDate: new Date('2024-12-31'),
        endDate: new Date('2024-01-01'),
      };

      const result = searchSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should allow query-only search', () => {
      const validData = { query: 'beach' };

      const result = searchSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  // ==================== EDGE CASES ====================
  describe('Edge Cases', () => {
    it('should handle undefined values in optional fields', () => {
      const data = {
        name: 'John',
        bio: undefined,
        location: undefined,
      };

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should handle null as invalid for string fields', () => {
      const data = {
        email: null,
        password: 'Password123',
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should handle unicode characters in text fields', () => {
      const data = {
        name: 'José García 日本語',
        email: 'jose@example.com',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
      };

      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should handle emoji in text fields', () => {
      const data = {
        recipientId: 'user-123',
        content: 'Hello! 👋 How are you? 🌟',
      };

      const result = sendMessageSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should handle whitespace-only strings', () => {
      const data = {
        email: '   ',
        password: 'Password123',
      };

      const result = loginSchema.safeParse(data);
      // Whitespace-only email is not a valid email format
      expect(result.success).toBe(false);
    });

    it('should handle extreme latitude/longitude values at boundaries', () => {
      const validData = {
        title: 'South Pole Adventure',
        description: 'An expedition to the southernmost point on Earth',
        category: 'adventure',
        location: {
          latitude: -90,
          longitude: -180,
          address: 'South Pole',
          city: 'Antarctica',
          country: 'Antarctica',
        },
        images: ['https://example.com/pole.jpg'],
      };

      const result = createMomentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
