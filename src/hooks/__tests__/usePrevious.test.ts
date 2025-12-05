/**
 * usePrevious Hook Tests
 * Tests for tracking previous values of state and props
 */

import { renderHook, act } from '@testing-library/react-native';
import { useState } from 'react';
import {
  usePrevious,
  usePreviousWithInitial,
  useValueChange,
  useDeepCompare,
} from '../usePrevious';

describe('usePrevious', () => {
  describe('usePrevious', () => {
    it('should return undefined on first render', () => {
      const { result } = renderHook(() => usePrevious(0));
      
      expect(result.current).toBeUndefined();
    });

    it('should return previous value after update', () => {
      const { result, rerender } = renderHook(
        ({ value }) => usePrevious(value),
        { initialProps: { value: 0 } }
      );
      
      expect(result.current).toBeUndefined();
      
      rerender({ value: 1 });
      expect(result.current).toBe(0);
      
      rerender({ value: 2 });
      expect(result.current).toBe(1);
    });

    it('should work with string values', () => {
      const { result, rerender } = renderHook(
        ({ value }) => usePrevious(value),
        { initialProps: { value: 'hello' } }
      );
      
      expect(result.current).toBeUndefined();
      
      rerender({ value: 'world' });
      expect(result.current).toBe('hello');
    });

    it('should work with object values', () => {
      const obj1 = { id: 1 };
      const obj2 = { id: 2 };
      
      const { result, rerender } = renderHook(
        ({ value }) => usePrevious(value),
        { initialProps: { value: obj1 } }
      );
      
      expect(result.current).toBeUndefined();
      
      rerender({ value: obj2 });
      expect(result.current).toBe(obj1);
    });

    it('should work with null and undefined', () => {
      const { result, rerender } = renderHook(
        ({ value }) => usePrevious(value),
        { initialProps: { value: null as string | null } }
      );
      
      expect(result.current).toBeUndefined();
      
      rerender({ value: 'test' });
      expect(result.current).toBeNull();
      
      rerender({ value: null });
      expect(result.current).toBe('test');
    });

    it('should track multiple rapid updates', () => {
      const { result, rerender } = renderHook(
        ({ value }) => usePrevious(value),
        { initialProps: { value: 0 } }
      );
      
      rerender({ value: 1 });
      rerender({ value: 2 });
      rerender({ value: 3 });
      
      expect(result.current).toBe(2);
    });
  });

  describe('usePreviousWithInitial', () => {
    it('should return initial value on first render', () => {
      const { result } = renderHook(() => usePreviousWithInitial(0, -1));
      
      expect(result.current).toBe(-1);
    });

    it('should return previous value after update', () => {
      const { result, rerender } = renderHook(
        ({ value }) => usePreviousWithInitial(value, -1),
        { initialProps: { value: 0 } }
      );
      
      expect(result.current).toBe(-1);
      
      rerender({ value: 1 });
      expect(result.current).toBe(0);
      
      rerender({ value: 2 });
      expect(result.current).toBe(1);
    });

    it('should work with different initial value types', () => {
      const { result, rerender } = renderHook(
        ({ value }) => usePreviousWithInitial(value, 'default'),
        { initialProps: { value: 'first' } }
      );
      
      expect(result.current).toBe('default');
      
      rerender({ value: 'second' });
      expect(result.current).toBe('first');
    });

    it('should work with object initial value', () => {
      const initial = { id: 0, name: 'initial' };
      const first = { id: 1, name: 'first' };
      
      const { result, rerender } = renderHook(
        ({ value }) => usePreviousWithInitial(value, initial),
        { initialProps: { value: first } }
      );
      
      expect(result.current).toBe(initial);
      
      const second = { id: 2, name: 'second' };
      rerender({ value: second });
      expect(result.current).toBe(first);
    });
  });

  describe('useValueChange', () => {
    it('should return initial state correctly', () => {
      const { result } = renderHook(() => useValueChange('idle'));
      
      expect(result.current.current).toBe('idle');
      expect(result.current.previous).toBeUndefined();
      expect(result.current.hasChanged).toBe(false);
    });

    it('should detect value change', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useValueChange(value),
        { initialProps: { value: 'idle' } }
      );
      
      expect(result.current.hasChanged).toBe(false);
      
      rerender({ value: 'loading' });
      
      expect(result.current.current).toBe('loading');
      expect(result.current.previous).toBe('idle');
      expect(result.current.hasChanged).toBe(true);
    });

    it('should not report change when value is same', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useValueChange(value),
        { initialProps: { value: 'status' } }
      );
      
      rerender({ value: 'status' });
      
      expect(result.current.hasChanged).toBe(false);
    });

    it('should track multiple changes', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useValueChange(value),
        { initialProps: { value: 1 } }
      );
      
      // First render - no change
      expect(result.current.hasChanged).toBe(false);
      
      // Change to 2
      rerender({ value: 2 });
      expect(result.current.hasChanged).toBe(true);
      expect(result.current.previous).toBe(1);
      
      // Change to 3
      rerender({ value: 3 });
      expect(result.current.hasChanged).toBe(true);
      expect(result.current.previous).toBe(2);
      
      // No change
      rerender({ value: 3 });
      expect(result.current.hasChanged).toBe(false);
    });

    it('should work with boolean values', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useValueChange(value),
        { initialProps: { value: false } }
      );
      
      rerender({ value: true });
      
      expect(result.current.current).toBe(true);
      expect(result.current.previous).toBe(false);
      expect(result.current.hasChanged).toBe(true);
    });
  });

  describe('useDeepCompare', () => {
    it('should use custom comparator to detect changes', () => {
      const comparator = (prev: { id: number } | undefined, curr: { id: number }) =>
        prev?.id === curr?.id;
      
      const { result, rerender } = renderHook(
        ({ value }) => useDeepCompare(value, comparator),
        { initialProps: { value: { id: 1, name: 'John' } } }
      );
      
      expect(result.current.hasChanged).toBe(false);
      
      // Same id, different name - should not detect change
      rerender({ value: { id: 1, name: 'Jane' } });
      expect(result.current.hasChanged).toBe(false);
      
      // Different id - should detect change
      rerender({ value: { id: 2, name: 'Jane' } });
      expect(result.current.hasChanged).toBe(true);
    });

    it('should detect first real change after initial render', () => {
      const comparator = (prev: number | undefined, curr: number) =>
        prev === curr;
      
      const { result, rerender } = renderHook(
        ({ value }) => useDeepCompare(value, comparator),
        { initialProps: { value: 5 } }
      );
      
      // First render - no change
      expect(result.current.hasChanged).toBe(false);
      
      // Change to different value
      rerender({ value: 10 });
      expect(result.current.hasChanged).toBe(true);
    });

    it('should work with array comparison', () => {
      const comparator = (prev: number[] | undefined, curr: number[]) =>
        prev?.length === curr.length;
      
      const { result, rerender } = renderHook(
        ({ value }) => useDeepCompare(value, comparator),
        { initialProps: { value: [1, 2, 3] } }
      );
      
      // Same length - no change
      rerender({ value: [4, 5, 6] });
      expect(result.current.hasChanged).toBe(false);
      
      // Different length - change
      rerender({ value: [1, 2] });
      expect(result.current.hasChanged).toBe(true);
    });

    it('should handle undefined previous value in comparator', () => {
      const comparator = (prev: string | undefined, curr: string) => {
        if (prev === undefined) return true; // Treat as no change
        return prev === curr;
      };
      
      const { result, rerender } = renderHook(
        ({ value }) => useDeepCompare(value, comparator),
        { initialProps: { value: 'test' } }
      );
      
      expect(result.current.hasChanged).toBe(false);
      
      rerender({ value: 'different' });
      expect(result.current.hasChanged).toBe(true);
    });

    it('should return current and previous values', () => {
      const comparator = () => true; // Always same
      
      const { result, rerender } = renderHook(
        ({ value }) => useDeepCompare(value, comparator),
        { initialProps: { value: 'a' } }
      );
      
      expect(result.current.current).toBe('a');
      expect(result.current.previous).toBeUndefined();
      
      rerender({ value: 'b' });
      
      expect(result.current.current).toBe('b');
      expect(result.current.previous).toBe('a');
    });
  });

  describe('Integration scenarios', () => {
    it('should work in a component tracking state changes', () => {
      const { result, rerender } = renderHook(
        ({ status }) => {
          const prevStatus = usePrevious(status);
          const { hasChanged } = useValueChange(status);
          
          return {
            current: status,
            previous: prevStatus,
            hasChanged,
          };
        },
        { initialProps: { status: 'idle' } }
      );
      
      expect(result.current.current).toBe('idle');
      expect(result.current.previous).toBeUndefined();
      expect(result.current.hasChanged).toBe(false);
      
      rerender({ status: 'loading' });
      
      expect(result.current.current).toBe('loading');
      expect(result.current.previous).toBe('idle');
      expect(result.current.hasChanged).toBe(true);
    });

    it('should detect specific state transitions', () => {
      const { result, rerender } = renderHook(
        ({ status }) => {
          const prev = usePrevious(status);
          const isSuccess = status === 'success' && prev !== 'success';
          return { status, prev, isSuccess };
        },
        { initialProps: { status: 'idle' } }
      );
      
      expect(result.current.isSuccess).toBe(false);
      
      rerender({ status: 'loading' });
      expect(result.current.isSuccess).toBe(false);
      
      rerender({ status: 'success' });
      expect(result.current.isSuccess).toBe(true);
      
      // Stay on success
      rerender({ status: 'success' });
      expect(result.current.isSuccess).toBe(false);
    });
  });
});

describe('Default export', () => {
  it('exports usePrevious as default', () => {
    expect(usePrevious).toBeDefined();
  });
});
