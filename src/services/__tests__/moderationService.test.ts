/**
 * Moderation Service Tests
 * Tests for report, block, and content moderation operations
 */

import { moderationService, REPORT_REASONS } from '../moderationService';
import { api } from '../../utils/api';

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

describe('moderationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('REPORT_REASONS', () => {
    it('should have all report reason labels', () => {
      const reasons = [
        'inappropriate_content',
        'spam',
        'harassment',
        'fake_profile',
        'scam_fraud',
        'violence',
        'hate_speech',
        'other',
      ];

      reasons.forEach((reason) => {
        expect(REPORT_REASONS[reason as keyof typeof REPORT_REASONS]).toBeDefined();
        expect(REPORT_REASONS[reason as keyof typeof REPORT_REASONS].label).toBeTruthy();
        expect(REPORT_REASONS[reason as keyof typeof REPORT_REASONS].description).toBeTruthy();
      });
    });

    it('should have descriptive labels for user-facing display', () => {
      expect(REPORT_REASONS.inappropriate_content.label).toBe('Inappropriate Content');
      expect(REPORT_REASONS.harassment.label).toBe('Harassment or Bullying');
      expect(REPORT_REASONS.fake_profile.label).toBe('Fake Profile');
    });
  });

  describe('submitReport', () => {
    it('should submit a report successfully', async () => {
      const mockReport = {
        id: 'report-123',
        reporterId: 'user-1',
        targetType: 'user',
        targetId: 'user-2',
        reason: 'harassment',
        status: 'pending',
        createdAt: '2025-01-01T00:00:00Z',
      };

      mockApi.post.mockResolvedValue({ report: mockReport, success: true });

      const result = await moderationService.submitReport({
        targetType: 'user',
        targetId: 'user-2',
        reason: 'harassment',
        description: 'Sent threatening messages',
      });

      expect(mockApi.post).toHaveBeenCalledWith('/reports', {
        targetType: 'user',
        targetId: 'user-2',
        reason: 'harassment',
        description: 'Sent threatening messages',
      });
      expect(result.success).toBe(true);
      expect(result.report.id).toBe('report-123');
    });

    it('should submit report without description', async () => {
      mockApi.post.mockResolvedValue({ report: {}, success: true });

      await moderationService.submitReport({
        targetType: 'moment',
        targetId: 'moment-1',
        reason: 'spam',
      });

      expect(mockApi.post).toHaveBeenCalledWith('/reports', {
        targetType: 'moment',
        targetId: 'moment-1',
        reason: 'spam',
      });
    });
  });

  describe('getMyReports', () => {
    it('should fetch user reports with pagination', async () => {
      const mockReports = [
        { id: 'report-1', status: 'pending' },
        { id: 'report-2', status: 'resolved' },
      ];

      mockApi.get.mockResolvedValue({ reports: mockReports, total: 2 });

      const result = await moderationService.getMyReports({
        page: 1,
        pageSize: 10,
        status: 'pending',
      });

      expect(mockApi.get).toHaveBeenCalledWith('/reports/my', {
        params: { page: 1, pageSize: 10, status: 'pending' },
      });
      expect(result.reports).toHaveLength(2);
    });

    it('should fetch all reports without filters', async () => {
      mockApi.get.mockResolvedValue({ reports: [], total: 0 });

      await moderationService.getMyReports();

      expect(mockApi.get).toHaveBeenCalledWith('/reports/my', {
        params: undefined,
      });
    });
  });

  describe('blockUser', () => {
    it('should block a user with reason', async () => {
      mockApi.post.mockResolvedValue({ success: true });

      const result = await moderationService.blockUser('user-123', 'Unwanted messages');

      expect(mockApi.post).toHaveBeenCalledWith('/users/block', {
        userId: 'user-123',
        reason: 'Unwanted messages',
      });
      expect(result.success).toBe(true);
    });

    it('should block a user without reason', async () => {
      mockApi.post.mockResolvedValue({ success: true });

      await moderationService.blockUser('user-456');

      expect(mockApi.post).toHaveBeenCalledWith('/users/block', {
        userId: 'user-456',
        reason: undefined,
      });
    });
  });

  describe('unblockUser', () => {
    it('should unblock a user', async () => {
      mockApi.post.mockResolvedValue({ success: true });

      const result = await moderationService.unblockUser('user-123');

      expect(mockApi.post).toHaveBeenCalledWith('/users/unblock', {
        userId: 'user-123',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('getBlockedUsers', () => {
    it('should fetch blocked users list', async () => {
      const mockBlockedUsers = [
        {
          id: 'block-1',
          userId: 'user-1',
          userName: 'John',
          userAvatar: 'avatar.jpg',
          blockedAt: '2025-01-01T00:00:00Z',
        },
      ];

      mockApi.get.mockResolvedValue({ blockedUsers: mockBlockedUsers });

      const result = await moderationService.getBlockedUsers();

      expect(mockApi.get).toHaveBeenCalledWith('/users/blocked');
      expect(result.blockedUsers).toHaveLength(1);
      expect(result.blockedUsers[0].userName).toBe('John');
    });

    it('should return empty list when no blocked users', async () => {
      mockApi.get.mockResolvedValue({ blockedUsers: [] });

      const result = await moderationService.getBlockedUsers();

      expect(result.blockedUsers).toHaveLength(0);
    });
  });

  describe('isUserBlocked', () => {
    it('should check if user is blocked', async () => {
      mockApi.get.mockResolvedValue({ isBlocked: true });

      const result = await moderationService.isUserBlocked('user-123');

      expect(mockApi.get).toHaveBeenCalledWith('/users/user-123/blocked-status');
      expect(result.isBlocked).toBe(true);
    });

    it('should return false for non-blocked user', async () => {
      mockApi.get.mockResolvedValue({ isBlocked: false });

      const result = await moderationService.isUserBlocked('user-456');

      expect(result.isBlocked).toBe(false);
    });
  });

  describe('reportUser', () => {
    it('should report a user', async () => {
      mockApi.post.mockResolvedValue({ report: {}, success: true });

      await moderationService.reportUser('user-123', 'fake_profile', 'Using fake photos');

      expect(mockApi.post).toHaveBeenCalledWith('/reports', {
        targetType: 'user',
        targetId: 'user-123',
        reason: 'fake_profile',
        description: 'Using fake photos',
      });
    });

    it('should report a user without description', async () => {
      mockApi.post.mockResolvedValue({ report: {}, success: true });

      await moderationService.reportUser('user-123', 'spam');

      expect(mockApi.post).toHaveBeenCalledWith('/reports', {
        targetType: 'user',
        targetId: 'user-123',
        reason: 'spam',
        description: undefined,
      });
    });
  });

  describe('reportMoment', () => {
    it('should report a moment', async () => {
      mockApi.post.mockResolvedValue({ report: {}, success: true });

      await moderationService.reportMoment('moment-123', 'inappropriate_content', 'Contains nudity');

      expect(mockApi.post).toHaveBeenCalledWith('/reports', {
        targetType: 'moment',
        targetId: 'moment-123',
        reason: 'inappropriate_content',
        description: 'Contains nudity',
      });
    });
  });

  describe('reportMessage', () => {
    it('should report a message', async () => {
      mockApi.post.mockResolvedValue({ report: {}, success: true });

      await moderationService.reportMessage('msg-123', 'harassment', 'Threatening language');

      expect(mockApi.post).toHaveBeenCalledWith('/reports', {
        targetType: 'message',
        targetId: 'msg-123',
        reason: 'harassment',
        description: 'Threatening language',
      });
    });
  });

  describe('reportReview', () => {
    it('should report a review', async () => {
      mockApi.post.mockResolvedValue({ report: {}, success: true });

      await moderationService.reportReview('review-123', 'hate_speech', 'Discriminatory content');

      expect(mockApi.post).toHaveBeenCalledWith('/reports', {
        targetType: 'review',
        targetId: 'review-123',
        reason: 'hate_speech',
        description: 'Discriminatory content',
      });
    });
  });

  describe('Error handling', () => {
    it('should propagate API errors on submitReport', async () => {
      mockApi.post.mockRejectedValue(new Error('Network error'));

      await expect(
        moderationService.submitReport({
          targetType: 'user',
          targetId: 'user-1',
          reason: 'spam',
        })
      ).rejects.toThrow('Network error');
    });

    it('should propagate API errors on blockUser', async () => {
      mockApi.post.mockRejectedValue(new Error('User not found'));

      await expect(moderationService.blockUser('invalid-user')).rejects.toThrow(
        'User not found'
      );
    });

    it('should propagate API errors on getBlockedUsers', async () => {
      mockApi.get.mockRejectedValue(new Error('Unauthorized'));

      await expect(moderationService.getBlockedUsers()).rejects.toThrow('Unauthorized');
    });
  });
});
