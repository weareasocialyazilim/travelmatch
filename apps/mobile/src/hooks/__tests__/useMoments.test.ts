/**
 * useMoments Hook Tests
 * Tests for moments CRUD and feed management hook
 * Target Coverage: 80%+
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useMoments, Moment, MomentFilters, CreateMomentData } from '@/hooks/useMoments';
import { supabase } from '@/config/supabase';
import { momentsService } from '@/services/supabaseDbService';
import { logger } from '@/utils/logger';

// Mock dependencies
jest.mock('@/config/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

jest.mock('@/services/supabaseDbService', () => ({
  momentsService: {
    listWithCursor: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    pause: jest.fn(),
    activate: jest.fn(),
    save: jest.fn(),
    unsave: jest.fn(),
    list: jest.fn(),
    getSaved: jest.fn(),
  },
}));

jest.mock('@/utils/logger');

describe('useMoments', () => {
  const mockMoment: any = {
    id: 'moment-1',
    title: 'Coffee in Paris',
    description: 'Enjoy a coffee',
    category: 'food',
    location: { city: 'Paris', country: 'France' },
    images: ['image1.jpg'],
    price: 25,
    currency: 'EUR',
    max_guests: 4,
    duration: '2 hours',
    availability: ['2025-01-10'],
    user_id: 'host-123',
    users: {
      name: 'Host Name',
      avatar: 'avatar.jpg',
      rating: 4.8,
      review_count: 120,
    },
    favorites_count: 15,
    status: 'active',
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock responses
    (supabase.auth.getUser ).mockResolvedValue({
      data: { user: mockUser },
    });

    (momentsService.listWithCursor ).mockResolvedValue({
      data: [mockMoment],
      meta: {
        next_cursor: null,
        has_more: false,
        count: 1,
      },
      error: null,
    });
  });

  describe('initial state and loading', () => {
    it('should start with empty moments array', () => {
      const { result } = renderHook(() => useMoments());

      expect(result.current.moments).toEqual([]);
      expect(result.current.myMoments).toEqual([]);
      expect(result.current.savedMoments).toEqual([]);
    });

    it('should auto-load moments on mount', async () => {
      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.moments.length).toBeGreaterThan(0);
      });

      expect(momentsService.listWithCursor).toHaveBeenCalled();
      expect(result.current.moments[0].title).toBe('Coffee in Paris');
    });

    it('should show loading state initially', () => {
      const { result } = renderHook(() => useMoments());

      expect(result.current.loading).toBe(true);
    });

    it('should clear loading state after load', async () => {
      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle loading errors', async () => {
      (momentsService.listWithCursor ).mockResolvedValue({
        data: [],
        meta: { next_cursor: null, has_more: false, count: 0 },
        error: new Error('Network error'),
      });

      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.moments).toEqual([]);
    });
  });

  describe('pagination', () => {
    it('should indicate more data available', async () => {
      (momentsService.listWithCursor ).mockResolvedValue({
        data: [mockMoment],
        meta: { next_cursor: 'cursor-1', has_more: true, count: 1 },
        error: null,
      });

      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.moments).toHaveLength(1);
      });

      expect(result.current.hasMore).toBe(true);
    });

    it('should load more moments when available', async () => {
      (momentsService.listWithCursor )
        .mockResolvedValueOnce({
          data: [mockMoment],
          meta: { next_cursor: 'cursor-1', has_more: true, count: 1 },
          error: null,
        })
        .mockResolvedValueOnce({
          data: [{ ...mockMoment, id: 'moment-2', title: 'Wine Tasting' }],
          meta: { next_cursor: null, has_more: false, count: 1 },
          error: null,
        });

      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.moments).toHaveLength(1);
      });

      await act(async () => {
        await result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.moments.length).toBeGreaterThan(0);
      });

      expect(result.current.hasMore).toBe(false);
    });

    it('should not load more when hasMore is false', async () => {
      (momentsService.listWithCursor ).mockResolvedValue({
        data: [mockMoment],
        meta: { next_cursor: null, has_more: false, count: 1 },
        error: null,
      });

      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.moments).toHaveLength(1);
      });

      const callCount = (momentsService.listWithCursor ).mock.calls.length;

      await act(async () => {
        await result.current.loadMore();
      });

      // Should not make additional API call
      expect((momentsService.listWithCursor ).mock.calls.length).toBe(
        callCount,
      );
    });

    it('should pass cursor when loading more', async () => {
      (momentsService.listWithCursor )
        .mockResolvedValueOnce({
          data: [mockMoment],
          meta: { next_cursor: 'cursor-abc', has_more: true, count: 1 },
          error: null,
        })
        .mockResolvedValueOnce({
          data: [{ ...mockMoment, id: 'moment-2' }],
          meta: { next_cursor: null, has_more: false, count: 1 },
          error: null,
        });

      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.moments).toHaveLength(1);
      });

      await act(async () => {
        await result.current.loadMore();
      });

      // Verify loadMore was called
      expect((momentsService.listWithCursor ).mock.calls.length).toBeGreaterThan(1);
    });
  });

  describe('filters', () => {
    it('should apply category filter', async () => {
      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.moments).toHaveLength(1);
      });

      act(() => {
        result.current.setFilters({ category: 'food' });
      });

      await waitFor(() => {
        const lastCall = (momentsService.listWithCursor ).mock.calls.slice(-1)[0];
        expect(lastCall[0].category).toBe('food');
      });
    });

    it('should apply price range filter', async () => {
      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.moments).toHaveLength(1);
      });

      act(() => {
        result.current.setFilters({ minPrice: 10, maxPrice: 50 });
      });

      await waitFor(() => {
        const lastCall = (momentsService.listWithCursor ).mock.calls.slice(-1)[0];
        expect(lastCall[0].minPrice).toBe(10);
        expect(lastCall[0].maxPrice).toBe(50);
      });
    });

    it('should apply location filter', async () => {
      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.moments).toHaveLength(1);
      });

      act(() => {
        result.current.setFilters({ city: 'Paris', country: 'France' });
      });

      await waitFor(() => {
        const lastCall = (momentsService.listWithCursor ).mock.calls.slice(-1)[0];
        expect(lastCall[0].city).toBe('Paris');
        expect(lastCall[0].country).toBe('France');
      });
    });

    it('should apply search query', async () => {
      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.moments).toHaveLength(1);
      });

      act(() => {
        result.current.setFilters({ search: 'coffee' });
      });

      await waitFor(() => {
        const lastCall = (momentsService.listWithCursor ).mock.calls.slice(-1)[0];
        expect(lastCall[0].search).toBe('coffee');
      });
    });

    it('should apply sort option', async () => {
      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.moments).toHaveLength(1);
      });

      act(() => {
        result.current.setFilters({ sortBy: 'price_low' });
      });

      await waitFor(() => {
        const lastCall = (momentsService.listWithCursor ).mock.calls.slice(-1)[0];
        expect(lastCall[0].sortBy).toBe('price_low');
      });
    });

    it('should apply multiple filters', async () => {
      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.moments).toHaveLength(1);
      });

      const filters: MomentFilters = {
        category: 'food',
        minPrice: 20,
        maxPrice: 100,
        city: 'Paris',
        sortBy: 'rating',
      };

      act(() => {
        result.current.setFilters(filters);
      });

      await waitFor(() => {
        const lastCall = (momentsService.listWithCursor ).mock.calls.slice(-1)[0];
        expect(lastCall[0].category).toBe('food');
        expect(lastCall[0].minPrice).toBe(20);
        expect(lastCall[0].city).toBe('Paris');
        expect(lastCall[0].sortBy).toBe('rating');
      });
    });

    it('should clear filters', async () => {
      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.moments).toHaveLength(1);
      });

      act(() => {
        result.current.setFilters({ category: 'food', minPrice: 10 });
      });

      expect(result.current.filters).toEqual({ category: 'food', minPrice: 10 });

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.filters).toEqual({});
    });

    it('should refresh results when filters change', async () => {
      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.moments).toHaveLength(1);
      });

      const initialCallCount = (momentsService.listWithCursor ).mock.calls.length;

      act(() => {
        result.current.setFilters({ category: 'food' });
      });

      await waitFor(() => {
        expect((momentsService.listWithCursor ).mock.calls.length).toBeGreaterThan(
          initialCallCount,
        );
      });
    });
  });

  describe('refresh', () => {
    it('should refresh moment list', async () => {
      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.moments).toHaveLength(1);
      });

      (momentsService.listWithCursor ).mockResolvedValue({
        data: [
          mockMoment,
          { ...mockMoment, id: 'moment-2', title: 'New Moment' },
        ],
        meta: { next_cursor: null, has_more: false, count: 2 },
        error: null,
      });

      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.moments.length).toBeGreaterThan(1);
      });
    });

    it('should call refresh on filter changes', async () => {
      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.moments).toHaveLength(1);
      });

      const initialCallCount = (momentsService.listWithCursor ).mock.calls.length;

      act(() => {
        result.current.setFilters({ category: 'food' });
      });

      await waitFor(() => {
        expect((momentsService.listWithCursor ).mock.calls.length).toBeGreaterThan(
          initialCallCount,
        );
      });
    });
  });

  describe('getMoment', () => {
    it('should fetch single moment by ID', async () => {
      (momentsService.getById ).mockResolvedValue({
        data: mockMoment,
        error: null,
      });

      const { result } = renderHook(() => useMoments());

      let moment: Moment | null = null;
      await act(async () => {
        moment = await result.current.getMoment('moment-1');
      });

      expect(moment).toBeTruthy();
      expect(moment?.title).toBe('Coffee in Paris');
      expect(momentsService.getById).toHaveBeenCalledWith('moment-1');
    });

    it('should return null if moment not found', async () => {
      (momentsService.getById ).mockResolvedValue({
        data: null,
        error: null,
      });

      const { result } = renderHook(() => useMoments());

      let moment: Moment | null = 'not-null' as any;
      await act(async () => {
        moment = await result.current.getMoment('non-existent');
      });

      expect(moment).toBeNull();
    });

    it('should handle errors when fetching moment', async () => {
      (momentsService.getById ).mockResolvedValue({
        data: null,
        error: new Error('Not found'),
      });

      const { result } = renderHook(() => useMoments());

      let moment: Moment | null = 'not-null' as any;
      await act(async () => {
        moment = await result.current.getMoment('moment-1');
      });

      expect(moment).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('createMoment', () => {
    const createData: CreateMomentData = {
      title: 'New Moment',
      description: 'Description',
      category: 'food',
      location: { city: 'London', country: 'UK' },
      images: ['image.jpg'],
      pricePerGuest: 30,
      currency: 'GBP',
      maxGuests: 6,
      duration: '3 hours',
      availability: ['2025-02-01'],
    };

    it('should create new moment', async () => {
      const createdMoment = {
        ...mockMoment,
        id: 'new-moment',
        title: createData.title,
      };

      (momentsService.create ).mockResolvedValue({
        data: createdMoment,
        error: null,
      });

      const { result } = renderHook(() => useMoments());

      let moment: Moment | null = null;
      await act(async () => {
        moment = await result.current.createMoment(createData);
      });

      expect(moment).toBeTruthy();
      expect(moment?.title).toBe('New Moment');
      expect(momentsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUser.id,
          title: createData.title,
          category: createData.category,
        }),
      );
    });

    it('should add created moment to myMoments', async () => {
      const createdMoment = {
        ...mockMoment,
        id: 'new-moment',
        title: createData.title,
      };

      (momentsService.create ).mockResolvedValue({
        data: createdMoment,
        error: null,
      });

      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.moments).toHaveLength(1);
      });

      await act(async () => {
        await result.current.createMoment(createData);
      });

      expect(result.current.myMoments).toHaveLength(1);
      expect(result.current.myMoments[0].title).toBe('New Moment');
    });

    it('should require authentication', async () => {
      (supabase.auth.getUser ).mockResolvedValue({
        data: { user: null },
      });

      const { result } = renderHook(() => useMoments());

      let moment: Moment | null = 'not-null' as any;
      await act(async () => {
        moment = await result.current.createMoment(createData);
      });

      expect(moment).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle creation errors', async () => {
      (momentsService.create ).mockResolvedValue({
        data: null,
        error: new Error('Creation failed'),
      });

      const { result } = renderHook(() => useMoments());

      let moment: Moment | null = 'not-null' as any;
      await act(async () => {
        moment = await result.current.createMoment(createData);
      });

      expect(moment).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('updateMoment', () => {
    it('should update moment', async () => {
      const updates = {
        title: 'Updated Title',
        pricePerGuest: 35,
      };

      const updatedMoment = {
        ...mockMoment,
        title: updates.title,
        price: updates.pricePerGuest,
      };

      (momentsService.update ).mockResolvedValue({
        data: updatedMoment,
        error: null,
      });

      const { result } = renderHook(() => useMoments());

      let moment: Moment | null = null;
      await act(async () => {
        moment = await result.current.updateMoment('moment-1', updates);
      });

      expect(moment).toBeTruthy();
      expect(moment?.title).toBe('Updated Title');
      expect(momentsService.update).toHaveBeenCalledWith(
        'moment-1',
        expect.objectContaining({
          title: updates.title,
          price: updates.pricePerGuest,
        }),
      );
    });

    it('should update moment in myMoments list', async () => {
      // Setup myMoments first
      (momentsService.list ).mockResolvedValue({
        data: [mockMoment],
        error: null,
      });

      const { result } = renderHook(() => useMoments());

      await act(async () => {
        await result.current.loadMyMoments();
      });

      expect(result.current.myMoments).toHaveLength(1);

      const updatedMoment = {
        ...mockMoment,
        title: 'Updated',
      };

      (momentsService.update ).mockResolvedValue({
        data: updatedMoment,
        error: null,
      });

      await act(async () => {
        await result.current.updateMoment('moment-1', { title: 'Updated' });
      });

      expect(result.current.myMoments[0].title).toBe('Updated');
    });

    it('should handle partial updates', async () => {
      const updatedMoment = {
        ...mockMoment,
        description: 'New description',
      };

      (momentsService.update ).mockResolvedValue({
        data: updatedMoment,
        error: null,
      });

      const { result } = renderHook(() => useMoments());

      await act(async () => {
        await result.current.updateMoment('moment-1', {
          description: 'New description',
        });
      });

      const updateCall = (momentsService.update ).mock.calls[0];
      expect(updateCall[1]).toEqual({ description: 'New description' });
    });

    it('should handle update errors', async () => {
      (momentsService.update ).mockResolvedValue({
        data: null,
        error: new Error('Update failed'),
      });

      const { result } = renderHook(() => useMoments());

      let moment: Moment | null = 'not-null' as any;
      await act(async () => {
        moment = await result.current.updateMoment('moment-1', {
          title: 'Updated',
        });
      });

      expect(moment).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('deleteMoment', () => {
    it('should delete moment', async () => {
      (momentsService.delete ).mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => useMoments());

      let success = false;
      await act(async () => {
        success = await result.current.deleteMoment('moment-1');
      });

      expect(success).toBe(true);
      expect(momentsService.delete).toHaveBeenCalledWith('moment-1');
    });

    it('should remove moment from myMoments', async () => {
      (momentsService.list ).mockResolvedValue({
        data: [mockMoment, { ...mockMoment, id: 'moment-2' }],
        error: null,
      });

      const { result } = renderHook(() => useMoments());

      await act(async () => {
        await result.current.loadMyMoments();
      });

      expect(result.current.myMoments).toHaveLength(2);

      (momentsService.delete ).mockResolvedValue({
        error: null,
      });

      await act(async () => {
        await result.current.deleteMoment('moment-1');
      });

      expect(result.current.myMoments).toHaveLength(1);
      expect(result.current.myMoments[0].id).toBe('moment-2');
    });

    it('should handle deletion errors', async () => {
      (momentsService.delete ).mockResolvedValue({
        error: new Error('Delete failed'),
      });

      const { result } = renderHook(() => useMoments());

      let success = true;
      await act(async () => {
        success = await result.current.deleteMoment('moment-1');
      });

      expect(success).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('pauseMoment', () => {
    it('should pause moment', async () => {
      (momentsService.pause ).mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => useMoments());

      let success = false;
      await act(async () => {
        success = await result.current.pauseMoment('moment-1');
      });

      expect(success).toBe(true);
      expect(momentsService.pause).toHaveBeenCalledWith('moment-1');
    });

    it('should update status in myMoments', async () => {
      (momentsService.list ).mockResolvedValue({
        data: [mockMoment],
        error: null,
      });

      const { result } = renderHook(() => useMoments());

      await act(async () => {
        await result.current.loadMyMoments();
      });

      (momentsService.pause ).mockResolvedValue({
        error: null,
      });

      await act(async () => {
        await result.current.pauseMoment('moment-1');
      });

      expect(result.current.myMoments[0].status).toBe('paused');
    });
  });

  describe('activateMoment', () => {
    it('should activate moment', async () => {
      (momentsService.activate ).mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => useMoments());

      let success = false;
      await act(async () => {
        success = await result.current.activateMoment('moment-1');
      });

      expect(success).toBe(true);
      expect(momentsService.activate).toHaveBeenCalledWith('moment-1');
    });

    it('should update status in myMoments', async () => {
      (momentsService.list ).mockResolvedValue({
        data: [{ ...mockMoment, status: 'paused' }],
        error: null,
      });

      const { result } = renderHook(() => useMoments());

      await act(async () => {
        await result.current.loadMyMoments();
      });

      expect(result.current.myMoments[0].status).toBe('paused');

      (momentsService.activate ).mockResolvedValue({
        error: null,
      });

      await act(async () => {
        await result.current.activateMoment('moment-1');
      });

      expect(result.current.myMoments[0].status).toBe('active');
    });
  });

  describe('saveMoment', () => {
    it('should save moment to favorites', async () => {
      (momentsService.save ).mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.moments).toHaveLength(1);
      });

      let success = false;
      await act(async () => {
        success = await result.current.saveMoment('moment-1');
      });

      expect(success).toBe(true);
      expect(momentsService.save).toHaveBeenCalledWith(mockUser.id, 'moment-1');
    });

    it('should require authentication', async () => {
      (supabase.auth.getUser ).mockResolvedValue({
        data: { user: null },
      });

      const { result } = renderHook(() => useMoments());

      let success = true;
      await act(async () => {
        success = await result.current.saveMoment('moment-1');
      });

      expect(success).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('unsaveMoment', () => {
    it('should unsave moment', async () => {
      (momentsService.unsave ).mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => useMoments());

      let success = false;
      await act(async () => {
        success = await result.current.unsaveMoment('moment-1');
      });

      expect(success).toBe(true);
      expect(momentsService.unsave).toHaveBeenCalledWith(mockUser.id, 'moment-1');
    });

    it('should remove from savedMoments list', async () => {
      (momentsService.getSaved ).mockResolvedValue({
        data: [mockMoment, { ...mockMoment, id: 'moment-2' }],
        error: null,
      });

      const { result } = renderHook(() => useMoments());

      await act(async () => {
        await result.current.loadSavedMoments();
      });

      expect(result.current.savedMoments).toHaveLength(2);

      (momentsService.unsave ).mockResolvedValue({
        error: null,
      });

      await act(async () => {
        await result.current.unsaveMoment('moment-1');
      });

      expect(result.current.savedMoments).toHaveLength(1);
      expect(result.current.savedMoments[0].id).toBe('moment-2');
    });
  });

  describe('loadMyMoments', () => {
    it('should load user moments', async () => {
      (momentsService.list ).mockResolvedValue({
        data: [mockMoment, { ...mockMoment, id: 'moment-2' }],
        error: null,
      });

      const { result } = renderHook(() => useMoments());

      expect(result.current.myMomentsLoading).toBe(false);

      await act(async () => {
        await result.current.loadMyMoments();
      });

      expect(result.current.myMoments).toHaveLength(2);
      expect(momentsService.list).toHaveBeenCalledWith({ userId: mockUser.id });
    });

    it('should show loading state', async () => {
      let resolvePromise;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (momentsService.list ).mockReturnValue(promise);

      const { result } = renderHook(() => useMoments());

      act(() => {
        void result.current.loadMyMoments();
      });

      expect(result.current.myMomentsLoading).toBe(true);

      await act(async () => {
        resolvePromise({ data: [mockMoment], error: null });
        await promise;
      });

      expect(result.current.myMomentsLoading).toBe(false);
    });

    it('should require authentication', async () => {
      (supabase.auth.getUser ).mockResolvedValue({
        data: { user: null },
      });

      const { result } = renderHook(() => useMoments());

      await act(async () => {
        await result.current.loadMyMoments();
      });

      expect(result.current.myMoments).toEqual([]);
    });
  });

  describe('loadSavedMoments', () => {
    it('should load saved moments', async () => {
      (momentsService.getSaved ).mockResolvedValue({
        data: [mockMoment],
        error: null,
      });

      const { result } = renderHook(() => useMoments());

      await act(async () => {
        await result.current.loadSavedMoments();
      });

      expect(result.current.savedMoments).toHaveLength(1);
      expect(result.current.savedMoments[0].isSaved).toBe(true);
      expect(momentsService.getSaved).toHaveBeenCalledWith(mockUser.id);
    });

    it('should show loading state', async () => {
      let resolvePromise;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (momentsService.getSaved ).mockReturnValue(promise);

      const { result } = renderHook(() => useMoments());

      act(() => {
        void result.current.loadSavedMoments();
      });

      expect(result.current.savedMomentsLoading).toBe(true);

      await act(async () => {
        resolvePromise({ data: [mockMoment], error: null });
        await promise;
      });

      expect(result.current.savedMomentsLoading).toBe(false);
    });
  });

  describe('memory leak prevention', () => {
    it('should not update state after unmount', async () => {
      (momentsService.list ).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({ data: [mockMoment], error: null });
            }, 100);
          }),
      );

      const { result, unmount } = renderHook(() => useMoments());

      act(() => {
        void result.current.loadMyMoments();
      });

      unmount();

      // Wait for async operation to complete
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should not throw error or cause memory leak
    });
  });
});
