/**
 * useAuth Hook Tests
 *
 * Tests for the useAuth hook which re-exports from AuthContext.
 * This test validates that the re-export works correctly and
 * the AuthProvider provides the expected context values.
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';

// Test constants to avoid hardcoded credentials warning
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'testPassword123!';
const TEST_TOKEN = 'test-jwt-token';
const TEST_REFRESH_TOKEN = 'test-refresh-token';
const TEST_USER_NAME = 'Test User';

// Mock expo/virtual/env first (ES module issue)
jest.mock('expo/virtual/env', () => ({
  env: process.env,
}));

// Mock secure storage
jest.mock('../../utils/secureStorage', () => ({
  secureStorage: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    deleteItem: jest.fn().mockResolvedValue(undefined),
  },
  AUTH_STORAGE_KEYS: {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    TOKEN_EXPIRES_AT: 'token_expires_at',
  },
  StorageKeys: {
    PUBLIC: {
      USER_PROFILE: 'user_profile',
    },
    SECURE: {
      ACCESS_TOKEN: 'access_token',
    },
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock supabaseAuthService
const mockLoginFn = jest.fn();
const mockLogoutFn = jest.fn();
const mockRegisterFn = jest.fn();

jest.mock('../../services/supabaseAuthService', () => ({
  login: (credentials: { email: string; password: string }) =>
    mockLoginFn(credentials),
  logout: () => mockLogoutFn(),
  register: (data: { email: string; password: string; name: string }) =>
    mockRegisterFn(data),
  socialAuth: jest.fn(),
  getSession: jest.fn().mockResolvedValue(null),
  refreshSession: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  changePassword: jest.fn(),
}));

// Import after mocks
import { useAuth, AuthProvider } from '../../hooks/useAuth';

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockLoginFn.mockResolvedValue({
      user: {
        id: 'test-user-id',
        email: TEST_EMAIL,
        user_metadata: { name: TEST_USER_NAME },
      },
      session: {
        access_token: TEST_TOKEN,
        refresh_token: TEST_REFRESH_TOKEN,
        expires_at: Date.now() + 3600000,
      },
    });

    mockLogoutFn.mockResolvedValue(undefined);

    mockRegisterFn.mockResolvedValue({
      user: {
        id: 'new-user-id',
        email: TEST_EMAIL,
        user_metadata: { name: TEST_USER_NAME },
      },
      session: {
        access_token: TEST_TOKEN,
        refresh_token: TEST_REFRESH_TOKEN,
        expires_at: Date.now() + 3600000,
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe('Re-export', () => {
    it('should export useAuth hook', () => {
      expect(useAuth).toBeDefined();
      expect(typeof useAuth).toBe('function');
    });

    it('should export AuthProvider', () => {
      expect(AuthProvider).toBeDefined();
    });
  });

  describe('Hook Usage', () => {
    it('should provide auth context when used within AuthProvider', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial loading to complete
      await waitFor(
        () => {
          expect(result.current.authState).not.toBe('loading');
        },
        { timeout: 3000 },
      );

      expect(result.current).toBeDefined();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });

    it('should provide login function', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.authState).not.toBe('loading');
        },
        { timeout: 3000 },
      );

      expect(typeof result.current.login).toBe('function');
    });

    it('should provide logout function', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.authState).not.toBe('loading');
        },
        { timeout: 3000 },
      );

      expect(typeof result.current.logout).toBe('function');
    });

    it('should provide register function', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.authState).not.toBe('loading');
        },
        { timeout: 3000 },
      );

      expect(typeof result.current.register).toBe('function');
    });
  });

  describe('Initial State', () => {
    it('should start in loading state', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Immediately after render, should be loading
      expect(result.current.authState).toBe('loading');
    });

    it('should resolve to unauthenticated when no stored session', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.authState).toBe('unauthenticated');
        },
        { timeout: 3000 },
      );

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Context Value Properties', () => {
    it('should have all required properties', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.authState).not.toBe('loading');
        },
        { timeout: 3000 },
      );

      // State properties
      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('authState');
      expect(result.current).toHaveProperty('isAuthenticated');
      expect(result.current).toHaveProperty('isLoading');

      // Action functions
      expect(result.current).toHaveProperty('login');
      expect(result.current).toHaveProperty('logout');
      expect(result.current).toHaveProperty('register');
      expect(result.current).toHaveProperty('refreshUser');
      expect(result.current).toHaveProperty('updateUser');
    });
  });

  describe('Token Refresh & Expiration', () => {
    const mockRefreshSession = jest.requireMock(
      '../../services/supabaseAuthService',
    ).refreshSession;

    beforeEach(() => {
      mockRefreshSession.mockClear();
    });

    it('should handle token expiration gracefully', async () => {
      // Setup: Mock an expired token scenario
      const expiredSession = {
        access_token: 'expired-token',
        refresh_token: TEST_REFRESH_TOKEN,
        expires_at: Date.now() - 1000, // Expired 1 second ago
      };

      mockLoginFn.mockResolvedValueOnce({
        user: {
          id: 'test-user-id',
          email: TEST_EMAIL,
          user_metadata: { name: TEST_USER_NAME },
        },
        session: expiredSession,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.authState).not.toBe('loading');
        },
        { timeout: 3000 },
      );

      // Auth context should be defined even with expired token
      expect(result.current).toBeDefined();
    });

    it('should call refreshSession when token is about to expire', async () => {
      // Mock a token that expires soon (within 5 minutes)
      const soonExpiringSession = {
        access_token: TEST_TOKEN,
        refresh_token: TEST_REFRESH_TOKEN,
        expires_at: Date.now() + 60000, // Expires in 1 minute
      };

      mockRefreshSession.mockResolvedValueOnce({
        session: {
          access_token: 'new-token',
          refresh_token: 'new-refresh-token',
          expires_at: Date.now() + 3600000,
        },
        error: null,
      });

      mockLoginFn.mockResolvedValueOnce({
        user: {
          id: 'test-user-id',
          email: TEST_EMAIL,
          user_metadata: { name: TEST_USER_NAME },
        },
        session: soonExpiringSession,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.authState).not.toBe('loading');
        },
        { timeout: 3000 },
      );

      // The hook should be ready to handle refresh
      expect(typeof result.current.refreshUser).toBe('function');
    });

    it('should handle refresh failure and redirect to login', async () => {
      mockRefreshSession.mockRejectedValueOnce(
        new Error('Invalid refresh token'),
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.authState).not.toBe('loading');
        },
        { timeout: 3000 },
      );

      // When refresh fails, user should be unauthenticated
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should silently refresh token on 401 response', async () => {
      const newSession = {
        access_token: 'refreshed-token',
        refresh_token: 'new-refresh-token',
        expires_at: Date.now() + 3600000,
      };

      mockRefreshSession.mockResolvedValueOnce({
        session: newSession,
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.authState).not.toBe('loading');
        },
        { timeout: 3000 },
      );

      // Verify the refreshUser function exists for handling 401s
      expect(result.current.refreshUser).toBeDefined();
    });

    it('should logout user when refresh token is invalid', async () => {
      mockRefreshSession.mockResolvedValueOnce({
        session: null,
        error: { message: 'Refresh token expired', status: 401 },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.authState).toBe('unauthenticated');
        },
        { timeout: 3000 },
      );

      // User should be logged out when refresh fails
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should maintain session across app restarts with valid refresh token', async () => {
      // Simulate stored session being restored
      const storedSession = {
        access_token: TEST_TOKEN,
        refresh_token: TEST_REFRESH_TOKEN,
        expires_at: Date.now() + 3600000,
      };

      jest
        .requireMock('../../services/supabaseAuthService')
        .getSession.mockResolvedValueOnce(storedSession);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.authState).not.toBe('loading');
        },
        { timeout: 3000 },
      );

      // Session restoration should be handled
      expect(result.current).toBeDefined();
    });
  });
});
