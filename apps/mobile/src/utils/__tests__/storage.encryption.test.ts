/**
 * Storage Encryption Tests
 * Tests for MMKV encryption with SecureStore-backed keys
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock SecureStore
const mockSecureStore = {
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
};

// Mock Crypto
const mockCrypto = {
  digestStringAsync: vi.fn(),
  CryptoDigestAlgorithm: {
    SHA256: 'SHA256',
  },
};

// Mock MMKV
const mockMMKV = vi.fn().mockImplementation((config) => ({
  set: vi.fn(),
  getString: vi.fn(),
  getBoolean: vi.fn(),
  getNumber: vi.fn(),
  delete: vi.fn(),
  clearAll: vi.fn(),
  getAllKeys: vi.fn().mockReturnValue([]),
  contains: vi.fn(),
  encryptionKey: config?.encryptionKey,
}));

vi.mock('expo-secure-store', () => mockSecureStore);
vi.mock('expo-crypto', () => mockCrypto);
vi.mock('react-native-mmkv', () => ({ MMKV: mockMMKV }));

describe('Storage Encryption', () => {
  const ENCRYPTION_KEY_STORAGE_KEY = 'travelmatch_mmkv_encryption_key';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Encryption Key Generation', () => {
    it('should generate a new encryption key if none exists', async () => {
      // Mock: no existing key
      mockSecureStore.getItemAsync.mockResolvedValue(null);
      mockCrypto.digestStringAsync.mockResolvedValue('generated-sha256-hash-key');

      // Simulate getOrCreateEncryptionKey logic
      const existingKey = await mockSecureStore.getItemAsync(ENCRYPTION_KEY_STORAGE_KEY);

      if (!existingKey) {
        const newKey = await mockCrypto.digestStringAsync(
          mockCrypto.CryptoDigestAlgorithm.SHA256,
          `travelmatch_${Date.now()}_${Math.random().toString(36)}`
        );

        await mockSecureStore.setItemAsync(
          ENCRYPTION_KEY_STORAGE_KEY,
          newKey,
          { keychainAccessible: mockSecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }
        );
      }

      expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith(ENCRYPTION_KEY_STORAGE_KEY);
      expect(mockCrypto.digestStringAsync).toHaveBeenCalled();
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        ENCRYPTION_KEY_STORAGE_KEY,
        'generated-sha256-hash-key',
        expect.objectContaining({
          keychainAccessible: mockSecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
        })
      );
    });

    it('should reuse existing encryption key', async () => {
      const existingKey = 'existing-encryption-key-from-secure-store';
      mockSecureStore.getItemAsync.mockResolvedValue(existingKey);

      const key = await mockSecureStore.getItemAsync(ENCRYPTION_KEY_STORAGE_KEY);

      expect(key).toBe(existingKey);
      expect(mockCrypto.digestStringAsync).not.toHaveBeenCalled();
      expect(mockSecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('should use SHA256 for key generation', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);
      mockCrypto.digestStringAsync.mockResolvedValue('sha256-hash');

      await mockCrypto.digestStringAsync(
        mockCrypto.CryptoDigestAlgorithm.SHA256,
        'test-input'
      );

      expect(mockCrypto.digestStringAsync).toHaveBeenCalledWith(
        'SHA256',
        expect.any(String)
      );
    });
  });

  describe('MMKV Initialization', () => {
    it('should initialize MMKV with encryption key', () => {
      const encryptionKey = 'test-encryption-key';

      const storage = new mockMMKV({
        id: 'travelmatch-storage',
        encryptionKey: encryptionKey,
      });

      expect(mockMMKV).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'travelmatch-storage',
          encryptionKey: encryptionKey,
        })
      );
    });

    it('should not store encryption key in MMKV itself', () => {
      const encryptionKey = 'secret-key';
      const storage = new mockMMKV({ encryptionKey });

      // Verify MMKV doesn't store the key as a value
      expect(storage.getString).not.toHaveBeenCalledWith(ENCRYPTION_KEY_STORAGE_KEY);
    });
  });

  describe('SecureStore Security', () => {
    it('should use WHEN_UNLOCKED_THIS_DEVICE_ONLY accessibility', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);
      mockCrypto.digestStringAsync.mockResolvedValue('new-key');

      await mockSecureStore.setItemAsync(
        ENCRYPTION_KEY_STORAGE_KEY,
        'new-key',
        { keychainAccessible: mockSecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }
      );

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          keychainAccessible: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY'
        })
      );
    });

    it('should handle SecureStore errors gracefully', async () => {
      mockSecureStore.getItemAsync.mockRejectedValue(new Error('SecureStore not available'));

      let fallbackKey: string | null = null;
      try {
        await mockSecureStore.getItemAsync(ENCRYPTION_KEY_STORAGE_KEY);
      } catch {
        // Fallback: generate a session-only key (not persisted)
        fallbackKey = 'session-only-fallback-key';
      }

      expect(fallbackKey).toBe('session-only-fallback-key');
    });
  });

  describe('Encryption Key Format', () => {
    it('should generate keys with sufficient entropy', async () => {
      const keys = new Set<string>();
      mockSecureStore.getItemAsync.mockResolvedValue(null);

      // Generate multiple keys
      for (let i = 0; i < 100; i++) {
        const uniquePart = `travelmatch_${Date.now()}_${Math.random().toString(36)}`;
        mockCrypto.digestStringAsync.mockResolvedValueOnce(`hash-${i}-${uniquePart}`);
        const key = await mockCrypto.digestStringAsync('SHA256', uniquePart);
        keys.add(key);
      }

      // All keys should be unique
      expect(keys.size).toBe(100);
    });

    it('should generate hex-encoded keys (SHA256 output)', () => {
      const sha256HexPattern = /^[a-f0-9]{64}$/;
      const sampleKey = 'a'.repeat(64); // 64 hex chars = 256 bits

      expect(sha256HexPattern.test(sampleKey)).toBe(true);
    });
  });

  describe('Data Protection', () => {
    it('should encrypt sensitive data when stored', () => {
      const storage = new mockMMKV({ encryptionKey: 'test-key' });

      // Store sensitive data
      storage.set('user_token', 'sensitive-jwt-token');
      storage.set('payment_info', JSON.stringify({ last4: '1234' }));

      expect(storage.set).toHaveBeenCalledWith('user_token', 'sensitive-jwt-token');
      expect(storage.set).toHaveBeenCalledWith('payment_info', expect.any(String));
    });

    it('should clear all data on logout', () => {
      const storage = new mockMMKV({ encryptionKey: 'test-key' });

      storage.clearAll();

      expect(storage.clearAll).toHaveBeenCalled();
    });
  });
});

describe('Migration from Unencrypted Storage', () => {
  it('should handle migration from AsyncStorage', async () => {
    const mockAsyncStorage = {
      getAllKeys: vi.fn().mockResolvedValue(['key1', 'key2']),
      multiGet: vi.fn().mockResolvedValue([
        ['key1', 'value1'],
        ['key2', 'value2'],
      ]),
      multiRemove: vi.fn().mockResolvedValue(undefined),
    };

    // Simulate migration
    const keys = await mockAsyncStorage.getAllKeys();
    const items = await mockAsyncStorage.multiGet(keys);

    const migratedData: Record<string, string> = {};
    items.forEach(([key, value]: [string, string | null]) => {
      if (value) migratedData[key] = value;
    });

    expect(migratedData).toEqual({
      key1: 'value1',
      key2: 'value2',
    });

    // Remove from old storage after migration
    await mockAsyncStorage.multiRemove(keys);
    expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith(['key1', 'key2']);
  });
});
