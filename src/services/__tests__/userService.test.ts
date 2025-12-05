/**
 * Tests for userService
 * Verifies user profile, preferences, and account operations
 */

import { userService } from '../userService';
import { api } from '../../utils/api';

// Mock the api module
jest.mock('../../utils/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should fetch current user profile', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        username: 'testuser',
        avatar: 'https://example.com/avatar.jpg',
        isVerified: true,
        rating: 4.5,
        reviewCount: 10,
        momentCount: 5,
        followerCount: 100,
        followingCount: 50,
      };

      mockApi.get.mockResolvedValueOnce(mockUser);

      const result = await userService.getCurrentUser();

      expect(mockApi.get).toHaveBeenCalledWith('/users/me');
      expect(result.id).toBe('user-1');
      expect(result.name).toBe('Test User');
      expect(result.isVerified).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(userService.getCurrentUser()).rejects.toThrow(
        'Network error',
      );
    });
  });

  describe('getUserById', () => {
    it('should fetch user by ID', async () => {
      const mockUser = {
        id: 'user-2',
        name: 'Another User',
        username: 'anotheruser',
        isVerified: false,
      };

      mockApi.get.mockResolvedValueOnce(mockUser);

      const result = await userService.getUserById('user-2');

      expect(mockApi.get).toHaveBeenCalledWith('/users/user-2');
      expect(result.id).toBe('user-2');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updateData = {
        name: 'Updated Name',
        bio: 'New bio',
        location: { city: 'San Francisco', country: 'USA' },
      };

      const mockResponse = { ...updateData, id: 'user-1' };
      mockApi.put.mockResolvedValueOnce(mockResponse);

      const result = await userService.updateProfile(updateData);

      expect(mockApi.put).toHaveBeenCalledWith('/users/me', updateData);
      expect(result.name).toBe('Updated Name');
      expect(result.bio).toBe('New bio');
    });

    it('should update specific fields only', async () => {
      const updateData = { bio: 'Just updating bio' };
      mockApi.put.mockResolvedValueOnce({ id: 'user-1', ...updateData });

      await userService.updateProfile(updateData);

      expect(mockApi.put).toHaveBeenCalledWith('/users/me', updateData);
    });
  });

  describe('getPreferences', () => {
    it('should fetch user preferences', async () => {
      const mockPreferences = {
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
        showLocation: true,
        language: 'en',
        currency: 'USD',
      };

      mockApi.get.mockResolvedValueOnce(mockPreferences);

      const result = await userService.getPreferences();

      expect(mockApi.get).toHaveBeenCalledWith('/users/me/preferences');
      expect(result.emailNotifications).toBe(true);
      expect(result.language).toBe('en');
    });
  });

  describe('updatePreferences', () => {
    it('should update user preferences', async () => {
      const updates = {
        pushNotifications: false,
        language: 'tr',
      };

      mockApi.put.mockResolvedValueOnce(updates);

      const result = await userService.updatePreferences(updates);

      expect(mockApi.put).toHaveBeenCalledWith(
        '/users/me/preferences',
        updates,
      );
      expect(result.pushNotifications).toBe(false);
    });
  });

  describe('follow/unfollow', () => {
    it('should follow a user', async () => {
      const mockResponse = { success: true };
      mockApi.post.mockResolvedValueOnce(mockResponse);

      const result = await userService.followUser('user-2');

      expect(mockApi.post).toHaveBeenCalledWith('/users/user-2/follow');
      expect(result.success).toBe(true);
    });

    it('should unfollow a user', async () => {
      const mockResponse = { success: true };
      mockApi.post.mockResolvedValueOnce(mockResponse);

      const result = await userService.unfollowUser('user-2');

      expect(mockApi.post).toHaveBeenCalledWith('/users/user-2/unfollow');
      expect(result.success).toBe(true);
    });
  });

  describe('getFollowers', () => {
    it('should fetch user followers with pagination', async () => {
      const mockFollowers = {
        followers: [
          { id: 'f1', name: 'Follower 1', isFollowing: false },
          { id: 'f2', name: 'Follower 2', isFollowing: true },
        ],
        total: 2,
      };

      mockApi.get.mockResolvedValueOnce(mockFollowers);

      const result = await userService.getFollowers('user-1', {
        page: 1,
        pageSize: 20,
      });

      expect(mockApi.get).toHaveBeenCalledWith('/users/user-1/followers', {
        params: { page: 1, pageSize: 20 },
      });
      expect(result.followers).toHaveLength(2);
    });
  });

  describe('getFollowing', () => {
    it('should fetch users being followed', async () => {
      const mockFollowing = {
        following: [{ id: 'u1', name: 'User 1', isFollowing: true }],
        total: 1,
      };

      mockApi.get.mockResolvedValueOnce(mockFollowing);

      const result = await userService.getFollowing('user-1');

      expect(mockApi.get).toHaveBeenCalledWith('/users/user-1/following', {
        params: undefined,
      });
      expect(result.following).toHaveLength(1);
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const passwordData = {
        currentPassword: 'oldpass123',
        newPassword: 'newpass456',
      };

      mockApi.post.mockResolvedValueOnce({ success: true });

      const result = await userService.changePassword(passwordData);

      expect(mockApi.post).toHaveBeenCalledWith(
        '/users/me/change-password',
        passwordData,
      );
      expect(result.success).toBe(true);
    });

    it('should reject with invalid current password', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Invalid current password'));

      await expect(
        userService.changePassword({
          currentPassword: 'wrong',
          newPassword: 'newpass',
        }),
      ).rejects.toThrow('Invalid current password');
    });
  });

  describe('requestPasswordReset', () => {
    it('should send password reset email', async () => {
      mockApi.post.mockResolvedValueOnce({ success: true });

      const result = await userService.requestPasswordReset('test@example.com');

      expect(mockApi.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'test@example.com',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('deleteAccount', () => {
    it('should delete user account with password confirmation', async () => {
      mockApi.delete.mockResolvedValueOnce({ success: true });

      const result = await userService.deleteAccount('password123');

      expect(mockApi.delete).toHaveBeenCalledWith('/users/me', {
        data: { password: 'password123' },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('updateAvatar', () => {
    it('should upload avatar image', async () => {
      const mockImageUri = 'file://avatar.jpg';

      mockApi.post.mockResolvedValueOnce({
        avatarUrl: 'https://cdn.example.com/avatar.jpg',
      });

      const result = await userService.updateAvatar(mockImageUri);

      expect(mockApi.post).toHaveBeenCalled();
      expect(result.avatarUrl).toContain('avatar.jpg');
    });
  });

  describe('searchUsers', () => {
    it('should search for users by query', async () => {
      const mockSearchResult = {
        users: [
          { id: 'u1', name: 'John Doe', username: 'johndoe' },
          { id: 'u2', name: 'Jane Doe', username: 'janedoe' },
        ],
        total: 2,
      };

      mockApi.get.mockResolvedValueOnce(mockSearchResult);

      const result = await userService.searchUsers('doe', {
        page: 1,
        pageSize: 10,
      });

      expect(mockApi.get).toHaveBeenCalledWith('/users/search', {
        params: { query: 'doe', page: 1, pageSize: 10 },
      });
      expect(result.users).toHaveLength(2);
    });
  });

  describe('getSuggestedUsers', () => {
    it('should fetch suggested users to follow', async () => {
      const mockSuggested = {
        users: [
          { id: 's1', name: 'Suggested User 1' },
          { id: 's2', name: 'Suggested User 2' },
        ],
      };

      mockApi.get.mockResolvedValueOnce(mockSuggested);

      const result = await userService.getSuggestedUsers(5);

      expect(mockApi.get).toHaveBeenCalledWith('/users/suggested', {
        params: { limit: 5 },
      });
      expect(result.users).toHaveLength(2);
    });
  });
});
