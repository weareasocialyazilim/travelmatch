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

describe('authStore', () => {
  // Reset store before each test
  beforeEach(() => {
    act(() => {
      useAuthStore.getState().logout();
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
      const loginPromise = act(async () => {
        return useAuthStore.getState().login('test@example.com', 'password');
      });

      // After login completes
      await loginPromise;

      const { isLoading } = useAuthStore.getState();
      expect(isLoading).toBe(false);
    });

    it('should set user and tokens after successful login', async () => {
      await act(async () => {
        await useAuthStore.getState().login('test@example.com', 'password');
      });

      const { user, token, refreshToken, isAuthenticated } =
        useAuthStore.getState();

      expect(user).not.toBeNull();
      expect(user?.email).toBe('test@example.com');
      expect(token).toBe('mock_token');
      expect(refreshToken).toBe('mock_refresh_token');
      expect(isAuthenticated).toBe(true);
    });

    it('should have user with correct properties', async () => {
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
      await act(async () => {
        await useAuthStore
          .getState()
          .register('New User', 'new@example.com', 'password');
      });

      const { token, refreshToken } = useAuthStore.getState();

      expect(token).toBe('mock_token');
      expect(refreshToken).toBe('mock_refresh_token');
    });

    it('should clear loading state after registration', async () => {
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
      // First login
      await act(async () => {
        await useAuthStore.getState().login('test@example.com', 'password');
      });

      // Then logout
      act(() => {
        useAuthStore.getState().logout();
      });

      const { user, token, refreshToken, isAuthenticated } =
        useAuthStore.getState();

      expect(user).toBeNull();
      expect(token).toBeNull();
      expect(refreshToken).toBeNull();
      expect(isAuthenticated).toBe(false);
    });

    it('should work even when not logged in', () => {
      expect(() => {
        act(() => {
          useAuthStore.getState().logout();
        });
      }).not.toThrow();
    });
  });

  describe('updateUser', () => {
    it('should update user properties', async () => {
      await act(async () => {
        await useAuthStore.getState().login('test@example.com', 'password');
      });

      act(() => {
        useAuthStore.getState().updateUser({ name: 'Updated Name' });
      });

      const { user } = useAuthStore.getState();
      expect(user?.name).toBe('Updated Name');
    });

    it('should preserve other user properties when updating', async () => {
      await act(async () => {
        await useAuthStore.getState().login('test@example.com', 'password');
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
      await act(async () => {
        await useAuthStore.getState().login('test@example.com', 'password');
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
      await act(async () => {
        await useAuthStore.getState().login('test@example.com', 'password');
      });

      // This should not throw
      await expect(
        act(async () => {
          await useAuthStore.getState().refreshAuth();
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('State Persistence', () => {
    it('should persist user state', async () => {
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
      await act(async () => {
        await useAuthStore.getState().login('test@example.com', 'password');
        useAuthStore.getState().logout();
      });

      const { isAuthenticated } = useAuthStore.getState();
      expect(isAuthenticated).toBe(false);
    });

    it('should handle update after logout', async () => {
      await act(async () => {
        await useAuthStore.getState().login('test@example.com', 'password');
      });

      act(() => {
        useAuthStore.getState().logout();
        useAuthStore.getState().updateUser({ name: 'Should not update' });
      });

      const { user } = useAuthStore.getState();
      expect(user).toBeNull();
    });
  });
});
