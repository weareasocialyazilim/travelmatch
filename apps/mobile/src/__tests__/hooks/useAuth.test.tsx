/**
 * useAuth Hook Tests
 * Tests for authentication context hook
 * Target Coverage: 85%+
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import * as authService from '@/services/supabaseAuthService';
import { secureStorage, AUTH_STORAGE_KEYS } from '@/utils/secureStorage';
import type { User } from '@/types/index';

// Mock Supabase config first
jest.mock('@/config/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      refreshSession: jest.fn(),
    },
  },
}));

// Mock dependencies
jest.mock('@/services/supabaseAuthService');
jest.mock('@/utils/secureStorage');

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth', () => {
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
  };

  const mockSession = {
    access_token: 'access-token-123',
    refresh_token: 'refresh-token-123',
    expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    
    // Mock secureStorage methods
    (secureStorage.getItem as jest.Mock).mockResolvedValue(null);
    (secureStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (secureStorage.deleteItems as jest.Mock).mockResolvedValue(undefined);
  });

  describe('initial state', () => {
    it('should start in loading state', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.authState).toBe('loading');
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should load to unauthenticated when no stored data', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.authState).toBe('unauthenticated');
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should restore session from storage', async () => {
      // Mock stored data
      await AsyncStorage.setItem(
        AUTH_STORAGE_KEYS.USER,
        JSON.stringify(mockUser),
      );

      (secureStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === AUTH_STORAGE_KEYS.ACCESS_TOKEN)
          return Promise.resolve('access-token-123');
        if (key === AUTH_STORAGE_KEYS.REFRESH_TOKEN)
          return Promise.resolve('refresh-token-123');
        if (key === AUTH_STORAGE_KEYS.TOKEN_EXPIRES_AT)
          return Promise.resolve(String(Date.now() + 3600000));
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.authState).toBe('authenticated');
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should not restore expired session', async () => {
      await AsyncStorage.setItem(
        AUTH_STORAGE_KEYS.USER,
        JSON.stringify(mockUser),
      );

      (secureStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === AUTH_STORAGE_KEYS.ACCESS_TOKEN)
          return Promise.resolve('access-token-123');
        if (key === AUTH_STORAGE_KEYS.REFRESH_TOKEN)
          return Promise.resolve('refresh-token-123');
        if (key === AUTH_STORAGE_KEYS.TOKEN_EXPIRES_AT)
          return Promise.resolve(String(Date.now() - 1000)); // Expired
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.authState).toBe('unauthenticated');
      });

      expect(result.current.user).toBeNull();
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      (authService.signInWithEmail as jest.Mock).mockResolvedValue({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          user_metadata: {
            name: mockUser.name,
            avatar_url: mockUser.avatar,
          },
        },
        session: mockSession,
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.authState).toBe('unauthenticated');
      });

      let loginResult: { success: boolean; error?: string } = {
        success: false,
      };
      await act(async () => {
        loginResult = await result.current.login({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      expect(loginResult.success).toBe(true);
      expect(loginResult.error).toBeUndefined();
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(authService.signInWithEmail).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
      );
    });

    it('should handle invalid credentials', async () => {
      (authService.signInWithEmail as jest.Mock).mockResolvedValue({
        user: null,
        session: null,
        error: new Error('Invalid credentials'),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.authState).toBe('unauthenticated');
      });

      let loginResult: { success: boolean; error?: string } = {
        success: false,
      };
      await act(async () => {
        loginResult = await result.current.login({
          email: 'test@example.com',
          password: 'wrong',
        });
      });

      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toBe('Invalid credentials');
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should handle network errors', async () => {
      (authService.signInWithEmail as jest.Mock).mockRejectedValue(
        new Error('Network error'),
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.authState).toBe('unauthenticated');
      });

      let loginResult: { success: boolean; error?: string } = {
        success: false,
      };
      await act(async () => {
        loginResult = await result.current.login({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toBe('Network error');
    });

    it('should persist user and tokens after login', async () => {
      (authService.signInWithEmail as jest.Mock).mockResolvedValue({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          user_metadata: { name: mockUser.name, avatar_url: mockUser.avatar },
        },
        session: mockSession,
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.authState).toBe('unauthenticated');
      });

      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      // Verify AsyncStorage was called
      const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.USER);
      expect(storedUser).toBeTruthy();
      expect(JSON.parse(storedUser!)).toEqual(mockUser);

      // Verify secureStorage was called
      expect(secureStorage.setItem).toHaveBeenCalledWith(
        AUTH_STORAGE_KEYS.ACCESS_TOKEN,
        mockSession.access_token,
      );
      expect(secureStorage.setItem).toHaveBeenCalledWith(
        AUTH_STORAGE_KEYS.REFRESH_TOKEN,
        mockSession.refresh_token,
      );
    });
  });

  describe('register', () => {
    it('should register new user successfully', async () => {
      (authService.signUpWithEmail as jest.Mock).mockResolvedValue({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          user_metadata: { name: mockUser.name },
        },
        session: mockSession,
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.authState).toBe('unauthenticated');
      });

      let registerResult: { success: boolean; error?: string } = {
        success: false,
      };
      await act(async () => {
        registerResult = await result.current.register({
          email: 'new@example.com',
          password: 'password123',
          name: 'New User',
        });
      });

      expect(registerResult.success).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
      expect(authService.signUpWithEmail).toHaveBeenCalledWith(
        'new@example.com',
        'password123',
        { name: 'New User' },
      );
    });

    it('should handle duplicate email error', async () => {
      (authService.signUpWithEmail as jest.Mock).mockResolvedValue({
        user: null,
        session: null,
        error: new Error('User already exists'),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.authState).toBe('unauthenticated');
      });

      let registerResult: { success: boolean; error?: string } = {
        success: false,
      };
      await act(async () => {
        registerResult = await result.current.register({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Test',
        });
      });

      expect(registerResult.success).toBe(false);
      expect(registerResult.error).toBe('User already exists');
    });

    it('should handle weak password error', async () => {
      (authService.signUpWithEmail as jest.Mock).mockRejectedValue(
        new Error('Password too weak'),
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.authState).toBe('unauthenticated');
      });

      let registerResult: { success: boolean; error?: string } = {
        success: false,
      };
      await act(async () => {
        registerResult = await result.current.register({
          email: 'test@example.com',
          password: '123',
          name: 'Test',
        });
      });

      expect(registerResult.success).toBe(false);
      expect(registerResult.error).toBe('Password too weak');
    });

    it('should handle registration without immediate session', async () => {
      (authService.signUpWithEmail as jest.Mock).mockResolvedValue({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          user_metadata: { name: mockUser.name },
        },
        session: null, // Email confirmation required
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.authState).toBe('unauthenticated');
      });

      let registerResult: { success: boolean; error?: string } = {
        success: false,
      };
      await act(async () => {
        registerResult = await result.current.register({
          email: 'new@example.com',
          password: 'password123',
          name: 'New User',
        });
      });

      expect(registerResult.success).toBe(true);
      // User should remain unauthenticated until email confirmation
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      // Setup authenticated state
      (authService.signInWithEmail as jest.Mock).mockResolvedValue({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          user_metadata: { name: mockUser.name },
        },
        session: mockSession,
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.authState).toBe('unauthenticated');
      });

      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Mock signOut
      (authService.signOut as jest.Mock).mockResolvedValue({ error: null });

      // Logout
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(authService.signOut).toHaveBeenCalled();
    });

    it('should clear local data even if server logout fails', async () => {
      // Setup authenticated state
      (authService.signInWithEmail as jest.Mock).mockResolvedValue({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          user_metadata: { name: mockUser.name },
        },
        session: mockSession,
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.authState).toBe('unauthenticated');
      });

      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      // Mock failed signOut
      (authService.signOut as jest.Mock).mockRejectedValue(
        new Error('Network error'),
      );

      // Logout should still clear local state
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should clear storage on logout', async () => {
      // Setup authenticated state
      (authService.signInWithEmail as jest.Mock).mockResolvedValue({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          user_metadata: { name: mockUser.name },
        },
        session: mockSession,
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.authState).toBe('unauthenticated');
      });

      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      (authService.signOut as jest.Mock).mockResolvedValue({ error: null });

      await act(async () => {
        await result.current.logout();
      });

      const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.USER);
      expect(storedUser).toBeNull();
      expect(secureStorage.deleteItems).toHaveBeenCalled();
    });
  });

  describe('token management', () => {
    it('should provide getAccessToken function', async () => {
      // Setup authenticated state with valid token
      await AsyncStorage.setItem(
        AUTH_STORAGE_KEYS.USER,
        JSON.stringify(mockUser),
      );

      const futureExpiry = Date.now() + 3600000; // 1 hour from now

      (secureStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === AUTH_STORAGE_KEYS.ACCESS_TOKEN)
          return Promise.resolve('valid-token');
        if (key === AUTH_STORAGE_KEYS.REFRESH_TOKEN)
          return Promise.resolve('refresh-token');
        if (key === AUTH_STORAGE_KEYS.TOKEN_EXPIRES_AT)
          return Promise.resolve(String(futureExpiry));
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.authState).toBe('authenticated');
      });

      let token: string | null = null;
      await act(async () => {
        token = await result.current.getAccessToken();
      });

      expect(token).toBe('valid-token');
    });

    it('should return null when not authenticated', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.authState).toBe('unauthenticated');
      });

      let token: string | null = 'not-null';
      await act(async () => {
        token = await result.current.getAccessToken();
      });

      expect(token).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user data locally', async () => {
      (authService.signInWithEmail as jest.Mock).mockResolvedValue({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          user_metadata: { name: mockUser.name },
        },
        session: mockSession,
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.authState).toBe('unauthenticated');
      });

      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      act(() => {
        result.current.updateUser({
          name: 'Updated Name',
          bio: 'New bio',
        });
      });

      expect(result.current.user?.name).toBe('Updated Name');
      expect(result.current.user?.bio).toBe('New bio');
    });

    it('should persist updated user to storage', async () => {
      (authService.signInWithEmail as jest.Mock).mockResolvedValue({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          user_metadata: { name: mockUser.name },
        },
        session: mockSession,
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.authState).toBe('unauthenticated');
      });

      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      act(() => {
        result.current.updateUser({ name: 'Updated Name' });
      });

      await waitFor(async () => {
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.USER);
        const parsed = stored ? JSON.parse(stored) : null;
        expect(parsed?.name).toBe('Updated Name');
      });
    });
  });

  describe('refreshUser', () => {
    it('should refresh user data from server', async () => {
      (authService.signInWithEmail as jest.Mock).mockResolvedValue({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          user_metadata: { name: mockUser.name },
        },
        session: mockSession,
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.authState).toBe('unauthenticated');
      });

      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      (authService.getCurrentUser as jest.Mock).mockResolvedValue({
        id: mockUser.id,
        email: mockUser.email,
        user_metadata: { name: 'Server Updated Name', avatar_url: 'new-avatar.jpg' },
      });

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(result.current.user?.name).toBe('Server Updated Name');
      expect(result.current.user?.avatar).toBe('new-avatar.jpg');
    });

    it('should handle refresh errors silently', async () => {
      (authService.signInWithEmail as jest.Mock).mockResolvedValue({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          user_metadata: { name: mockUser.name },
        },
        session: mockSession,
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.authState).toBe('unauthenticated');
      });

      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      (authService.getCurrentUser as jest.Mock).mockRejectedValue(
        new Error('Network error'),
      );

      await act(async () => {
        await result.current.refreshUser();
      });

      // User should remain unchanged (avatar may be undefined after login without it)
      expect(result.current.user?.name).toBe(mockUser.name);
      expect(result.current.user?.email).toBe(mockUser.email);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('password operations', () => {
    it('should request password reset', async () => {
      (authService.resetPassword as jest.Mock).mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.authState).toBe('unauthenticated');
      });

      let resetResult: { success: boolean; error?: string } = {
        success: false,
      };
      await act(async () => {
        resetResult = await result.current.forgotPassword('test@example.com');
      });

      expect(resetResult.success).toBe(true);
      expect(authService.resetPassword).toHaveBeenCalledWith('test@example.com');
    });

    it('should handle password reset errors', async () => {
      (authService.resetPassword as jest.Mock).mockResolvedValue({
        error: new Error('User not found'),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.authState).toBe('unauthenticated');
      });

      let resetResult: { success: boolean; error?: string } = {
        success: false,
      };
      await act(async () => {
        resetResult = await result.current.forgotPassword(
          'nonexistent@example.com',
        );
      });

      expect(resetResult.success).toBe(false);
      expect(resetResult.error).toBe('User not found');
    });
  });

  describe('error handling', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
    });
  });
});
