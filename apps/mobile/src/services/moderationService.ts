/**
 * Moderation Service
 * Report, block, and content moderation operations
 */

import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { moderationService as dbModerationService } from './supabaseDbService';

// Types
export type ReportReason =
  | 'inappropriate_content'
  | 'spam'
  | 'harassment'
  | 'fake_profile'
  | 'scam_fraud'
  | 'violence'
  | 'hate_speech'
  | 'other';

export type ReportTarget = 'user' | 'moment' | 'message' | 'review';

export interface Report {
  id: string;
  reporterId: string;
  targetType: ReportTarget;
  targetId: string;
  reason: ReportReason;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
}

export interface BlockedUser {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  blockedAt: string;
  reason?: string;
}

export interface ReportRequest {
  targetType: ReportTarget;
  targetId: string;
  reason: ReportReason;
  description?: string;
}

// Report reason labels for UI
export const REPORT_REASONS: { label: string; value: ReportReason }[] = [
  { label: 'Inappropriate Content', value: 'inappropriate_content' },
  { label: 'Spam', value: 'spam' },
  { label: 'Harassment', value: 'harassment' },
  { label: 'Fake Profile', value: 'fake_profile' },
  { label: 'Scam / Fraud', value: 'scam_fraud' },
  { label: 'Violence', value: 'violence' },
  { label: 'Hate Speech', value: 'hate_speech' },
  { label: 'Other', value: 'other' },
];

// Moderation Service
export const moderationService = {
  /**
   * Create a report
   */
  createReport: async (data: ReportRequest): Promise<{ report: Report }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Map target type to DB columns
      // DB has reported_user_id, reported_moment_id
      // We need to know which one to set based on targetType
      let reportedUserId = null;
      let reportedMomentId = null;

      if (data.targetType === 'user') {
        reportedUserId = data.targetId;
      } else if (data.targetType === 'moment') {
        reportedMomentId = data.targetId;
      } else {
        // For message/review, we might need to find the related user or moment
        // Or just store in description for now if schema doesn't support it directly
        // Schema has: reported_user_id, reported_moment_id
      }

      const { data: reportData, error } =
        await dbModerationService.createReport({
          reporter_id: user.id,
          reported_user_id: reportedUserId,
          reported_moment_id: reportedMomentId,
          reason: data.reason,
          description: data.description,
          status: 'pending',
        });

      if (error) throw error;
      if (!reportData) throw new Error('Failed to create report');

      const report: Report = {
        id: reportData.id,
        reporterId: reportData.reporter_id,
        targetType: data.targetType,
        targetId: data.targetId,
        reason: reportData.reason as ReportReason,
        description: reportData.description || '',
        status: reportData.status as Report['status'],
        createdAt: reportData.created_at,
      };

      return { report };
    } catch (error) {
      logger.error('Create report error:', error);
      throw error;
    }
  },

  /**
   * Get my reports
   */
  getMyReports: async (_params?: {
    page?: number;
    pageSize?: number;
    status?: string;
  }) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, count, error } = await dbModerationService.listReports(
        user.id,
      );
      if (error) throw error;

      const reports: Report[] = data.map((row: any) => ({
        id: row.id,
        reporterId: row.reporter_id,
        targetType: row.reported_moment_id ? 'moment' : 'user', // Simplified
        targetId: row.reported_moment_id || row.reported_user_id,
        reason: row.reason as ReportReason,
        description: row.description || '',
        status: row.status,
        createdAt: row.created_at,
        resolvedAt: row.resolved_at,
      }));

      return { reports, total: count || 0 };
    } catch (error) {
      logger.error('Get my reports error:', error);
      return { reports: [], total: 0 };
    }
  },

  /**
   * Block a user
   */
  blockUser: async (
    userId: string,
    _reason?: string,
  ): Promise<{ success: boolean }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await dbModerationService.blockUser({
        blocker_id: user.id,
        blocked_id: userId,
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      logger.error('Block user error:', error);
      throw error;
    }
  },

  /**
   * Unblock a user
   */
  unblockUser: async (userId: string): Promise<{ success: boolean }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await dbModerationService.unblockUser(user.id, userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      logger.error('Unblock user error:', error);
      throw error;
    }
  },

  /**
   * Get blocked users list
   */
  getBlockedUsers: async (): Promise<{ blockedUsers: BlockedUser[] }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await dbModerationService.listBlockedUsers(
        user.id,
      );
      if (error) throw error;

      const blockedUsers: BlockedUser[] = data.map((row: any) => ({
        id: row.id,
        userId: row.blocked_id,
        userName: row.blocked?.full_name || 'User',
        userAvatar: row.blocked?.avatar_url || '',
        blockedAt: row.created_at,
      }));

      return { blockedUsers };
    } catch (error) {
      logger.error('Get blocked users error:', error);
      return { blockedUsers: [] };
    }
  },

  /**
   * Check if a user is blocked
   */
  isUserBlocked: async (userId: string): Promise<{ isBlocked: boolean }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // We can check the list or do a direct query
      // For now, let's do a direct query via supabase client as db service doesn't have check method
      const { count, error } = await supabase
        .from('blocks')
        .select('*', { count: 'exact', head: true })
        .eq('blocker_id', user.id)
        .eq('blocked_id', userId);

      if (error) throw error;
      return { isBlocked: (count || 0) > 0 };
    } catch (error) {
      logger.error('Check is user blocked error:', error);
      return { isBlocked: false };
    }
  },
};

export default moderationService;
