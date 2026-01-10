/**
 * Validation Utility Tests
 * Comprehensive tests for all Zod schemas and validation helpers
 * Target Coverage: 90%+
 */

import {
  // Auth schemas
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  // Profile schemas
  updateProfileSchema,
  // Moment schemas
  createMomentSchema,
  updateMomentSchema,
  // Message schemas
  sendMessageSchema,
  // Payment schemas
  addCardSchema,
  addBankAccountSchema,
  // Review schemas
  createReviewSchema,
  // Search schemas
  searchSchema,
  // Report schemas
  reportSchema,
  // Settings schemas
  notificationSettingsSchema,
  privacySettingsSchema,
  // Contact schemas
  contactSchema,
  feedbackSchema,
  // Reusable schemas
  coordinateSchema,
  dateRangeSchema,
  paginationSchema,
  // Other schemas
  withdrawalSchema,
  disputeSchema,
  // Helper functions
  validateInput,
  formatZodErrors,
} from '@/utils/validation';

describe('validation.ts', () => {
  // ========================================
  // AUTH SCHEMAS
  // ========================================
  describe('loginSchema', () => {
    it('should validate valid login credentials', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing email', () => {
      const result = loginSchema.safeParse({
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email format', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    const validRegister = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    };

    it('should validate valid registration data', () => {
      const result = registerSchema.safeParse(validRegister);
      expect(result.success).toBe(true);
    });

    it('should reject name shorter than 2 characters', () => {
      const result = registerSchema.safeParse({
        ...validRegister,
        name: 'J',
      });
      expect(result.success).toBe(false);
    });

    it('should reject name longer than 50 characters', () => {
      const result = registerSchema.safeParse({
        ...validRegister,
        name: 'A'.repeat(51),
      });
      expect(result.success).toBe(false);
    });

    it('should reject password without uppercase letter', () => {
      const result = registerSchema.safeParse({
        ...validRegister,
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject password without lowercase letter', () => {
      const result = registerSchema.safeParse({
        ...validRegister,
        password: 'PASSWORD123',
        confirmPassword: 'PASSWORD123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject password without number', () => {
      const result = registerSchema.safeParse({
        ...validRegister,
        password: 'PasswordABC',
        confirmPassword: 'PasswordABC',
      });
      expect(result.success).toBe(false);
    });

    it('should reject mismatched passwords', () => {
      const result = registerSchema.safeParse({
        ...validRegister,
        confirmPassword: 'Different123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should validate valid email', () => {
      const result = forgotPasswordSchema.safeParse({
        email: 'test@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = forgotPasswordSchema.safeParse({
        email: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('resetPasswordSchema', () => {
    it('should validate matching passwords with valid format', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'NewPassword123',
        confirmPassword: 'NewPassword123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'NewPassword123',
        confirmPassword: 'Different123',
      });
      expect(result.success).toBe(false);
    });
  });

  // ========================================
  // PROFILE SCHEMAS
  // ========================================
  describe('updateProfileSchema', () => {
    it('should validate valid profile update', () => {
      const result = updateProfileSchema.safeParse({
        full_name: 'John Doe',
        bio: 'Test bio',
      });
      expect(result.success).toBe(true);
    });

    it('should accept optional fields', () => {
      const result = updateProfileSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject invalid phone number', () => {
      const result = updateProfileSchema.safeParse({
        phone: 'invalid',
      });
      expect(result.success).toBe(false);
    });

    it('should reject bio longer than 500 characters', () => {
      const result = updateProfileSchema.safeParse({
        bio: 'A'.repeat(501),
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid date_of_birth as ISO string', () => {
      const result = updateProfileSchema.safeParse({
        date_of_birth: '1990-01-15T00:00:00.000Z',
      });
      expect(result.success).toBe(true);
    });
  });

  // ========================================
  // MOMENT SCHEMAS
  // ========================================
  describe('createMomentSchema', () => {
    const validMoment = {
      title: 'Coffee in Paris',
      description: 'Enjoy a cup of coffee at a cozy café in Paris',
      category: 'food',
      location: {
        latitude: 48.8566,
        longitude: 2.3522,
        address: '123 Main St',
        city: 'Paris',
        country: 'France',
      },
      price: 25,
      images: ['https://example.com/image1.jpg'],
    };

    it('should validate valid moment creation data', () => {
      const result = createMomentSchema.safeParse(validMoment);
      expect(result.success).toBe(true);
    });

    it('should reject title shorter than 3 characters', () => {
      const result = createMomentSchema.safeParse({
        ...validMoment,
        title: 'AB',
      });
      expect(result.success).toBe(false);
    });

    it('should reject description shorter than 10 characters', () => {
      const result = createMomentSchema.safeParse({
        ...validMoment,
        description: 'Short',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid latitude', () => {
      const result = createMomentSchema.safeParse({
        ...validMoment,
        location: { ...validMoment.location, latitude: 91 },
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid longitude', () => {
      const result = createMomentSchema.safeParse({
        ...validMoment,
        location: { ...validMoment.location, longitude: 181 },
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative price', () => {
      const result = createMomentSchema.safeParse({
        ...validMoment,
        price: -10,
      });
      expect(result.success).toBe(false);
    });

    it('should reject more than 10 images', () => {
      const result = createMomentSchema.safeParse({
        ...validMoment,
        images: Array(11).fill('https://example.com/image.jpg'),
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid image URL', () => {
      const result = createMomentSchema.safeParse({
        ...validMoment,
        images: ['not-a-url'],
      });
      expect(result.success).toBe(false);
    });

    it('should reject more than 10 tags', () => {
      const result = createMomentSchema.safeParse({
        ...validMoment,
        tags: Array(11).fill('tag'),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateMomentSchema', () => {
    it('should allow partial updates', () => {
      const result = updateMomentSchema.safeParse({
        title: 'Updated Title',
      });
      expect(result.success).toBe(true);
    });

    it('should allow empty object', () => {
      const result = updateMomentSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  // ========================================
  // MESSAGE SCHEMAS
  // ========================================
  describe('sendMessageSchema', () => {
    it('should validate valid message', () => {
      const result = sendMessageSchema.safeParse({
        recipientId: 'user-123',
        content: 'Hello, how are you?',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty message', () => {
      const result = sendMessageSchema.safeParse({
        recipientId: 'user-123',
        content: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject message longer than 1000 characters', () => {
      const result = sendMessageSchema.safeParse({
        recipientId: 'user-123',
        content: 'A'.repeat(1001),
      });
      expect(result.success).toBe(false);
    });

    it('should reject more than 5 attachments', () => {
      const result = sendMessageSchema.safeParse({
        recipientId: 'user-123',
        content: 'Message with attachments',
        attachments: Array(6).fill('https://example.com/file.pdf'),
      });
      expect(result.success).toBe(false);
    });
  });

  // ========================================
  // PAYMENT SCHEMAS
  // ========================================
  describe('addCardSchema', () => {
    const validCard = {
      cardNumber: '1234567890123456',
      cardholderName: 'John Doe',
      expiryMonth: 12,
      expiryYear: new Date().getFullYear() + 1,
      cvv: '123',
    };

    it('should validate valid card', () => {
      const result = addCardSchema.safeParse(validCard);
      expect(result.success).toBe(true);
    });

    it('should reject invalid card number format', () => {
      const result = addCardSchema.safeParse({
        ...validCard,
        cardNumber: '123', // Too short
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid expiry month', () => {
      const result = addCardSchema.safeParse({
        ...validCard,
        expiryMonth: 13,
      });
      expect(result.success).toBe(false);
    });

    it('should reject expired card', () => {
      const result = addCardSchema.safeParse({
        ...validCard,
        expiryYear: 2020,
      });
      expect(result.success).toBe(false);
    });

    it('should accept 4-digit CVV', () => {
      const result = addCardSchema.safeParse({
        ...validCard,
        cvv: '1234',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid CVV', () => {
      const result = addCardSchema.safeParse({
        ...validCard,
        cvv: '12', // Too short
      });
      expect(result.success).toBe(false);
    });
  });

  describe('addBankAccountSchema', () => {
    it('should validate valid bank account', () => {
      const result = addBankAccountSchema.safeParse({
        accountHolderName: 'John Doe',
        iban: 'GB82WEST12345698765432',
        bankName: 'Test Bank',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid IBAN format', () => {
      const result = addBankAccountSchema.safeParse({
        accountHolderName: 'John Doe',
        iban: 'invalid-iban',
        bankName: 'Test Bank',
      });
      expect(result.success).toBe(false);
    });
  });

  // ========================================
  // REVIEW SCHEMAS
  // ========================================
  describe('createReviewSchema', () => {
    it('should validate valid review', () => {
      const result = createReviewSchema.safeParse({
        rating: 5,
        comment: 'Great experience!',
      });
      expect(result.success).toBe(true);
    });

    it('should reject rating below 1', () => {
      const result = createReviewSchema.safeParse({
        rating: 0,
      });
      expect(result.success).toBe(false);
    });

    it('should reject rating above 5', () => {
      const result = createReviewSchema.safeParse({
        rating: 6,
      });
      expect(result.success).toBe(false);
    });

    it('should reject comment shorter than 10 characters', () => {
      const result = createReviewSchema.safeParse({
        rating: 5,
        comment: 'Good',
      });
      expect(result.success).toBe(false);
    });
  });

  // ========================================
  // SEARCH SCHEMAS
  // ========================================
  describe('searchSchema', () => {
    it('should validate valid search', () => {
      const result = searchSchema.safeParse({
        query: 'coffee',
        category: 'food',
        minPrice: 10,
        maxPrice: 50,
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty query', () => {
      const result = searchSchema.safeParse({
        query: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject minPrice greater than maxPrice', () => {
      const result = searchSchema.safeParse({
        query: 'test',
        minPrice: 100,
        maxPrice: 50,
      });
      expect(result.success).toBe(false);
    });

    it('should reject startDate after endDate', () => {
      const start = new Date('2024-12-31');
      const end = new Date('2024-01-01');
      const result = searchSchema.safeParse({
        query: 'test',
        startDate: start,
        endDate: end,
      });
      expect(result.success).toBe(false);
    });
  });

  // ========================================
  // REPORT SCHEMAS
  // ========================================
  describe('reportSchema', () => {
    it('should validate valid report', () => {
      const result = reportSchema.safeParse({
        reason: 'spam',
        description: 'This is spam content that violates our policies',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid reason', () => {
      const result = reportSchema.safeParse({
        reason: 'invalid_reason',
        description: 'Test description that is long enough',
      });
      expect(result.success).toBe(false);
    });

    it('should reject description shorter than 10 characters', () => {
      const result = reportSchema.safeParse({
        reason: 'spam',
        description: 'Short',
      });
      expect(result.success).toBe(false);
    });

    it('should reject more than 5 evidence files', () => {
      const result = reportSchema.safeParse({
        reason: 'spam',
        description: 'Test description that is long enough',
        evidence: Array(6).fill('https://example.com/evidence.jpg'),
      });
      expect(result.success).toBe(false);
    });
  });

  // ========================================
  // SETTINGS SCHEMAS
  // ========================================
  describe('notificationSettingsSchema', () => {
    it('should validate valid notification settings', () => {
      const result = notificationSettingsSchema.safeParse({
        pushEnabled: true,
        emailEnabled: true,
        smsEnabled: false,
        marketingEnabled: false,
        newMessages: true,
        momentUpdates: true,
        requestUpdates: true,
        paymentUpdates: true,
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const result = notificationSettingsSchema.safeParse({
        pushEnabled: true,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('privacySettingsSchema', () => {
    it('should validate valid privacy settings', () => {
      const result = privacySettingsSchema.safeParse({
        profileVisibility: 'public',
        showLocation: true,
        allowMessagesFrom: 'everyone',
        showActivityStatus: true,
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid profile visibility', () => {
      const result = privacySettingsSchema.safeParse({
        profileVisibility: 'invalid',
        showLocation: true,
        allowMessagesFrom: 'everyone',
        showActivityStatus: true,
      });
      expect(result.success).toBe(false);
    });
  });

  // ========================================
  // CONTACT & FEEDBACK SCHEMAS
  // ========================================
  describe('contactSchema', () => {
    it('should validate valid contact form', () => {
      const result = contactSchema.safeParse({
        subject: 'Help needed',
        message: 'I need help with my account and cannot access it',
        category: 'support',
      });
      expect(result.success).toBe(true);
    });

    it('should reject subject shorter than 5 characters', () => {
      const result = contactSchema.safeParse({
        subject: 'Help',
        message: 'I need help with my account',
        category: 'support',
      });
      expect(result.success).toBe(false);
    });

    it('should reject message shorter than 20 characters', () => {
      const result = contactSchema.safeParse({
        subject: 'Help needed',
        message: 'Short message',
        category: 'support',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('feedbackSchema', () => {
    it('should validate valid feedback', () => {
      const result = feedbackSchema.safeParse({
        type: 'bug',
        title: 'App crashes on startup',
        description:
          'The app crashes immediately when I try to open it on my device',
        priority: 'high',
      });
      expect(result.success).toBe(true);
    });

    it('should reject more than 3 attachments', () => {
      const result = feedbackSchema.safeParse({
        type: 'bug',
        title: 'Bug report',
        description: 'This is a detailed description of the bug I encountered',
        attachments: Array(4).fill('https://example.com/screenshot.jpg'),
      });
      expect(result.success).toBe(false);
    });
  });

  // ========================================
  // REUSABLE SCHEMAS
  // ========================================
  describe('coordinateSchema', () => {
    it('should validate valid coordinates', () => {
      const result = coordinateSchema.safeParse({
        latitude: 40.7128,
        longitude: -74.006,
      });
      expect(result.success).toBe(true);
    });

    it('should reject latitude out of range', () => {
      const result = coordinateSchema.safeParse({
        latitude: 91,
        longitude: 0,
      });
      expect(result.success).toBe(false);
    });

    it('should reject longitude out of range', () => {
      const result = coordinateSchema.safeParse({
        latitude: 0,
        longitude: 181,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('dateRangeSchema', () => {
    it('should validate valid date range', () => {
      const result = dateRangeSchema.safeParse({
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T00:00:00.000Z',
      });
      expect(result.success).toBe(true);
    });

    it('should reject start date after end date', () => {
      const result = dateRangeSchema.safeParse({
        startDate: '2024-12-31T00:00:00.000Z',
        endDate: '2024-01-01T00:00:00.000Z',
      });
      expect(result.success).toBe(false);
    });

    it('should allow same start and end date', () => {
      const date = '2024-06-15T00:00:00.000Z';
      const result = dateRangeSchema.safeParse({
        startDate: date,
        endDate: date,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('paginationSchema', () => {
    it('should validate with defaults', () => {
      const result = paginationSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('should reject page less than 1', () => {
      const result = paginationSchema.safeParse({ page: 0 });
      expect(result.success).toBe(false);
    });

    it('should reject limit greater than 100', () => {
      const result = paginationSchema.safeParse({ limit: 101 });
      expect(result.success).toBe(false);
    });
  });

  // ========================================
  // OTHER SCHEMAS
  // ========================================
  describe('withdrawalSchema', () => {
    it('should validate valid withdrawal', () => {
      const result = withdrawalSchema.safeParse({
        amount: 100,
        destinationType: 'bank',
        destinationId: 'bank-123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject amount below minimum', () => {
      const result = withdrawalSchema.safeParse({
        amount: 5,
        destinationType: 'bank',
        destinationId: 'bank-123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('disputeSchema', () => {
    it('should validate valid dispute', () => {
      const result = disputeSchema.safeParse({
        transactionId: 'txn-123',
        reason: 'not_as_described',
        description: 'The item I received was not as described in the listing',
        evidence: ['https://example.com/evidence1.jpg'],
      });
      expect(result.success).toBe(true);
    });

    it('should reject description shorter than 20 characters', () => {
      const result = disputeSchema.safeParse({
        transactionId: 'txn-123',
        reason: 'not_as_described',
        description: 'Short description',
        evidence: ['https://example.com/evidence1.jpg'],
      });
      expect(result.success).toBe(false);
    });

    it('should reject without evidence', () => {
      const result = disputeSchema.safeParse({
        transactionId: 'txn-123',
        reason: 'not_as_described',
        description: 'The item I received was not as described in the listing',
        evidence: [],
      });
      expect(result.success).toBe(false);
    });

    it('should reject more than 10 evidence files', () => {
      const result = disputeSchema.safeParse({
        transactionId: 'txn-123',
        reason: 'not_as_described',
        description: 'The item I received was not as described in the listing',
        evidence: Array(11).fill('https://example.com/evidence.jpg'),
      });
      expect(result.success).toBe(false);
    });
  });

  // ========================================
  // HELPER FUNCTIONS
  // ========================================
  describe('validateInput', () => {
    it('should return success for valid data', () => {
      const result = validateInput(loginSchema, {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
      }
    });

    it('should return errors for invalid data', () => {
      const result = validateInput(loginSchema, {
        email: 'invalid-email',
        password: 'short',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toBeDefined();
      }
    });
  });

  describe('formatZodErrors', () => {
    it('should format Zod errors correctly', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'short',
      });

      if (!result.success) {
        const formatted = formatZodErrors(result.error);
        expect(formatted).toBeDefined();
        expect(typeof formatted).toBe('object');
        expect(Object.keys(formatted).length).toBeGreaterThan(0);
      }
    });

    it('should group errors by path', () => {
      const result = registerSchema.safeParse({
        name: 'J',
        email: 'invalid',
        password: 'weak',
        confirmPassword: 'different',
      });

      if (!result.success) {
        const formatted = formatZodErrors(result.error);
        expect(formatted.name).toBeDefined();
        expect(formatted.email).toBeDefined();
        expect(formatted.password).toBeDefined();
      }
    });
  });
});
