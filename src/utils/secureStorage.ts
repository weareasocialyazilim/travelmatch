/**
 * Secure Storage Service
 * Uses expo-secure-store for sensitive data (tokens)
 * Falls back to AsyncStorage for non-sensitive data
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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
 * Storage keys for auth
 */
export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  TOKEN_EXPIRES_AT: 'auth_token_expires',
  USER: '@auth_user', // Non-sensitive, uses AsyncStorage
};

export default secureStorage;
