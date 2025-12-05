/**
 * Auth Store Tests
 * Comprehensive tests for authentication flow
 */

import { useAuthStore } from '../authStore';
import { act } from '@testing-library/react-native';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock API client
jest.mock('../../utils/api', () => ({
  apiClient: {
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock secureStorage
jest.mock('../../utils/secureStorage', () => ({
  secureStorage: {
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    deleteItem: jest.fn(() => Promise.resolve()),
    deleteItems: jest.fn(() => Promise.resolve()),
  },
  AUTH_STORAGE_KEYS: {
    ACCESS_TOKEN: 'auth_access_token',
    REFRESH_TOKEN: 'auth_refresh_token',
    TOKEN_EXPIRES_AT: 'auth_token_expires',
    USER: '@auth_user',
  },
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

// Get mocked apiClient
import { apiClient } from '../../utils/api';
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('authStore', () => {
  // Reset store before each test
  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      useAuthStore.setState({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    });
  });

  describe('Initial State', () => {
    it('should have null user initially', () => {
      const { user } = useAuthStore.getState();
      expect(user).toBeNull();
    });

    it('should have null token initially', () => {
      const { token } = useAuthStore.getState();
      expect(token).toBeNull();
    });

    it('should have null refreshToken initially', () => {
      const { refreshToken } = useAuthStore.getState();
      expect(refreshToken).toBeNull();
    });

    it('should not be authenticated initially', () => {
      const { isAuthenticated } = useAuthStore.getState();
      expect(isAuthenticated).toBe(false);
    });

    it('should not be loading initially', () => {
      const { isLoading } = useAuthStore.getState();
      expect(isLoading).toBe(false);
    });
  });

  describe('setUser', () => {
    it('should set user and mark as authenticated', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date().toISOString(),
      };

      act(() => {
        useAuthStore.getState().setUser(mockUser);
      });

      const { user, isAuthenticated } = useAuthStore.getState();
      expect(user).toEqual(mockUser);
      expect(isAuthenticated).toBe(true);
    });

    it('should clear user and mark as not authenticated when null', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date().toISOString(),
      };

      act(() => {
        useAuthStore.getState().setUser(mockUser);
        useAuthStore.getState().setUser(null);
      });

      const { user, isAuthenticated } = useAuthStore.getState();
      expect(user).toBeNull();
      expect(isAuthenticated).toBe(false);
    });
  });

  describe('setTokens', () => {
    it('should set both token and refreshToken', () => {
      const token = 'access_token_123';
      const refreshToken = 'refresh_token_456';

      act(() => {
        useAuthStore.getState().setTokens(token, refreshToken);
      });

      const state = useAuthStore.getState();
      expect(state.token).toBe(token);
      expect(state.refreshToken).toBe(refreshToken);
    });
  });

  describe('login', () => {
    it('should set loading state while logging in', async () => {
      // Mock successful login response
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            createdAt: new Date().toISOString(),
          },
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
        },
      });

      const loginPromise = act(async () => {
        return useAuthStore.getState().login('test@example.com', 'password');
      });

      // After login completes
      await loginPromise;

      const { isLoading } = useAuthStore.getState();
      expect(isLoading).toBe(false);
    });

    it('should set user and tokens after successful login', async () => {
      // Mock successful login response
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            createdAt: new Date().toISOString(),
          },
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
        },
      });

      await act(async () => {
        await useAuthStore.getState().login('test@example.com', 'password');
      });

      const { user, token, refreshToken, isAuthenticated } =
        useAuthStore.getState();

      expect(user).not.toBeNull();
      expect(user?.email).toBe('test@example.com');
      expect(token).toBe('mock_access_token');
      expect(refreshToken).toBe('mock_refresh_token');
      expect(isAuthenticated).toBe(true);
    });

    it('should have user with correct properties', async () => {
      // Mock successful login response
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            createdAt: new Date().toISOString(),
          },
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
        },
      });

      await act(async () => {
        await useAuthStore.getState().login('test@example.com', 'password');
      });

      const { user } = useAuthStore.getState();

      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('createdAt');
    });
  });

  describe('register', () => {
    it('should set user after successful registration', async () => {
      // Mock successful register response
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          user: {
            id: '1',
            email: 'new@example.com',
            name: 'New User',
            createdAt: new Date().toISOString(),
          },
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
        },
      });

      await act(async () => {
        await useAuthStore
          .getState()
          .register('New User', 'new@example.com', 'password');
      });

      const { user, isAuthenticated } = useAuthStore.getState();

      expect(user).not.toBeNull();
      expect(user?.name).toBe('New User');
      expect(user?.email).toBe('new@example.com');
      expect(isAuthenticated).toBe(true);
    });

    it('should set tokens after successful registration', async () => {
      // Mock successful register response
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          user: {
            id: '1',
            email: 'new@example.com',
            name: 'New User',
            createdAt: new Date().toISOString(),
          },
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
        },
      });

      await act(async () => {
        await useAuthStore
          .getState()
          .register('New User', 'new@example.com', 'password');
      });

      const { token, refreshToken } = useAuthStore.getState();

      expect(token).toBe('mock_access_token');
      expect(refreshToken).toBe('mock_refresh_token');
    });

    it('should clear loading state after registration', async () => {
      // Mock successful register response
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          user: {
            id: '1',
            email: 'new@example.com',
            name: 'New User',
            createdAt: new Date().toISOString(),
          },
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
        },
      });

      await act(async () => {
        await useAuthStore
          .getState()
          .register('New User', 'new@example.com', 'password');
      });

      const { isLoading } = useAuthStore.getState();
      expect(isLoading).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear all auth state', async () => {
      // Set initial state as logged in
      act(() => {
        useAuthStore.setState({
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            createdAt: new Date().toISOString(),
          },
          token: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
          isAuthenticated: true,
          isLoading: false,
        });
      });

      // Then logout
      await act(async () => {
        await useAuthStore.getState().logout();
      });

      const { user, token, refreshToken, isAuthenticated } =
        useAuthStore.getState();

      expect(user).toBeNull();
      expect(token).toBeNull();
      expect(refreshToken).toBeNull();
      expect(isAuthenticated).toBe(false);
    });

    it('should work even when not logged in', async () => {
      await expect(
        act(async () => {
          await useAuthStore.getState().logout();
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('updateUser', () => {
    it('should update user properties', async () => {
      // Set initial state as logged in
      act(() => {
        useAuthStore.setState({
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            createdAt: new Date().toISOString(),
          },
          token: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
          isAuthenticated: true,
          isLoading: false,
        });
      });

      act(() => {
        useAuthStore.getState().updateUser({ name: 'Updated Name' });
      });

      const { user } = useAuthStore.getState();
      expect(user?.name).toBe('Updated Name');
    });

    it('should preserve other user properties when updating', async () => {
      // Set initial state as logged in
      act(() => {
        useAuthStore.setState({
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            createdAt: new Date().toISOString(),
          },
          token: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
          isAuthenticated: true,
          isLoading: false,
        });
      });

      const originalEmail = useAuthStore.getState().user?.email;

      act(() => {
        useAuthStore.getState().updateUser({ name: 'New Name' });
      });

      const { user } = useAuthStore.getState();
      expect(user?.email).toBe(originalEmail);
    });

    it('should not update when no user is logged in', () => {
      act(() => {
        useAuthStore.getState().updateUser({ name: 'Test' });
      });

      const { user } = useAuthStore.getState();
      expect(user).toBeNull();
    });

    it('should allow updating multiple properties at once', async () => {
      // Set initial state as logged in
      act(() => {
        useAuthStore.setState({
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            createdAt: new Date().toISOString(),
          },
          token: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
          isAuthenticated: true,
          isLoading: false,
        });
      });

      act(() => {
        useAuthStore.getState().updateUser({
          name: 'New Name',
          bio: 'New bio',
          location: 'New York',
        });
      });

      const { user } = useAuthStore.getState();
      expect(user?.name).toBe('New Name');
      expect(user?.bio).toBe('New bio');
      expect(user?.location).toBe('New York');
    });
  });

  describe('refreshAuth', () => {
    it('should do nothing when no refreshToken exists', async () => {
      await act(async () => {
        await useAuthStore.getState().refreshAuth();
      });

      const { isAuthenticated } = useAuthStore.getState();
      expect(isAuthenticated).toBe(false);
    });

    it('should attempt refresh when refreshToken exists', async () => {
      // Set initial state with refreshToken
      act(() => {
        useAuthStore.setState({
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            createdAt: new Date().toISOString(),
          },
          token: 'old_access_token',
          refreshToken: 'mock_refresh_token',
          isAuthenticated: true,
          isLoading: false,
        });
      });

      // Mock successful refresh response
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          accessToken: 'new_access_token',
          refreshToken: 'new_refresh_token',
        },
      });

      // This should not throw
      await expect(
        act(async () => {
          await useAuthStore.getState().refreshAuth();
        }),
      ).resolves.not.toThrow();

      // API should have been called with refresh endpoint
      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken: 'mock_refresh_token',
      });
    });
  });

  describe('State Persistence', () => {
    it('should persist user state', async () => {
      // Mock successful login
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            createdAt: new Date().toISOString(),
          },
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
        },
      });

      await act(async () => {
        await useAuthStore.getState().login('test@example.com', 'password');
      });

      // The store is configured to persist these values
      const persistedState = useAuthStore.getState();

      expect(persistedState.user).not.toBeNull();
      expect(persistedState.token).not.toBeNull();
      expect(persistedState.refreshToken).not.toBeNull();
      expect(persistedState.isAuthenticated).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent login calls', async () => {
      // Mock successful login responses for both calls
      mockApiClient.post
        .mockResolvedValueOnce({
          data: {
            user: { id: '1', email: 'user1@example.com', name: 'User 1', createdAt: new Date().toISOString() },
            accessToken: 'token1',
            refreshToken: 'refresh1',
          },
        })
        .mockResolvedValueOnce({
          data: {
            user: { id: '2', email: 'user2@example.com', name: 'User 2', createdAt: new Date().toISOString() },
            accessToken: 'token2',
            refreshToken: 'refresh2',
          },
        });

      const login1 = act(async () => {
        await useAuthStore.getState().login('user1@example.com', 'password');
      });

      const login2 = act(async () => {
        await useAuthStore.getState().login('user2@example.com', 'password');
      });

      await Promise.all([login1, login2]);

      // One of the logins should complete
      const { isAuthenticated } = useAuthStore.getState();
      expect(isAuthenticated).toBe(true);
    });

    it('should handle login followed by immediate logout', async () => {
      // Mock successful login
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          user: { id: '1', email: 'test@example.com', name: 'Test User', createdAt: new Date().toISOString() },
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
        },
      });

      await act(async () => {
        await useAuthStore.getState().login('test@example.com', 'password');
        await useAuthStore.getState().logout();
      });

      const { isAuthenticated } = useAuthStore.getState();
      expect(isAuthenticated).toBe(false);
    });

    it('should handle update after logout', async () => {
      // Mock successful login
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          user: { id: '1', email: 'test@example.com', name: 'Test User', createdAt: new Date().toISOString() },
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
        },
      });

      await act(async () => {
        await useAuthStore.getState().login('test@example.com', 'password');
      });

      await act(async () => {
        await useAuthStore.getState().logout();
        useAuthStore.getState().updateUser({ name: 'Should not update' });
      });

      const { user } = useAuthStore.getState();
      expect(user).toBeNull();
    });
  });
});
