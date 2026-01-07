/**
 * Tests for secureStorage utility
 * Target: 85%+ coverage
 *
 * Note: This tests the observable behavior of secureStorage since the isSecureStoreAvailable
 * function is internal. We test through different platform and availability scenarios.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { secureStorage, AUTH_STORAGE_KEYS } from '@/utils/secureStorage';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  isAvailableAsync: jest.fn(),
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const mockPlatform = { OS: 'ios' };
jest.mock('react-native/Libraries/Utilities/Platform', () => mockPlatform, {
  virtual: true,
});

describe('secureStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPlatform.OS = 'ios';
  });

  describe('AUTH_STORAGE_KEYS', () => {
    it('should export all required auth storage keys', () => {
      // New API keys
      expect(AUTH_STORAGE_KEYS.ACCESS_KEY).toBe('auth_access_key');
      expect(AUTH_STORAGE_KEYS.REFRESH_KEY).toBe('auth_refresh_key');
      expect(AUTH_STORAGE_KEYS.EXPIRES_AT).toBe('auth_expires_at');
      expect(AUTH_STORAGE_KEYS.USER_REF).toBe('@auth_user_ref');
      // Backward compatibility aliases
      expect(AUTH_STORAGE_KEYS.ACCESS_TOKEN).toBe('auth_access_key');
      expect(AUTH_STORAGE_KEYS.REFRESH_TOKEN).toBe('auth_refresh_key');
      expect(AUTH_STORAGE_KEYS.TOKEN_EXPIRES_AT).toBe('auth_expires_at');
      expect(AUTH_STORAGE_KEYS.USER).toBe('@auth_user_ref');
    });

    it('should have consistent key naming for secure keys', () => {
      const secureKeys = [
        AUTH_STORAGE_KEYS.ACCESS_KEY,
        AUTH_STORAGE_KEYS.REFRESH_KEY,
        AUTH_STORAGE_KEYS.EXPIRES_AT,
      ];

      secureKeys.forEach((key) => {
        expect(key).toMatch(/^auth_/);
        expect(key).not.toMatch(/^@/);
      });
    });

    it('should mark USER_REF key for AsyncStorage with @ prefix', () => {
      expect(AUTH_STORAGE_KEYS.USER_REF).toMatch(/^@/);
    });
  });

  describe('setItem - SecureStore available', () => {
    beforeEach(() => {
      (SecureStore.isAvailableAsync as jest.Mock).mockResolvedValue(true);
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
    });

    it('should store item in SecureStore when available', async () => {
      await secureStorage.setItem('test_key', 'test_value');

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'test_key',
        'test_value',
      );
    });

    it('should store auth tokens in SecureStore', async () => {
      await secureStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, 'token_123');

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        AUTH_STORAGE_KEYS.ACCESS_TOKEN,
        'token_123',
      );
    });
  });

  describe('setItem - SecureStore not available', () => {
    beforeEach(() => {
      (SecureStore.isAvailableAsync as jest.Mock).mockResolvedValue(false);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    });

    it('should fallback to AsyncStorage when SecureStore not available', async () => {
      await secureStorage.setItem('test_key', 'test_value');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@secure_test_key',
        'test_value',
      );
    });

    it('should prefix keys with @secure_ when using AsyncStorage', async () => {
      await secureStorage.setItem('my_key', 'my_value');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@secure_my_key',
        'my_value',
      );
    });
  });

  describe('setItem - web platform', () => {
    beforeEach(() => {
      mockPlatform.OS = 'web';
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    });

    it('should use AsyncStorage on web platform', async () => {
      await secureStorage.setItem('web_key', 'web_value');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@secure_web_key',
        'web_value',
      );
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });
  });

  describe('setItem - error handling', () => {
    it('should fallback to AsyncStorage when SecureStore throws error', async () => {
      (SecureStore.isAvailableAsync as jest.Mock).mockResolvedValue(true);
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(
        new Error('SecureStore error'),
      );
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await secureStorage.setItem('test_key', 'test_value');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@secure_test_key',
        'test_value',
      );
    });

    it('should throw if both SecureStore and AsyncStorage fail', async () => {
      (SecureStore.isAvailableAsync as jest.Mock).mockResolvedValue(true);
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(
        new Error('SecureStore error'),
      );
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
        new Error('AsyncStorage error'),
      );

      await expect(
        secureStorage.setItem('test_key', 'test_value'),
      ).rejects.toThrow('AsyncStorage error');
    });
  });

  describe('getItem - SecureStore available', () => {
    beforeEach(() => {
      (SecureStore.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    });

    it('should retrieve item from SecureStore', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('stored_value');

      const result = await secureStorage.getItem('test_key');

      expect(result).toBe('stored_value');
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('test_key');
    });

    it('should return null when key does not exist', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const result = await secureStorage.getItem('nonexistent');

      expect(result).toBeNull();
    });

    it('should retrieve auth tokens from SecureStore', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
        'refresh_token_456',
      );

      const result = await secureStorage.getItem(
        AUTH_STORAGE_KEYS.REFRESH_TOKEN,
      );

      expect(result).toBe('refresh_token_456');
    });
  });

  describe('getItem - SecureStore not available', () => {
    beforeEach(() => {
      (SecureStore.isAvailableAsync as jest.Mock).mockResolvedValue(false);
    });

    it('should retrieve from AsyncStorage when SecureStore not available', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('async_value');

      const result = await secureStorage.getItem('test_key');

      expect(result).toBe('async_value');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@secure_test_key');
    });

    it('should return null from AsyncStorage when key does not exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await secureStorage.getItem('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getItem - error handling', () => {
    it('should fallback to AsyncStorage when SecureStore throws error', async () => {
      (SecureStore.isAvailableAsync as jest.Mock).mockResolvedValue(true);
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(
        new Error('SecureStore error'),
      );
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('fallback_value');

      const result = await secureStorage.getItem('test_key');

      expect(result).toBe('fallback_value');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@secure_test_key');
    });

    it('should handle isAvailableAsync throwing error', async () => {
      (SecureStore.isAvailableAsync as jest.Mock).mockRejectedValue(
        new Error('Availability check failed'),
      );
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('async_fallback');

      const result = await secureStorage.getItem('test_key');

      expect(result).toBe('async_fallback');
    });
  });

  describe('deleteItem - SecureStore available', () => {
    beforeEach(() => {
      (SecureStore.isAvailableAsync as jest.Mock).mockResolvedValue(true);
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
    });

    it('should delete from SecureStore when available', async () => {
      await secureStorage.deleteItem('test_key');

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('test_key');
    });

    it('should delete auth tokens from SecureStore', async () => {
      await secureStorage.deleteItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        AUTH_STORAGE_KEYS.ACCESS_TOKEN,
      );
    });
  });

  describe('deleteItem - SecureStore not available', () => {
    beforeEach(() => {
      (SecureStore.isAvailableAsync as jest.Mock).mockResolvedValue(false);
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    });

    it('should delete from AsyncStorage when SecureStore not available', async () => {
      await secureStorage.deleteItem('test_key');

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@secure_test_key');
    });
  });

  describe('deleteItem - error handling', () => {
    it('should fallback to AsyncStorage when SecureStore throws error', async () => {
      (SecureStore.isAvailableAsync as jest.Mock).mockResolvedValue(true);
      (SecureStore.deleteItemAsync as jest.Mock).mockRejectedValue(
        new Error('SecureStore delete error'),
      );
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await secureStorage.deleteItem('test_key');

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@secure_test_key');
    });
  });

  describe('deleteItems', () => {
    beforeEach(() => {
      (SecureStore.isAvailableAsync as jest.Mock).mockResolvedValue(true);
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
    });

    it('should delete multiple items', async () => {
      const keys = ['key1', 'key2', 'key3'];
      await secureStorage.deleteItems(keys);

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(3);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('key1');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('key2');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('key3');
    });

    it('should delete all auth tokens at once', async () => {
      const authKeys = [
        AUTH_STORAGE_KEYS.ACCESS_TOKEN,
        AUTH_STORAGE_KEYS.REFRESH_TOKEN,
        AUTH_STORAGE_KEYS.TOKEN_EXPIRES_AT,
      ];

      await secureStorage.deleteItems(authKeys);

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(3);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        AUTH_STORAGE_KEYS.ACCESS_TOKEN,
      );
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        AUTH_STORAGE_KEYS.REFRESH_TOKEN,
      );
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        AUTH_STORAGE_KEYS.TOKEN_EXPIRES_AT,
      );
    });

    it('should handle empty array', async () => {
      await secureStorage.deleteItems([]);

      expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
    });

    it('should delete items even if some fail', async () => {
      (SecureStore.deleteItemAsync as jest.Mock)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Delete failed'))
        .mockResolvedValueOnce(undefined);
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      const keys = ['key1', 'key2', 'key3'];
      await secureStorage.deleteItems(keys);

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(3);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@secure_key2');
    });
  });

  describe('Integration scenarios', () => {
    beforeEach(() => {
      (SecureStore.isAvailableAsync as jest.Mock).mockResolvedValue(true);
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
      (SecureStore.getItemAsync as jest.Mock).mockImplementation(
        (key: string) => {
          const storage: Record<string, string> = {
            [AUTH_STORAGE_KEYS.ACCESS_TOKEN]: 'access_123',
            [AUTH_STORAGE_KEYS.REFRESH_TOKEN]: 'refresh_456',
          };
          return Promise.resolve(storage[key] || null);
        },
      );
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
    });

    it('should handle full auth flow: store, retrieve, delete tokens', async () => {
      // Mock SecureStore to store and retrieve values
      const storedValues: Record<string, string> = {};
      (SecureStore.setItemAsync as jest.Mock).mockImplementation(
        async (key: string, value: string) => {
          storedValues[key] = value;
        },
      );
      (SecureStore.getItemAsync as jest.Mock).mockImplementation(
        async (key: string) => storedValues[key] || null,
      );
      // AsyncStorage should return null so SecureStore is checked
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      // Store tokens
      await secureStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, 'access_123');
      await secureStorage.setItem(
        AUTH_STORAGE_KEYS.REFRESH_TOKEN,
        'refresh_456',
      );

      // Retrieve tokens
      const accessToken = await secureStorage.getItem(
        AUTH_STORAGE_KEYS.ACCESS_TOKEN,
      );
      const refreshToken = await secureStorage.getItem(
        AUTH_STORAGE_KEYS.REFRESH_TOKEN,
      );

      expect(accessToken).toBe('access_123');
      expect(refreshToken).toBe('refresh_456');

      // Clear all auth data
      await secureStorage.deleteItems([
        AUTH_STORAGE_KEYS.ACCESS_TOKEN,
        AUTH_STORAGE_KEYS.REFRESH_TOKEN,
        AUTH_STORAGE_KEYS.TOKEN_EXPIRES_AT,
      ]);

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(3);
    });

    it('should handle token refresh scenario', async () => {
      // Mock SecureStore to store and retrieve values
      const storedValues: Record<string, string> = {
        [AUTH_STORAGE_KEYS.ACCESS_TOKEN]: 'old_token',
      };
      (SecureStore.getItemAsync as jest.Mock).mockImplementation(
        async (key: string) => storedValues[key] || null,
      );
      (SecureStore.setItemAsync as jest.Mock).mockImplementation(
        async (key: string, value: string) => {
          storedValues[key] = value;
        },
      );
      // AsyncStorage should return null so SecureStore is checked
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      // Get old token
      const oldToken = await secureStorage.getItem(
        AUTH_STORAGE_KEYS.ACCESS_TOKEN,
      );
      expect(oldToken).toBe('old_token');

      // Update with new token
      storedValues[AUTH_STORAGE_KEYS.ACCESS_TOKEN] = 'new_token';
      await secureStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, 'new_token');

      // Verify new token
      const newToken = await secureStorage.getItem(
        AUTH_STORAGE_KEYS.ACCESS_TOKEN,
      );
      expect(newToken).toBe('new_token');
    });

    it('should handle concurrent operations', async () => {
      // AsyncStorage should return null so SecureStore is checked for getItem
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const operations = [
        secureStorage.setItem('key1', 'value1'),
        secureStorage.setItem('key2', 'value2'),
        secureStorage.getItem('key3'),
        secureStorage.deleteItem('key4'),
      ];

      await Promise.all(operations);

      expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(2);
      expect(SecureStore.getItemAsync).toHaveBeenCalledTimes(1);
      // deleteItem calls both AsyncStorage.removeItem and SecureStore.deleteItemAsync
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('Platform-specific behavior', () => {
    it('should handle Android platform', async () => {
      mockPlatform.OS = 'android';
      (SecureStore.isAvailableAsync as jest.Mock).mockResolvedValue(true);
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      await secureStorage.setItem('android_key', 'android_value');

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'android_key',
        'android_value',
      );
    });

    it('should handle iOS platform', async () => {
      mockPlatform.OS = 'ios';
      (SecureStore.isAvailableAsync as jest.Mock).mockResolvedValue(true);
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      await secureStorage.setItem('ios_key', 'ios_value');

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'ios_key',
        'ios_value',
      );
    });
  });
});
