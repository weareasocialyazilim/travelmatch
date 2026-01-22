/**
 * Session Manager Tests
 * Tests for session/token management, refresh logic, and event handling
 * Target Coverage: 90%+
 */

import {
  sessionManager,
  SessionData,
  SessionTokens,
  SessionState,
} from '../sessionManager';
import type { User } from '@/types';

// Mock dependencies
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('@/utils/secureStorage', () => ({
  secureStorage: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    deleteItem: jest.fn(),
    deleteItems: jest.fn(),
  },
  AUTH_STORAGE_KEYS: {
    ACCESS_TOKEN: 'auth_access_key',
    REFRESH_TOKEN: 'auth_refresh_key',
    TOKEN_EXPIRES_AT: 'auth_expires_at',
  },
  StorageKeys: {
    PUBLIC: {
      USER_PROFILE: 'user_profile',
    },
  },
}));

jest.mock('@/config/supabase', () => ({
  supabase: {
    auth: {
      refreshSession: jest.fn(),
    },
  },
}));

jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Import mocked modules
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  secureStorage,
  AUTH_STORAGE_KEYS,
  StorageKeys,
} from '@/utils/secureStorage';
import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';

describe('SessionManager', () => {
  // Mock data
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    role: 'Traveler',
    kyc: 'Pending',
    location: { lat: 0, lng: 0 },
  } as User;

  const mockTokens: SessionTokens = {
    accessToken: 'access-token-123',
    refreshToken: 'refresh-token-123',
    expiresAt: Date.now() + 3600000, // 1 hour from now
  };

  const mockExpiredTokens: SessionTokens = {
    accessToken: 'expired-access-token',
    refreshToken: 'expired-refresh-token',
    expiresAt: Date.now() - 3600000, // 1 hour ago
  };

  const mockSessionData: SessionData = {
    user: mockUser,
    tokens: mockTokens,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset session manager internal state
    (sessionManager as any).tokens = null;
    (sessionManager as any).user = null;
    (sessionManager as any).refreshPromise = null;
    (sessionManager as any).listeners = new Set();

    // Default network state: online
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    });
  });

  // ========================================
  // INITIALIZE TESTS
  // ========================================
  describe('initialize', () => {
    it('should return invalid when no stored session', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (secureStorage.getItem as jest.Mock).mockResolvedValue(null);

      const state = await sessionManager.initialize();

      expect(state).toBe('invalid');
      expect(logger.info).toHaveBeenCalledWith(
        '[SessionManager] Initializing...',
      );
      expect(logger.info).toHaveBeenCalledWith(
        '[SessionManager] No stored session found',
      );
    });

    it('should return valid when session is valid', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockUser),
      );
      (secureStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(mockTokens.accessToken)
        .mockResolvedValueOnce(mockTokens.refreshToken)
        .mockResolvedValueOnce(mockTokens.expiresAt.toString());

      const state = await sessionManager.initialize();

      expect(state).toBe('valid');
      expect(sessionManager.getUser()).toEqual(mockUser);
      expect(sessionManager.getTokens()).toEqual({
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        expiresAt: mockTokens.expiresAt,
      });
      expect(logger.info).toHaveBeenCalledWith(
        '[SessionManager] Valid session restored',
      );
    });

    it('should return expired when token is expired', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockUser),
      );
      (secureStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(mockExpiredTokens.accessToken)
        .mockResolvedValueOnce(mockExpiredTokens.refreshToken)
        .mockResolvedValueOnce(mockExpiredTokens.expiresAt.toString());

      const state = await sessionManager.initialize();

      expect(state).toBe('expired');
      expect(logger.info).toHaveBeenCalledWith(
        '[SessionManager] Session expired, needs refresh',
      );
    });

    it('should return unknown on error', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(error);

      const state = await sessionManager.initialize();

      expect(state).toBe('unknown');
      expect(logger.error).toHaveBeenCalledWith(
        '[SessionManager] Initialize failed:',
        error,
      );
    });

    it('should return invalid when missing access token', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockUser),
      );
      (secureStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(null) // No access token
        .mockResolvedValueOnce(mockTokens.refreshToken)
        .mockResolvedValueOnce(mockTokens.expiresAt.toString());

      const state = await sessionManager.initialize();

      expect(state).toBe('invalid');
    });

    it('should return invalid when missing refresh token', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockUser),
      );
      (secureStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(mockTokens.accessToken)
        .mockResolvedValueOnce(null) // No refresh token
        .mockResolvedValueOnce(mockTokens.expiresAt.toString());

      const state = await sessionManager.initialize();

      expect(state).toBe('invalid');
    });
  });

  // ========================================
  // SAVE SESSION TESTS
  // ========================================
  describe('saveSession', () => {
    it('should save session successfully', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      (secureStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await sessionManager.saveSession(mockSessionData);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        StorageKeys.PUBLIC.USER_PROFILE,
        JSON.stringify(mockUser),
      );
      expect(secureStorage.setItem).toHaveBeenCalledWith(
        AUTH_STORAGE_KEYS.ACCESS_TOKEN,
        mockTokens.accessToken,
      );
      expect(secureStorage.setItem).toHaveBeenCalledWith(
        AUTH_STORAGE_KEYS.REFRESH_TOKEN,
        mockTokens.refreshToken,
      );
      expect(secureStorage.setItem).toHaveBeenCalledWith(
        AUTH_STORAGE_KEYS.TOKEN_EXPIRES_AT,
        mockTokens.expiresAt.toString(),
      );
      expect(sessionManager.getUser()).toEqual(mockUser);
      expect(sessionManager.getTokens()).toEqual(mockTokens);
      expect(logger.info).toHaveBeenCalledWith(
        '[SessionManager] Session saved successfully',
      );
    });

    it('should emit session_created event', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      (secureStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const listener = jest.fn() as jest.Mock;
      sessionManager.addListener(listener);

      await sessionManager.saveSession(mockSessionData);

      expect(listener).toHaveBeenCalledWith(
        'session_created',
        expect.objectContaining({
          user: mockUser,
          tokens: mockTokens,
        }),
      );
    });

    it('should throw error on storage failure', async () => {
      const error = new Error('Storage full');
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(error);

      await expect(sessionManager.saveSession(mockSessionData)).rejects.toThrow(
        'Failed to save session',
      );
      expect(logger.error).toHaveBeenCalledWith(
        '[SessionManager] Save session failed:',
        error,
      );
    });
  });

  // ========================================
  // GET VALID TOKEN TESTS
  // ========================================
  describe('getValidToken', () => {
    it('should return null when no tokens available', async () => {
      const token = await sessionManager.getValidToken();

      expect(token).toBeNull();
      expect(logger.warn).toHaveBeenCalledWith(
        '[SessionManager] No tokens available',
      );
    });

    it('should return token when still valid', async () => {
      // Set up valid session
      (sessionManager as any).tokens = mockTokens;
      (sessionManager as any).user = mockUser;

      const token = await sessionManager.getValidToken();

      expect(token).toBe(mockTokens.accessToken);
    });

    it('should refresh token when expiring soon', async () => {
      // Set up session with token expiring in 2 minutes (within 5 min buffer)
      const expiringTokens: SessionTokens = {
        ...mockTokens,
        expiresAt: Date.now() + 2 * 60 * 1000, // 2 minutes
      };
      (sessionManager as any).tokens = expiringTokens;
      (sessionManager as any).user = mockUser;

      // Mock successful refresh
      (supabase.auth.refreshSession as jest.Mock).mockResolvedValue({
        data: {
          session: {
            access_token: 'new-access-token',
            refresh_token: 'new-refresh-token',
            expires_at: Math.floor((Date.now() + 3600000) / 1000),
          },
        },
        error: null,
      });
      (secureStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const token = await sessionManager.getValidToken();

      expect(token).toBe('new-access-token');
      expect(logger.info).toHaveBeenCalledWith(
        '[SessionManager] Token expiring soon, refreshing...',
      );
    });
  });

  // ========================================
  // TOKEN REFRESH TESTS
  // ========================================
  describe('token refresh', () => {
    beforeEach(() => {
      (sessionManager as any).tokens = mockExpiredTokens;
      (sessionManager as any).user = mockUser;
    });

    it('should refresh token successfully when online', async () => {
      const newSession = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_at: Math.floor((Date.now() + 3600000) / 1000),
      };

      (supabase.auth.refreshSession as jest.Mock).mockResolvedValue({
        data: { session: newSession },
        error: null,
      });
      (secureStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const token = await sessionManager.getValidToken();

      expect(token).toBe('new-access-token');
      expect(logger.info).toHaveBeenCalledWith(
        '[SessionManager] Token refreshed successfully',
      );
    });

    it('should return current token when offline', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      const token = await sessionManager.getValidToken();

      expect(token).toBe(mockExpiredTokens.accessToken);
      expect(logger.warn).toHaveBeenCalledWith(
        '[SessionManager] Offline, cannot refresh token',
      );
    });

    it('should clear session on refresh failure', async () => {
      (supabase.auth.refreshSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: { message: 'Refresh token expired' },
      });
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
      (secureStorage.deleteItems as jest.Mock).mockResolvedValue(undefined);

      const listener = jest.fn() as jest.Mock;
      sessionManager.addListener(listener);

      const token = await sessionManager.getValidToken();

      expect(token).toBeNull();
      expect(listener).toHaveBeenCalledWith(
        'refresh_failed',
        expect.any(Object),
      );
      expect(listener).toHaveBeenCalledWith('session_expired', undefined);
      expect(logger.error).toHaveBeenCalledWith(
        '[SessionManager] Refresh failed:',
        expect.anything(),
      );
    });

    it('should deduplicate concurrent refresh calls', async () => {
      const newSession = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_at: Math.floor((Date.now() + 3600000) / 1000),
      };

      // Simulate slow refresh
      (supabase.auth.refreshSession as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: { session: newSession },
                  error: null,
                }),
              100,
            ),
          ),
      );
      (secureStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      // Make concurrent calls
      const [token1, token2, token3] = await Promise.all([
        sessionManager.getValidToken(),
        sessionManager.getValidToken(),
        sessionManager.getValidToken(),
      ]);

      // All should get same token
      expect(token1).toBe('new-access-token');
      expect(token2).toBe('new-access-token');
      expect(token3).toBe('new-access-token');

      // Refresh should only be called once
      expect(supabase.auth.refreshSession).toHaveBeenCalledTimes(1);
    });

    it('should handle refresh exception', async () => {
      const error = new Error('Network error');
      (supabase.auth.refreshSession as jest.Mock).mockRejectedValue(error);
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
      (secureStorage.deleteItems as jest.Mock).mockResolvedValue(undefined);

      const token = await sessionManager.getValidToken();

      expect(token).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(
        '[SessionManager] Refresh exception:',
        error,
      );
    });
  });

  // ========================================
  // CLEAR SESSION TESTS
  // ========================================
  describe('clearSession', () => {
    beforeEach(() => {
      (sessionManager as any).tokens = mockTokens;
      (sessionManager as any).user = mockUser;
    });

    it('should clear all session data', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
      (secureStorage.deleteItems as jest.Mock).mockResolvedValue(undefined);

      await sessionManager.clearSession();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        StorageKeys.PUBLIC.USER_PROFILE,
      );
      expect(secureStorage.deleteItems).toHaveBeenCalledWith([
        AUTH_STORAGE_KEYS.ACCESS_TOKEN,
        AUTH_STORAGE_KEYS.REFRESH_TOKEN,
        AUTH_STORAGE_KEYS.TOKEN_EXPIRES_AT,
      ]);
      expect(sessionManager.getUser()).toBeNull();
      expect(sessionManager.getTokens()).toBeNull();
      expect(logger.info).toHaveBeenCalledWith(
        '[SessionManager] Session cleared',
      );
    });

    it('should emit session_cleared event', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
      (secureStorage.deleteItems as jest.Mock).mockResolvedValue(undefined);

      const listener = jest.fn() as jest.Mock;
      sessionManager.addListener(listener);

      await sessionManager.clearSession();

      expect(listener).toHaveBeenCalledWith('session_cleared', undefined);
    });

    it('should clear memory even on storage error', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(
        new Error('Storage error'),
      );

      await sessionManager.clearSession();

      expect(sessionManager.getUser()).toBeNull();
      expect(sessionManager.getTokens()).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(
        '[SessionManager] Clear session failed:',
        expect.any(Error),
      );
    });
  });

  // ========================================
  // IS SESSION VALID TESTS
  // ========================================
  describe('isSessionValid', () => {
    it('should return false when no session', async () => {
      const isValid = await sessionManager.isSessionValid();

      expect(isValid).toBe(false);
    });

    it('should return true when session is valid', async () => {
      (sessionManager as any).tokens = mockTokens;
      (sessionManager as any).user = mockUser;

      const isValid = await sessionManager.isSessionValid();

      expect(isValid).toBe(true);
    });

    it('should return false when no user', async () => {
      (sessionManager as any).tokens = mockTokens;
      (sessionManager as any).user = null;

      const isValid = await sessionManager.isSessionValid();

      expect(isValid).toBe(false);
    });

    it('should try refresh when expired and return result', async () => {
      (sessionManager as any).tokens = mockExpiredTokens;
      (sessionManager as any).user = mockUser;

      // Mock successful refresh
      (supabase.auth.refreshSession as jest.Mock).mockResolvedValue({
        data: {
          session: {
            access_token: 'new-token',
            refresh_token: 'new-refresh',
            expires_at: Math.floor((Date.now() + 3600000) / 1000),
          },
        },
        error: null,
      });
      (secureStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const isValid = await sessionManager.isSessionValid();

      expect(isValid).toBe(true);
    });

    it('should return false when refresh fails', async () => {
      (sessionManager as any).tokens = mockExpiredTokens;
      (sessionManager as any).user = mockUser;

      (supabase.auth.refreshSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: { message: 'Token expired' },
      });
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
      (secureStorage.deleteItems as jest.Mock).mockResolvedValue(undefined);

      const isValid = await sessionManager.isSessionValid();

      expect(isValid).toBe(false);
    });
  });

  // ========================================
  // UPDATE USER TESTS
  // ========================================
  describe('updateUser', () => {
    beforeEach(() => {
      (sessionManager as any).tokens = mockTokens;
      (sessionManager as any).user = mockUser;
    });

    it('should update user profile', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await sessionManager.updateUser({ name: 'Updated Name' });

      expect(sessionManager.getUser()?.name).toBe('Updated Name');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        StorageKeys.PUBLIC.USER_PROFILE,
        expect.stringContaining('Updated Name'),
      );
      expect(logger.info).toHaveBeenCalledWith('[SessionManager] User updated');
    });

    it('should throw error when no active session', async () => {
      (sessionManager as any).user = null;

      await expect(sessionManager.updateUser({ name: 'Test' })).rejects.toThrow(
        'No active session',
      );
    });

    it('should preserve existing user fields', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await sessionManager.updateUser({ name: 'New Name' });

      const user = sessionManager.getUser();
      expect(user?.email).toBe(mockUser.email);
      expect(user?.id).toBe(mockUser.id);
      expect(user?.name).toBe('New Name');
    });
  });

  // ========================================
  // EVENT LISTENER TESTS
  // ========================================
  describe('addListener', () => {
    it('should add and invoke listener', async () => {
      const listener = jest.fn() as jest.Mock;
      sessionManager.addListener(listener);

      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      (secureStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await sessionManager.saveSession(mockSessionData);

      expect(listener).toHaveBeenCalled();
    });

    it('should return unsubscribe function', () => {
      const listener = jest.fn() as jest.Mock;
      const unsubscribe = sessionManager.addListener(listener);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should unsubscribe when unsubscribe is called', async () => {
      const listener = jest.fn() as jest.Mock;
      const unsubscribe = sessionManager.addListener(listener);

      unsubscribe();

      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      (secureStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await sessionManager.saveSession(mockSessionData);

      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle listener errors gracefully', async () => {
      const errorListener = jest.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });
      const normalListener = jest.fn() as jest.Mock;

      sessionManager.addListener(errorListener);
      sessionManager.addListener(normalListener);

      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      (secureStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      // Should not throw
      await sessionManager.saveSession(mockSessionData);

      expect(errorListener).toHaveBeenCalled();
      expect(normalListener).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(
        '[SessionManager] Listener error:',
        expect.any(Error),
      );
    });
  });

  // ========================================
  // GET SESSION SUMMARY TESTS
  // ========================================
  describe('getSessionSummary', () => {
    it('should return invalid summary when no session', () => {
      const summary = sessionManager.getSessionSummary();

      expect(summary).toEqual({
        state: 'invalid',
        user: null,
        expiresAt: null,
        isExpired: true,
      });
    });

    it('should return valid summary when session is active', () => {
      (sessionManager as any).tokens = mockTokens;
      (sessionManager as any).user = mockUser;

      const summary = sessionManager.getSessionSummary();

      expect(summary.state).toBe('valid');
      expect(summary.user).toEqual(mockUser);
      expect(summary.expiresAt).toBeInstanceOf(Date);
      expect(summary.isExpired).toBe(false);
    });

    it('should return expired summary when token expired', () => {
      (sessionManager as any).tokens = mockExpiredTokens;
      (sessionManager as any).user = mockUser;

      const summary = sessionManager.getSessionSummary();

      expect(summary.state).toBe('expired');
      expect(summary.isExpired).toBe(true);
    });
  });

  // ========================================
  // GETTER TESTS
  // ========================================
  describe('getUser', () => {
    it('should return null when no user', () => {
      expect(sessionManager.getUser()).toBeNull();
    });

    it('should return user when set', () => {
      (sessionManager as any).user = mockUser;

      expect(sessionManager.getUser()).toEqual(mockUser);
    });
  });

  describe('getTokens', () => {
    it('should return null when no tokens', () => {
      expect(sessionManager.getTokens()).toBeNull();
    });

    it('should return tokens when set', () => {
      (sessionManager as any).tokens = mockTokens;

      expect(sessionManager.getTokens()).toEqual(mockTokens);
    });
  });

  // ========================================
  // EDGE CASES
  // ========================================
  describe('edge cases', () => {
    it('should handle internet reachable as null (unknown)', async () => {
      (sessionManager as any).tokens = mockExpiredTokens;
      (sessionManager as any).user = mockUser;

      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
        isInternetReachable: null, // Unknown
      });

      const newSession = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_at: Math.floor((Date.now() + 3600000) / 1000),
      };

      (supabase.auth.refreshSession as jest.Mock).mockResolvedValue({
        data: { session: newSession },
        error: null,
      });
      (secureStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const token = await sessionManager.getValidToken();

      // Should try to refresh when isInternetReachable is null (not explicitly false)
      expect(token).toBe('new-access-token');
    });

    it('should handle malformed stored user data', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid-json');
      (secureStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(mockTokens.accessToken)
        .mockResolvedValueOnce(mockTokens.refreshToken)
        .mockResolvedValueOnce(mockTokens.expiresAt.toString());

      const state = await sessionManager.initialize();

      expect(state).toBe('unknown');
    });
  });
});
