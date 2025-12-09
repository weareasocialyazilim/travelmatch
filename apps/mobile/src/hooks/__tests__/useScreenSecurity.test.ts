/**
 * useScreenSecurity Hook - Comprehensive Tests
 * 
 * Tests for screenshot protection:
 * - Enable protection on mount
 * - Disable protection on unmount
 * - Handle permission errors
 * - Multiple instances
 * - Platform-specific behavior
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import * as ScreenCapture from 'expo-screen-capture';
import { logger } from '../../utils/logger';
import { useScreenSecurity } from '../useScreenSecurity';

// Mock dependencies
jest.mock('expo-screen-capture', () => ({
  preventScreenCaptureAsync: jest.fn(),
  allowScreenCaptureAsync: jest.fn(),
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const mockScreenCapture = ScreenCapture as jest.Mocked<typeof ScreenCapture>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('useScreenSecurity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Screenshot Protection', () => {
    it('should prevent screenshots on mount', async () => {
      mockScreenCapture.preventScreenCaptureAsync.mockResolvedValue(undefined);

      renderHook(() => useScreenSecurity());

      await waitFor(() => {
        expect(mockScreenCapture.preventScreenCaptureAsync).toHaveBeenCalledTimes(1);
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'ScreenSecurity',
        'Screenshot protection enabled'
      );
    });

    it('should allow screenshots on unmount', async () => {
      mockScreenCapture.preventScreenCaptureAsync.mockResolvedValue(undefined);
      mockScreenCapture.allowScreenCaptureAsync.mockResolvedValue(undefined);

      const { unmount } = renderHook(() => useScreenSecurity());

      await waitFor(() => {
        expect(mockScreenCapture.preventScreenCaptureAsync).toHaveBeenCalled();
      });

      unmount();

      await waitFor(() => {
        expect(mockScreenCapture.allowScreenCaptureAsync).toHaveBeenCalledTimes(1);
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'ScreenSecurity',
        'Screenshot protection disabled'
      );
    });

    it('should handle enable protection error gracefully', async () => {
      const error = new Error('Permission denied');
      mockScreenCapture.preventScreenCaptureAsync.mockRejectedValue(error);

      renderHook(() => useScreenSecurity());

      await waitFor(() => {
        expect(mockLogger.warn).toHaveBeenCalledWith(
          'ScreenSecurity',
          'Failed to enable screenshot protection',
          error
        );
      });

      // Should not throw
      expect(mockScreenCapture.preventScreenCaptureAsync).toHaveBeenCalled();
    });

    it('should handle disable protection error gracefully', async () => {
      mockScreenCapture.preventScreenCaptureAsync.mockResolvedValue(undefined);
      const error = new Error('Disable failed');
      mockScreenCapture.allowScreenCaptureAsync.mockRejectedValue(error);

      const { unmount } = renderHook(() => useScreenSecurity());

      await waitFor(() => {
        expect(mockScreenCapture.preventScreenCaptureAsync).toHaveBeenCalled();
      });

      unmount();

      await waitFor(() => {
        expect(mockLogger.warn).toHaveBeenCalledWith(
          'ScreenSecurity',
          'Failed to disable screenshot protection',
          error
        );
      });

      // Should not throw
      expect(mockScreenCapture.allowScreenCaptureAsync).toHaveBeenCalled();
    });

    it('should not disable if enable failed', async () => {
      mockScreenCapture.preventScreenCaptureAsync.mockRejectedValue(
        new Error('Enable failed')
      );

      const { unmount } = renderHook(() => useScreenSecurity());

      await waitFor(() => {
        expect(mockScreenCapture.preventScreenCaptureAsync).toHaveBeenCalled();
      });

      unmount();

      // Should not call allowScreenCaptureAsync since preventScreenCaptureAsync failed
      await waitFor(() => {
        expect(mockScreenCapture.allowScreenCaptureAsync).not.toHaveBeenCalled();
      });
    });
  });

  describe('Multiple Instances', () => {
    it('should handle multiple hooks enabling protection', async () => {
      mockScreenCapture.preventScreenCaptureAsync.mockResolvedValue(undefined);

      const { unmount: unmount1 } = renderHook(() => useScreenSecurity());
      const { unmount: unmount2 } = renderHook(() => useScreenSecurity());
      const { unmount: unmount3 } = renderHook(() => useScreenSecurity());

      await waitFor(() => {
        expect(mockScreenCapture.preventScreenCaptureAsync).toHaveBeenCalledTimes(3);
      });

      unmount1();
      unmount2();
      unmount3();

      await waitFor(() => {
        expect(mockScreenCapture.allowScreenCaptureAsync).toHaveBeenCalledTimes(3);
      });
    });

    it('should maintain protection if one instance remains', async () => {
      mockScreenCapture.preventScreenCaptureAsync.mockResolvedValue(undefined);
      mockScreenCapture.allowScreenCaptureAsync.mockResolvedValue(undefined);

      const { unmount: unmount1 } = renderHook(() => useScreenSecurity());
      const { unmount: unmount2 } = renderHook(() => useScreenSecurity());

      await waitFor(() => {
        expect(mockScreenCapture.preventScreenCaptureAsync).toHaveBeenCalledTimes(2);
      });

      // Unmount first instance
      unmount1();

      await waitFor(() => {
        expect(mockScreenCapture.allowScreenCaptureAsync).toHaveBeenCalledTimes(1);
      });

      // Second instance should still have protection
      expect(mockScreenCapture.allowScreenCaptureAsync).toHaveBeenCalledTimes(1);

      // Unmount second instance
      unmount2();

      await waitFor(() => {
        expect(mockScreenCapture.allowScreenCaptureAsync).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Remounting', () => {
    it('should re-enable protection on remount', async () => {
      mockScreenCapture.preventScreenCaptureAsync.mockResolvedValue(undefined);
      mockScreenCapture.allowScreenCaptureAsync.mockResolvedValue(undefined);

      const { unmount, rerender } = renderHook(() => useScreenSecurity());

      await waitFor(() => {
        expect(mockScreenCapture.preventScreenCaptureAsync).toHaveBeenCalledTimes(1);
      });

      unmount();

      await waitFor(() => {
        expect(mockScreenCapture.allowScreenCaptureAsync).toHaveBeenCalledTimes(1);
      });

      // Remount
      rerender({});

      await waitFor(() => {
        expect(mockScreenCapture.preventScreenCaptureAsync).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid mount/unmount', async () => {
      mockScreenCapture.preventScreenCaptureAsync.mockResolvedValue(undefined);
      mockScreenCapture.allowScreenCaptureAsync.mockResolvedValue(undefined);

      for (let i = 0; i < 10; i++) {
        const { unmount } = renderHook(() => useScreenSecurity());
        unmount();
      }

      await waitFor(() => {
        expect(mockScreenCapture.preventScreenCaptureAsync).toHaveBeenCalledTimes(10);
        expect(mockScreenCapture.allowScreenCaptureAsync).toHaveBeenCalled();
      });
    });

    it('should handle async enable during unmount', async () => {
      let resolvePrevent: () => void;
      const preventPromise = new Promise<void>((resolve) => {
        resolvePrevent = resolve;
      });

      mockScreenCapture.preventScreenCaptureAsync.mockReturnValue(preventPromise);
      mockScreenCapture.allowScreenCaptureAsync.mockResolvedValue(undefined);

      const { unmount } = renderHook(() => useScreenSecurity());

      // Unmount before enable completes
      unmount();

      // Complete enable
      resolvePrevent!();

      await waitFor(() => {
        expect(mockScreenCapture.preventScreenCaptureAsync).toHaveBeenCalled();
      });

      // Should still call allow after enable completes
      await waitFor(() => {
        expect(mockScreenCapture.allowScreenCaptureAsync).toHaveBeenCalled();
      });
    });

    it('should not crash if ScreenCapture is undefined', async () => {
      const originalPrevent = mockScreenCapture.preventScreenCaptureAsync;
      (mockScreenCapture.preventScreenCaptureAsync as any) = undefined;

      expect(() => {
        renderHook(() => useScreenSecurity());
      }).not.toThrow();

      mockScreenCapture.preventScreenCaptureAsync = originalPrevent;
    });
  });

  describe('Platform-Specific Behavior', () => {
    it('should work on iOS', async () => {
      const originalPlatform = jest.requireActual('react-native').Platform.OS;
      jest.mock('react-native', () => ({
        Platform: { OS: 'ios' },
      }));

      mockScreenCapture.preventScreenCaptureAsync.mockResolvedValue(undefined);

      renderHook(() => useScreenSecurity());

      await waitFor(() => {
        expect(mockScreenCapture.preventScreenCaptureAsync).toHaveBeenCalled();
      });

      // Restore
      jest.mock('react-native', () => ({
        Platform: { OS: originalPlatform },
      }));
    });

    it('should work on Android', async () => {
      const originalPlatform = jest.requireActual('react-native').Platform.OS;
      jest.mock('react-native', () => ({
        Platform: { OS: 'android' },
      }));

      mockScreenCapture.preventScreenCaptureAsync.mockResolvedValue(undefined);

      renderHook(() => useScreenSecurity());

      await waitFor(() => {
        expect(mockScreenCapture.preventScreenCaptureAsync).toHaveBeenCalled();
      });

      // Restore
      jest.mock('react-native', () => ({
        Platform: { OS: originalPlatform },
      }));
    });
  });

  describe('Logging', () => {
    it('should log successful enable', async () => {
      mockScreenCapture.preventScreenCaptureAsync.mockResolvedValue(undefined);

      renderHook(() => useScreenSecurity());

      await waitFor(() => {
        expect(mockLogger.info).toHaveBeenCalledWith(
          'ScreenSecurity',
          'Screenshot protection enabled'
        );
      });
    });

    it('should log successful disable', async () => {
      mockScreenCapture.preventScreenCaptureAsync.mockResolvedValue(undefined);
      mockScreenCapture.allowScreenCaptureAsync.mockResolvedValue(undefined);

      const { unmount } = renderHook(() => useScreenSecurity());

      await waitFor(() => {
        expect(mockScreenCapture.preventScreenCaptureAsync).toHaveBeenCalled();
      });

      unmount();

      await waitFor(() => {
        expect(mockLogger.info).toHaveBeenCalledWith(
          'ScreenSecurity',
          'Screenshot protection disabled'
        );
      });
    });

    it('should log enable errors', async () => {
      const error = new Error('Test error');
      mockScreenCapture.preventScreenCaptureAsync.mockRejectedValue(error);

      renderHook(() => useScreenSecurity());

      await waitFor(() => {
        expect(mockLogger.warn).toHaveBeenCalledWith(
          'ScreenSecurity',
          'Failed to enable screenshot protection',
          error
        );
      });
    });

    it('should log disable errors', async () => {
      mockScreenCapture.preventScreenCaptureAsync.mockResolvedValue(undefined);
      const error = new Error('Disable error');
      mockScreenCapture.allowScreenCaptureAsync.mockRejectedValue(error);

      const { unmount } = renderHook(() => useScreenSecurity());

      await waitFor(() => {
        expect(mockScreenCapture.preventScreenCaptureAsync).toHaveBeenCalled();
      });

      unmount();

      await waitFor(() => {
        expect(mockLogger.warn).toHaveBeenCalledWith(
          'ScreenSecurity',
          'Failed to disable screenshot protection',
          error
        );
      });
    });
  });
});
