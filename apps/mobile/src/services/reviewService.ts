/**
 * Review Service
 * Ratings, reviews, and feedback operations
 */

import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { reviewsService as dbReviewsService } from './supabaseDbService';

// ReviewRow type placeholder - should be defined in database.types.ts
type ReviewRow = Record<string, unknown>;

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
  requestId: string; // Links to the transaction/request
  rating: number;
  comment: string;
}

export interface ReviewFilters {
  userId?: string; // User being reviewed
  reviewerId?: string; // User who wrote the review
  momentId?: string;
  rating?: number;
  page?: number;
  pageSize?: number;
}

// Review Service
export const reviewService = {
  /**
   * Create a new review
   */
  createReview: async (data: CreateReviewData): Promise<{ review: Review }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch request details to get moment_id and host_id/user_id
      const { data: request, error: reqError } = await supabase
        .from('requests')
        .select('moment_id, host_id, user_id')
        .eq('id', data.requestId)
        .single();

      if (reqError || !request) throw new Error('Request not found');

      // Determine who is being reviewed
      // If I am the host, I review the user. If I am the user, I review the host.
      let reviewedId = '';
      if (user.id === request.host_id) {
        reviewedId = request.user_id;
      } else if (user.id === request.user_id) {
        reviewedId = request.host_id;
      } else {
        throw new Error('Not authorized to review this request');
      }

      const { data: newReview, error } = await dbReviewsService.create({
        moment_id: request.moment_id,
        reviewer_id: user.id,
        reviewed_id: reviewedId,
        rating: data.rating,
        comment: data.comment,
      });

      if (error) throw error;

      // Construct return object
      // We need to fetch names/avatars or return simplified object
      // For now, simplified
      const review: Review = {
        id: newReview!.id,
        rating: newReview!.rating,
        comment: newReview!.comment || '',
        reviewerId: user.id,
        reviewerName: '', // Fetch if needed
        reviewerAvatar: '',
        revieweeId: reviewedId,
        revieweeName: '',
        momentId: request.moment_id,
        momentTitle: '',
        requestId: data.requestId,
        createdAt: newReview!.created_at,
        isVerified: true,
        isEdited: false,
      };

      return { review };
    } catch (error) {
      logger.error('Create review error:', error);
      throw error;
    }
  },

  /**
   * Get reviews for a user or moment
   */
  getReviews: async (
    filters: ReviewFilters,
  ): Promise<{ reviews: Review[]; stats: ReviewStats; total: number }> => {
    try {
      let data: any[] = [];
      let count = 0;

      if (filters.userId) {
        const result = await dbReviewsService.listByUser(filters.userId);
        data = result.data;
        count = result.count;
      } else {
        // TODO: Implement listByMoment or generic list in db service
        // For now, return empty if not by user
        return {
          reviews: [],
          stats: {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          },
          total: 0,
        };
      }

      const reviews: Review[] = data.map((row: any) => ({
        id: row.id as string,
        rating: row.rating as number,
        comment: (row.comment as string) || '',
        reviewerId: row.reviewer_id as string,
        reviewerName: row.reviewer?.full_name || 'User',
        reviewerAvatar: row.reviewer?.avatar_url || '',
        revieweeId: row.reviewed_id as string,
        revieweeName: '', // Could be fetched
        momentId: row.moment_id as string,
        momentTitle: row.moment?.title || '',
        requestId: '', // Not stored in reviews table directly usually
        createdAt: row.created_at as string,
        isVerified: true,
        isEdited: false,
      }));

      // Calculate stats
      const stats: ReviewStats = {
        averageRating: 0,
        totalReviews: count,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };

      if (count > 0) {
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        stats.averageRating = sum / count;
        reviews.forEach((r) => {
          const rating = Math.round(r.rating) as 1 | 2 | 3 | 4 | 5;
          if (stats.ratingDistribution[rating] !== undefined) {
            stats.ratingDistribution[rating]++;
          }
        });
      }

      return { reviews, stats, total: count };
    } catch (error) {
      logger.error('Get reviews error:', error);
      return {
        reviews: [],
        stats: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
        total: 0,
      };
    }
  },

  /**
   * Get my reviews (reviews I've written)
   */
  getMyWrittenReviews: async (
    _filters?: ReviewFilters,
  ): Promise<{ reviews: Review[]; total: number }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, count, error } = await supabase
        .from('reviews')
        .select('*, reviewer:users(*), moment:moments(*)', { count: 'exact' })
        .eq('reviewer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const reviews: Review[] = (data || []).map((row: any) => ({
        id: row.id,
        rating: row.rating,
        comment: row.comment || '',
        reviewerId: row.reviewer_id,
        reviewerName: 'Me',
        reviewerAvatar: '',
        revieweeId: row.reviewed_id,
        revieweeName: '',
        momentId: row.moment_id,
        momentTitle: row.moment?.title || '',
        requestId: '',
        createdAt: row.created_at,
        isVerified: true,
        isEdited: false,
      }));

      return { reviews, total: count || 0 };
    } catch (error) {
      logger.error('Get my written reviews error:', error);
      return { reviews: [], total: 0 };
    }
  },

  /**
   * Get reviews about me
   */
  getMyReceivedReviews: async (
    filters?: ReviewFilters,
  ): Promise<{ reviews: Review[]; stats: ReviewStats; total: number }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      return reviewService.getReviews({ ...filters, userId: user.id });
    } catch (error) {
      logger.error('Get my received reviews error:', error);
      return {
        reviews: [],
        stats: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
        total: 0,
      };
    }
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
    }>;
  }> => {
    // TODO: Implement query to find completed requests where I haven't left a review yet
    return { pendingReviews: [] };
  },

  /**
   * Get my review statistics
   */
  getMyReviewStats: async (): Promise<{ stats: ReviewStats }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { stats } = await reviewService.getReviews({ userId: user.id });
      return { stats };
    } catch (error) {
      logger.error('Get my review stats error:', error);
      return {
        stats: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
      };
    }
  },

  /**
   * Get reviews for a specific user
   */
  getUserReviews: async (
    userId: string,
    filters?: ReviewFilters,
  ): Promise<{ reviews: Review[]; stats: ReviewStats; total: number }> => {
    return reviewService.getReviews({ ...filters, userId });
  },

  /**
   * Get reviews for a specific moment
   */
  getMomentReviews: async (
    momentId: string,
    filters?: ReviewFilters,
  ): Promise<{ reviews: Review[]; stats: ReviewStats; total: number }> => {
    return reviewService.getReviews({ ...filters, momentId });
  },

  /**
   * Update an existing review
   */
  updateReview: async (
    reviewId: string,
    data: { rating?: number; comment?: string },
  ): Promise<{ review: Review }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: updated, error } = await supabase
        .from('reviews')
        .update({
          rating: data.rating,
          comment: data.comment,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reviewId)
        .eq('reviewer_id', user.id) // Ensure only owner can update
        .select('*, reviewer:users(*), moment:moments(*)')
        .single();

      if (error) throw error;
      if (!updated) throw new Error('Review not found');

      const review: Review = {
        id: updated.id,
        rating: updated.rating,
        comment: updated.comment || '',
        reviewerId: updated.reviewer_id,
        reviewerName: (updated as any).reviewer?.full_name || 'User',
        reviewerAvatar: (updated as any).reviewer?.avatar_url || '',
        revieweeId: updated.reviewed_id,
        revieweeName: '',
        momentId: updated.moment_id,
        momentTitle: (updated as any).moment?.title || '',
        requestId: '',
        createdAt: updated.created_at,
        isVerified: true,
        isEdited: true,
      };

      return { review };
    } catch (error) {
      logger.error('Update review error:', error);
      throw error;
    }
  },

  /**
   * Delete a review
   */
  deleteReview: async (reviewId: string): Promise<void> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('reviewer_id', user.id); // Ensure only owner can delete

      if (error) throw error;
    } catch (error) {
      logger.error('Delete review error:', error);
      throw error;
    }
  },

  /**
   * Respond to a review (for reviewed users)
   */
  respondToReview: async (
    reviewId: string,
    text: string,
  ): Promise<{ review: Review }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if user is the reviewed person
      const { data: existingReview, error: fetchError } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', reviewId)
        .eq('reviewed_id', user.id)
        .single();

      if (fetchError || !existingReview) {
        throw new Error('Review not found or not authorized');
      }

      // Note: Response field may need to be added to the reviews table
      // For now, we'll store it but the schema may need updating
      const { data: updated, error } = await supabase
        .from('reviews')
        .update({
          response: text,
          response_at: new Date().toISOString(),
        } as any)
        .eq('id', reviewId)
        .select('*, reviewer:users(*), moment:moments(*)')
        .single();

      if (error) throw error;

      const review: Review = {
        id: updated!.id,
        rating: updated!.rating,
        comment: updated!.comment || '',
        reviewerId: updated!.reviewer_id,
        reviewerName: (updated as any)?.reviewer?.full_name || 'User',
        reviewerAvatar: (updated as any)?.reviewer?.avatar_url || '',
        revieweeId: updated!.reviewed_id,
        revieweeName: '',
        momentId: updated!.moment_id,
        momentTitle: (updated as any)?.moment?.title || '',
        requestId: '',
        createdAt: updated!.created_at,
        isVerified: true,
        isEdited: false,
        response: {
          text,
          createdAt: new Date().toISOString(),
        },
      };

      return { review };
    } catch (error) {
      logger.error('Respond to review error:', error);
      throw error;
    }
  },

  /**
   * Report a review
   */
  reportReview: async (reviewId: string, reason: string): Promise<void> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Insert into reports table (assuming it exists)
      const { error } = await supabase.from('reports').insert({
        reporter_id: user.id,
        target_type: 'review',
        target_id: reviewId,
        reason,
        status: 'pending',
      } as any);

      if (error) throw error;
    } catch (error) {
      logger.error('Report review error:', error);
      throw error;
    }
  },
};

// Utility functions
export const getRatingLabel = (rating: number): string => {
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 3.5) return 'Very Good';
  if (rating >= 2.5) return 'Good';
  if (rating >= 1.5) return 'Fair';
  return 'Poor';
};

export const getRatingColor = (rating: number): string => {
  if (rating >= 4.5) return '#22c55e'; // green
  if (rating >= 3.5) return '#10b981'; // light green
  if (rating >= 2.5) return '#f59e0b'; // orange
  if (rating >= 1.5) return '#ef4444'; // red
  return '#dc2626'; // dark red
};

export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

export const calculatePercentage = (count: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
};

export default reviewService;
