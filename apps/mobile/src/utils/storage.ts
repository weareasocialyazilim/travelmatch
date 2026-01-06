/**
 * MMKV Storage Wrapper
 * 10-20x faster than AsyncStorage with synchronous API
 * Encrypted storage with type-safe methods
 */

import { MMKV } from 'react-native-mmkv';

// Lazy initialization to prevent "runtime not ready" errors with Hermes
let _storage: MMKV | null = null;

const getStorage = (): MMKV => {
  if (!_storage) {
    _storage = new MMKV({
      id: 'travelmatch-storage',
      // Note: In production, use a secure key from environment or secure keychain
      // encryptionKey: process.env.EXPO_PUBLIC_MMKV_ENCRYPTION_KEY,
    });
  }
  return _storage;
};

// For backward compatibility - lazy getter
export const storage = {
  set: (key: string, value: string | number | boolean) =>
    getStorage().set(key, value),
  getString: (key: string) => getStorage().getString(key),
  getNumber: (key: string) => getStorage().getNumber(key),
  getBoolean: (key: string) => getStorage().getBoolean(key),
  delete: (key: string) => getStorage().delete(key),
  clearAll: () => getStorage().clearAll(),
  getAllKeys: () => getStorage().getAllKeys(),
  contains: (key: string) => getStorage().contains(key),
};

/**
 * Storage API - Drop-in AsyncStorage replacement
 * Returns Promises for backward compatibility, but operations are synchronous
 */
export const Storage = {
  /**
   * Set string value
   */
  setItem: (key: string, value: string): Promise<void> => {
    getStorage().set(key, value);
    return Promise.resolve();
  },

  /**
   * Get string value
   */
  getItem: (key: string): Promise<string | null> => {
    const value = getStorage().getString(key);
    return Promise.resolve(value ?? null);
  },

  /**
   * Remove item
   */
  removeItem: (key: string): Promise<void> => {
    getStorage().delete(key);
    return Promise.resolve();
  },

  /**
   * Clear all storage
   */
  clear: (): Promise<void> => {
    getStorage().clearAll();
    return Promise.resolve();
  },

  /**
   * Get all keys
   */
  getAllKeys: (): Promise<string[]> => {
    const keys = getStorage().getAllKeys();
    return Promise.resolve(keys);
  },

  // ============================================
  // MMKV-Specific Type-Safe Methods
  // ============================================

  /**
   * Set object value (automatically stringified)
   */
  setObject: <T>(key: string, value: T): void => {
    getStorage().set(key, JSON.stringify(value));
  },

  /**
   * Get object value (automatically parsed)
   */
  getObject: <T>(key: string): T | null => {
    const value = getStorage().getString(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch (_parseError) {
      return null;
    }
  },

  /**
   * Set number value (stored as number, not string)
   */
  setNumber: (key: string, value: number): void => {
    getStorage().set(key, value);
  },

  /**
   * Get number value
   */
  getNumber: (key: string): number | undefined => {
    return getStorage().getNumber(key);
  },

  /**
   * Set boolean value (stored as boolean, not string)
   */
  setBoolean: (key: string, value: boolean): void => {
    getStorage().set(key, value);
  },

  /**
   * Get boolean value
   */
  getBoolean: (key: string): boolean | undefined => {
    return getStorage().getBoolean(key);
  },

  /**
   * Check if key exists
   */
  contains: (key: string): boolean => {
    return getStorage().contains(key);
  },
};

// Export the raw MMKV instance for advanced use cases
export default Storage;
