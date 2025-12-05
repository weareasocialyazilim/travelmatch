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
import { secureStorage, AUTH_STORAGE_KEYS } from '../utils/secureStorage';
import { apiClient } from '../utils/api';
import { logger } from '../utils/logger';

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
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          // Real API call
          const response = await apiClient.post<{
            user: User;
            accessToken: string;
            refreshToken: string;
          }>('/auth/login', { email, password });

          const { user, accessToken, refreshToken } = response.data;

          // Store tokens securely
          await secureStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          await secureStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

          logger.info('[Auth] Login successful', { userId: user.id });

          set({
            user,
            token: accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          logger.error('[Auth] Login failed', error as Error);
          set({ isLoading: false });
          throw error;
        }
      },

      // Register
      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          // Real API call
          const response = await apiClient.post<{
            user: User;
            accessToken: string;
            refreshToken: string;
          }>('/auth/register', { name, email, password });

          const { user, accessToken, refreshToken } = response.data;

          // Store tokens securely
          await secureStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          await secureStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

          logger.info('[Auth] Registration successful', { userId: user.id });

          set({
            user,
            token: accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          logger.error('[Auth] Registration failed', error as Error);
          set({ isLoading: false });
          throw error;
        }
      },

      // Logout
      logout: async () => {
        try {
          // Clear secure storage
          await secureStorage.deleteItems([
            AUTH_STORAGE_KEYS.ACCESS_TOKEN,
            AUTH_STORAGE_KEYS.REFRESH_TOKEN,
            AUTH_STORAGE_KEYS.TOKEN_EXPIRES_AT,
          ]);
          logger.info('[Auth] Logout successful');
        } catch (error) {
          logger.error('[Auth] Error clearing tokens', error as Error);
        }
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
          const response = await apiClient.post<{
            accessToken: string;
            refreshToken: string;
          }>('/auth/refresh', { refreshToken });

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          // Update secure storage
          await secureStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          await secureStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

          set({ token: accessToken, refreshToken: newRefreshToken });
          logger.info('[Auth] Token refreshed successfully');
        } catch (error) {
          logger.error('[Auth] Token refresh failed', error as Error);
          // If refresh fails, logout
          await get().logout();
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
