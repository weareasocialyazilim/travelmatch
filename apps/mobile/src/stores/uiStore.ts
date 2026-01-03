/**
 * UI Store
 * Theme, language, ve diğer UI preferences
 *
 * @note Uses MMKV - 10-20x faster than AsyncStorage
 * @security All data here is non-sensitive and safe for MMKV storage
 *
 * ⚠️ GHOST STORE AUDIT (2026-01-03):
 * This store is currently NOT USED in production code.
 * All 4 state variables are "ghost states" - written but never read.
 *
 * Current app patterns use:
 * - I18nContext for language management
 * - useOnboarding() hook for onboarding state
 * - Component-level state for notification settings
 *
 * TODO: Either integrate this store into the app or remove it.
 * @see apps/mobile/src/context/I18nContext.tsx (current language pattern)
 * @see apps/mobile/src/hooks/useOnboarding.ts (current onboarding pattern)
 */

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { Storage } from '../utils/storage';

// Handle __DEV__ being undefined in test environments
const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : true;

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
  devtools(
    persist(
      (set) => ({
        // Initial State
        theme: 'system',
        language: 'tr',
        isOnboardingCompleted: false,
        notificationsEnabled: true,

        // Actions
        setTheme: (theme) => set({ theme }, false, 'ui/setTheme'),

        setLanguage: (language) => set({ language }, false, 'ui/setLanguage'),

        completeOnboarding: () =>
          set({ isOnboardingCompleted: true }, false, 'ui/completeOnboarding'),

        toggleNotifications: () =>
          set(
            (state) => ({
              notificationsEnabled: !state.notificationsEnabled,
            }),
            false,
            'ui/toggleNotifications',
          ),
      }),
      {
        name: 'ui-storage',
        storage: createJSONStorage(() => Storage),
      },
    ),
    {
      name: 'UIStore',
      enabled: isDev,
    },
  ),
);
