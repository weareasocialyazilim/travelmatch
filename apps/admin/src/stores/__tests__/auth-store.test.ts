import { act } from '@testing-library/react';

// Reset modules before importing to get fresh store state
jest.resetModules();

// Mock zustand persist middleware
jest.mock('zustand/middleware', () => ({
  persist: (fn: unknown) => fn,
}));

describe('AuthStore', () => {
  let useAuthStore: typeof import('../auth-store').useAuthStore;

  beforeEach(() => {
    // Reset modules to get fresh store state
    jest.resetModules();
    // Re-import to get fresh store
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    useAuthStore = require('../auth-store').useAuthStore;
  });

  const mockUser = {
    id: 'user-1',
    email: 'admin@example.com',
    name: 'Admin User',
    full_name: 'Admin User',
    avatar_url: null,
    role: 'super_admin' as const,
    is_active: true,
    requires_2fa: true,
    totp_enabled: true,
    totp_secret: null, // Required by AdminUser type
    created_at: '2024-01-01T00:00:00Z',
    created_by: null,
    last_login_at: '2024-01-01T00:00:00Z',
  };

  describe('Initial state', () => {
    it('starts with null user', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });

    it('starts with isAuthenticated false', () => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
    });

    it('starts with is2FAVerified false', () => {
      const state = useAuthStore.getState();
      expect(state.is2FAVerified).toBe(false);
    });

    it('starts with isLoading true', () => {
      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(true);
    });
  });

  describe('setUser action', () => {
    it('sets user correctly', () => {
      act(() => {
        useAuthStore.getState().setUser(mockUser);
      });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('clears user when set to null', () => {
      // First set a user
      act(() => {
        useAuthStore.getState().setUser(mockUser);
      });

      // Then clear it
      act(() => {
        useAuthStore.getState().setUser(null);
      });

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('set2FAVerified action', () => {
    it('sets 2FA verified to true', () => {
      act(() => {
        useAuthStore.getState().set2FAVerified(true);
      });

      expect(useAuthStore.getState().is2FAVerified).toBe(true);
    });

    it('sets 2FA verified to false', () => {
      // First set to true
      act(() => {
        useAuthStore.getState().set2FAVerified(true);
      });

      // Then set to false
      act(() => {
        useAuthStore.getState().set2FAVerified(false);
      });

      expect(useAuthStore.getState().is2FAVerified).toBe(false);
    });
  });

  describe('setLoading action', () => {
    it('sets loading to true', () => {
      act(() => {
        useAuthStore.getState().setLoading(true);
      });

      expect(useAuthStore.getState().isLoading).toBe(true);
    });

    it('sets loading to false', () => {
      act(() => {
        useAuthStore.getState().setLoading(false);
      });

      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('logout action', () => {
    it('resets all auth state', () => {
      // First set up authenticated state
      act(() => {
        useAuthStore.getState().setUser(mockUser);
        useAuthStore.getState().set2FAVerified(true);
      });

      // Verify authenticated state
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      // Logout
      act(() => {
        useAuthStore.getState().logout();
      });

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.is2FAVerified).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });
});
