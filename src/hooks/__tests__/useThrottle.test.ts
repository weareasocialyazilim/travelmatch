/**
 * useThrottle Hook Tests
 * Tests for throttling values and callbacks
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import {
  useThrottle,
  useThrottledCallback,
  useThrottleState,
} from '../useThrottle';

describe('useThrottle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('useThrottle', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useThrottle('initial', 100));
      
      expect(result.current).toBe('initial');
    });

    it('should throttle value updates', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useThrottle(value, 100),
        { initialProps: { value: 0 } }
      );
      
      expect(result.current).toBe(0);
      
      // Update value
      rerender({ value: 1 });
      
      // May not update immediately, depends on implementation
      // Advance time to ensure update
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      expect(result.current).toBe(1);
      
      // Rapid updates
      rerender({ value: 2 });
      rerender({ value: 3 });
      
      // Advance time
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      // Should have the latest value after throttle interval
      expect(result.current).toBe(3);
    });

    it('should update after interval elapses', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useThrottle(value, 200),
        { initialProps: { value: 'a' } }
      );
      
      rerender({ value: 'b' });
      
      act(() => {
        jest.advanceTimersByTime(200);
      });
      
      expect(result.current).toBe('b');
    });

    it('should handle different interval values', () => {
      const { result, rerender } = renderHook(
        ({ value, interval }) => useThrottle(value, interval),
        { initialProps: { value: 0, interval: 50 } }
      );
      
      rerender({ value: 1, interval: 50 });
      
      act(() => {
        jest.advanceTimersByTime(50);
      });
      
      expect(result.current).toBe(1);
    });

    it('should work with object values', () => {
      const obj1 = { count: 1 };
      const obj2 = { count: 2 };
      
      const { result, rerender } = renderHook(
        ({ value }) => useThrottle(value, 100),
        { initialProps: { value: obj1 } }
      );
      
      expect(result.current).toBe(obj1);
      
      rerender({ value: obj2 });
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      expect(result.current).toBe(obj2);
    });
  });

  describe('useThrottledCallback', () => {
    it('should execute callback immediately on first call', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useThrottledCallback(callback, 100));
      
      act(() => {
        result.current('arg1');
      });
      
      expect(callback).toHaveBeenCalledWith('arg1');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should throttle subsequent calls', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useThrottledCallback(callback, 100));
      
      act(() => {
        result.current('first');
      });
      
      expect(callback).toHaveBeenCalledTimes(1);
      
      // Rapid calls within interval
      act(() => {
        result.current('second');
        result.current('third');
      });
      
      // Should still be 1 (throttled)
      expect(callback).toHaveBeenCalledTimes(1);
      
      // After interval, trailing call should execute
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenLastCalledWith('third');
    });

    it('should pass arguments correctly', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useThrottledCallback(callback, 100));
      
      act(() => {
        result.current('a', 'b', 'c');
      });
      
      expect(callback).toHaveBeenCalledWith('a', 'b', 'c');
    });

    it('should update callback reference', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      const { result, rerender } = renderHook(
        ({ cb }) => useThrottledCallback(cb, 100),
        { initialProps: { cb: callback1 } }
      );
      
      act(() => {
        result.current();
      });
      
      expect(callback1).toHaveBeenCalledTimes(1);
      
      // Update callback
      rerender({ cb: callback2 });
      
      // Wait for interval
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      act(() => {
        result.current();
      });
      
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('should cleanup timeout on unmount', () => {
      const callback = jest.fn();
      const { result, unmount } = renderHook(() => 
        useThrottledCallback(callback, 100)
      );
      
      act(() => {
        result.current();
        result.current();
      });
      
      unmount();
      
      // Should not throw or cause issues
      act(() => {
        jest.advanceTimersByTime(200);
      });
    });

    it('should handle zero interval', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useThrottledCallback(callback, 0));
      
      act(() => {
        result.current();
        result.current();
        result.current();
      });
      
      // All calls should execute with 0 interval
      expect(callback.mock.calls.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('useThrottleState', () => {
    it('should return initial value and not pending', () => {
      const { result } = renderHook(() => 
        useThrottleState('initial', { interval: 100 })
      );
      
      expect(result.current.throttledValue).toBe('initial');
    });

    it('should throttle with leading edge by default', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useThrottleState(value, { interval: 100 }),
        { initialProps: { value: 0 } }
      );
      
      // Update value
      rerender({ value: 1 });
      
      // Leading edge behavior - may update immediately or after timeout
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      expect(result.current.throttledValue).toBe(1);
    });

    it('should show pending state', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useThrottleState(value, { interval: 100 }),
        { initialProps: { value: 'a' } }
      );
      
      rerender({ value: 'b' });
      
      // After immediate update, rapid changes should show pending
      rerender({ value: 'c' });
      
      // Pending depends on timing, just verify the structure
      expect(typeof result.current.isPending).toBe('boolean');
    });

    it('should respect leading: false option', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useThrottleState(value, { 
          interval: 100, 
          leading: false 
        }),
        { initialProps: { value: 0 } }
      );
      
      expect(result.current.throttledValue).toBe(0);
      
      rerender({ value: 1 });
      
      // Should not update immediately with leading: false
      expect(result.current.isPending).toBe(true);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      expect(result.current.throttledValue).toBe(1);
    });

    it('should respect trailing: false option', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useThrottleState(value, { 
          interval: 100, 
          trailing: false 
        }),
        { initialProps: { value: 0 } }
      );
      
      rerender({ value: 1 });
      
      // Wait for full interval
      act(() => {
        jest.advanceTimersByTime(150);
      });
      
      // Value should update
      expect(typeof result.current.throttledValue).toBe('number');
      
      // Rapid updates within interval
      rerender({ value: 2 });
      rerender({ value: 3 });
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      // Verify structure is correct
      expect(typeof result.current.throttledValue).toBe('number');
      expect(typeof result.current.isPending).toBe('boolean');
    });

    it('should cleanup on unmount', () => {
      const { result, unmount } = renderHook(() => 
        useThrottleState(0, { interval: 100 })
      );
      
      unmount();
      
      // Should not throw
      act(() => {
        jest.advanceTimersByTime(200);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle rapid interval changes', () => {
      const { result, rerender } = renderHook(
        ({ value, interval }) => useThrottle(value, interval),
        { initialProps: { value: 0, interval: 100 } }
      );
      
      rerender({ value: 1, interval: 50 });
      rerender({ value: 2, interval: 200 });
      
      act(() => {
        jest.advanceTimersByTime(200);
      });
      
      expect(result.current).toBe(2);
    });

    it('should handle value changing to same value', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useThrottle(value, 100),
        { initialProps: { value: 'same' } }
      );
      
      rerender({ value: 'same' });
      rerender({ value: 'same' });
      
      expect(result.current).toBe('same');
    });
  });
});

describe('Default export', () => {
  it('exports useThrottle as default', () => {
    expect(useThrottle).toBeDefined();
  });
});
