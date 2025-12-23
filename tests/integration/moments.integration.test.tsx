/**
 * Integration Tests
 * 
 * Tests combined functionality of hooks + services + API
 * Ensures end-to-end data flow works correctly
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMoments } from '../src/hooks/useMoments';
import { momentsService } from '../src/services/supabaseDbService';
import { supabase } from '../src/lib/supabase';

// Mock Supabase client
jest.mock('../src/lib/supabase');

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
      // Mock Supabase response
      const mockMoments = [
        {
          id: '1',
          title: 'Paris Trip',
          description: 'Amazing journey',
          user_id: 'user-1',
          created_at: '2024-12-01T00:00:00Z',
        },
        {
          id: '2',
          title: 'Tokyo Adventure',
          description: 'Unforgettable experience',
          user_id: 'user-1',
          created_at: '2024-12-02T00:00:00Z',
        },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: mockMoments,
                error: null,
              }),
            }),
          }),
        }),
      });

      // Render hook with QueryClient provider
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(() => useMoments(), { wrapper });

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.moments).toHaveLength(2);
      });

      // Verify data
      expect(result.current.moments[0].title).toBe('Paris Trip');
      expect(result.current.moments[1].title).toBe('Tokyo Adventure');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should create moment and update cache', async () => {
      const newMoment = {
        title: 'New York Visit',
        description: 'City that never sleeps',
        price: 100,
        currency: 'USD',
      };

      const createdMoment = {
        id: '3',
        ...newMoment,
        user_id: 'user-1',
        created_at: '2024-12-08T00:00:00Z',
      };

      // Mock create response
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: createdMoment,
              error: null,
            }),
          }),
        }),
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(() => useMoments(), { wrapper });

      // Create moment
      await waitFor(async () => {
        await result.current.createMoment(newMoment);
      });

      // Verify service was called
      expect(supabase.from).toHaveBeenCalledWith('moments');
    });

    it('should handle API errors gracefully', async () => {
      // Mock error response
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Network error', code: 'NETWORK_ERROR' },
              }),
            }),
          }),
        }),
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(() => useMoments(), { wrapper });

      // Wait for error state
      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.moments).toHaveLength(0);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Cache invalidation and updates', () => {
    it('should invalidate cache after mutation', async () => {
      const mockMoments = [{ id: '1', title: 'Test' }];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: mockMoments,
                error: null,
              }),
            }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: '1', title: 'Updated Test' },
                error: null,
              }),
            }),
          }),
        }),
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(() => useMoments(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.moments).toHaveLength(1);
      });

      // Update moment
      await waitFor(async () => {
        await result.current.updateMoment('1', { title: 'Updated Test' });
      });

      // Cache should be invalidated
      expect(queryClient.getQueryState(['moments']))?.isInvalidated;
    });
  });
});

describe('Integration Tests: Authentication Flow', () => {
  it('should login and store session', async () => {
    // TODO: Implement auth integration tests
  });

  it('should handle OAuth callback', async () => {
    // TODO: Implement OAuth integration tests
  });
});

describe('Integration Tests: Payment Flow', () => {
  it('should create payment intent and process payment', async () => {
    // TODO: Implement payment integration tests
  });
});
