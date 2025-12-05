// Note: For production, use expo-secure-store or @react-native-async-storage/async-storage
import { logger } from './logger';
// npx expo install expo-secure-store
// npx expo install @react-native-async-storage/async-storage

// Simple in-memory storage for development
const memoryStorage = new Map<string, string>();

/**
 * Secure storage for sensitive data (tokens, passwords, etc.)
 * TODO: Replace with expo-secure-store for production
 */
export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      memoryStorage.set(`@secure_${key}`, value);
    } catch (error) {
      logger.error('SecureStore setItem error:', error);
      throw error;
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      return memoryStorage.get(`@secure_${key}`) || null;
    } catch (error) {
      logger.error('SecureStore getItem error:', error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      memoryStorage.delete(`@secure_${key}`);
    } catch (error) {
      logger.error('SecureStore removeItem error:', error);
      throw error;
    }
  },
};

/**
 * Sanitize user input to prevent XSS and injection attacks
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';

  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove remaining brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (basic international format)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{7,14}$/;
  return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
};

/**
 * Password strength validation
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export const validatePassword = (
  password: string,
): PasswordValidationResult => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain a lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain a number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain a special character');
  }

  // Calculate strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  const passedChecks = 5 - errors.length;

  if (passedChecks >= 5 && password.length >= 12) {
    strength = 'strong';
  } else if (passedChecks >= 3) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
};

/**
 * Validate username
 */
export const isValidUsername = (username: string): boolean => {
  // 3-20 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * Validate URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Mask sensitive data (e.g., email, phone)
 */
export const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;

  const maskedLocal =
    localPart.length > 2
      ? localPart[0] +
        '*'.repeat(localPart.length - 2) +
        localPart[localPart.length - 1]
      : localPart;

  return `${maskedLocal}@${domain}`;
};

export const maskPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 4) return phone;

  return '*'.repeat(cleaned.length - 4) + cleaned.slice(-4);
};

/**
 * Rate limiting helper (client-side)
 */
const rateLimitMap = new Map<string, number[]>();

export const checkRateLimit = (
  action: string,
  maxAttempts = 5,
  windowMs = 60000,
): boolean => {
  const now = Date.now();
  const attempts = rateLimitMap.get(action) || [];

  // Remove old attempts outside the window
  const recentAttempts = attempts.filter((time) => now - time < windowMs);

  if (recentAttempts.length >= maxAttempts) {
    return false; // Rate limited
  }

  recentAttempts.push(now);
  rateLimitMap.set(action, recentAttempts);
  return true; // Allowed
};

/**
 * Generate a random ID (for client-side use only)
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Secure comparison (timing-safe for strings)
 */
export const secureCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
};
