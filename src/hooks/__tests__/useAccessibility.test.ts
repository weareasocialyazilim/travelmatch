/**
 * useAccessibility Hook Tests
 * Testing accessibility utilities and hooks
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import {
  useScreenReader,
  useReduceMotion,
  useAccessibilityAnnounce,
  accessibilityProps,
} from '../useAccessibility';

// Mock AccessibilityInfo methods
const mockIsScreenReaderEnabled = jest.fn();
const mockIsReduceMotionEnabled = jest.fn();
const mockAddEventListener = jest.fn();
const mockAnnounceForAccessibility = jest.fn();

jest
  .spyOn(AccessibilityInfo, 'isScreenReaderEnabled')
  .mockImplementation(mockIsScreenReaderEnabled);
jest
  .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
  .mockImplementation(mockIsReduceMotionEnabled);
jest
  .spyOn(AccessibilityInfo, 'addEventListener')
  .mockImplementation(mockAddEventListener);
jest
  .spyOn(AccessibilityInfo, 'announceForAccessibility')
  .mockImplementation(mockAnnounceForAccessibility);

describe('useScreenReader', () => {
  let mockRemove: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRemove = jest.fn();
    mockIsScreenReaderEnabled.mockResolvedValue(false);
    mockAddEventListener.mockReturnValue({ remove: mockRemove });
  });

  it('should return false initially', async () => {
    const { result } = renderHook(() => useScreenReader());

    expect(result.current).toBe(false);
  });

  it('should check screen reader status on mount', async () => {
    mockIsScreenReaderEnabled.mockResolvedValue(true);

    const { result } = renderHook(() => useScreenReader());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should subscribe to screen reader changes', () => {
    renderHook(() => useScreenReader());

    expect(mockAddEventListener).toHaveBeenCalledWith(
      'screenReaderChanged',
      expect.any(Function),
    );
  });

  it('should unsubscribe on unmount', () => {
    const { unmount } = renderHook(() => useScreenReader());

    unmount();

    expect(mockRemove).toHaveBeenCalled();
  });

  it('should update when screen reader state changes', async () => {
    let callback: ((enabled: boolean) => void) | undefined;
    mockAddEventListener.mockImplementation((event, cb) => {
      if (event === 'screenReaderChanged') {
        callback = cb;
      }
      return { remove: mockRemove };
    });

    const { result } = renderHook(() => useScreenReader());

    expect(result.current).toBe(false);

    act(() => {
      if (callback) callback(true);
    });

    expect(result.current).toBe(true);
  });
});

describe('useReduceMotion', () => {
  let mockRemove: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRemove = jest.fn();
    mockIsReduceMotionEnabled.mockResolvedValue(false);
    mockAddEventListener.mockReturnValue({ remove: mockRemove });
  });

  it('should return false initially', async () => {
    const { result } = renderHook(() => useReduceMotion());

    expect(result.current).toBe(false);
  });

  it('should check reduce motion status on mount', async () => {
    mockIsReduceMotionEnabled.mockResolvedValue(true);

    const { result } = renderHook(() => useReduceMotion());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should subscribe to reduce motion changes', () => {
    renderHook(() => useReduceMotion());

    expect(mockAddEventListener).toHaveBeenCalledWith(
      'reduceMotionChanged',
      expect.any(Function),
    );
  });

  it('should unsubscribe on unmount', () => {
    const { unmount } = renderHook(() => useReduceMotion());

    unmount();

    expect(mockRemove).toHaveBeenCalled();
  });
});

describe('useAccessibilityAnnounce', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return announce function', () => {
    const { result } = renderHook(() => useAccessibilityAnnounce());

    expect(typeof result.current).toBe('function');
  });

  it('should call announceForAccessibility with message', () => {
    const { result } = renderHook(() => useAccessibilityAnnounce());

    act(() => {
      result.current('Test announcement');
    });

    expect(mockAnnounceForAccessibility).toHaveBeenCalledWith(
      'Test announcement',
    );
  });

  it('should be memoized', () => {
    const { result, rerender } = renderHook(() => useAccessibilityAnnounce());

    const firstAnnounce = result.current;
    rerender({});
    const secondAnnounce = result.current;

    expect(firstAnnounce).toBe(secondAnnounce);
  });
});

describe('accessibilityProps', () => {
  describe('button', () => {
    it('should return correct props for button', () => {
      const props = accessibilityProps.button('Submit');

      expect(props).toEqual({
        accessible: true,
        accessibilityRole: 'button',
        accessibilityLabel: 'Submit',
        accessibilityHint: undefined,
        accessibilityState: { disabled: undefined },
      });
    });

    it('should include hint when provided', () => {
      const props = accessibilityProps.button(
        'Submit',
        'Double tap to submit form',
      );

      expect(props.accessibilityHint).toBe('Double tap to submit form');
    });

    it('should include disabled state when provided', () => {
      const props = accessibilityProps.button('Submit', undefined, true);

      expect(props.accessibilityState?.disabled).toBe(true);
    });

    it('should include all props when all parameters provided', () => {
      const props = accessibilityProps.button(
        'Submit',
        'Double tap to submit',
        false,
      );

      expect(props).toEqual({
        accessible: true,
        accessibilityRole: 'button',
        accessibilityLabel: 'Submit',
        accessibilityHint: 'Double tap to submit',
        accessibilityState: { disabled: false },
      });
    });
  });

  describe('link', () => {
    it('should return correct props for link', () => {
      const props = accessibilityProps.link('Visit website');

      expect(props).toEqual({
        accessible: true,
        accessibilityRole: 'link',
        accessibilityLabel: 'Visit website',
      });
    });
  });
});
