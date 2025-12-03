/**
 * Auth Store
 * Zustand ile auth state management
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  createdAt: string;
}

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (token: string, refreshToken: string) => void;
  login: (email: string, _password: string) => Promise<void>;
  register: (name: string, email: string, _password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  refreshAuth: () => Promise<void>;
}

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
