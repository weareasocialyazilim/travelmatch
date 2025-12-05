/**
 * useFetch Hook Tests
 * Testing data fetching functionality
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useFetch } from '../useFetch';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('useFetch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
  });

  it('should initialize with loading state', () => {
    mockFetch.mockImplementation(
      () =>
        new Promise(() => {
          // Never resolves - simulates pending request
        }),
    );

    const { result } = renderHook(() => useFetch<{ id: string }>('/api/test'));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should skip initial fetch when skip option is true', () => {
    const { result } = renderHook(() => useFetch('/api/test', { skip: true }));

    expect(result.current.loading).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should fetch data successfully', async () => {
    const mockData = { id: '1', name: 'Test User' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const { result } = renderHook(() =>
      useFetch<typeof mockData>('/api/users/1'),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('should handle HTTP errors', async () => {
    const onError = jest.fn();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'Not found' }),
    });

    renderHook(() => useFetch('/api/not-found', { onError }));

    await waitFor(
      () => {
        expect(onError).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );
  });

  it('should handle HTTP errors with default message', async () => {
    const onError = jest.fn();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('Invalid JSON')),
    });

    renderHook(() => useFetch('/api/error', { onError }));

    await waitFor(
      () => {
        expect(onError).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );
  });

  it('should call onSuccess callback on successful fetch', async () => {
    const mockData = { id: '1' };
    const onSuccess = jest.fn();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    renderHook(() => useFetch<typeof mockData>('/api/test', { onSuccess }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockData);
    });
  });

  it('should call onError callback on failed fetch', async () => {
    const onError = jest.fn();

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'Bad request' }),
    });

    renderHook(() => useFetch('/api/test', { onError }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Bad request'),
      }),
    );
  });

  it('should refetch data when refetch is called', async () => {
    const mockData = { id: '1', version: 1 };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const { result } = renderHook(() => useFetch<typeof mockData>('/api/test'));

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 3000 },
    );

    const initialCallCount = mockFetch.mock.calls.length;

    act(() => {
      result.current.refetch();
    });

    await waitFor(
      () => {
        expect(mockFetch.mock.calls.length).toBeGreaterThan(initialCallCount);
      },
      { timeout: 3000 },
    );
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useFetch('/api/test'));

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).not.toBeNull();
      },
      { timeout: 3000 },
    );
  });

  it('should pass abort signal to fetch', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    renderHook(() => useFetch('/api/test'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it('should provide refetch function', () => {
    mockFetch.mockImplementation(
      () =>
        new Promise(() => {
          // Never resolves - simulates pending request
        }),
    );

    const { result } = renderHook(() => useFetch('/api/test'));

    expect(typeof result.current.refetch).toBe('function');
  });
});
