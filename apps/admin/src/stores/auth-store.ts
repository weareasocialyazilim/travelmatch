import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminUser } from '@/types/admin';

interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  is2FAVerified: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: AdminUser | null) => void;
  set2FAVerified: (verified: boolean) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      is2FAVerified: false,
      isLoading: true,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      set2FAVerified: (verified) =>
        set({ is2FAVerified: verified }),

      setLoading: (loading) =>
        set({ isLoading: loading }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          is2FAVerified: false,
          isLoading: false,
        }),
    }),
    {
      name: 'admin-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        is2FAVerified: state.is2FAVerified,
      }),
    }
  )
);
