/**
 * useReviews Hook
 * Review management and statistics
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  Review,
  ReviewStats,
  CreateReviewData,
  ReviewFilters,
} from '../services/reviewService';
import { reviewService } from '../services/reviewService';
import { logger } from '../utils/logger';

interface PendingReview {
  requestId: string;
  momentId: string;
  momentTitle: string;
  userId: string;
  userName: string;
  userAvatar: string;
  completedAt: string;
  expiresAt: string;
}

interface UseReviewsReturn {
  // My reviews (written by me)
  writtenReviews: Review[];
  writtenLoading: boolean;
  writtenError: string | null;
  refreshWritten: () => Promise<void>;

  // Reviews about me
  receivedReviews: Review[];
  receivedStats: ReviewStats | null;
  receivedLoading: boolean;
  receivedError: string | null;
  refreshReceived: () => Promise<void>;

  // Pending reviews
  pendingReviews: PendingReview[];
  pendingLoading: boolean;
  refreshPending: () => Promise<void>;

  // User reviews (for viewing other profiles)
  getUserReviews: (
    userId: string,
    filters?: ReviewFilters,
  ) => Promise<{
    reviews: Review[];
    stats: ReviewStats;
    total: number;
  } | null>;

  // Moment reviews
  getMomentReviews: (
    momentId: string,
    filters?: ReviewFilters,
  ) => Promise<{
    reviews: Review[];
    stats: ReviewStats;
    total: number;
  } | null>;

  // Actions
  createReview: (data: CreateReviewData) => Promise<Review | null>;
  updateReview: (
    reviewId: string,
    data: { rating?: number; comment?: string },
  ) => Promise<Review | null>;
  deleteReview: (reviewId: string) => Promise<boolean>;
  respondToReview: (reviewId: string, text: string) => Promise<Review | null>;
  reportReview: (reviewId: string, reason: string) => Promise<boolean>;

  // My stats
  myStats: ReviewStats | null;
}

export const useReviews = (): UseReviewsReturn => {
  // Written reviews state
  const [writtenReviews, setWrittenReviews] = useState<Review[]>([]);
  const [writtenLoading, setWrittenLoading] = useState(true);
  const [writtenError, setWrittenError] = useState<string | null>(null);

  // Received reviews state
  const [receivedReviews, setReceivedReviews] = useState<Review[]>([]);
  const [receivedStats, setReceivedStats] = useState<ReviewStats | null>(null);
  const [receivedLoading, setReceivedLoading] = useState(true);
  const [receivedError, setReceivedError] = useState<string | null>(null);

  // Pending reviews
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);

  // My stats
  const [myStats, setMyStats] = useState<ReviewStats | null>(null);

  /**
   * Fetch written reviews
   */
  const refreshWritten = useCallback(async () => {
    try {
      setWrittenLoading(true);
      setWrittenError(null);
      const response = await reviewService.getMyWrittenReviews();
      setWrittenReviews(response.reviews);
    } catch (error) {
      setWrittenError(
        error instanceof Error ? error.message : 'Failed to load reviews',
      );
    } finally {
      setWrittenLoading(false);
    }
  }, []);

  /**
   * Fetch received reviews
   */
  const refreshReceived = useCallback(async () => {
    try {
      setReceivedLoading(true);
      setReceivedError(null);
      const response = await reviewService.getMyReceivedReviews();
      setReceivedReviews(response.reviews);
      setReceivedStats(response.stats);
    } catch (error) {
      setReceivedError(
        error instanceof Error ? error.message : 'Failed to load reviews',
      );
    } finally {
      setReceivedLoading(false);
    }
  }, []);

  /**
   * Fetch pending reviews
   */
  const refreshPending = useCallback(async () => {
    try {
      setPendingLoading(true);
      const response = await reviewService.getPendingReviews();
      setPendingReviews(response.pendingReviews);
    } catch (error) {
      logger.error('Failed to fetch pending reviews:', error);
    } finally {
      setPendingLoading(false);
    }
  }, []);

  /**
   * Fetch my stats
   */
  const fetchMyStats = useCallback(async () => {
    try {
      const response = await reviewService.getMyReviewStats();
      setMyStats(response.stats);
    } catch (error) {
      logger.error('Failed to fetch review stats:', error);
    }
  }, []);

  /**
   * Get reviews for a user
   */
  const getUserReviews = useCallback(
    async (
      userId: string,
      filters?: ReviewFilters,
    ): Promise<{
      reviews: Review[];
      stats: ReviewStats;
      total: number;
    } | null> => {
      try {
        return await reviewService.getUserReviews(userId, filters);
      } catch (error) {
        logger.error('Failed to get user reviews:', error);
        return null;
      }
    },
    [],
  );

  /**
   * Get reviews for a moment
   */
  const getMomentReviews = useCallback(
    async (
      momentId: string,
      filters?: ReviewFilters,
    ): Promise<{
      reviews: Review[];
      stats: ReviewStats;
      total: number;
    } | null> => {
      try {
        return await reviewService.getMomentReviews(momentId, filters);
      } catch (error) {
        logger.error('Failed to get moment reviews:', error);
        return null;
      }
    },
    [],
  );

  /**
   * Create a review
   */
  const createReview = useCallback(
    async (data: CreateReviewData): Promise<Review | null> => {
      try {
        const response = await reviewService.createReview(data);

        // Add to written reviews
        setWrittenReviews((prev) => [response.review, ...prev]);

        // Remove from pending
        setPendingReviews((prev) =>
          prev.filter((p) => p.requestId !== data.requestId),
        );

        return response.review;
      } catch (error) {
        logger.error('Failed to create review:', error);
        return null;
      }
    },
    [],
  );

  /**
   * Update a review
   */
  const updateReview = useCallback(
    async (
      reviewId: string,
      data: { rating?: number; comment?: string },
    ): Promise<Review | null> => {
      try {
        const response = await reviewService.updateReview(reviewId, data);

        // Update in written reviews
        setWrittenReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? response.review : r)),
        );

        return response.review;
      } catch (error) {
        logger.error('Failed to update review:', error);
        return null;
      }
    },
    [],
  );

  /**
   * Delete a review
   */
  const deleteReview = useCallback(
    async (reviewId: string): Promise<boolean> => {
      try {
        await reviewService.deleteReview(reviewId);
        setWrittenReviews((prev) => prev.filter((r) => r.id !== reviewId));
        return true;
      } catch (error) {
        logger.error('Failed to delete review:', error);
        return false;
      }
    },
    [],
  );

  /**
   * Respond to a review
   */
  const respondToReview = useCallback(
    async (reviewId: string, text: string): Promise<Review | null> => {
      try {
        const response = await reviewService.respondToReview(reviewId, text);

        // Update in received reviews
        setReceivedReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? response.review : r)),
        );

        return response.review;
      } catch (error) {
        logger.error('Failed to respond to review:', error);
        return null;
      }
    },
    [],
  );

  /**
   * Report a review
   */
  const reportReview = useCallback(
    async (reviewId: string, reason: string): Promise<boolean> => {
      try {
        await reviewService.reportReview(reviewId, reason);
        return true;
      } catch (error) {
        logger.error('Failed to report review:', error);
        return false;
      }
    },
    [],
  );

  // Initial load
  useEffect(() => {
    refreshWritten();
    refreshReceived();
    refreshPending();
    fetchMyStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // Written reviews
    writtenReviews,
    writtenLoading,
    writtenError,
    refreshWritten,

    // Received reviews
    receivedReviews,
    receivedStats,
    receivedLoading,
    receivedError,
    refreshReceived,

    // Pending reviews
    pendingReviews,
    pendingLoading,
    refreshPending,

    // User/moment reviews
    getUserReviews,
    getMomentReviews,

    // Actions
    createReview,
    updateReview,
    deleteReview,
    respondToReview,
    reportReview,

    // Stats
    myStats,
  };
};

export default useReviews;
