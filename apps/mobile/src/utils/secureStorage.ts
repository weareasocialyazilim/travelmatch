/**
 * Secure Storage Service
 * Uses expo-secure-store for sensitive data (tokens)
 * Falls back to AsyncStorage for non-sensitive data
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Check if SecureStore is available
const isSecureStoreAvailable = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
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
    try {
      const available = await isSecureStoreAvailable();
      if (available) {
        await SecureStore.setItemAsync(key, value);
      } else {
        // Fallback to AsyncStorage (web or unavailable)
        await AsyncStorage.setItem(`@secure_${key}`, value);
      }
    } catch (error) {
      // Fallback to AsyncStorage on error
      await AsyncStorage.setItem(`@secure_${key}`, value);
    }
  },

  /**
   * Get a value securely
   */
  getItem: async (key: string): Promise<string | null> => {
    try {
      const available = await isSecureStoreAvailable();
      if (available) {
        return await SecureStore.getItemAsync(key);
      } else {
        return await AsyncStorage.getItem(`@secure_${key}`);
      }
    } catch {
      // Fallback to AsyncStorage on error
      return await AsyncStorage.getItem(`@secure_${key}`);
    }
  },

  /**
   * Delete a value
   */
  deleteItem: async (key: string): Promise<void> => {
    try {
      const available = await isSecureStoreAvailable();
      if (available) {
        await SecureStore.deleteItemAsync(key);
      } else {
        await AsyncStorage.removeItem(`@secure_${key}`);
      }
    } catch {
      // Fallback to AsyncStorage on error
      await AsyncStorage.removeItem(`@secure_${key}`);
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
 */
export const StorageKeys = {
  // SENSITIVE - Must use SecureStore (encrypted, hardware-backed)
  SECURE: {
    ACCESS_TOKEN: 'secure:access_token',
    REFRESH_TOKEN: 'secure:refresh_token',
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
 */
export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: StorageKeys.SECURE.ACCESS_TOKEN,
  REFRESH_TOKEN: StorageKeys.SECURE.REFRESH_TOKEN,
  TOKEN_EXPIRES_AT: StorageKeys.SECURE.TOKEN_EXPIRES_AT,
  USER: StorageKeys.PUBLIC.USER_PROFILE,
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
      const value = await AsyncStorage.getItem(old);
      if (value) {
        await secureStorage.setItem(newKey, value);
        await AsyncStorage.removeItem(old);
        console.log(`✅ Migrated ${old} → ${newKey}`);
      }
    } catch (error) {
      console.error(`❌ Migration failed: ${old}`, error);
    }
  }
}

export default secureStorage;
