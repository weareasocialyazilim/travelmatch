import { loginSchema, registerSchema } from '../validation';

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail with invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'password123',
      };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email address');
      }
    });

    it('should fail with short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'short', // less than 8 chars
      };
      // Note: loginSchema in validation.ts requires min 8 chars
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123', // Contains Upper, lower, number
        confirmPassword: 'Password123',
      };
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail when passwords do not match', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Password456',
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Passwords don't match");
      }
    });

    it('should fail with weak password', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password', // No uppercase, no number
        confirmPassword: 'password',
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
