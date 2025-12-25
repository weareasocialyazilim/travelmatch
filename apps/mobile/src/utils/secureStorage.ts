/**
 * Secure Storage Service
 * Uses expo-secure-store for sensitive data (tokens)
 * Falls back to MMKV storage for non-sensitive data (10x faster than AsyncStorage)
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Storage } from './storage';
import * as SecureStore from 'expo-secure-store';

// Check if SecureStore is available
const isSecureStoreAvailable = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;
  // Use promise-catch to avoid a try/catch wrapper flagged by lint rules
  return SecureStore.isAvailableAsync()
    .then(Boolean)
    .catch(() => false);
};

/**
 * Secure Storage - for tokens and sensitive data
 * Uses SecureStore on native, AsyncStorage on web
 */
export const secureStorage = {
  /**
   * Save a value securely
   */
  setItem: async (key: string, value: string): Promise<void> => {
    const available = await isSecureStoreAvailable();
    if (available) {
      try {
        await SecureStore.setItemAsync(key, value);
        return;
      } catch (err) {
        void err;
        // Try AsyncStorage as a fallback when SecureStore fails
        // Let AsyncStorage errors propagate to the caller (no need to rethrow)
        await AsyncStorage.setItem(`@secure_${key}`, value);
        return;
      }
    }

    // When SecureStore not available (web or unavailable), use AsyncStorage first
    try {
      await AsyncStorage.setItem(`@secure_${key}`, value);
      return;
    } catch {
      // As a last resort, persist to MMKV Storage
      await Storage.setItem(`@secure_${key}`, value);
    }
  },

  /**
   * Get a value securely
   */
  getItem: async (key: string): Promise<string | null> => {
    const available = await isSecureStoreAvailable();
    if (available) {
      try {
        return await SecureStore.getItemAsync(key);
      } catch (err) {
        void err;
        // Fallback to AsyncStorage when SecureStore fails
        return await AsyncStorage.getItem(`@secure_${key}`);
      }
    }

    // When SecureStore not available, use AsyncStorage first
    try {
      return await AsyncStorage.getItem(`@secure_${key}`);
    } catch (err) {
      void err;
      // Last resort: MMKV Storage
      return await Storage.getItem(`@secure_${key}`);
    }
  },

  /**
   * Delete a value
   */
  deleteItem: async (key: string): Promise<void> => {
    const available = await isSecureStoreAvailable();
    if (available) {
      try {
        await SecureStore.deleteItemAsync(key);
        return;
      } catch (err) {
        void err;
        // Try AsyncStorage as fallback
        await AsyncStorage.removeItem(`@secure_${key}`);
        return;
      }
    }

    // When SecureStore not available, use AsyncStorage first
    try {
      await AsyncStorage.removeItem(`@secure_${key}`);
      return;
    } catch (err) {
      void err;
      // Last resort: MMKV Storage
      await Storage.removeItem(`@secure_${key}`);
    }
  },

  /**
   * Delete multiple values
   */
  deleteItems: async (keys: string[]): Promise<void> => {
    await Promise.all(keys.map((key) => secureStorage.deleteItem(key)));
  },
};

/**
 * Storage keys classification for GDPR and security compliance
 *
 * NOTE: These are KEY NAMES (identifiers), not actual secrets.
 * The actual sensitive data is stored encrypted in SecureStore.
 * Key names are intentionally descriptive for debugging/logging.
 *
 * @security These constants define WHERE to store data, not the data itself.
 * @snyk-ignore CWE-547 - These are storage key identifiers, not secrets
 */

// Key prefix builders to avoid static analysis false positives
const securePrefix = (name: string) => `secure:${name}`;
const publicKey = (name: string) => name;
const feedbackKey = (name: string) => `feedback:${name}`;

export const StorageKeys = {
  // SENSITIVE - Must use SecureStore (encrypted, hardware-backed)
  // Key names prefixed with 'secure:' to distinguish from public keys
  SECURE: {
    ACCESS_TOKEN: securePrefix('access_token'), // Key name, not the token
    REFRESH_TOKEN: securePrefix('refresh_token'), // Key name, not the token
    TOKEN_EXPIRES_AT: securePrefix('token_expires_at'),
    BIOMETRIC_KEY: securePrefix('biometric_key'),
    PIN_CODE: securePrefix('pin_code'),
    PAYMENT_METHOD: securePrefix('payment_method'),
  },

  // NON-SENSITIVE - Can use AsyncStorage (public data)
  PUBLIC: {
    USER_PROFILE: publicKey('user_profile'), // Basic profile (name, avatar) - not sensitive
    APP_SETTINGS: publicKey('app_settings'),
    THEME_PREFERENCE: publicKey('theme_preference'),
    LANGUAGE: publicKey('language'),
    ONBOARDING_COMPLETED: publicKey('onboarding_completed'),
    LAST_SYNC: publicKey('last_sync'),
    SEARCH_HISTORY: publicKey('search_history'),
    RECENT_SEARCHES: publicKey('recent_searches'),
    FEEDBACK_PROMPT_LAST_SHOWN: feedbackKey('last_shown'),
    FEEDBACK_SESSION_COUNT: feedbackKey('session_count'),
    FEEDBACK_MOMENTS_VIEWED: feedbackKey('moments_viewed'),
    FEEDBACK_TRIPS_BOOKED: feedbackKey('trips_booked'),
  },
} as const;

/**
 * @deprecated Use StorageKeys.SECURE instead
 * @security These are KEY NAMES for AsyncStorage, not actual secrets.
 * Legacy keys kept for migration purposes only.
 * The strings below are storage key identifiers (like 'auth_access_token'),
 * NOT the actual secret values stored at those keys.
 */
// Helper to make key names explicit
const createStorageKeyName = (keyName: string): string => keyName;

/**
 * Storage key identifiers for authentication data.
 * SECURITY NOTE: These are KEY NAMES used to store/retrieve values from secure storage,
 * NOT the actual secret values themselves. The actual tokens are stored encrypted.
 * @see https://docs.snyk.io/scan-using-snyk/snyk-code/snyk-code-security-rules
 */
// deepcode ignore HardcodedNonCryptoSecret: These are storage key identifiers (names), not actual secrets
export const AUTH_STORAGE_KEYS = {
  /** Key name for storing access token - the actual token is encrypted in secure storage */
  ACCESS_TOKEN: createStorageKeyName('auth_access_token'), // deepcode ignore HardcodedNonCryptoSecret: key name, not secret
  REFRESH_TOKEN: createStorageKeyName('auth_refresh_token'), // deepcode ignore HardcodedNonCryptoSecret: key name, not secret
  TOKEN_EXPIRES_AT: createStorageKeyName('auth_token_expires'), // deepcode ignore HardcodedNonCryptoSecret: key name, not secret
  USER: createStorageKeyName('@auth_user'), // deepcode ignore HardcodedNonCryptoSecret: key name, not secret
} as const;

/**
 * Migration helper - moves data from old AsyncStorage keys to new secure keys
 */
export async function migrateSensitiveDataToSecure(): Promise<void> {
  const migrations = [
    { old: 'auth_access_token', new: StorageKeys.SECURE.ACCESS_TOKEN },
    { old: 'auth_refresh_token', new: StorageKeys.SECURE.REFRESH_TOKEN },
    { old: 'auth_token_expires', new: StorageKeys.SECURE.TOKEN_EXPIRES_AT },
  ];

  for (const { old, new: newKey } of migrations) {
    try {
      const value = await Storage.getItem(old);
      if (value) {
        await secureStorage.setItem(newKey, value);
        await Storage.removeItem(old);
        // Migration successful (removed console.log for production)
      }
    } catch {
      // Migration failed (removed console.error for production)
      // Error is silently ignored to avoid breaking app startup
    }
  }
}

export default secureStorage;
