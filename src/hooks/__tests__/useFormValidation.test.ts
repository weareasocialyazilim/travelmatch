/**
 * useFormValidation Hook Tests
 * Testing Zod-based form validation
 */

import { renderHook, act } from '@testing-library/react-native';
import { z } from 'zod';
import { useFormValidation } from '../useFormValidation';

describe('useFormValidation', () => {
  // Test schema
  const userSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    age: z.number().min(18, 'Must be at least 18 years old').optional(),
  });

  type UserForm = z.infer<typeof userSchema>;

  describe('initial state', () => {
    it('should have empty errors initially', () => {
      const { result } = renderHook(() => useFormValidation(userSchema));

      expect(result.current.errors).toEqual({});
    });

    it('should be valid initially', () => {
      const { result } = renderHook(() => useFormValidation(userSchema));

      expect(result.current.isValid).toBe(true);
    });

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useFormValidation(userSchema));

      expect(typeof result.current.validate).toBe('function');
      expect(typeof result.current.validateField).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
      expect(typeof result.current.clearErrors).toBe('function');
    });
  });

  describe('validate', () => {
    it('should return true for valid data', () => {
      const { result } = renderHook(() => useFormValidation(userSchema));

      const validData: UserForm = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe',
      };

      let isValid: boolean | undefined;
      act(() => {
        isValid = result.current.validate(validData);
      });

      expect(isValid).toBe(true);
      expect(result.current.errors).toEqual({});
      expect(result.current.isValid).toBe(true);
    });

    it('should return false for invalid email', () => {
      const { result } = renderHook(() => useFormValidation(userSchema));

      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'John Doe',
      };

      let isValid: boolean | undefined;
      act(() => {
        isValid = result.current.validate(invalidData);
      });

      expect(isValid).toBe(false);
      expect(result.current.errors.email).toBe('Invalid email address');
      expect(result.current.isValid).toBe(false);
    });

    it('should return false for short password', () => {
      const { result } = renderHook(() => useFormValidation(userSchema));

      const invalidData = {
        email: 'test@example.com',
        password: '123',
        name: 'John Doe',
      };

      let isValid: boolean | undefined;
      act(() => {
        isValid = result.current.validate(invalidData);
      });

      expect(isValid).toBe(false);
      expect(result.current.errors.password).toBe(
        'Password must be at least 8 characters',
      );
    });

    it('should return false for short name', () => {
      const { result } = renderHook(() => useFormValidation(userSchema));

      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'J',
      };

      let isValid: boolean | undefined;
      act(() => {
        isValid = result.current.validate(invalidData);
      });

      expect(isValid).toBe(false);
      expect(result.current.errors.name).toBe(
        'Name must be at least 2 characters',
      );
    });

    it('should collect multiple errors', () => {
      const { result } = renderHook(() => useFormValidation(userSchema));

      const invalidData = {
        email: 'invalid',
        password: '123',
        name: 'J',
      };

      act(() => {
        result.current.validate(invalidData);
      });

      expect(Object.keys(result.current.errors).length).toBeGreaterThan(1);
    });

    it('should handle optional fields correctly', () => {
      const { result } = renderHook(() => useFormValidation(userSchema));

      const validData: UserForm = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe',
        // age is optional
      };

      let isValid: boolean | undefined;
      act(() => {
        isValid = result.current.validate(validData);
      });

      expect(isValid).toBe(true);
    });

    it('should validate optional fields when provided', () => {
      const { result } = renderHook(() => useFormValidation(userSchema));

      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe',
        age: 16, // Too young
      };

      let isValid: boolean | undefined;
      act(() => {
        isValid = result.current.validate(invalidData);
      });

      expect(isValid).toBe(false);
      expect(result.current.errors.age).toBe('Must be at least 18 years old');
    });
  });

  describe('validateField', () => {
    it('should clear error for valid field', () => {
      const { result } = renderHook(() => useFormValidation(userSchema));

      // First set an error
      act(() => {
        result.current.validate({
          email: 'invalid',
          password: 'password123',
          name: 'John',
        });
      });

      expect(result.current.errors.email).toBeDefined();

      // Clear by validating field
      act(() => {
        result.current.validateField('email', 'valid@email.com');
      });

      expect(result.current.errors.email).toBeUndefined();
    });
  });

  describe('clearError', () => {
    it('should clear specific field error', () => {
      const { result } = renderHook(() => useFormValidation(userSchema));

      // Set multiple errors
      act(() => {
        result.current.validate({
          email: 'invalid',
          password: '123',
          name: 'J',
        });
      });

      const initialErrorCount = Object.keys(result.current.errors).length;

      // Clear one error
      act(() => {
        result.current.clearError('email');
      });

      expect(result.current.errors.email).toBeUndefined();
      expect(Object.keys(result.current.errors).length).toBe(
        initialErrorCount - 1,
      );
    });

    it('should not affect other errors', () => {
      const { result } = renderHook(() => useFormValidation(userSchema));

      act(() => {
        result.current.validate({
          email: 'invalid',
          password: '123',
          name: 'John',
        });
      });

      act(() => {
        result.current.clearError('email');
      });

      expect(result.current.errors.password).toBeDefined();
    });
  });

  describe('clearErrors', () => {
    it('should clear all errors', () => {
      const { result } = renderHook(() => useFormValidation(userSchema));

      // Set multiple errors
      act(() => {
        result.current.validate({
          email: 'invalid',
          password: '123',
          name: 'J',
        });
      });

      expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);

      // Clear all
      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.errors).toEqual({});
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('isValid computed property', () => {
    it('should be true when no errors', () => {
      const { result } = renderHook(() => useFormValidation(userSchema));

      expect(result.current.isValid).toBe(true);
    });

    it('should be false when there are errors', () => {
      const { result } = renderHook(() => useFormValidation(userSchema));

      act(() => {
        result.current.validate({
          email: 'invalid',
          password: 'password123',
          name: 'John',
        });
      });

      expect(result.current.isValid).toBe(false);
    });

    it('should become true after clearing all errors', () => {
      const { result } = renderHook(() => useFormValidation(userSchema));

      act(() => {
        result.current.validate({
          email: 'invalid',
          password: '123',
          name: 'J',
        });
      });

      expect(result.current.isValid).toBe(false);

      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.isValid).toBe(true);
    });
  });

  describe('nested schema validation', () => {
    const nestedSchema = z.object({
      user: z.object({
        profile: z.object({
          firstName: z.string().min(1, 'First name required'),
          lastName: z.string().min(1, 'Last name required'),
        }),
      }),
    });

    it('should handle nested path errors', () => {
      const { result } = renderHook(() => useFormValidation(nestedSchema));

      act(() => {
        result.current.validate({
          user: {
            profile: {
              firstName: '',
              lastName: '',
            },
          },
        });
      });

      // Should have nested path errors
      expect(
        result.current.errors['user.profile.firstName'] ||
          result.current.errors['firstName'],
      ).toBeDefined();
    });
  });
});
