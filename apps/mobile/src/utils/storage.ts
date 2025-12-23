/**
 * MMKV Storage Wrapper with AsyncStorage Fallback
 * 10-20x faster than AsyncStorage with synchronous API
 * Falls back to AsyncStorage when MMKV/JSI is not available
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Try to import MMKV, but don't fail if it's not available
let MMKV: typeof import('react-native-mmkv').MMKV | null = null;
let mmkvInstance: InstanceType<typeof import('react-native-mmkv').MMKV> | null =
  null;
let isMMKVAvailable = false;

// Try to initialize MMKV - wrapped in function to prevent crashes
function initMMKV(): boolean {
  try {
    const mmkvModule = require('react-native-mmkv');
    if (!mmkvModule?.MMKV) {
      return false;
    }
    MMKV = mmkvModule.MMKV;

    // Test if MMKV can actually be instantiated (JSI must be available)
    if (MMKV) {
      mmkvInstance = new MMKV({ id: 'travelmatch-storage' });
      console.log('[Storage] MMKV initialized successfully');
      return true;
    }
    return false;
  } catch {
    // This is expected in simulator/remote debugger - MMKV requires JSI which is only available on-device
    // Using AsyncStorage fallback is fine for development
    if (__DEV__) {
      console.log(
        '[Storage] Using AsyncStorage fallback (MMKV requires on-device JSI)',
      );
    }
    return false;
  }
}

// Safe MMKV initialization - never throws
isMMKVAvailable = initMMKV();

// In-memory cache for AsyncStorage fallback (for sync-like access)
const memoryCache: Map<string, string | number | boolean> = new Map();
let memoryCacheInitialized = false;

/**
 * Initialize storage - loads AsyncStorage into memory cache if MMKV not available
 */
export async function initializeStorage(): Promise<void> {
  if (isMMKVAvailable && mmkvInstance) {
    console.log('[Storage] Using MMKV');
    return;
  }

  // Load AsyncStorage into memory cache for sync-like access
  if (!memoryCacheInitialized) {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const pairs = await AsyncStorage.multiGet(keys);
      pairs.forEach(([key, value]) => {
        if (value !== null) {
          // Try to parse as JSON, otherwise store as string
          try {
            const parsed = JSON.parse(value);
            memoryCache.set(key, parsed);
          } catch {
            memoryCache.set(key, value);
          }
        }
      });
      memoryCacheInitialized = true;
      console.log(
        '[Storage] AsyncStorage cache initialized with',
        keys.length,
        'keys',
      );
    } catch (error) {
      console.warn('[Storage] Failed to initialize AsyncStorage cache:', error);
    }
  }
}

/**
 * Sync helper - persist memory cache to AsyncStorage
 */
async function persistToAsyncStorage(
  key: string,
  value: string | number | boolean,
): Promise<void> {
  try {
    const stringValue =
      typeof value === 'string' ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, stringValue);
  } catch (error) {
    console.warn('[Storage] Failed to persist to AsyncStorage:', error);
  }
}

/**
 * Storage implementation with MMKV/AsyncStorage abstraction
 */
export const storage = {
  set: (key: string, value: string | number | boolean) => {
    if (isMMKVAvailable && mmkvInstance) {
      mmkvInstance.set(key, value);
    } else {
      memoryCache.set(key, value);
      // Async persist to AsyncStorage (fire and forget)
      persistToAsyncStorage(key, value);
    }
  },

  getString: (key: string): string | undefined => {
    if (isMMKVAvailable && mmkvInstance) {
      return mmkvInstance.getString(key);
    }
    const value = memoryCache.get(key);
    return typeof value === 'string' ? value : undefined;
  },

  getNumber: (key: string): number | undefined => {
    if (isMMKVAvailable && mmkvInstance) {
      return mmkvInstance.getNumber(key);
    }
    const value = memoryCache.get(key);
    return typeof value === 'number' ? value : undefined;
  },

  getBoolean: (key: string): boolean | undefined => {
    if (isMMKVAvailable && mmkvInstance) {
      return mmkvInstance.getBoolean(key);
    }
    const value = memoryCache.get(key);
    return typeof value === 'boolean' ? value : undefined;
  },

  delete: (key: string) => {
    if (isMMKVAvailable && mmkvInstance) {
      mmkvInstance.delete(key);
    } else {
      memoryCache.delete(key);
      AsyncStorage.removeItem(key).catch(() => {});
    }
  },

  contains: (key: string): boolean => {
    if (isMMKVAvailable && mmkvInstance) {
      return mmkvInstance.contains(key);
    }
    return memoryCache.has(key);
  },

  getAllKeys: (): string[] => {
    if (isMMKVAvailable && mmkvInstance) {
      return mmkvInstance.getAllKeys();
    }
    return Array.from(memoryCache.keys());
  },

  clearAll: () => {
    if (isMMKVAvailable && mmkvInstance) {
      mmkvInstance.clearAll();
    } else {
      memoryCache.clear();
      AsyncStorage.clear().catch(() => {});
    }
  },
};

/**
 * Storage API - Drop-in AsyncStorage replacement
 * Returns Promises for backward compatibility
 */
export const Storage = {
  setItem: async (key: string, value: string): Promise<void> => {
    storage.set(key, value);
  },

  getItem: async (key: string): Promise<string | null> => {
    const value = storage.getString(key);
    return value ?? null;
  },

  removeItem: async (key: string): Promise<void> => {
    storage.delete(key);
  },

  clear: async (): Promise<void> => {
    storage.clearAll();
  },

  getAllKeys: async (): Promise<string[]> => {
    return storage.getAllKeys();
  },

  setObject: <T>(key: string, value: T): void => {
    storage.set(key, JSON.stringify(value));
  },

  getObject: <T>(key: string): T | null => {
    const value = storage.getString(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  setNumber: (key: string, value: number): void => {
    storage.set(key, value);
  },

  getNumber: (key: string): number | undefined => {
    return storage.getNumber(key);
  },

  setBoolean: (key: string, value: boolean): void => {
    storage.set(key, value);
  },

  getBoolean: (key: string): boolean | undefined => {
    return storage.getBoolean(key);
  },

  contains: (key: string): boolean => {
    return storage.contains(key);
  },
};

export const isUsingMMKV = (): boolean => isMMKVAvailable;

export default Storage;
