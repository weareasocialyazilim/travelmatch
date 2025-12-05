/**
 * User Service
 * User profile, follow/unfollow, preferences, and account operations
 */

import { api } from '../utils/api';
import { COLORS } from '../constants/colors';

// Types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar: string;
  coverImage?: string;
  bio?: string;
  location?: {
    city: string;
    country: string;
  };
  languages: string[];
  interests: string[];

  // Verification
  isVerified: boolean;
  kycStatus: 'unverified' | 'pending' | 'verified' | 'rejected';

  // Stats
  rating: number;
  reviewCount: number;
  momentCount: number;
  followerCount: number;
  followingCount: number;
  giftsSent: number;
  giftsReceived: number;

  // Dates
  createdAt: string;
  lastActiveAt: string;

  // Social links
  instagram?: string;
  twitter?: string;
  website?: string;

  // Relationship with current user
  isFollowing?: boolean;
  isFollowedBy?: boolean;
  isBlocked?: boolean;
}

export interface UserPreferences {
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;

  // Privacy
  showLocation: boolean;
  showLastActive: boolean;
  allowMessages: 'everyone' | 'followers' | 'none';

  // Display
  language: string;
  currency: string;
  timezone: string;

  // Features
  autoAcceptRequests: boolean;
  instantBooking: boolean;
}

export interface UpdateProfileData {
  name?: string;
  username?: string;
  bio?: string;
  location?: {
    city: string;
    country: string;
  };
  languages?: string[];
  interests?: string[];
  instagram?: string;
  twitter?: string;
  website?: string;
}

export interface FollowUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isVerified: boolean;
  isFollowing: boolean;
  isFollowedBy: boolean;
}

// User Service
export const userService = {
  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<{ user: UserProfile }> => {
    return api.get('/users/me');
  },

  /**
   * Get user profile by ID
   */
  getUserById: async (userId: string): Promise<{ user: UserProfile }> => {
    return api.get(`/users/${userId}`);
  },

  /**
   * Get user profile by username
   */
  getUserByUsername: async (
    username: string,
  ): Promise<{ user: UserProfile }> => {
    return api.get(`/users/username/${username}`);
  },

  /**
   * Update current user profile
   */
  updateProfile: async (
    data: UpdateProfileData,
  ): Promise<{ user: UserProfile }> => {
    return api.put('/users/me', data);
  },

  /**
   * Update avatar
   */
  updateAvatar: async (imageUri: string): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as unknown as Blob);

    return api.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Update cover image
   */
  updateCoverImage: async (imageUri: string): Promise<{ coverUrl: string }> => {
    const formData = new FormData();
    formData.append('cover', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'cover.jpg',
    } as unknown as Blob);

    return api.post('/users/me/cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Delete avatar
   */
  deleteAvatar: async (): Promise<{ success: boolean }> => {
    return api.delete('/users/me/avatar');
  },

  // --- Follow/Unfollow ---

  /**
   * Follow a user
   */
  followUser: async (userId: string): Promise<{ success: boolean }> => {
    return api.post(`/users/${userId}/follow`);
  },

  /**
   * Unfollow a user
   */
  unfollowUser: async (userId: string): Promise<{ success: boolean }> => {
    return api.post(`/users/${userId}/unfollow`);
  },

  /**
   * Get followers list
   */
  getFollowers: async (
    userId: string,
    params?: { page?: number; pageSize?: number },
  ): Promise<{ followers: FollowUser[]; total: number }> => {
    return api.get(`/users/${userId}/followers`, { params });
  },

  /**
   * Get following list
   */
  getFollowing: async (
    userId: string,
    params?: { page?: number; pageSize?: number },
  ): Promise<{ following: FollowUser[]; total: number }> => {
    return api.get(`/users/${userId}/following`, { params });
  },

  /**
   * Remove a follower
   */
  removeFollower: async (userId: string): Promise<{ success: boolean }> => {
    return api.post(`/users/${userId}/remove-follower`);
  },

  // --- Preferences ---

  /**
   * Get user preferences
   */
  getPreferences: async (): Promise<{ preferences: UserPreferences }> => {
    return api.get('/users/me/preferences');
  },

  /**
   * Update user preferences
   */
  updatePreferences: async (
    data: Partial<UserPreferences>,
  ): Promise<{ preferences: UserPreferences }> => {
    return api.put('/users/me/preferences', data);
  },

  // --- Account Management ---

  /**
   * Change password
   */
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean }> => {
    return api.post('/users/me/change-password', data);
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (
    email: string,
  ): Promise<{ success: boolean }> => {
    return api.post('/auth/forgot-password', { email });
  },

  /**
   * Verify email
   */
  verifyEmail: async (token: string): Promise<{ success: boolean }> => {
    return api.post('/auth/verify-email', { token });
  },

  /**
   * Resend verification email
   */
  resendVerificationEmail: async (): Promise<{ success: boolean }> => {
    return api.post('/auth/resend-verification');
  },

  /**
   * Deactivate account
   */
  deactivateAccount: async (
    password: string,
  ): Promise<{ success: boolean }> => {
    return api.post('/users/me/deactivate', { password });
  },

  /**
   * Delete account permanently
   */
  deleteAccount: async (password: string): Promise<{ success: boolean }> => {
    return api.delete('/users/me', { data: { password } });
  },

  /**
   * Export user data (GDPR)
   */
  exportData: async (): Promise<{ downloadUrl: string }> => {
    return api.post('/users/me/export-data');
  },

  // --- Search ---

  /**
   * Search users
   */
  searchUsers: async (
    query: string,
    params?: { page?: number; pageSize?: number },
  ): Promise<{ users: UserProfile[]; total: number }> => {
    return api.get('/users/search', { params: { query, ...params } });
  },

  /**
   * Get suggested users to follow
   */
  getSuggestedUsers: async (
    limit?: number,
  ): Promise<{ users: UserProfile[] }> => {
    return api.get('/users/suggested', { params: { limit } });
  },
};

// Helper functions
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const formatMemberSince = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export const getVerificationBadge = (
  kycStatus: UserProfile['kycStatus'],
): { icon: string; color: string; label: string } | null => {
  switch (kycStatus) {
    case 'verified':
      return {
        icon: 'shield-checkmark',
        color: COLORS.emerald,
        label: 'Verified',
      };
    case 'pending':
      return {
        icon: 'time',
        color: COLORS.warning,
        label: 'Verification Pending',
      };
    case 'rejected':
      return {
        icon: 'close-circle',
        color: COLORS.error,
        label: 'Verification Failed',
      };
    default:
      return null;
  }
};

export default userService;
