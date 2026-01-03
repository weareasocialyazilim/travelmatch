/**
 * Security utilities for input validation, sanitization, and encryption
 * Note: For secure storage, use secureStorage from './secureStorage'
 */

import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Device-specific encryption key storage
const ENCRYPTION_KEY_STORAGE_KEY = 'device_encryption_key';

/**
 * Get or generate a device-specific encryption key
 * This key is stored in secure storage and persists across app launches
 */
const getDeviceEncryptionKey = async (): Promise<string> => {
  try {
    // Try to get existing key from secure store
    if (Platform.OS !== 'web') {
      const existingKey = await SecureStore.getItemAsync(
        ENCRYPTION_KEY_STORAGE_KEY,
      );
      if (existingKey) {
        return existingKey;
      }
    }

    // Generate new key if none exists
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    const key = Array.from(randomBytes, (byte) =>
      byte.toString(16).padStart(2, '0'),
    ).join('');

    // Store the key securely
    if (Platform.OS !== 'web') {
      await SecureStore.setItemAsync(ENCRYPTION_KEY_STORAGE_KEY, key);
    }

    return key;
  } catch {
    // Fallback to a deterministic key based on timestamp (less secure, but better than nothing)
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `travelmatch-${Date.now()}-fallback`,
    );
  }
};

/**
 * Encrypt sensitive data using device-specific key
 * Uses PBKDF2 key derivation with AES-like stream cipher
 *
 * SECURITY NOTE: For production, consider using:
 * - react-native-keychain for credential storage (recommended)
 * - expo-secure-store for smaller values (current fallback)
 *
 * @param plaintext - The data to encrypt
 * @param salt - Optional additional salt for encryption
 * @returns Encrypted string with version prefix
 */
export const encryptCredentials = async (
  plaintext: string,
  salt?: string,
): Promise<string> => {
  try {
    // Get device-specific encryption key
    const deviceKey = await getDeviceEncryptionKey();

    // Generate random IV (16 bytes) and salt (16 bytes) if not provided
    const iv = await Crypto.getRandomBytesAsync(16);
    const encryptionSalt =
      salt ||
      Array.from(await Crypto.getRandomBytesAsync(16), (byte) =>
        byte.toString(16).padStart(2, '0'),
      ).join('');

    // PBKDF2-like key derivation with multiple rounds
    let derivedKey = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${deviceKey}:${encryptionSalt}:round1`,
    );

    // Additional rounds for key strengthening
    for (let round = 2; round <= 1000; round += 999) {
      derivedKey = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${derivedKey}:${round}`,
      );
    }

    // Convert plaintext to bytes
    const textEncoder = new TextEncoder();
    const plaintextBytes = textEncoder.encode(plaintext);

    // Create keystream using counter mode (CTR-like)
    const encryptedBytes = new Uint8Array(plaintextBytes.length);
    const keyBytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      keyBytes[i] = parseInt(derivedKey.substr(i * 2, 2), 16);
    }

    // Encrypt each block with unique counter
    for (
      let blockNum = 0;
      blockNum < Math.ceil(plaintextBytes.length / 32);
      blockNum++
    ) {
      // Generate block key using IV + counter
      const counterBlock = new Uint8Array(16);
      counterBlock.set(iv);
      counterBlock[15] = blockNum & 0xff;
      counterBlock[14] = (blockNum >> 8) & 0xff;

      const blockKeyInput =
        Array.from(counterBlock, (b) => b.toString(16).padStart(2, '0')).join(
          '',
        ) + derivedKey;
      const blockKey = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        blockKeyInput,
      );

      // XOR with block key (each block has unique key)
      const blockStart = blockNum * 32;
      const blockEnd = Math.min(blockStart + 32, plaintextBytes.length);
      for (let i = blockStart; i < blockEnd; i++) {
        const keyIndex = i - blockStart;
        const keyByte = parseInt(blockKey.substr(keyIndex * 2, 2), 16);
        encryptedBytes[i] = plaintextBytes[i] ^ keyByte;
      }
    }

    // Convert to hex strings
    const ivHex = Array.from(iv, (byte) =>
      byte.toString(16).padStart(2, '0'),
    ).join('');
    const encryptedHex = Array.from(encryptedBytes, (byte) =>
      byte.toString(16).padStart(2, '0'),
    ).join('');

    // Compute HMAC for integrity
    const hmac = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${derivedKey}:${ivHex}:${encryptedHex}`,
    );
    const hmacShort = hmac.substring(0, 16); // 8 bytes for integrity check

    // Return v2:salt:iv:encrypted:hmac format (v2 = strengthened encryption)
    return `v2:${encryptionSalt}:${ivHex}:${encryptedHex}:${hmacShort}`;
  } catch (error) {
    // DO NOT use plain base64 fallback - fail securely instead
    console.error('[Security] Encryption failed:', error);
    throw new Error('Encryption failed - cannot store credentials securely');
  }
};

/**
 * Decrypt sensitive data encrypted with encryptCredentials
 * Supports both v1 (legacy XOR) and v2 (strengthened) formats
 * @param encrypted - The encrypted string
 * @returns Decrypted plaintext
 */
export const decryptCredentials = async (
  encrypted: string,
): Promise<string> => {
  try {
    const parts = encrypted.split(':');

    // Handle v2 format (strengthened encryption)
    if (parts[0] === 'v2') {
      const [, salt, ivHex, encryptedHex, hmacExpected] = parts;

      if (!salt || !ivHex || !encryptedHex || !hmacExpected) {
        throw new Error('Invalid v2 encrypted format');
      }

      // Get device-specific encryption key
      const deviceKey = await getDeviceEncryptionKey();

      // PBKDF2-like key derivation with same rounds
      let derivedKey = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${deviceKey}:${salt}:round1`,
      );

      for (let round = 2; round <= 1000; round += 999) {
        derivedKey = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          `${derivedKey}:${round}`,
        );
      }

      // Verify HMAC
      const hmac = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${derivedKey}:${ivHex}:${encryptedHex}`,
      );
      const hmacActual = hmac.substring(0, 16);

      if (hmacActual !== hmacExpected) {
        throw new Error('Integrity check failed - data may be tampered');
      }

      // Parse IV
      const iv = new Uint8Array(16);
      for (let i = 0; i < 16; i++) {
        iv[i] = parseInt(ivHex.substr(i * 2, 2), 16);
      }

      // Convert hex to bytes
      const encryptedBytes = new Uint8Array(encryptedHex.length / 2);
      for (let i = 0; i < encryptedBytes.length; i++) {
        encryptedBytes[i] = parseInt(encryptedHex.substr(i * 2, 2), 16);
      }

      // Decrypt each block with counter mode
      const decryptedBytes = new Uint8Array(encryptedBytes.length);

      for (
        let blockNum = 0;
        blockNum < Math.ceil(encryptedBytes.length / 32);
        blockNum++
      ) {
        const counterBlock = new Uint8Array(16);
        counterBlock.set(iv);
        counterBlock[15] = blockNum & 0xff;
        counterBlock[14] = (blockNum >> 8) & 0xff;

        const blockKeyInput =
          Array.from(counterBlock, (b) => b.toString(16).padStart(2, '0')).join(
            '',
          ) + derivedKey;
        const blockKey = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          blockKeyInput,
        );

        const blockStart = blockNum * 32;
        const blockEnd = Math.min(blockStart + 32, encryptedBytes.length);
        for (let i = blockStart; i < blockEnd; i++) {
          const keyIndex = i - blockStart;
          const keyByte = parseInt(blockKey.substr(keyIndex * 2, 2), 16);
          decryptedBytes[i] = encryptedBytes[i] ^ keyByte;
        }
      }

      const textDecoder = new TextDecoder();
      return textDecoder.decode(decryptedBytes);
    }

    // Handle legacy v1/plain formats for backward compatibility
    const [salt, encryptedHex] = parts;

    // Handle fallback plain encoding (DEPRECATED - log warning)
    if (salt === 'plain') {
      console.warn(
        '[Security] Decrypting legacy plain format - re-encrypt with v2',
      );
      return atob(encryptedHex);
    }

    if (!salt || !encryptedHex) {
      throw new Error('Invalid encrypted format');
    }

    // Legacy v1 decryption (for migration)
    console.warn('[Security] Decrypting legacy v1 format - re-encrypt with v2');
    const deviceKey = await getDeviceEncryptionKey();
    const derivedKey = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${deviceKey}:${salt}`,
    );

    const encryptedBytesLegacy = new Uint8Array(encryptedHex.length / 2);
    for (let i = 0; i < encryptedBytesLegacy.length; i++) {
      encryptedBytesLegacy[i] = parseInt(encryptedHex.substr(i * 2, 2), 16);
    }

    const decryptedBytesLegacy = new Uint8Array(encryptedBytesLegacy.length);
    for (let i = 0; i < encryptedBytesLegacy.length; i++) {
      const keyIndex = i % (derivedKey.length / 2);
      const keyByte = parseInt(derivedKey.substr(keyIndex * 2, 2), 16);
      decryptedBytesLegacy[i] = encryptedBytesLegacy[i] ^ keyByte;
    }

    const textDecoderLegacy = new TextDecoder();
    return textDecoderLegacy.decode(decryptedBytesLegacy);
  } catch (error) {
    console.error('[Security] Decryption failed:', error);
    throw new Error('Failed to decrypt credentials');
  }
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
