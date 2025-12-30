/**
 * Security utilities for input validation and sanitization
 * Note: For secure storage, use secureStorage from './secureStorage'
 */

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
 * @param url - The URL to validate
 * @param requireHttps - Whether to require HTTPS protocol (default: true for security)
 */
export const isValidUrl = (url: string, requireHttps = true): boolean => {
  try {
    const parsed = new URL(url);
    if (requireHttps && parsed.protocol !== 'https:') {
      return false;
    }
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
 * Generate a cryptographically secure random ID
 * Uses crypto.getRandomValues() for secure randomness
 */
export const generateId = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const hex = Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${Date.now()}-${hex}`;
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

/**
 * Base32 alphabet for TOTP secret encoding (RFC 4648)
 */
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Generate a cryptographically secure TOTP secret key
 * Returns a Base32-encoded string compatible with authenticator apps
 * @param length - Number of random bytes to generate (default: 20 for 160-bit secret)
 */
export const generateTotpSecret = (length = 20): string => {
  // Generate cryptographically secure random bytes
  const randomValues = new Uint8Array(length);

  // Require crypto.getRandomValues - fail if not available (security requirement)
  if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
    throw new Error(
      'Cryptographically secure random generation not available. Cannot generate TOTP secret.',
    );
  }
  crypto.getRandomValues(randomValues);

  // Encode to Base32
  let result = '';
  let bits = 0;
  let value = 0;

  for (let i = 0; i < randomValues.length; i++) {
    value = (value << 8) | randomValues[i];
    bits += 8;

    while (bits >= 5) {
      bits -= 5;
      result += BASE32_ALPHABET[(value >> bits) & 0x1f];
    }
  }

  // Handle remaining bits
  if (bits > 0) {
    result += BASE32_ALPHABET[(value << (5 - bits)) & 0x1f];
  }

  return result;
};
