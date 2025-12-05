/**
 * Review Service
 * Ratings, reviews, and feedback operations
 */

import { api } from '../utils/api';
import { COLORS } from '../constants/colors';

// Types
export interface Review {
  id: string;
  rating: number; // 1-5
  comment: string;

  // Reviewer info
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;

  // Reviewee info
  revieweeId: string;
  revieweeName: string;

  // Related moment/request
  momentId: string;
  momentTitle: string;
  requestId: string;

  // Timestamps
  createdAt: string;
  updatedAt?: string;

  // Response from reviewee
  response?: {
    text: string;
    createdAt: string;
  };

  // Flags
  isVerified: boolean; // From completed transaction
  isEdited: boolean;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface CreateReviewData {
  requestId: string;
  rating: number;
  comment: string;
}

export interface ReviewFilters {
  userId?: string;
  momentId?: string;
  minRating?: number;
  maxRating?: number;
  page?: number;
  pageSize?: number;
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest';
}

// Review Service
export const reviewService = {
  /**
   * Get reviews for a user
   */
  getUserReviews: async (
    userId: string,
    filters?: ReviewFilters,
  ): Promise<{ reviews: Review[]; stats: ReviewStats; total: number }> => {
    return api.get(`/users/${userId}/reviews`, { params: filters });
  },

  /**
   * Get reviews for a moment
   */
  getMomentReviews: async (
    momentId: string,
    filters?: Omit<ReviewFilters, 'momentId'>,
  ): Promise<{ reviews: Review[]; stats: ReviewStats; total: number }> => {
    return api.get(`/moments/${momentId}/reviews`, { params: filters });
  },

  /**
   * Get my reviews (reviews I've written)
   */
  getMyWrittenReviews: async (
    filters?: ReviewFilters,
  ): Promise<{ reviews: Review[]; total: number }> => {
    return api.get('/reviews/written', { params: filters });
  },

  /**
   * Get reviews about me
   */
  getMyReceivedReviews: async (
    filters?: ReviewFilters,
  ): Promise<{ reviews: Review[]; stats: ReviewStats; total: number }> => {
    return api.get('/reviews/received', { params: filters });
  },

  /**
   * Get pending reviews (requests I need to review)
   */
  getPendingReviews: async (): Promise<{
    pendingReviews: Array<{
      requestId: string;
      momentId: string;
      momentTitle: string;
      userId: string;
      userName: string;
      userAvatar: string;
      completedAt: string;
      expiresAt: string; // Review window expires
    }>;
  }> => {
    return api.get('/reviews/pending');
  },

  /**
   * Create a review
   */
  createReview: async (data: CreateReviewData): Promise<{ review: Review }> => {
    return api.post('/reviews', data);
  },

  /**
   * Update a review (within edit window)
   */
  updateReview: async (
    reviewId: string,
    data: { rating?: number; comment?: string },
  ): Promise<{ review: Review }> => {
    return api.put(`/reviews/${reviewId}`, data);
  },

  /**
   * Delete a review (within delete window)
   */
  deleteReview: async (reviewId: string): Promise<{ success: boolean }> => {
    return api.delete(`/reviews/${reviewId}`);
  },

  /**
   * Respond to a review (as reviewee)
   */
  respondToReview: async (
    reviewId: string,
    text: string,
  ): Promise<{ review: Review }> => {
    return api.post(`/reviews/${reviewId}/respond`, { text });
  },

  /**
   * Report a review
   */
  reportReview: async (
    reviewId: string,
    reason: string,
  ): Promise<{ success: boolean }> => {
    return api.post(`/reviews/${reviewId}/report`, { reason });
  },

  /**
   * Get review summary for current user
   */
  getMyReviewStats: async (): Promise<{ stats: ReviewStats }> => {
    return api.get('/reviews/my-stats');
  },

  /**
   * Check if user can review a request
   */
  canReviewRequest: async (
    requestId: string,
  ): Promise<{ canReview: boolean; reason?: string }> => {
    return api.get(`/reviews/can-review/${requestId}`);
  },
};

// Helper functions
export const getRatingLabel = (rating: number): string => {
  const labels: Record<number, string> = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  };
  return labels[rating] || '';
};

export const getRatingColor = (rating: number): string => {
  if (rating >= 4.5) return COLORS.emerald; // Green
  if (rating >= 3.5) return COLORS.greenBright; // Light green
  if (rating >= 2.5) return COLORS.warning; // Yellow
  if (rating >= 1.5) return COLORS.orangeAlt; // Orange
  return COLORS.error; // Red
};

export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

export const calculatePercentage = (count: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
};

export default reviewService;
