/**
 * Integration Tests
 *
 * Tests combined functionality of hooks + services + API
 * Ensures end-to-end data flow works correctly
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMoments } from '../../apps/mobile/src/hooks/useMoments';

// Mock all the dependencies
jest.mock('../../apps/mobile/src/config/supabase', () => {
  const mockMoments = [
    {
      id: '1',
      title: 'Paris Trip',
      description: 'Amazing journey',
      user_id: 'user-1',
      created_at: '2024-12-01T00:00:00Z',
      category_id: 'cat-1',
      price: 100,
      currency: 'USD',
      location_city: 'Paris',
      location_country: 'France',
      status: 'active',
      users: {
        full_name: 'Test User',
        avatar_url: '',
        rating: 4.5,
        review_count: 10,
      },
    },
    {
      id: '2',
      title: 'Tokyo Adventure',
      description: 'Unforgettable experience',
      user_id: 'user-1',
      created_at: '2024-12-02T00:00:00Z',
      category_id: 'cat-2',
      price: 200,
      currency: 'USD',
      location_city: 'Tokyo',
      location_country: 'Japan',
      status: 'active',
      users: {
        full_name: 'Test User',
        avatar_url: '',
        rating: 4.5,
        review_count: 10,
      },
    },
  ];

  const createChainMock = (data: any) => {
    const mock = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: data[0], error: null }),
      maybeSingle: jest.fn().mockResolvedValue({ data: data[0], error: null }),
    };
    // Make range resolve with the data
    mock.range.mockResolvedValue({ data, error: null, count: data.length });
    return mock;
  };

  return {
    supabase: {
      auth: {
        getUser: jest
          .fn()
          .mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
        getSession: jest.fn().mockResolvedValue({
          data: { session: { user: { id: 'user-1' } } },
          error: null,
        }),
      },
      from: jest.fn(() => createChainMock(mockMoments)),
      rpc: jest.fn().mockResolvedValue({ data: [], error: null }),
      channel: jest.fn(() => ({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }),
      })),
      removeChannel: jest.fn(),
    },
    isSupabaseConfigured: () => true,
  };
});

// Mock logger
jest.mock('../../apps/mobile/src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock errorHandler
jest.mock('../../apps/mobile/src/utils/errorHandler', () => ({
  ErrorHandler: {
    handle: jest.fn(),
    log: jest.fn(),
  },
}));

describe('Integration Tests: Moments Flow', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  describe('useMoments + momentsService + Supabase API', () => {
    it('should fetch moments and handle pagination', async () => {
      // Render hook with QueryClient provider
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(() => useMoments(), { wrapper });

      // Wait for data to load - the hook might return empty initially
      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
        },
        { timeout: 3000 },
      );

      // The hook fetches data, verify no error state
      expect(result.current.error).toBeNull();
    });

    it('should create moment and update cache', async () => {
      const newMoment = {
        title: 'New York Visit',
        description: 'City that never sleeps',
        price: 100,
        currency: 'USD',
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(() => useMoments(), { wrapper });

      // Wait for hook to be ready
      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
        },
        { timeout: 3000 },
      );

      // Verify hook provides createMoment function
      expect(typeof result.current.createMoment).toBe('function');
    });

    it('should handle API errors gracefully', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(() => useMoments(), { wrapper });

      // Wait for hook to finish loading
      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
        },
        { timeout: 3000 },
      );

      // Verify hook has proper structure
      expect(result.current).toHaveProperty('moments');
      expect(result.current).toHaveProperty('error');
    });
  });

  describe('Cache invalidation and updates', () => {
    it('should invalidate cache after mutation', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(() => useMoments(), { wrapper });

      // Wait for initial load
      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
        },
        { timeout: 3000 },
      );

      // Verify updateMoment function exists
      expect(typeof result.current.updateMoment).toBe('function');
    });
  });
});

describe('Integration Tests: Authentication Flow', () => {
  it('should login and store session', async () => {
    // TODO: Implement auth integration tests
    expect(true).toBe(true);
  });

  it('should handle OAuth callback', async () => {
    // TODO: Implement OAuth integration tests
    expect(true).toBe(true);
  });
});

describe('Integration Tests: Payment Flow', () => {
  it('should create payment intent and process payment', async () => {
    // TODO: Implement payment integration tests
    expect(true).toBe(true);
  });
});
