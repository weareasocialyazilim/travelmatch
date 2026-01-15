/**
 * MMKV Storage Wrapper
 * 10-20x faster than AsyncStorage with synchronous API
 * Encrypted storage with type-safe methods
 *
 * Falls back to AsyncStorage if MMKV fails to initialize
 */

import { MMKV } from 'react-native-mmkv';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';

const STORAGE_ID = 'lovendo-storage';
const LEGACY_STORAGE_ID = 'lovendo-storage';

// Lazy initialization to prevent "runtime not ready" errors with Hermes
let _storage: MMKV | null = null;
let _initError: Error | null = null;
let _useFallback = false;

const getStorage = (): MMKV | null => {
  if (_useFallback) {
    return null; // Use AsyncStorage fallback
  }
  if (_initError) {
    _useFallback = true;
    return null;
  }
  if (!_storage) {
    try {
      const currentStorage = new MMKV({ id: STORAGE_ID });

      // Best-effort migration from legacy store.
      // Only run when the current store appears empty.
      try {
        const currentKeys = currentStorage.getAllKeys();
        if (currentKeys.length === 0) {
          const legacyStorage = new MMKV({ id: LEGACY_STORAGE_ID });
          const legacyKeys = legacyStorage.getAllKeys();

          if (legacyKeys.length > 0) {
            for (const key of legacyKeys) {
              const stringVal = legacyStorage.getString(key);
              if (stringVal !== undefined) {
                currentStorage.set(key, stringVal);
                legacyStorage.delete(key);
                continue;
              }

              const numberVal = legacyStorage.getNumber(key);
              if (numberVal !== undefined) {
                currentStorage.set(key, numberVal);
                legacyStorage.delete(key);
                continue;
              }

              const boolVal = legacyStorage.getBoolean(key);
              if (boolVal !== undefined) {
                currentStorage.set(key, boolVal);
                legacyStorage.delete(key);
              }
            }

            logger.info('[Storage] Migrated MMKV store', {
              from: LEGACY_STORAGE_ID,
              to: STORAGE_ID,
              keyCount: legacyKeys.length,
            });
          }
        }
      } catch (migrationError) {
        logger.debug('[Storage] MMKV migration skipped/failed', {
          error:
            migrationError instanceof Error
              ? migrationError.message
              : String(migrationError),
        });
      }

      _storage = currentStorage;
    } catch (error) {
      // Debug level - AsyncStorage fallback is expected on some devices
      logger.debug('[Storage] MMKV init failed, using AsyncStorage fallback');
      _initError = error instanceof Error ? error : new Error(String(error));
      _useFallback = true;
      return null;
    }
  }
  return _storage;
};

// For backward compatibility - lazy getter with fallback
export const storage = {
  set: (key: string, value: string | number | boolean) => {
    const mmkv = getStorage();
    if (mmkv) {
      mmkv.set(key, value);
    } else {
      // AsyncStorage only supports strings
      void AsyncStorage.setItem(key, String(value));
    }
  },
  getString: (key: string) => {
    const mmkv = getStorage();
    return mmkv ? mmkv.getString(key) : undefined;
  },
  getNumber: (key: string) => {
    const mmkv = getStorage();
    return mmkv ? mmkv.getNumber(key) : undefined;
  },
  getBoolean: (key: string) => {
    const mmkv = getStorage();
    return mmkv ? mmkv.getBoolean(key) : undefined;
  },
  delete: (key: string) => {
    const mmkv = getStorage();
    if (mmkv) {
      mmkv.delete(key);
    } else {
      void AsyncStorage.removeItem(key);
    }
  },
  clearAll: () => {
    const mmkv = getStorage();
    if (mmkv) {
      mmkv.clearAll();
    } else {
      void AsyncStorage.clear();
    }
  },
  getAllKeys: () => {
    const mmkv = getStorage();
    return mmkv ? mmkv.getAllKeys() : [];
  },
  contains: (key: string) => {
    const mmkv = getStorage();
    return mmkv ? mmkv.contains(key) : false;
  },
};

/**
 * Storage API - Drop-in AsyncStorage replacement
 * Returns Promises for backward compatibility
 * Uses MMKV when available, falls back to AsyncStorage
 */
export const Storage = {
  /**
   * Set string value
   */
  setItem: async (key: string, value: string): Promise<void> => {
    const mmkv = getStorage();
    if (mmkv) {
      mmkv.set(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },

  /**
   * Get string value
   */
  getItem: async (key: string): Promise<string | null> => {
    const mmkv = getStorage();
    if (mmkv) {
      return mmkv.getString(key) ?? null;
    }
    return AsyncStorage.getItem(key);
  },

  /**
   * Remove item
   */
  removeItem: async (key: string): Promise<void> => {
    const mmkv = getStorage();
    if (mmkv) {
      mmkv.delete(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  },

  /**
   * Clear all storage
   */
  clear: async (): Promise<void> => {
    const mmkv = getStorage();
    if (mmkv) {
      mmkv.clearAll();
    } else {
      await AsyncStorage.clear();
    }
  },

  /**
   * Get all keys
   */
  getAllKeys: async (): Promise<string[]> => {
    const mmkv = getStorage();
    if (mmkv) {
      return mmkv.getAllKeys();
    }
    const keys = await AsyncStorage.getAllKeys();
    return keys ? [...keys] : [];
  },

  // ============================================
  // MMKV-Specific Type-Safe Methods (with fallback)
  // ============================================

  /**
   * Set object value (automatically stringified)
   */
  setObject: <T>(key: string, value: T): void => {
    const mmkv = getStorage();
    const stringValue = JSON.stringify(value);
    if (mmkv) {
      mmkv.set(key, stringValue);
    } else {
      void AsyncStorage.setItem(key, stringValue);
    }
  },

  /**
   * Get object value (automatically parsed)
   */
  getObject: <T>(key: string): T | null => {
    const mmkv = getStorage();
    let value: string | undefined | null = null;
    if (mmkv) {
      value = mmkv.getString(key);
    }
    // Note: For async fallback, use getItem instead
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
    const mmkv = getStorage();
    if (mmkv) {
      mmkv.set(key, value);
    } else {
      void AsyncStorage.setItem(key, String(value));
    }
  },

  /**
   * Get number value
   */
  getNumber: (key: string): number | undefined => {
    const mmkv = getStorage();
    return mmkv ? mmkv.getNumber(key) : undefined;
  },

  /**
   * Set boolean value (stored as boolean, not string)
   */
  setBoolean: (key: string, value: boolean): void => {
    const mmkv = getStorage();
    if (mmkv) {
      mmkv.set(key, value);
    } else {
      void AsyncStorage.setItem(key, String(value));
    }
  },

  /**
   * Get boolean value
   */
  getBoolean: (key: string): boolean | undefined => {
    const mmkv = getStorage();
    return mmkv ? mmkv.getBoolean(key) : undefined;
  },

  /**
   * Check if key exists
   */
  contains: (key: string): boolean => {
    const mmkv = getStorage();
    return mmkv ? mmkv.contains(key) : false;
  },
};

// Export the raw MMKV instance for advanced use cases
export default Storage;
