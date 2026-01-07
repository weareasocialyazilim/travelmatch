/**
 * useDebounce Hook Tests
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useDebounce, useDebouncedCallback } from '../../hooks/useDebounce';

describe('useDebounce Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('useDebounce', () => {
    it('returns initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 500));
      expect(result.current).toBe('initial');
    });

    it('delays value update', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'first', delay: 500 } },
      );

      expect(result.current).toBe('first');

      rerender({ value: 'second', delay: 500 });
      expect(result.current).toBe('first'); // Still first

      act(() => {
        jest.advanceTimersByTime(499);
      });
      expect(result.current).toBe('first'); // Still first

      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(result.current).toBe('second'); // Now second
    });

    it('cancels previous timeout on rapid changes', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 500),
        { initialProps: { value: 'first' } },
      );

      rerender({ value: 'second' });
      act(() => {
        jest.advanceTimersByTime(300);
      });

      rerender({ value: 'third' });
      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(result.current).toBe('first'); // Timeout was reset

      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(result.current).toBe('third'); // Now updated to latest
    });

    it('handles different data types', () => {
      // String
      const { result: stringResult } = renderHook(() =>
        useDebounce('test', 100),
      );
      expect(stringResult.current).toBe('test');

      // Number
      const { result: numberResult } = renderHook(() => useDebounce(42, 100));
      expect(numberResult.current).toBe(42);

      // Object
      const obj = { key: 'value' };
      const { result: objectResult } = renderHook(() => useDebounce(obj, 100));
      expect(objectResult.current).toBe(obj);

      // Array
      const arr = [1, 2, 3];
      const { result: arrayResult } = renderHook(() => useDebounce(arr, 100));
      expect(arrayResult.current).toBe(arr);
    });

    it('respects different delay values', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'first', delay: 1000 } },
      );

      rerender({ value: 'second', delay: 1000 });

      act(() => {
        jest.advanceTimersByTime(999);
      });
      expect(result.current).toBe('first');

      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(result.current).toBe('second');
    });

    it('cleans up timeout on unmount', () => {
      const { unmount } = renderHook(() => useDebounce('test', 500));

      unmount();

      // Should not throw or cause memory leaks
      act(() => {
        jest.advanceTimersByTime(500);
      });
    });
  });

  describe('useDebouncedCallback', () => {
    it('delays callback execution', () => {
      const callback = jest.fn() as jest.Mock;
      const { result } = renderHook(() => useDebouncedCallback(callback, 500));

      act(() => {
        result.current('arg1', 'arg2');
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('cancels previous call on rapid invocations', () => {
      const callback = jest.fn() as jest.Mock;
      const { result } = renderHook(() => useDebouncedCallback(callback, 500));

      act(() => {
        result.current('first');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      act(() => {
        result.current('second');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(callback).toHaveBeenCalledWith('second');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('handles multiple arguments', () => {
      const callback = jest.fn() as jest.Mock;
      const { result } = renderHook(() => useDebouncedCallback(callback, 500));

      act(() => {
        result.current(1, 'two', { three: 3 }, [4, 5]);
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(callback).toHaveBeenCalledWith(1, 'two', { three: 3 }, [4, 5]);
    });

    it('updates to latest callback', () => {
      let callbackValue = 'first';
      const callback1 = jest.fn(() => callbackValue);
      const callback2 = jest.fn(() => 'second');

      const { result, rerender } = renderHook(
        ({ cb }) => useDebouncedCallback(cb, 500),
        { initialProps: { cb: callback1 } },
      );

      act(() => {
        result.current();
      });

      callbackValue = 'updated';
      rerender({ cb: callback2 });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Should call the updated callback
      expect(callback2).toHaveBeenCalled();
    });

    it('cleans up timeout on unmount', () => {
      const callback = jest.fn() as jest.Mock;
      const { result, unmount } = renderHook(() =>
        useDebouncedCallback(callback, 500),
      );

      act(() => {
        result.current('test');
      });

      unmount();

      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Callback should not be called after unmount
      expect(callback).not.toHaveBeenCalled();
    });

    it('handles zero delay', () => {
      const callback = jest.fn() as jest.Mock;
      const { result } = renderHook(() => useDebouncedCallback(callback, 0));

      act(() => {
        result.current('immediate');
      });

      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(callback).toHaveBeenCalledWith('immediate');
    });

    it('returns stable function reference', () => {
      const callback = jest.fn() as jest.Mock;
      const { result, rerender } = renderHook(
        ({ cb }) => useDebouncedCallback(cb, 500),
        { initialProps: { cb: callback } },
      );

      const firstRef = result.current;

      rerender({ cb: callback });

      const secondRef = result.current;

      expect(firstRef).toBe(secondRef);
    });
  });

  describe('Real-world Scenarios', () => {
    it('search input debouncing', () => {
      const searchApi = jest.fn() as jest.Mock;
      const { result, rerender } = renderHook(
        ({ query }) => useDebounce(query, 300),
        { initialProps: { query: '' } },
      );

      // User types "hello" quickly
      rerender({ query: 'h' });
      rerender({ query: 'he' });
      rerender({ query: 'hel' });
      rerender({ query: 'hell' });
      rerender({ query: 'hello' });

      expect(result.current).toBe('');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current).toBe('hello');
      // Only one API call should be made
    });

    it('window resize debouncing', () => {
      const handleResize = jest.fn() as jest.Mock;
      const { result } = renderHook(() =>
        useDebouncedCallback(handleResize, 200),
      );

      // Simulate rapid resize events
      act(() => {
        result.current({ width: 100, height: 200 });
        jest.advanceTimersByTime(50);
        result.current({ width: 110, height: 210 });
        jest.advanceTimersByTime(50);
        result.current({ width: 120, height: 220 });
        jest.advanceTimersByTime(50);
        result.current({ width: 130, height: 230 });
      });

      expect(handleResize).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(handleResize).toHaveBeenCalledTimes(1);
      expect(handleResize).toHaveBeenCalledWith({ width: 130, height: 230 });
    });
  });
});
