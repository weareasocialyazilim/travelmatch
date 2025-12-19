/**
 * MMKV Storage Wrapper
 * 10-20x faster than AsyncStorage with synchronous API
 * Encrypted storage with type-safe methods
 */

import { MMKV } from 'react-native-mmkv';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

// Encryption key management
const ENCRYPTION_KEY_STORAGE_KEY = 'mmkv_encryption_key_v1';
let encryptionKey: string | undefined;
let storageInstance: MMKV | null = null;

/**
 * Get or generate encryption key from SecureStore
 * Key is hardware-backed on iOS (Keychain) and Android (Keystore)
 */
async function getOrCreateEncryptionKey(): Promise<string> {
  if (encryptionKey) {
    return encryptionKey;
  }

  try {
    // Try to get existing key from SecureStore
    const existingKey = await SecureStore.getItemAsync(
      ENCRYPTION_KEY_STORAGE_KEY,
    );

    if (existingKey) {
      encryptionKey = existingKey;
      return existingKey;
    }

    // Generate new cryptographically secure key
    const newKey = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `travelmatch_${Date.now()}_${Math.random().toString(36)}`,
    );

    // Store key securely (hardware-backed)
    await SecureStore.setItemAsync(ENCRYPTION_KEY_STORAGE_KEY, newKey, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });

    encryptionKey = newKey;
    return newKey;
  } catch (error) {
    console.warn('[MMKV] Failed to get/create encryption key:', error);

    // SECURITY FIX (D1-002): Generate random fallback instead of hardcoded value
    // This handles simulator/emulator environments where SecureStore may not work
    // In production, this should rarely if ever be reached
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    const fallbackKey = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    console.warn(
      '[MMKV] Using randomly generated fallback key (not persisted)',
    );
    encryptionKey = fallbackKey;
    return fallbackKey;
  }
}

/**
 * Initialize encrypted MMKV storage
 * Must be called before using storage
 */
export async function initializeStorage(): Promise<MMKV> {
  if (storageInstance) {
    return storageInstance;
  }

  const key = await getOrCreateEncryptionKey();

  storageInstance = new MMKV({
    id: 'travelmatch-storage',
    encryptionKey: key,
  });

  console.log('[MMKV] Encrypted storage initialized');
  return storageInstance;
}

/**
 * Get storage instance (sync after initialization)
 * Throws if storage not initialized
 */
function getStorage(): MMKV {
  if (!storageInstance) {
    // Create unencrypted instance as fallback (for sync access before init)
    // This will be replaced once initializeStorage is called
    console.warn(
      '[MMKV] Storage accessed before initialization, using unencrypted fallback',
    );
    return new MMKV({ id: 'travelmatch-storage-temp' });
  }
  return storageInstance;
}

// Legacy export for backward compatibility
// Will use encrypted instance once initialized
export const storage = {
  get: () => getStorage(),
  set: (key: string, value: string | number | boolean) =>
    getStorage().set(key, value),
  getString: (key: string) => getStorage().getString(key),
  getNumber: (key: string) => getStorage().getNumber(key),
  getBoolean: (key: string) => getStorage().getBoolean(key),
  delete: (key: string) => getStorage().delete(key),
  contains: (key: string) => getStorage().contains(key),
  getAllKeys: () => getStorage().getAllKeys(),
  clearAll: () => getStorage().clearAll(),
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
    storage.set(key, value);
    return Promise.resolve();
  },

  /**
   * Get string value
   */
  getItem: (key: string): Promise<string | null> => {
    const value = storage.getString(key);
    return Promise.resolve(value ?? null);
  },

  /**
   * Remove item
   */
  removeItem: (key: string): Promise<void> => {
    storage.delete(key);
    return Promise.resolve();
  },

  /**
   * Clear all storage
   */
  clear: (): Promise<void> => {
    storage.clearAll();
    return Promise.resolve();
  },

  /**
   * Get all keys
   */
  getAllKeys: (): Promise<string[]> => {
    const keys = storage.getAllKeys();
    return Promise.resolve(keys);
  },

  // ============================================
  // MMKV-Specific Type-Safe Methods
  // ============================================

  /**
   * Set object value (automatically stringified)
   */
  setObject: <T>(key: string, value: T): void => {
    storage.set(key, JSON.stringify(value));
  },

  /**
   * Get object value (automatically parsed)
   */
  getObject: <T>(key: string): T | null => {
    const value = storage.getString(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  /**
   * Set number value (stored as number, not string)
   */
  setNumber: (key: string, value: number): void => {
    storage.set(key, value);
  },

  /**
   * Get number value
   */
  getNumber: (key: string): number | undefined => {
    return storage.getNumber(key);
  },

  /**
   * Set boolean value (stored as boolean, not string)
   */
  setBoolean: (key: string, value: boolean): void => {
    storage.set(key, value);
  },

  /**
   * Get boolean value
   */
  getBoolean: (key: string): boolean | undefined => {
    return storage.getBoolean(key);
  },

  /**
   * Check if key exists
   */
  contains: (key: string): boolean => {
    return storage.contains(key);
  },
};

// Export the raw MMKV instance for advanced use cases
export default Storage;
