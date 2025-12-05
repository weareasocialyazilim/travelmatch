/**
 * Tests for useReviews hook
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useReviews } from '../useReviews';
import { reviewService } from '../../services/reviewService';

// Mock the review service
jest.mock('../../services/reviewService', () => ({
  reviewService: {
    getMyWrittenReviews: jest.fn(),
    getMyReceivedReviews: jest.fn(),
    getPendingReviews: jest.fn(),
    getMyReviewStats: jest.fn(),
    getUserReviews: jest.fn(),
    getMomentReviews: jest.fn(),
    createReview: jest.fn(),
    updateReview: jest.fn(),
    deleteReview: jest.fn(),
    respondToReview: jest.fn(),
    reportReview: jest.fn(),
  },
}));

const mockReviewService = reviewService as jest.Mocked<typeof reviewService>;

describe('useReviews', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // Setup default mock returns to prevent errors during auto-fetch
    mockReviewService.getMyWrittenReviews.mockResolvedValue({ reviews: [] });
    mockReviewService.getMyReceivedReviews.mockResolvedValue({
      reviews: [],
      stats: null,
    });
    mockReviewService.getPendingReviews.mockResolvedValue({
      pendingReviews: [],
    });
    mockReviewService.getMyReviewStats.mockResolvedValue({ stats: null });
  });

  describe('refreshWritten', () => {
    it('should fetch written reviews', async () => {
      const mockReviews = [
        { id: 'r1', rating: 5, comment: 'Great!' },
        { id: 'r2', rating: 4, comment: 'Good' },
      ];

      // Use mockResolvedValue instead of Once since hook auto-fetches on mount
      mockReviewService.getMyWrittenReviews.mockResolvedValue({
        reviews: mockReviews,
      });

      const { result } = renderHook(() => useReviews());

      await waitFor(() => {
        expect(result.current.writtenLoading).toBe(false);
        expect(result.current.writtenReviews).toEqual(mockReviews);
      });
    });

    it('should handle errors', async () => {
      mockReviewService.getMyWrittenReviews.mockImplementation(() => {
        return Promise.reject(new Error('Failed'));
      });

      const { result } = renderHook(() => useReviews());

      await waitFor(() => {
        expect(result.current.writtenError).toBe('Failed');
      });
    });
  });

  describe('refreshReceived', () => {
    it('should fetch received reviews', async () => {
      const mockReviews = [{ id: 'r1', rating: 5, comment: 'Amazing!' }];
      const mockStats = {
        averageRating: 5,
        totalReviews: 1,
        ratingDistribution: { 5: 1, 4: 0, 3: 0, 2: 0, 1: 0 },
      };

      mockReviewService.getMyReceivedReviews.mockResolvedValue({
        reviews: mockReviews,
        stats: mockStats,
      });

      const { result } = renderHook(() => useReviews());

      await waitFor(() => {
        expect(result.current.receivedLoading).toBe(false);
        expect(result.current.receivedReviews).toEqual(mockReviews);
        expect(result.current.receivedStats).toEqual(mockStats);
      });
    });
  });

  describe('refreshPending', () => {
    it('should fetch pending reviews', async () => {
      const mockPending = [
        { requestId: 'req1', momentId: 'm1', userName: 'John' },
      ];

      mockReviewService.getPendingReviews.mockResolvedValue({
        pendingReviews: mockPending,
      });

      const { result } = renderHook(() => useReviews());

      await waitFor(() => {
        expect(result.current.pendingLoading).toBe(false);
        expect(result.current.pendingReviews).toEqual(mockPending);
      });
    });
  });

  describe('getUserReviews', () => {
    it('should get reviews for a user', async () => {
      const mockData = {
        reviews: [{ id: 'r1', rating: 5 }],
        stats: { averageRating: 5, totalReviews: 1 },
        total: 1,
      };

      mockReviewService.getUserReviews.mockResolvedValueOnce(mockData);

      const { result } = renderHook(() => useReviews());

      let userData = null;
      await act(async () => {
        userData = await result.current.getUserReviews('u1');
      });

      expect(userData).toEqual(mockData);
      expect(mockReviewService.getUserReviews).toHaveBeenCalledWith(
        'u1',
        undefined,
      );
    });

    it('should pass filters', async () => {
      const mockData = { reviews: [], stats: null, total: 0 };

      mockReviewService.getUserReviews.mockResolvedValueOnce(mockData);

      const { result } = renderHook(() => useReviews());

      await act(async () => {
        await result.current.getUserReviews('u1', { minRating: 4 });
      });

      expect(mockReviewService.getUserReviews).toHaveBeenCalledWith('u1', {
        minRating: 4,
      });
    });
  });

  describe('getMomentReviews', () => {
    it('should get reviews for a moment', async () => {
      const mockData = {
        reviews: [{ id: 'r1', rating: 5 }],
        stats: { averageRating: 5, totalReviews: 1 },
        total: 1,
      };

      mockReviewService.getMomentReviews.mockResolvedValueOnce(mockData);

      const { result } = renderHook(() => useReviews());

      let momentData = null;
      await act(async () => {
        momentData = await result.current.getMomentReviews('m1');
      });

      expect(momentData).toEqual(mockData);
      expect(mockReviewService.getMomentReviews).toHaveBeenCalledWith(
        'm1',
        undefined,
      );
    });
  });

  describe('createReview', () => {
    it('should create a review', async () => {
      const newReview = {
        id: 'r1',
        rating: 5,
        comment: 'Amazing!',
      };

      mockReviewService.createReview.mockResolvedValueOnce({
        review: newReview,
      });

      const { result } = renderHook(() => useReviews());

      let review = null;
      await act(async () => {
        review = await result.current.createReview({
          requestId: 'req1',
          rating: 5,
          comment: 'Amazing!',
        });
      });

      expect(review).toEqual(newReview);
      expect(mockReviewService.createReview).toHaveBeenCalled();
    });

    it('should handle create errors', async () => {
      mockReviewService.createReview.mockRejectedValueOnce(new Error('Failed'));

      const { result } = renderHook(() => useReviews());

      let review = null;
      await act(async () => {
        review = await result.current.createReview({
          requestId: 'req1',
          rating: 5,
        });
      });

      expect(review).toBeNull();
    });
  });

  describe('updateReview', () => {
    it('should update a review', async () => {
      const updatedReview = { id: 'r1', rating: 4, comment: 'Updated' };

      mockReviewService.updateReview.mockResolvedValueOnce({
        review: updatedReview,
      });

      const { result } = renderHook(() => useReviews());

      let review = null;
      await act(async () => {
        review = await result.current.updateReview('r1', {
          rating: 4,
          comment: 'Updated',
        });
      });

      expect(review).toEqual(updatedReview);
      expect(mockReviewService.updateReview).toHaveBeenCalledWith('r1', {
        rating: 4,
        comment: 'Updated',
      });
    });
  });

  describe('deleteReview', () => {
    it('should delete a review', async () => {
      mockReviewService.deleteReview.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useReviews());

      let success = false;
      await act(async () => {
        success = await result.current.deleteReview('r1');
      });

      expect(success).toBe(true);
      expect(mockReviewService.deleteReview).toHaveBeenCalledWith('r1');
    });
  });

  describe('respondToReview', () => {
    it('should respond to a review', async () => {
      const reviewWithResponse = {
        id: 'r1',
        rating: 5,
        response: { text: 'Thank you!', createdAt: new Date().toISOString() },
      };

      mockReviewService.respondToReview.mockResolvedValueOnce({
        review: reviewWithResponse,
      });

      const { result } = renderHook(() => useReviews());

      let review = null;
      await act(async () => {
        review = await result.current.respondToReview('r1', 'Thank you!');
      });

      expect(review).toEqual(reviewWithResponse);
      expect(mockReviewService.respondToReview).toHaveBeenCalledWith(
        'r1',
        'Thank you!',
      );
    });
  });

  describe('reportReview', () => {
    it('should report a review', async () => {
      mockReviewService.reportReview.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useReviews());

      let success = false;
      await act(async () => {
        success = await result.current.reportReview(
          'r1',
          'Inappropriate content',
        );
      });

      expect(success).toBe(true);
      expect(mockReviewService.reportReview).toHaveBeenCalledWith(
        'r1',
        'Inappropriate content',
      );
    });
  });
});
