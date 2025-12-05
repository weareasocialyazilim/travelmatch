/**
 * Review Service Tests
 * Tests for ratings, reviews, and feedback operations
 */

import {
  reviewService,
  getRatingLabel,
  getRatingColor,
  formatRating,
  calculatePercentage,
} from '../reviewService';
import { api } from '../../utils/api';
import { COLORS } from '../../constants/colors';

// Mock API
jest.mock('../../utils/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

describe('reviewService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserReviews', () => {
    it('should fetch user reviews with stats', async () => {
      const mockResponse = {
        reviews: [
          { id: 'review-1', rating: 5, comment: 'Great!' },
          { id: 'review-2', rating: 4, comment: 'Good' },
        ],
        stats: {
          averageRating: 4.5,
          totalReviews: 2,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 },
        },
        total: 2,
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await reviewService.getUserReviews('user-123');

      expect(mockApi.get).toHaveBeenCalledWith('/users/user-123/reviews', {
        params: undefined,
      });
      expect(result.reviews).toHaveLength(2);
      expect(result.stats.averageRating).toBe(4.5);
    });

    it('should apply filters to user reviews', async () => {
      mockApi.get.mockResolvedValue({ reviews: [], stats: {}, total: 0 });

      await reviewService.getUserReviews('user-123', {
        minRating: 4,
        sortBy: 'newest',
        page: 1,
        pageSize: 10,
      });

      expect(mockApi.get).toHaveBeenCalledWith('/users/user-123/reviews', {
        params: { minRating: 4, sortBy: 'newest', page: 1, pageSize: 10 },
      });
    });
  });

  describe('getMomentReviews', () => {
    it('should fetch moment reviews', async () => {
      const mockResponse = {
        reviews: [{ id: 'review-1', rating: 5 }],
        stats: { averageRating: 5, totalReviews: 1, ratingDistribution: {} },
        total: 1,
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await reviewService.getMomentReviews('moment-123');

      expect(mockApi.get).toHaveBeenCalledWith('/moments/moment-123/reviews', {
        params: undefined,
      });
      expect(result.reviews).toHaveLength(1);
    });

    it('should apply filters to moment reviews', async () => {
      mockApi.get.mockResolvedValue({ reviews: [], stats: {}, total: 0 });

      await reviewService.getMomentReviews('moment-123', {
        sortBy: 'highest',
        page: 2,
      });

      expect(mockApi.get).toHaveBeenCalledWith('/moments/moment-123/reviews', {
        params: { sortBy: 'highest', page: 2 },
      });
    });
  });

  describe('getMyWrittenReviews', () => {
    it('should fetch reviews written by user', async () => {
      mockApi.get.mockResolvedValue({
        reviews: [{ id: 'review-1' }],
        total: 1,
      });

      const result = await reviewService.getMyWrittenReviews();

      expect(mockApi.get).toHaveBeenCalledWith('/reviews/written', {
        params: undefined,
      });
      expect(result.reviews).toHaveLength(1);
    });
  });

  describe('getMyReceivedReviews', () => {
    it('should fetch reviews about user', async () => {
      const mockResponse = {
        reviews: [{ id: 'review-1', rating: 4 }],
        stats: { averageRating: 4 },
        total: 1,
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await reviewService.getMyReceivedReviews();

      expect(mockApi.get).toHaveBeenCalledWith('/reviews/received', {
        params: undefined,
      });
      expect(result.stats.averageRating).toBe(4);
    });
  });

  describe('getPendingReviews', () => {
    it('should fetch pending reviews', async () => {
      const mockPending = {
        pendingReviews: [
          {
            requestId: 'req-1',
            momentId: 'moment-1',
            momentTitle: 'City Tour',
            userId: 'user-1',
            userName: 'John',
            userAvatar: 'avatar.jpg',
            completedAt: '2025-01-01T00:00:00Z',
            expiresAt: '2025-01-15T00:00:00Z',
          },
        ],
      };

      mockApi.get.mockResolvedValue(mockPending);

      const result = await reviewService.getPendingReviews();

      expect(mockApi.get).toHaveBeenCalledWith('/reviews/pending');
      expect(result.pendingReviews).toHaveLength(1);
      expect(result.pendingReviews[0].momentTitle).toBe('City Tour');
    });
  });

  describe('createReview', () => {
    it('should create a new review', async () => {
      const mockReview = {
        id: 'review-new',
        rating: 5,
        comment: 'Amazing experience!',
      };

      mockApi.post.mockResolvedValue({ review: mockReview });

      const result = await reviewService.createReview({
        requestId: 'req-123',
        rating: 5,
        comment: 'Amazing experience!',
      });

      expect(mockApi.post).toHaveBeenCalledWith('/reviews', {
        requestId: 'req-123',
        rating: 5,
        comment: 'Amazing experience!',
      });
      expect(result.review.rating).toBe(5);
    });
  });

  describe('updateReview', () => {
    it('should update review rating', async () => {
      const mockReview = { id: 'review-1', rating: 4, isEdited: true };

      mockApi.put.mockResolvedValue({ review: mockReview });

      const result = await reviewService.updateReview('review-1', { rating: 4 });

      expect(mockApi.put).toHaveBeenCalledWith('/reviews/review-1', { rating: 4 });
      expect(result.review.isEdited).toBe(true);
    });

    it('should update review comment', async () => {
      mockApi.put.mockResolvedValue({ review: {} });

      await reviewService.updateReview('review-1', {
        comment: 'Updated comment',
      });

      expect(mockApi.put).toHaveBeenCalledWith('/reviews/review-1', {
        comment: 'Updated comment',
      });
    });

    it('should update both rating and comment', async () => {
      mockApi.put.mockResolvedValue({ review: {} });

      await reviewService.updateReview('review-1', {
        rating: 3,
        comment: 'Changed my mind',
      });

      expect(mockApi.put).toHaveBeenCalledWith('/reviews/review-1', {
        rating: 3,
        comment: 'Changed my mind',
      });
    });
  });

  describe('deleteReview', () => {
    it('should delete a review', async () => {
      mockApi.delete.mockResolvedValue({ success: true });

      const result = await reviewService.deleteReview('review-123');

      expect(mockApi.delete).toHaveBeenCalledWith('/reviews/review-123');
      expect(result.success).toBe(true);
    });
  });

  describe('respondToReview', () => {
    it('should add response to review', async () => {
      const mockReview = {
        id: 'review-1',
        response: {
          text: 'Thank you for your feedback!',
          createdAt: '2025-01-01T00:00:00Z',
        },
      };

      mockApi.post.mockResolvedValue({ review: mockReview });

      const result = await reviewService.respondToReview(
        'review-1',
        'Thank you for your feedback!'
      );

      expect(mockApi.post).toHaveBeenCalledWith('/reviews/review-1/respond', {
        text: 'Thank you for your feedback!',
      });
      expect(result.review.response?.text).toBe('Thank you for your feedback!');
    });
  });

  describe('reportReview', () => {
    it('should report a review', async () => {
      mockApi.post.mockResolvedValue({ success: true });

      const result = await reviewService.reportReview('review-1', 'Fake review');

      expect(mockApi.post).toHaveBeenCalledWith('/reviews/review-1/report', {
        reason: 'Fake review',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('getMyReviewStats', () => {
    it('should fetch user review stats', async () => {
      const mockStats = {
        stats: {
          averageRating: 4.7,
          totalReviews: 50,
          ratingDistribution: { 1: 0, 2: 1, 3: 2, 4: 10, 5: 37 },
        },
      };

      mockApi.get.mockResolvedValue(mockStats);

      const result = await reviewService.getMyReviewStats();

      expect(mockApi.get).toHaveBeenCalledWith('/reviews/my-stats');
      expect(result.stats.averageRating).toBe(4.7);
      expect(result.stats.totalReviews).toBe(50);
    });
  });

  describe('canReviewRequest', () => {
    it('should check if user can review', async () => {
      mockApi.get.mockResolvedValue({ canReview: true });

      const result = await reviewService.canReviewRequest('req-123');

      expect(mockApi.get).toHaveBeenCalledWith('/reviews/can-review/req-123');
      expect(result.canReview).toBe(true);
    });

    it('should return reason when cannot review', async () => {
      mockApi.get.mockResolvedValue({
        canReview: false,
        reason: 'Review window expired',
      });

      const result = await reviewService.canReviewRequest('req-456');

      expect(result.canReview).toBe(false);
      expect(result.reason).toBe('Review window expired');
    });
  });

  describe('Error handling', () => {
    it('should propagate API errors', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'));

      await expect(reviewService.getUserReviews('user-1')).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle createReview errors', async () => {
      mockApi.post.mockRejectedValue(new Error('Already reviewed'));

      await expect(
        reviewService.createReview({
          requestId: 'req-1',
          rating: 5,
          comment: 'test',
        })
      ).rejects.toThrow('Already reviewed');
    });
  });
});

describe('Helper functions', () => {
  describe('getRatingLabel', () => {
    it('should return correct label for each rating', () => {
      expect(getRatingLabel(1)).toBe('Poor');
      expect(getRatingLabel(2)).toBe('Fair');
      expect(getRatingLabel(3)).toBe('Good');
      expect(getRatingLabel(4)).toBe('Very Good');
      expect(getRatingLabel(5)).toBe('Excellent');
    });

    it('should return empty string for invalid rating', () => {
      expect(getRatingLabel(0)).toBe('');
      expect(getRatingLabel(6)).toBe('');
      expect(getRatingLabel(-1)).toBe('');
    });
  });

  describe('getRatingColor', () => {
    it('should return green for high ratings', () => {
      expect(getRatingColor(5)).toBe(COLORS.emerald);
      expect(getRatingColor(4.5)).toBe(COLORS.emerald);
    });

    it('should return light green for good ratings', () => {
      expect(getRatingColor(4)).toBe(COLORS.greenBright);
      expect(getRatingColor(3.5)).toBe(COLORS.greenBright);
    });

    it('should return yellow for average ratings', () => {
      expect(getRatingColor(3)).toBe(COLORS.warning);
      expect(getRatingColor(2.5)).toBe(COLORS.warning);
    });

    it('should return orange for below average', () => {
      expect(getRatingColor(2)).toBe(COLORS.orangeAlt);
      expect(getRatingColor(1.5)).toBe(COLORS.orangeAlt);
    });

    it('should return red for poor ratings', () => {
      expect(getRatingColor(1)).toBe(COLORS.error);
      expect(getRatingColor(0.5)).toBe(COLORS.error);
    });
  });

  describe('formatRating', () => {
    it('should format rating to one decimal place', () => {
      expect(formatRating(4.5)).toBe('4.5');
      expect(formatRating(5)).toBe('5.0');
      expect(formatRating(3.333)).toBe('3.3');
      expect(formatRating(4.999)).toBe('5.0');
    });
  });

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculatePercentage(25, 100)).toBe(25);
      expect(calculatePercentage(1, 4)).toBe(25);
      expect(calculatePercentage(3, 10)).toBe(30);
    });

    it('should return 0 when total is 0', () => {
      expect(calculatePercentage(5, 0)).toBe(0);
      expect(calculatePercentage(0, 0)).toBe(0);
    });

    it('should round to nearest integer', () => {
      expect(calculatePercentage(1, 3)).toBe(33);
      expect(calculatePercentage(2, 3)).toBe(67);
    });
  });
});
