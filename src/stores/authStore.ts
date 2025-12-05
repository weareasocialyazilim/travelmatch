/**
 * Auth Store
 *
 * Zustand store for authentication state management.
 * Persists auth state to AsyncStorage for session persistence.
 *
 * @module stores/authStore
 *
 * @example
 * ```tsx
 * import { useAuthStore } from '../stores/authStore';
 *
 * const MyComponent = () => {
 *   const { user, isAuthenticated, login, logout } = useAuthStore();
 *
 *   const handleLogin = async () => {
 *     await login('user@example.com', 'password');
 *   };
 *
 *   return isAuthenticated ? (
 *     <Text>Welcome, {user?.name}</Text>
 *   ) : (
 *     <Button onPress={handleLogin}>Login</Button>
 *   );
 * };
 * ```
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * User profile data
 */
export interface User {
  /** Unique user identifier */
  id: string;
  /** User's email address */
  email: string;
  /** User's display name */
  name: string;
  /** URL to user's avatar image */
  avatar?: string;
  /** User's bio/description */
  bio?: string;
  /** User's location string */
  location?: string;
  /** Account creation timestamp */
  createdAt: string;
}

/**
 * Auth store state and actions
 */
interface AuthState {
  // State
  /** Current user data, null if not logged in */
  user: User | null;
  /** JWT access token */
  token: string | null;
  /** Token for refreshing access token */
  refreshToken: string | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether auth operation is in progress */
  isLoading: boolean;

  // Actions
  /** Set user data */
  setUser: (user: User | null) => void;
  /** Set authentication tokens */
  setTokens: (token: string, refreshToken: string) => void;
  /** Login with email and password */
  login: (email: string, _password: string) => Promise<void>;
  /** Register new account */
  register: (name: string, email: string, _password: string) => Promise<void>;
  /** Logout and clear session */
  logout: () => void;
  /** Update user profile data */
  updateUser: (updates: Partial<User>) => void;
  /** Refresh authentication tokens */
  refreshAuth: () => Promise<void>;
}

/**
 * Zustand auth store with persistence
 *
 * @returns Auth state and actions
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Set User
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      // Set Tokens
      setTokens: (token, refreshToken) =>
        set({
          token,
          refreshToken,
        }),

      // Login
      login: async (email, _password) => {
        set({ isLoading: true });
        try {
          // TODO: Replace with actual API call
          // const response = await api.post('/auth/login', { email, password });

          // Mock response
          const mockUser: User = {
            id: '1',
            email,
            name: 'John Doe',
            createdAt: new Date().toISOString(),
          };

          const mockToken = 'mock_token';
          const mockRefreshToken = 'mock_refresh_token';

          set({
            user: mockUser,
            token: mockToken,
            refreshToken: mockRefreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Register
      register: async (name, email, _password) => {
        set({ isLoading: true });
        try {
          // TODO: Replace with actual API call
          // const response = await api.post('/auth/register', { name, email, password });

          // Mock response
          const mockUser: User = {
            id: '1',
            email,
            name,
            createdAt: new Date().toISOString(),
          };

          const mockToken = 'mock_token';
          const mockRefreshToken = 'mock_refresh_token';

          set({
            user: mockUser,
            token: mockToken,
            refreshToken: mockRefreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Logout
      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      // Update User
      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },

      // Refresh Auth
      refreshAuth: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return;

        try {
          // TODO: Replace with actual API call
          // const response = await api.post('/auth/refresh', { refreshToken });
          // set({ token: response.data.token });
        } catch (error) {
          // If refresh fails, logout
          get().logout();
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
