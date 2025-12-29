import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminUser } from '@/types/admin';

interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  is2FAVerified: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;

  // Actions
  setUser: (user: AdminUser | null) => void;
  set2FAVerified: (verified: boolean) => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (state: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      is2FAVerified: false,
      isLoading: true,
      _hasHydrated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      set2FAVerified: (verified) => set({ is2FAVerified: verified }),

      setLoading: (loading) => set({ isLoading: loading }),

      setHasHydrated: (state) => set({ _hasHydrated: state, isLoading: false }),

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
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
