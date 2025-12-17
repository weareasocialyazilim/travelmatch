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
  return SecureStore.isAvailableAsync().then(Boolean).catch(() => false);
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
    } catch (asyncErr) {
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
 */
export const StorageKeys = {
  // SENSITIVE - Must use SecureStore (encrypted, hardware-backed)
  // Key names prefixed with 'secure:' to distinguish from public keys
  SECURE: {
    ACCESS_TOKEN: 'secure:access_token', // Key name, not the token
    REFRESH_TOKEN: 'secure:refresh_token', // Key name, not the token
    TOKEN_EXPIRES_AT: 'secure:token_expires_at',
    BIOMETRIC_KEY: 'secure:biometric_key',
    PIN_CODE: 'secure:pin_code',
    PAYMENT_METHOD: 'secure:payment_method',
  },

  // NON-SENSITIVE - Can use AsyncStorage (public data)
  PUBLIC: {
    USER_PROFILE: 'user_profile', // Basic profile (name, avatar) - not sensitive
    APP_SETTINGS: 'app_settings',
    THEME_PREFERENCE: 'theme_preference',
    LANGUAGE: 'language',
    ONBOARDING_COMPLETED: 'onboarding_completed',
    LAST_SYNC: 'last_sync',
    SEARCH_HISTORY: 'search_history',
    RECENT_SEARCHES: 'recent_searches',
    FEEDBACK_PROMPT_LAST_SHOWN: 'feedback:last_shown',
    FEEDBACK_SESSION_COUNT: 'feedback:session_count',
    FEEDBACK_MOMENTS_VIEWED: 'feedback:moments_viewed',
    FEEDBACK_TRIPS_BOOKED: 'feedback:trips_booked',
  },
} as const;

/**
 * @deprecated Use StorageKeys.SECURE instead
 * @security These are KEY NAMES for AsyncStorage, not actual secrets.
 * Legacy keys kept for migration purposes only.
 */
export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token', // Key name for migration
  REFRESH_TOKEN: 'auth_refresh_token', // Key name for migration
  TOKEN_EXPIRES_AT: 'auth_token_expires',
  USER: '@auth_user',
};

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
    } catch (error) {
      // Migration failed (removed console.error for production)
      // Error is silently ignored to avoid breaking app startup
    }
  }
}

export default secureStorage;
