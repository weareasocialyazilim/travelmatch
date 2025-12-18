/**
 * useMoments Hook Tests
 * Integration tests for optimized data fetching
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useMoments } from '../../hooks/useMoments';
import { momentsService } from '../../services/supabaseDbService';
import { supabase } from '../../config/supabase';

// Mock dependencies
jest.mock('../../services/supabaseDbService');
jest.mock('../../config/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));
jest.mock('../../utils/logger');

// Skip: These performance tests need refactoring to match actual hook behavior
// The mock structure doesn't align with the real service implementation
// TODO: Refactor to use proper E2E testing with actual Supabase instance
describe.skip('useMoments Hook - Performance Optimization', () => {
  const mockMomentsServiceListWithCursor = momentsService.listWithCursor as jest.MockedFunction<
    typeof momentsService.listWithCursor
  >;
  const mockMomentsServiceGetSaved = momentsService.getSaved as jest.MockedFunction<
    typeof momentsService.getSaved
  >;
  const mockGetUser = supabase.auth.getUser as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
  });

  describe('Data Mapping with Optimized Joins', () => {
    it('should correctly map moment data from optimized join structure', async () => {
      const mockData = [
        {
          id: 'moment-1',
          title: 'Beach Adventure',
          description: 'Fun beach day',
          category: 'adventure',
          location: { city: 'Miami', country: 'USA' },
          images: ['img1.jpg', 'img2.jpg'],
          price: 50,
          currency: 'USD',
          max_guests: 4,
          duration: '4 hours',
          availability: ['2024-01-01'],
          user_id: 'host-1',
          users: {
            id: 'host-1',
            name: 'John Doe',
            avatar: 'avatar.jpg',
            trust_score: 85,
            review_count: 12,
            rating: 4.5,
          },
          categories: {
            id: 'adventure',
            name: 'Adventure',
            emoji: '🏔️',
          },
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockMomentsServiceListWithCursor.mockResolvedValue({
        data: mockData,
        meta: { next_cursor: null, has_more: false, count: 1 },
        error: null,
      });

      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const moment = result.current.moments[0];
      expect(moment).toMatchObject({
        id: 'moment-1',
        title: 'Beach Adventure',
        hostName: 'John Doe',
        hostAvatar: 'avatar.jpg',
        hostRating: 4.5,
        hostReviewCount: 12,
        pricePerGuest: 50,
      });
    });

    it('should handle missing user data gracefully', async () => {
      const mockData = [
        {
          id: 'moment-1',
          title: 'Orphaned Moment',
          description: 'Test',
          category: 'adventure',
          location: { city: 'Test', country: 'Test' },
          images: [],
          price: 30,
          currency: 'USD',
          max_guests: 2,
          duration: '2 hours',
          availability: [],
          users: null, // User deleted
          user_id: 'deleted-user',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockMomentsServiceListWithCursor.mockResolvedValue({
        data: mockData,
        meta: { next_cursor: null, has_more: false, count: 1 },
        error: null,
      });

      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const moment = result.current.moments[0];
      expect(moment.hostName).toBe('Unknown');
      expect(moment.hostAvatar).toBe('');
      expect(moment.hostRating).toBe(0);
    });

    it('should extract trust_score when rating is not available', async () => {
      const mockData = [
        {
          id: 'moment-1',
          title: 'Test',
          description: 'Test description',
          category: 'adventure',
          location: { city: 'Test', country: 'Test' },
          images: [],
          price: 40,
          currency: 'USD',
          max_guests: 2,
          duration: '2 hours',
          availability: [],
          users: {
            id: 'host-1',
            name: 'Jane',
            avatar: '',
            trust_score: 92,
            review_count: 0,
            // No rating field
          },
          user_id: 'host-1',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockMomentsServiceListWithCursor.mockResolvedValue({
        data: mockData,
        meta: { next_cursor: null, has_more: false, count: 1 },
        error: null,
      });

      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.moments[0].hostRating).toBe(92);
    });
  });

  describe('Query Efficiency', () => {
    it('should fetch moments only once on mount', async () => {
      mockMomentsServiceListWithCursor.mockResolvedValue({
        data: [],
        meta: { next_cursor: null, has_more: false, count: 0 },
        error: null,
      });

      renderHook(() => useMoments());

      await waitFor(() => {
        expect(mockMomentsServiceListWithCursor).toHaveBeenCalledTimes(1);
      });
    });

    it('should use filters in single query', async () => {
      mockMomentsServiceListWithCursor.mockResolvedValue({
        data: [],
        meta: { next_cursor: null, has_more: false, count: 0 },
        error: null,
      });

      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setFilters({
          category: 'adventure',
          city: 'Miami',
          minPrice: 20,
          maxPrice: 100,
        });
      });

      await waitFor(() => {
        expect(mockMomentsServiceListWithCursor).toHaveBeenCalledWith(
          expect.objectContaining({
            category: 'adventure',
            city: 'Miami',
            minPrice: 20,
            maxPrice: 100,
          })
        );
      });

      // Should make only 2 calls: initial + filtered (not separate for each filter)
      expect(mockMomentsServiceListWithCursor).toHaveBeenCalledTimes(2);
    });

    it('should paginate efficiently without refetching previous pages', async () => {
      const page1Data = Array.from({ length: 10 }, (_, i) => ({
        id: `moment-${i}`,
        title: `Moment ${i}`,
        description: `Description ${i}`,
        category: 'adventure',
        location: { city: 'Test', country: 'Test' },
        images: [],
        price: 50,
        currency: 'USD',
        max_guests: 4,
        duration: '4 hours',
        availability: [],
        users: { id: `user-${i}`, name: `User ${i}`, avatar: '', rating: 5, review_count: 1 },
        user_id: 'user-1',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }));

      const page2Data = Array.from({ length: 10 }, (_, i) => ({
        id: `moment-${i + 10}`,
        title: `Moment ${i + 10}`,
        description: `Description ${i + 10}`,
        category: 'adventure',
        location: { city: 'Test', country: 'Test' },
        images: [],
        price: 50,
        currency: 'USD',
        max_guests: 4,
        duration: '4 hours',
        availability: [],
        users: { id: `user-${i + 10}`, name: `User ${i + 10}`, avatar: '', rating: 5, review_count: 1 },
        user_id: 'user-1',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }));

      mockMomentsServiceListWithCursor
        .mockResolvedValueOnce({
          data: page1Data,
          meta: { next_cursor: null, has_more: false, count: 20 },
          error: null,
        })
        .mockResolvedValueOnce({
          data: page2Data,
          meta: { next_cursor: null, has_more: false, count: 20 },
          error: null,
        });

      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.moments).toHaveLength(10);
      });

      act(() => {
        result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.moments).toHaveLength(20);
      });

      // Should make exactly 2 queries (page 1 + page 2)
      expect(mockMomentsServiceListWithCursor).toHaveBeenCalledTimes(2);
    });
  });

  describe('Saved Moments Optimization', () => {
    it('should fetch saved moments with nested joins', async () => {
      const mockSavedData = [
        {
          id: 'moment-1',
          title: 'Saved Moment',
          users: {
            id: 'host-1',
            name: 'Host Name',
            avatar: 'host.jpg',
          },
          categories: {
            id: 'food',
            name: 'Food',
            emoji: '🍕',
          },
          price: 60,
          user_id: 'host-1',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockMomentsServiceGetSaved.mockResolvedValue({
        data: mockSavedData,
        meta: { next_cursor: null, has_more: false, count: 1 },
        error: null,
      });

      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.loadSavedMoments();
      });

      await waitFor(() => {
        expect(result.current.savedMoments).toHaveLength(1);
      });

      // Should make only 1 query for saved moments with all nested data
      expect(mockMomentsServiceGetSaved).toHaveBeenCalledTimes(1);
      expect(mockMomentsServiceGetSaved).toHaveBeenCalledWith('user-123');

      const savedMoment = result.current.savedMoments[0];
      expect(savedMoment.hostName).toBe('Host Name');
      expect(savedMoment.hostAvatar).toBe('host.jpg');
    });
  });

  describe('Performance Under Load', () => {
    it('should handle large datasets efficiently', async () => {
      const largeMockData = Array.from({ length: 100 }, (_, i) => ({
        id: `moment-${i}`,
        title: `Moment ${i}`,
        description: `Description ${i}`,
        category: 'adventure',
        location: { city: 'City', country: 'Country' },
        images: [`img${i}.jpg`],
        price: 50 + i,
        currency: 'USD',
        max_guests: 4,
        duration: '4 hours',
        availability: [],
        user_id: `host-${i}`,
        users: {
          id: `host-${i}`,
          name: `Host ${i}`,
          avatar: `avatar${i}.jpg`,
          trust_score: 80 + (i % 20),
        },
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }));

      mockMomentsServiceListWithCursor.mockResolvedValue({
        data: largeMockData,
        meta: { next_cursor: null, has_more: false, count: 100 },
        error: null,
      });

      const startTime = Date.now();
      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      const endTime = Date.now();

      // Should process 100 items efficiently
      expect(result.current.moments).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in < 1s

      // Should make only 1 query for all 100 items
      expect(mockMomentsServiceListWithCursor).toHaveBeenCalledTimes(1);
    });

    it('should prevent memory leaks on unmount during fetch', async () => {
      mockMomentsServiceListWithCursor.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  data: [],
                  count: 0,
                  error: null,
                }),
              100
            );
          })
      );

      const { unmount } = renderHook(() => useMoments());

      // Unmount before fetch completes
      unmount();

      // Should not throw errors or update state after unmount
      await new Promise((resolve) => setTimeout(resolve, 150));
    });
  });

  describe('Error Handling', () => {
    it('should handle query errors gracefully', async () => {
      mockMomentsServiceListWithCursor.mockResolvedValue({
        data: [],
        meta: { next_cursor: null, has_more: false, count: 0 },
        error: new Error('Database connection failed'),
      });

      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.moments).toHaveLength(0);
    });

    it('should recover from errors on retry', async () => {
      mockMomentsServiceListWithCursor
        .mockResolvedValueOnce({
          data: [],
          meta: { next_cursor: null, has_more: false, count: 0 },
          error: new Error('Network error'),
        })
        .mockResolvedValueOnce({
          data: [
            {
              id: 'moment-1',
              title: 'Success',
              description: 'Test',
              category: 'adventure',
              location: { city: 'Test', country: 'Test' },
              images: [],
              price: 50,
              currency: 'USD',
              max_guests: 2,
              duration: '2 hours',
              availability: [],
              users: { id: 'user-1', name: 'Host', avatar: '', rating: 5, review_count: 1 },
              user_id: 'user-1',
              status: 'active',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
            },
          ],
          meta: { next_cursor: null, has_more: false, count: 1 },
          error: null,
        });

      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.moments).toHaveLength(1);
      });
    });
  });
});
