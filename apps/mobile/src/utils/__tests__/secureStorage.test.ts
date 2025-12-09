/**
 * secureStorage - Comprehensive Tests
 * 
 * Tests for secure storage:
 * - SecureStore vs AsyncStorage fallback
 * - Encryption and secure storage
 * - Platform-specific behavior (iOS, Android, Web)
 * - Migration from AsyncStorage to SecureStore
 * - Error handling and fallbacks
 * - Storage keys classification
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {
  secureStorage,
  StorageKeys,
  migrateSensitiveDataToSecure,
} from '../secureStorage';

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

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('secureStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('SecureStore Available', () => {
    beforeEach(() => {
      mockSecureStore.isAvailableAsync.mockResolvedValue(true);
    });

    it('should use SecureStore when available', async () => {
      mockSecureStore.setItemAsync.mockResolvedValue(undefined);

      await secureStorage.setItem('test_key', 'test_value');

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('test_key', 'test_value');
      expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should retrieve from SecureStore when available', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue('secure_value');

      const value = await secureStorage.getItem('test_key');

      expect(value).toBe('secure_value');
      expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith('test_key');
      expect(mockAsyncStorage.getItem).not.toHaveBeenCalled();
    });

    it('should delete from SecureStore when available', async () => {
      mockSecureStore.deleteItemAsync.mockResolvedValue(undefined);

      await secureStorage.deleteItem('test_key');

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('test_key');
      expect(mockAsyncStorage.removeItem).not.toHaveBeenCalled();
    });

    it('should return null when key does not exist', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);

      const value = await secureStorage.getItem('nonexistent');

      expect(value).toBeNull();
    });
  });

  describe('SecureStore Unavailable - Fallback to AsyncStorage', () => {
    beforeEach(() => {
      mockSecureStore.isAvailableAsync.mockResolvedValue(false);
    });

    it('should use AsyncStorage when SecureStore unavailable', async () => {
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      await secureStorage.setItem('test_key', 'test_value');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@secure_test_key',
        'test_value'
      );
      expect(mockSecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('should retrieve from AsyncStorage when SecureStore unavailable', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('async_value');

      const value = await secureStorage.getItem('test_key');

      expect(value).toBe('async_value');
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@secure_test_key');
      expect(mockSecureStore.getItemAsync).not.toHaveBeenCalled();
    });

    it('should delete from AsyncStorage when SecureStore unavailable', async () => {
      mockAsyncStorage.removeItem.mockResolvedValue(undefined);

      await secureStorage.deleteItem('test_key');

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('@secure_test_key');
      expect(mockSecureStore.deleteItemAsync).not.toHaveBeenCalled();
    });
  });

  describe('Web Platform', () => {
    const originalPlatform = Platform.OS;

    beforeAll(() => {
      Object.defineProperty(Platform, 'OS', {
        get: () => 'web',
        configurable: true,
      });
    });

    afterAll(() => {
      Object.defineProperty(Platform, 'OS', {
        get: () => originalPlatform,
        configurable: true,
      });
    });

    it('should use AsyncStorage on web platform', async () => {
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      await secureStorage.setItem('web_key', 'web_value');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('@secure_web_key', 'web_value');
    });
  });

  describe('Error Handling - Fallback to AsyncStorage', () => {
    beforeEach(() => {
      mockSecureStore.isAvailableAsync.mockResolvedValue(true);
    });

    it('should fallback to AsyncStorage on SecureStore write error', async () => {
      mockSecureStore.setItemAsync.mockRejectedValue(new Error('SecureStore error'));
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      await secureStorage.setItem('test_key', 'test_value');

      expect(mockSecureStore.setItemAsync).toHaveBeenCalled();
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@secure_test_key',
        'test_value'
      );
    });

    it('should fallback to AsyncStorage on SecureStore read error', async () => {
      mockSecureStore.getItemAsync.mockRejectedValue(new Error('Read error'));
      mockAsyncStorage.getItem.mockResolvedValue('fallback_value');

      const value = await secureStorage.getItem('test_key');

      expect(value).toBe('fallback_value');
      expect(mockSecureStore.getItemAsync).toHaveBeenCalled();
      expect(mockAsyncStorage.getItem).toHaveBeenCalled();
    });

    it('should fallback to AsyncStorage on SecureStore delete error', async () => {
      mockSecureStore.deleteItemAsync.mockRejectedValue(new Error('Delete error'));
      mockAsyncStorage.removeItem.mockResolvedValue(undefined);

      await secureStorage.deleteItem('test_key');

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalled();
      expect(mockAsyncStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe('Delete Multiple Items', () => {
    beforeEach(() => {
      mockSecureStore.isAvailableAsync.mockResolvedValue(true);
      mockSecureStore.deleteItemAsync.mockResolvedValue(undefined);
    });

    it('should delete multiple items', async () => {
      const keys = ['key1', 'key2', 'key3'];

      await secureStorage.deleteItems(keys);

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledTimes(3);
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('key1');
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('key2');
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('key3');
    });

    it('should handle empty array', async () => {
      await secureStorage.deleteItems([]);

      expect(mockSecureStore.deleteItemAsync).not.toHaveBeenCalled();
    });

    it('should delete all items even if some fail', async () => {
      mockSecureStore.deleteItemAsync
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Delete failed'))
        .mockResolvedValueOnce(undefined);

      mockAsyncStorage.removeItem.mockResolvedValue(undefined);

      await secureStorage.deleteItems(['key1', 'key2', 'key3']);

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledTimes(3);
      // key2 should fallback to AsyncStorage
      expect(mockAsyncStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe('Storage Keys Classification', () => {
    it('should have secure storage keys', () => {
      expect(StorageKeys.SECURE.ACCESS_TOKEN).toBe('secure:access_token');
      expect(StorageKeys.SECURE.REFRESH_TOKEN).toBe('secure:refresh_token');
      expect(StorageKeys.SECURE.TOKEN_EXPIRES_AT).toBe('secure:token_expires_at');
      expect(StorageKeys.SECURE.BIOMETRIC_KEY).toBe('secure:biometric_key');
      expect(StorageKeys.SECURE.PIN_CODE).toBe('secure:pin_code');
      expect(StorageKeys.SECURE.PAYMENT_METHOD).toBe('secure:payment_method');
    });

    it('should have public storage keys', () => {
      expect(StorageKeys.PUBLIC.USER_PROFILE).toBe('user_profile');
      expect(StorageKeys.PUBLIC.APP_SETTINGS).toBe('app_settings');
      expect(StorageKeys.PUBLIC.THEME_PREFERENCE).toBe('theme_preference');
      expect(StorageKeys.PUBLIC.LANGUAGE).toBe('language');
      expect(StorageKeys.PUBLIC.ONBOARDING_COMPLETED).toBe('onboarding_completed');
      expect(StorageKeys.PUBLIC.SEARCH_HISTORY).toBe('search_history');
    });

    it('should separate sensitive from non-sensitive keys', () => {
      const secureKeys = Object.values(StorageKeys.SECURE);
      const publicKeys = Object.values(StorageKeys.PUBLIC);

      // No overlap
      secureKeys.forEach((key) => {
        expect(publicKeys).not.toContain(key);
      });

      // Secure keys have 'secure:' prefix
      secureKeys.forEach((key) => {
        expect(key).toMatch(/^secure:/);
      });

      // Public keys don't have 'secure:' prefix
      publicKeys.forEach((key) => {
        expect(key).not.toMatch(/^secure:/);
      });
    });
  });

  describe('Data Migration', () => {
    beforeEach(() => {
      mockSecureStore.isAvailableAsync.mockResolvedValue(true);
      jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should migrate data from AsyncStorage to SecureStore', async () => {
      mockAsyncStorage.getItem
        .mockResolvedValueOnce('old_access_token')
        .mockResolvedValueOnce('old_refresh_token')
        .mockResolvedValueOnce('1234567890');

      mockSecureStore.setItemAsync.mockResolvedValue(undefined);
      mockAsyncStorage.removeItem.mockResolvedValue(undefined);

      await migrateSensitiveDataToSecure();

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        StorageKeys.SECURE.ACCESS_TOKEN,
        'old_access_token'
      );
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        StorageKeys.SECURE.REFRESH_TOKEN,
        'old_refresh_token'
      );
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        StorageKeys.SECURE.TOKEN_EXPIRES_AT,
        '1234567890'
      );

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('auth_access_token');
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('auth_refresh_token');
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('auth_token_expires');
    });

    it('should skip migration if old keys do not exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      await migrateSensitiveDataToSecure();

      expect(mockSecureStore.setItemAsync).not.toHaveBeenCalled();
      expect(mockAsyncStorage.removeItem).not.toHaveBeenCalled();
    });

    it('should handle migration errors gracefully', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('token_value');
      mockSecureStore.setItemAsync.mockRejectedValue(new Error('Migration failed'));

      await migrateSensitiveDataToSecure();

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Migration failed'),
        expect.any(Error)
      );
    });

    it('should log successful migrations', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('token_value');
      mockSecureStore.setItemAsync.mockResolvedValue(undefined);
      mockAsyncStorage.removeItem.mockResolvedValue(undefined);

      await migrateSensitiveDataToSecure();

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('✅ Migrated')
      );
    });
  });

  describe('Sensitive Data Handling', () => {
    beforeEach(() => {
      mockSecureStore.isAvailableAsync.mockResolvedValue(true);
      mockSecureStore.setItemAsync.mockResolvedValue(undefined);
      mockSecureStore.getItemAsync.mockResolvedValue('encrypted_token');
    });

    it('should store access token securely', async () => {
      await secureStorage.setItem(
        StorageKeys.SECURE.ACCESS_TOKEN,
        'sensitive_access_token'
      );

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        StorageKeys.SECURE.ACCESS_TOKEN,
        'sensitive_access_token'
      );
    });

    it('should store refresh token securely', async () => {
      await secureStorage.setItem(
        StorageKeys.SECURE.REFRESH_TOKEN,
        'sensitive_refresh_token'
      );

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        StorageKeys.SECURE.REFRESH_TOKEN,
        'sensitive_refresh_token'
      );
    });

    it('should store biometric key securely', async () => {
      await secureStorage.setItem(
        StorageKeys.SECURE.BIOMETRIC_KEY,
        'biometric_secret_key'
      );

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        StorageKeys.SECURE.BIOMETRIC_KEY,
        'biometric_secret_key'
      );
    });

    it('should store PIN code securely', async () => {
      await secureStorage.setItem(StorageKeys.SECURE.PIN_CODE, '1234');

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        StorageKeys.SECURE.PIN_CODE,
        '1234'
      );
    });

    it('should retrieve sensitive data only from SecureStore', async () => {
      const token = await secureStorage.getItem(StorageKeys.SECURE.ACCESS_TOKEN);

      expect(token).toBe('encrypted_token');
      expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith(
        StorageKeys.SECURE.ACCESS_TOKEN
      );
    });

    it('should delete all auth tokens', async () => {
      mockSecureStore.deleteItemAsync.mockResolvedValue(undefined);

      await secureStorage.deleteItems([
        StorageKeys.SECURE.ACCESS_TOKEN,
        StorageKeys.SECURE.REFRESH_TOKEN,
        StorageKeys.SECURE.TOKEN_EXPIRES_AT,
      ]);

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledTimes(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long values', async () => {
      mockSecureStore.isAvailableAsync.mockResolvedValue(true);
      mockSecureStore.setItemAsync.mockResolvedValue(undefined);

      const longValue = 'a'.repeat(10000);

      await secureStorage.setItem('long_key', longValue);

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('long_key', longValue);
    });

    it('should handle special characters in keys', async () => {
      mockSecureStore.isAvailableAsync.mockResolvedValue(true);
      mockSecureStore.setItemAsync.mockResolvedValue(undefined);

      await secureStorage.setItem('key:with:colons', 'value');

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'key:with:colons',
        'value'
      );
    });

    it('should handle special characters in values', async () => {
      mockSecureStore.isAvailableAsync.mockResolvedValue(true);
      mockSecureStore.setItemAsync.mockResolvedValue(undefined);

      const specialValue = 'value\nwith\nnewlines\tand\ttabs';

      await secureStorage.setItem('key', specialValue);

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('key', specialValue);
    });

    it('should handle concurrent operations', async () => {
      mockSecureStore.isAvailableAsync.mockResolvedValue(true);
      mockSecureStore.setItemAsync.mockResolvedValue(undefined);
      mockSecureStore.getItemAsync.mockResolvedValue('value');
      mockSecureStore.deleteItemAsync.mockResolvedValue(undefined);

      const operations = [
        secureStorage.setItem('key1', 'value1'),
        secureStorage.getItem('key2'),
        secureStorage.deleteItem('key3'),
        secureStorage.setItem('key4', 'value4'),
      ];

      await Promise.all(operations);

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledTimes(2);
      expect(mockSecureStore.getItemAsync).toHaveBeenCalledTimes(1);
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledTimes(1);
    });

    it('should handle empty string values', async () => {
      mockSecureStore.isAvailableAsync.mockResolvedValue(true);
      mockSecureStore.setItemAsync.mockResolvedValue(undefined);
      mockSecureStore.getItemAsync.mockResolvedValue('');

      await secureStorage.setItem('empty_key', '');
      const value = await secureStorage.getItem('empty_key');

      expect(value).toBe('');
    });
  });
});
