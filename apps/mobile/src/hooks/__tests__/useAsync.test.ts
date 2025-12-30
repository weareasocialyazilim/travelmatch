/**
 * useAsync Hook Tests
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAsync } from '../../hooks/useAsync';

describe('useAsync Hook', () => {
  describe('Initial State', () => {
    it('has correct initial state', () => {
      const asyncFn = jest.fn().mockResolvedValue('data');
      const { result } = renderHook(() => useAsync(asyncFn));

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('accepts initial data', () => {
      const asyncFn = jest.fn().mockResolvedValue('new data');
      const { result } = renderHook(() => 
        useAsync(asyncFn, { initialData: 'initial data' })
      );

      expect(result.current.data).toBe('initial data');
    });

    it('executes immediately when immediate option is true', async () => {
      const asyncFn = jest.fn().mockResolvedValue('data');
      const { result } = renderHook(() => 
        useAsync(asyncFn, { immediate: true })
      );

      expect(result.current.isLoading).toBe(true);
      
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(asyncFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Success Flow', () => {
    it('handles successful async operation', async () => {
      const asyncFn = jest.fn().mockResolvedValue('success data');
      const { result } = renderHook(() => useAsync(asyncFn));

      await act(async () => {
        await result.current.execute();
      });

      await waitFor(() => {
        expect(result.current.data).toBe('success data');
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
      });
    });

    it('calls onSuccess callback', async () => {
      const onSuccess = jest.fn() as jest.Mock;
      const asyncFn = jest.fn().mockResolvedValue('data');
      const { result } = renderHook(() => 
        useAsync(asyncFn, { onSuccess })
      );

      await act(async () => {
        await result.current.execute();
      });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith('data');
      });
    });

    it('passes arguments to async function', async () => {
      const asyncFn = jest.fn().mockResolvedValue('result');
      const { result } = renderHook(() => useAsync(asyncFn));

      await act(async () => {
        await result.current.execute('arg1', 'arg2', 123);
      });

      await waitFor(() => {
        expect(asyncFn).toHaveBeenCalledWith('arg1', 'arg2', 123);
      });
    });
  });

  describe('Error Flow', () => {
    it('handles async operation error', async () => {
      const error = new Error('Test error');
      const asyncFn = jest.fn().mockRejectedValue(error);
      const { result } = renderHook(() => useAsync(asyncFn));

      await act(async () => {
        await result.current.execute();
      });

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
        expect(result.current.isError).toBe(true);
        expect(result.current.isSuccess).toBe(false);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('calls onError callback', async () => {
      const error = new Error('Test error');
      const onError = jest.fn() as jest.Mock;
      const asyncFn = jest.fn().mockRejectedValue(error);
      const { result } = renderHook(() => 
        useAsync(asyncFn, { onError })
      );

      await act(async () => {
        await result.current.execute();
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(error);
      });
    });
  });

  describe('Loading State', () => {
    it('sets loading state during execution', async () => {
      let resolvePromise: (value: string) => void;
      const promise = new Promise<string>((resolve) => {
        resolvePromise = resolve;
      });
      const asyncFn = jest.fn().mockReturnValue(promise);
      const { result } = renderHook(() => useAsync(asyncFn));

      act(() => {
        result.current.execute();
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isSuccess).toBe(false);

      await act(async () => {
        resolvePromise!('data');
        await promise;
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(true);
    });

    it('keeps previous data when keepPreviousData is true', async () => {
      const asyncFn = jest
        .fn()
        .mockResolvedValueOnce('first')
        .mockResolvedValueOnce('second');
      
      const { result } = renderHook(() => 
        useAsync(asyncFn, { keepPreviousData: true })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toBe('first');

      act(() => {
        result.current.execute();
      });

      // Previous data should still be available
      expect(result.current.data).toBe('first');
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.data).toBe('second');
      });
    });

    it('clears previous data when keepPreviousData is false', async () => {
      const asyncFn = jest
        .fn()
        .mockResolvedValueOnce('first')
        .mockResolvedValueOnce('second');
      
      const { result } = renderHook(() => 
        useAsync(asyncFn, { keepPreviousData: false })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toBe('first');

      act(() => {
        result.current.execute();
      });

      // Data should be null while loading
      expect(result.current.data).toBeNull();

      await waitFor(() => {
        expect(result.current.data).toBe('second');
      });
    });
  });

  describe('Reset Functionality', () => {
    it('resets to initial state', async () => {
      const asyncFn = jest.fn().mockResolvedValue('data');
      const { result } = renderHook(() => useAsync(asyncFn));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toBe('data');
      expect(result.current.isSuccess).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('resets to initial data when provided', async () => {
      const asyncFn = jest.fn().mockResolvedValue('new data');
      const { result } = renderHook(() => 
        useAsync(asyncFn, { initialData: 'initial' })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toBe('new data');

      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBe('initial');
    });
  });

  describe('Manual Data Setting', () => {
    it('allows manual data setting', () => {
      const asyncFn = jest.fn().mockResolvedValue('async data');
      const { result } = renderHook(() => useAsync(asyncFn));

      act(() => {
        result.current.setData('manual data');
      });

      expect(result.current.data).toBe('manual data');
    });
  });

  describe('Memory Leaks Prevention', () => {
    it('does not update state after unmount', async () => {
      let resolvePromise: (value: string) => void;
      const promise = new Promise<string>((resolve) => {
        resolvePromise = resolve;
      });
      const asyncFn = jest.fn().mockReturnValue(promise);
      const { result, unmount } = renderHook(() => useAsync(asyncFn));

      act(() => {
        result.current.execute();
      });

      unmount();

      await act(async () => {
        resolvePromise!('data');
        await promise;
      });

      // Should not throw or update state after unmount
    });
  });

  describe('Multiple Executions', () => {
    it('handles multiple sequential executions', async () => {
      const asyncFn = jest
        .fn()
        .mockResolvedValueOnce('first')
        .mockResolvedValueOnce('second')
        .mockResolvedValueOnce('third');
      
      const { result } = renderHook(() => useAsync(asyncFn));

      await act(async () => {
        await result.current.execute();
      });
      expect(result.current.data).toBe('first');

      await act(async () => {
        await result.current.execute();
      });
      expect(result.current.data).toBe('second');

      await act(async () => {
        await result.current.execute();
      });
      expect(result.current.data).toBe('third');

      expect(asyncFn).toHaveBeenCalledTimes(3);
    });
  });
});
