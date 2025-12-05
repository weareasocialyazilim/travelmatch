/**
 * UI Store Tests
 * Testing theme, language, and UI preferences
 */

import { act, renderHook } from '@testing-library/react-native';
import { useUIStore } from '../uiStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('uiStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useUIStore.setState({
        theme: 'system',
        language: 'tr',
        isOnboardingCompleted: false,
        notificationsEnabled: true,
      });
    });
  });

  describe('initial state', () => {
    it('should have default theme as system', () => {
      const { result } = renderHook(() => useUIStore());
      expect(result.current.theme).toBe('system');
    });

    it('should have default language as tr', () => {
      const { result } = renderHook(() => useUIStore());
      expect(result.current.language).toBe('tr');
    });

    it('should have onboarding not completed', () => {
      const { result } = renderHook(() => useUIStore());
      expect(result.current.isOnboardingCompleted).toBe(false);
    });

    it('should have notifications enabled', () => {
      const { result } = renderHook(() => useUIStore());
      expect(result.current.notificationsEnabled).toBe(true);
    });
  });

  describe('setTheme', () => {
    it('should set theme to light', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setTheme('light');
      });

      expect(result.current.theme).toBe('light');
    });

    it('should set theme to dark', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
    });

    it('should set theme to system', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setTheme('dark');
        result.current.setTheme('system');
      });

      expect(result.current.theme).toBe('system');
    });
  });

  describe('setLanguage', () => {
    it('should set language to en', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setLanguage('en');
      });

      expect(result.current.language).toBe('en');
    });

    it('should set language to tr', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setLanguage('en');
        result.current.setLanguage('tr');
      });

      expect(result.current.language).toBe('tr');
    });
  });

  describe('completeOnboarding', () => {
    it('should set isOnboardingCompleted to true', () => {
      const { result } = renderHook(() => useUIStore());

      expect(result.current.isOnboardingCompleted).toBe(false);

      act(() => {
        result.current.completeOnboarding();
      });

      expect(result.current.isOnboardingCompleted).toBe(true);
    });

    it('should remain true after multiple calls', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.completeOnboarding();
        result.current.completeOnboarding();
      });

      expect(result.current.isOnboardingCompleted).toBe(true);
    });
  });

  describe('toggleNotifications', () => {
    it('should toggle from true to false', () => {
      const { result } = renderHook(() => useUIStore());

      expect(result.current.notificationsEnabled).toBe(true);

      act(() => {
        result.current.toggleNotifications();
      });

      expect(result.current.notificationsEnabled).toBe(false);
    });

    it('should toggle from false to true', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.toggleNotifications(); // true -> false
        result.current.toggleNotifications(); // false -> true
      });

      expect(result.current.notificationsEnabled).toBe(true);
    });

    it('should toggle multiple times correctly', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.toggleNotifications(); // false
      });
      expect(result.current.notificationsEnabled).toBe(false);

      act(() => {
        result.current.toggleNotifications(); // true
      });
      expect(result.current.notificationsEnabled).toBe(true);

      act(() => {
        result.current.toggleNotifications(); // false
      });
      expect(result.current.notificationsEnabled).toBe(false);
    });
  });

  describe('state persistence shape', () => {
    it('should have all required state properties', () => {
      const { result } = renderHook(() => useUIStore());

      expect(result.current).toHaveProperty('theme');
      expect(result.current).toHaveProperty('language');
      expect(result.current).toHaveProperty('isOnboardingCompleted');
      expect(result.current).toHaveProperty('notificationsEnabled');
    });

    it('should have all required action functions', () => {
      const { result } = renderHook(() => useUIStore());

      expect(typeof result.current.setTheme).toBe('function');
      expect(typeof result.current.setLanguage).toBe('function');
      expect(typeof result.current.completeOnboarding).toBe('function');
      expect(typeof result.current.toggleNotifications).toBe('function');
    });
  });
});
