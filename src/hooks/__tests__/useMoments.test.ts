/**
 * Tests for useMoments hook
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useMoments } from '../useMoments';
import { api } from '../../utils/api';

// Mock the api module
jest.mock('../../utils/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock the logger module
jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

describe('useMoments', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('initial load', () => {
    it('should fetch moments on mount', async () => {
      const mockMoments = {
        moments: [
          { id: 'm1', title: 'Moment 1', saves: 10 },
          { id: 'm2', title: 'Moment 2', saves: 20 },
        ],
        total: 2,
      };

      mockApi.get.mockResolvedValueOnce(mockMoments);

      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.moments).toEqual(mockMoments.moments);
      });
    });

    it('should handle errors', async () => {
      // Mock the API to reject with an error
      mockApi.get.mockImplementation(() => {
        return Promise.reject(new Error('Network error'));
      });

      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
    });
  });

  describe('refresh', () => {
    it('should refresh moments', async () => {
      const mockMoments = {
        moments: [{ id: 'm1', title: 'Moment 1' }],
        total: 1,
      };

      mockApi.get.mockResolvedValue(mockMoments);

      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.refresh();
      });

      // Initial load + refresh
      expect(mockApi.get).toHaveBeenCalled();
    });
  });

  describe('loadMore', () => {
    it('should load more moments when hasMore is true', async () => {
      // Page 1 returns full page of 10 items (hasMore = true based on length === DEFAULT_PAGE_SIZE)
      const page1Moments = Array(10)
        .fill(null)
        .map((_, i) => ({ id: `m${i}`, title: `Moment ${i}` }));
      const page1 = {
        moments: page1Moments,
        total: 20,
      };
      // Page 2
      const page2 = {
        moments: [{ id: 'm11', title: 'Moment 11' }],
        total: 20,
      };

      // Track page numbers from API calls
      mockApi.get.mockImplementation(
        (url: string, config?: { params?: { page?: number } }) => {
          const page = config?.params?.page || 1;
          if (page === 1) return Promise.resolve(page1);
          return Promise.resolve(page2);
        },
      );

      const { result } = renderHook(() => useMoments());

      // Wait for initial load to complete with page 1 data
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.moments.length).toBe(10);
      });

      // hasMore should be true since we got exactly DEFAULT_PAGE_SIZE items
      expect(result.current.hasMore).toBe(true);

      await act(async () => {
        await result.current.loadMore();
      });

      // Verify loadMore was called (total moments should now be 11)
      expect(result.current.moments.length).toBe(11);
    });
  });

  describe('setFilters', () => {
    it('should set filters', async () => {
      const mockMoments = {
        moments: [{ id: 'm1', category: 'food' }],
        total: 1,
      };

      mockApi.get.mockResolvedValue(mockMoments);

      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        result.current.setFilters({ category: 'food' });
      });

      expect(result.current.filters).toEqual({ category: 'food' });
    });
  });

  describe('getMoment', () => {
    it('should get a single moment', async () => {
      const mockMoment = { id: 'm1', title: 'Moment 1' };

      mockApi.get
        .mockResolvedValueOnce({ moments: [], total: 0 })
        .mockResolvedValueOnce({ moment: mockMoment });

      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let _moment = null;
      await act(async () => {
        _moment = await result.current.getMoment('m1');
      });

      expect(mockApi.get).toHaveBeenCalledWith('/moments/m1');
    });
  });

  describe('createMoment', () => {
    it('should create a new moment', async () => {
      const newMoment = {
        id: 'm1',
        title: 'New Moment',
        description: 'Description',
      };

      mockApi.get.mockResolvedValueOnce({ moments: [], total: 0 });
      mockApi.post.mockResolvedValueOnce({ moment: newMoment });

      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let _createdMoment = null;
      await act(async () => {
        _createdMoment = await result.current.createMoment({
          title: 'New Moment',
          description: 'Description',
          category: 'food',
          location: { city: 'Paris', country: 'France' },
          images: [],
          pricePerGuest: 50,
          currency: 'USD',
          maxGuests: 4,
          duration: '2h',
          availability: ['Monday'],
        });
      });

      expect(mockApi.post).toHaveBeenCalledWith('/moments', expect.any(Object));
    });
  });

  describe('updateMoment', () => {
    it('should update a moment', async () => {
      const updatedMoment = { id: 'm1', title: 'Updated Title' };

      mockApi.get.mockResolvedValueOnce({ moments: [], total: 0 });
      mockApi.put.mockResolvedValueOnce({ moment: updatedMoment });

      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updateMoment('m1', { title: 'Updated Title' });
      });

      expect(mockApi.put).toHaveBeenCalledWith('/moments/m1', {
        title: 'Updated Title',
      });
    });
  });

  describe('deleteMoment', () => {
    it('should delete a moment', async () => {
      mockApi.get.mockResolvedValueOnce({ moments: [], total: 0 });
      mockApi.delete.mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let success = false;
      await act(async () => {
        success = await result.current.deleteMoment('m1');
      });

      expect(success).toBe(true);
      expect(mockApi.delete).toHaveBeenCalledWith('/moments/m1');
    });
  });

  describe('saveMoment and unsaveMoment', () => {
    it('should save a moment', async () => {
      mockApi.get.mockResolvedValueOnce({ moments: [], total: 0 });
      mockApi.post.mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let success = false;
      await act(async () => {
        success = await result.current.saveMoment('m1');
      });

      expect(success).toBe(true);
      expect(mockApi.post).toHaveBeenCalledWith('/moments/m1/save');
    });

    it('should unsave a moment', async () => {
      mockApi.get.mockResolvedValueOnce({ moments: [], total: 0 });
      mockApi.delete.mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let success = false;
      await act(async () => {
        success = await result.current.unsaveMoment('m1');
      });

      expect(success).toBe(true);
      expect(mockApi.delete).toHaveBeenCalledWith('/moments/m1/save');
    });
  });

  describe('loadMyMoments', () => {
    it('should load user moments', async () => {
      const mockMoments = [{ id: 'm1', title: 'My Moment' }];

      mockApi.get
        .mockResolvedValueOnce({ moments: [], total: 0 })
        .mockResolvedValueOnce({ moments: mockMoments });

      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.loadMyMoments();
      });

      expect(mockApi.get).toHaveBeenCalledWith('/moments/my');
    });
  });

  describe('loadSavedMoments', () => {
    it('should load saved moments', async () => {
      const mockMoments = [{ id: 'm1', title: 'Saved Moment' }];

      mockApi.get
        .mockResolvedValueOnce({ moments: [], total: 0 })
        .mockResolvedValueOnce({ moments: mockMoments });

      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.loadSavedMoments();
      });

      expect(mockApi.get).toHaveBeenCalledWith('/moments/saved');
    });
  });

  describe('clearFilters', () => {
    it('should clear all filters', async () => {
      mockApi.get.mockResolvedValue({ moments: [], total: 0 });

      const { result } = renderHook(() => useMoments());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Set some filters first
      await act(async () => {
        result.current.setFilters({ category: 'food', city: 'Paris' });
      });

      expect(result.current.filters).toEqual({
        category: 'food',
        city: 'Paris',
      });

      // Clear filters
      await act(async () => {
        result.current.clearFilters();
      });

      expect(result.current.filters).toEqual({});
    });
  });
});
