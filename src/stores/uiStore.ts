/**
 * UI Store
 * Theme, language, ve diğer UI preferences
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'tr';

interface UIState {
  // State
  theme: Theme;
  language: Language;
  isOnboardingCompleted: boolean;
  notificationsEnabled: boolean;

  // Actions
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  completeOnboarding: () => void;
  toggleNotifications: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial State
      theme: 'system',
      language: 'tr',
      isOnboardingCompleted: false,
      notificationsEnabled: true,

      // Actions
      setTheme: (theme) => set({ theme }),

      setLanguage: (language) => set({ language }),

      completeOnboarding: () => set({ isOnboardingCompleted: true }),

      toggleNotifications: () =>
        set((state) => ({
          notificationsEnabled: !state.notificationsEnabled,
        })),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
