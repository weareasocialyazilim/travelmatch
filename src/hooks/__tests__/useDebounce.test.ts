/**
 * useDebounce Hook Tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { useDebounce } from '@/utils/performance';

jest.useFakeTimers();

describe('useDebounce', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      (props: { value: string; delay: number }) =>
        useDebounce(props.value, props.delay),
      { initialProps: { value: 'initial', delay: 500 } },
    );

    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial'); // Still old value

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated'); // Now updated
  });

  it('should cancel previous timeout on rapid changes', () => {
    const { result, rerender } = renderHook(
      (props: { value: string }) => useDebounce(props.value, 500),
      { initialProps: { value: 'v1' } },
    );

    rerender({ value: 'v2' });
    act(() => {
      jest.advanceTimersByTime(250);
    });

    rerender({ value: 'v3' });
    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(result.current).toBe('v1'); // Still initial

    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(result.current).toBe('v3'); // Latest value
  });
});
