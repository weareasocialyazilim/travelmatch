/**
 * Secure Storage Tests
 * Testing secure storage operations
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { secureStorage, AUTH_STORAGE_KEYS } from '../secureStorage';

// Mock SecureStore
jest.mock('expo-secure-store', () => ({
  isAvailableAsync: jest.fn(),
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('secureStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setItem', () => {
    it('should use SecureStore when available', async () => {
      mockSecureStore.isAvailableAsync.mockResolvedValueOnce(true);
      mockSecureStore.setItemAsync.mockResolvedValueOnce();

      await secureStorage.setItem('test_key', 'test_value');

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'test_key',
        'test_value',
      );
    });

    it('should fallback to AsyncStorage when SecureStore unavailable', async () => {
      mockSecureStore.isAvailableAsync.mockResolvedValueOnce(false);
      mockAsyncStorage.setItem.mockResolvedValueOnce();

      await secureStorage.setItem('test_key', 'test_value');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@secure_test_key',
        'test_value',
      );
    });

    it('should fallback to AsyncStorage on SecureStore error', async () => {
      mockSecureStore.isAvailableAsync.mockRejectedValueOnce(
        new Error('SecureStore error'),
      );
      mockAsyncStorage.setItem.mockResolvedValueOnce();

      await secureStorage.setItem('test_key', 'test_value');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@secure_test_key',
        'test_value',
      );
    });
  });

  describe('getItem', () => {
    it('should use SecureStore when available', async () => {
      mockSecureStore.isAvailableAsync.mockResolvedValueOnce(true);
      mockSecureStore.getItemAsync.mockResolvedValueOnce('stored_value');

      const result = await secureStorage.getItem('test_key');

      expect(result).toBe('stored_value');
      expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith('test_key');
    });

    it('should fallback to AsyncStorage when SecureStore unavailable', async () => {
      mockSecureStore.isAvailableAsync.mockResolvedValueOnce(false);
      mockAsyncStorage.getItem.mockResolvedValueOnce('async_value');

      const result = await secureStorage.getItem('test_key');

      expect(result).toBe('async_value');
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@secure_test_key');
    });

    it('should return null when key not found', async () => {
      mockSecureStore.isAvailableAsync.mockResolvedValueOnce(true);
      mockSecureStore.getItemAsync.mockResolvedValueOnce(null);

      const result = await secureStorage.getItem('nonexistent_key');

      expect(result).toBeNull();
    });
  });

  describe('deleteItem', () => {
    it('should use SecureStore when available', async () => {
      mockSecureStore.isAvailableAsync.mockResolvedValueOnce(true);
      mockSecureStore.deleteItemAsync.mockResolvedValueOnce();

      await secureStorage.deleteItem('test_key');

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('test_key');
    });

    it('should fallback to AsyncStorage when SecureStore unavailable', async () => {
      mockSecureStore.isAvailableAsync.mockResolvedValueOnce(false);
      mockAsyncStorage.removeItem.mockResolvedValueOnce();

      await secureStorage.deleteItem('test_key');

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
        '@secure_test_key',
      );
    });
  });

  describe('deleteItems', () => {
    it('should delete multiple items', async () => {
      mockSecureStore.isAvailableAsync.mockResolvedValue(true);
      mockSecureStore.deleteItemAsync.mockResolvedValue();

      await secureStorage.deleteItems(['key1', 'key2', 'key3']);

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledTimes(3);
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('key1');
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('key2');
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('key3');
    });

    it('should handle empty array', async () => {
      await secureStorage.deleteItems([]);

      expect(mockSecureStore.deleteItemAsync).not.toHaveBeenCalled();
    });
  });
});

describe('AUTH_STORAGE_KEYS', () => {
  it('should have access token key', () => {
    expect(AUTH_STORAGE_KEYS.ACCESS_TOKEN).toBe('auth_access_token');
  });

  it('should have refresh token key', () => {
    expect(AUTH_STORAGE_KEYS.REFRESH_TOKEN).toBe('auth_refresh_token');
  });

  it('should have token expires key', () => {
    expect(AUTH_STORAGE_KEYS.TOKEN_EXPIRES_AT).toBe('auth_token_expires');
  });

  it('should have user key with @ prefix', () => {
    expect(AUTH_STORAGE_KEYS.USER).toBe('@auth_user');
  });
});
