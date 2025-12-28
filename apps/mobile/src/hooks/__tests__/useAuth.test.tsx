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

// Mock Linking
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Linking: {
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
      getInitialURL: jest.fn().mockResolvedValue(null),
    },
  };
});

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
});
