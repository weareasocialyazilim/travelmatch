/**
 * Moderation Service
 * Report, block, and content moderation operations
 */

import { api } from '../utils/api';

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
export const REPORT_REASONS: Record<
  ReportReason,
  { label: string; description: string }
> = {
  inappropriate_content: {
    label: 'Inappropriate Content',
    description: 'Nudity, explicit content, or offensive material',
  },
  spam: {
    label: 'Spam',
    description: 'Unsolicited advertising or repetitive content',
  },
  harassment: {
    label: 'Harassment or Bullying',
    description: 'Threats, insults, or targeted behavior',
  },
  fake_profile: {
    label: 'Fake Profile',
    description: 'Impersonation or misleading identity',
  },
  scam_fraud: {
    label: 'Scam or Fraud',
    description: 'Suspicious financial activity or deception',
  },
  violence: {
    label: 'Violence',
    description: 'Threats of violence or dangerous behavior',
  },
  hate_speech: {
    label: 'Hate Speech',
    description: 'Discrimination based on race, religion, gender, etc.',
  },
  other: {
    label: 'Other',
    description: 'Something else not listed above',
  },
};

// Moderation Service
export const moderationService = {
  /**
   * Submit a report
   */
  submitReport: async (
    data: ReportRequest,
  ): Promise<{ report: Report; success: boolean }> => {
    return api.post('/reports', data);
  },

  /**
   * Get my reports
   */
  getMyReports: async (params?: {
    page?: number;
    pageSize?: number;
    status?: string;
  }) => {
    return api.get<{ reports: Report[]; total: number }>('/reports/my', {
      params,
    });
  },

  /**
   * Block a user
   */
  blockUser: async (
    userId: string,
    reason?: string,
  ): Promise<{ success: boolean }> => {
    return api.post('/users/block', { userId, reason });
  },

  /**
   * Unblock a user
   */
  unblockUser: async (userId: string): Promise<{ success: boolean }> => {
    return api.post('/users/unblock', { userId });
  },

  /**
   * Get blocked users list
   */
  getBlockedUsers: async (): Promise<{ blockedUsers: BlockedUser[] }> => {
    return api.get('/users/blocked');
  },

  /**
   * Check if a user is blocked
   */
  isUserBlocked: async (userId: string): Promise<{ isBlocked: boolean }> => {
    return api.get(`/users/${userId}/blocked-status`);
  },

  /**
   * Report a user
   */
  reportUser: async (
    userId: string,
    reason: ReportReason,
    description?: string,
  ) => {
    return moderationService.submitReport({
      targetType: 'user',
      targetId: userId,
      reason,
      description,
    });
  },

  /**
   * Report a moment
   */
  reportMoment: async (
    momentId: string,
    reason: ReportReason,
    description?: string,
  ) => {
    return moderationService.submitReport({
      targetType: 'moment',
      targetId: momentId,
      reason,
      description,
    });
  },

  /**
   * Report a message
   */
  reportMessage: async (
    messageId: string,
    reason: ReportReason,
    description?: string,
  ) => {
    return moderationService.submitReport({
      targetType: 'message',
      targetId: messageId,
      reason,
      description,
    });
  },

  /**
   * Report a review
   */
  reportReview: async (
    reviewId: string,
    reason: ReportReason,
    description?: string,
  ) => {
    return moderationService.submitReport({
      targetType: 'review',
      targetId: reviewId,
      reason,
      description,
    });
  },
};

export default moderationService;
