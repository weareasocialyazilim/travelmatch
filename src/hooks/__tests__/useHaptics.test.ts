/**
 * useHaptics Hook Tests
 * Testing haptic feedback functionality
 */

import { renderHook, act } from '@testing-library/react-native';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useHaptics } from '../useHaptics';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    warn: jest.fn(),
  },
}));

describe('useHaptics', () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Platform to iOS for tests
    Object.defineProperty(Platform, 'OS', {
      value: 'ios',
      writable: true,
    });
  });

  afterAll(() => {
    Object.defineProperty(Platform, 'OS', {
      value: originalPlatform,
      writable: true,
    });
  });

  describe('impact function', () => {
    it('should return impact function', () => {
      const { result } = renderHook(() => useHaptics());

      expect(result.current.impact).toBeDefined();
      expect(typeof result.current.impact).toBe('function');
    });

    it('should trigger light impact by default', async () => {
      const { result } = renderHook(() => useHaptics());

      await act(async () => {
        await result.current.impact();
      });

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light,
      );
    });

    it('should trigger light impact when specified', async () => {
      const { result } = renderHook(() => useHaptics());

      await act(async () => {
        await result.current.impact('light');
      });

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light,
      );
    });

    it('should trigger medium impact when specified', async () => {
      const { result } = renderHook(() => useHaptics());

      await act(async () => {
        await result.current.impact('medium');
      });

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Medium,
      );
    });

    it('should trigger heavy impact when specified', async () => {
      const { result } = renderHook(() => useHaptics());

      await act(async () => {
        await result.current.impact('heavy');
      });

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Heavy,
      );
    });

    it('should trigger success notification when specified', async () => {
      const { result } = renderHook(() => useHaptics());

      await act(async () => {
        await result.current.impact('success');
      });

      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success,
      );
    });

    it('should trigger warning notification when specified', async () => {
      const { result } = renderHook(() => useHaptics());

      await act(async () => {
        await result.current.impact('warning');
      });

      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Warning,
      );
    });

    it('should trigger error notification when specified', async () => {
      const { result } = renderHook(() => useHaptics());

      await act(async () => {
        await result.current.impact('error');
      });

      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Error,
      );
    });
  });

  describe('platform handling', () => {
    it('should not trigger haptics on web', async () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'web',
        writable: true,
      });

      const { result } = renderHook(() => useHaptics());

      await act(async () => {
        await result.current.impact('medium');
      });

      expect(Haptics.impactAsync).not.toHaveBeenCalled();
      expect(Haptics.notificationAsync).not.toHaveBeenCalled();
    });

    it('should trigger haptics on iOS', async () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'ios',
        writable: true,
      });

      const { result } = renderHook(() => useHaptics());

      await act(async () => {
        await result.current.impact('light');
      });

      expect(Haptics.impactAsync).toHaveBeenCalled();
    });

    it('should trigger haptics on Android', async () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'android',
        writable: true,
      });

      const { result } = renderHook(() => useHaptics());

      await act(async () => {
        await result.current.impact('light');
      });

      expect(Haptics.impactAsync).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle haptics errors gracefully', async () => {
      const mockError = new Error('Haptics not available');
      (Haptics.impactAsync as jest.Mock).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useHaptics());

      // Should not throw
      await act(async () => {
        await result.current.impact('light');
      });

      // Test passes if no error is thrown
      expect(true).toBe(true);
    });
  });
});
