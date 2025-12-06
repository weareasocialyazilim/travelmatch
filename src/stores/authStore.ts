/**
 * Auth Store
 *
 * Zustand store for authentication state management.
 * Persists auth state to AsyncStorage for session persistence.
 *
 * @module stores/authStore
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as authService from '../services/supabaseAuthService';
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
  logout: () => Promise<void>;
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
          const { user, session, error } = await authService.signInWithEmail(email, password);

          if (error) throw error;
          if (!user || !session) throw new Error('Login failed');

          const storeUser: User = {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || '',
            avatar: user.user_metadata?.avatar_url,
            createdAt: user.created_at,
          };

          set({
            user: storeUser,
            token: session.access_token,
            refreshToken: session.refresh_token,
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
          const { user, session, error } = await authService.signUpWithEmail(email, password, { name });

          if (error) throw error;
          if (!user) throw new Error('Registration failed');

          if (session) {
            const storeUser: User = {
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.name || '',
              avatar: user.user_metadata?.avatar_url,
              createdAt: user.created_at,
            };

            set({
              user: storeUser,
              token: session.access_token,
              refreshToken: session.refresh_token,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            logger.info('[Auth] Registration successful, waiting for email confirmation');
            set({ isLoading: false });
          }
        } catch (error) {
          logger.error('[Auth] Registration failed', error as Error);
          set({ isLoading: false });
          throw error;
        }
      },

      // Logout
      logout: async () => {
        try {
          await authService.signOut();
          logger.info('[Auth] Logout successful');
        } catch (error) {
          logger.error('[Auth] Error signing out', error as Error);
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
        try {
          const { session } = await authService.getSession();
          if (session) {
            set({ 
              token: session.access_token, 
              refreshToken: session.refresh_token 
            });
          } else {
            get().logout();
          }
        } catch (error) {
          logger.error('[Auth] Token refresh failed', error as Error);
          get().logout();
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
