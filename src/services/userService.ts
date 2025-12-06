/**
 * User Service
 * User profile, follow/unfollow, preferences, and account operations
 */

import { COLORS } from '../constants/colors';
import { supabase } from '../config/supabase';
import { usersService as dbUsersService } from './supabaseDbService';
import { logger } from '../utils/logger';
import { uploadFile } from './supabaseStorageService';
import { encryptionService } from './encryptionService';

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
  publicKey?: string;
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
   * Initialize and sync encryption keys
   */
  syncKeys: async () => {
    try {
      const { user } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Ensure local keys exist
      const keys = await encryptionService.initializeKeys();

      // 2. Check remote key
      const { data: profile } = await dbUsersService.getById(user.id);
      
      // @ts-ignore - public_key might not be in types yet
      if (profile && !profile.public_key) {
        logger.info('[User] Uploading public key');
        await dbUsersService.update(user.id, {
          // @ts-ignore
          public_key: keys.publicKey,
        });
      }
    } catch (error) {
      logger.error('[User] Failed to sync keys', error);
    }
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<{ user: UserProfile | null; error: Error | null }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      logger.error('Error fetching current user profile:', error);
      throw error;
    }

    return { user: profile as unknown as UserProfile };
  },

  /**
   * Get user profile by ID
   */
  getUserById: async (userId: string): Promise<{ user: UserProfile }> => {
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      logger.error(`Error fetching user ${userId}:`, error);
      throw error;
    }

    return { user: profile as unknown as UserProfile };
  },

  /**
   * Get user profile by username
   */
  getUserByUsername: async (
    username: string,
  ): Promise<{ user: UserProfile }> => {
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      logger.error(`Error fetching user by username ${username}:`, error);
      throw error;
    }

    return { user: profile as unknown as UserProfile };
  },

  /**
   * Update current user profile
   */
  updateProfile: async (
    data: UpdateProfileData,
  ): Promise<{ user: UserProfile }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating profile:', error);
      throw error;
    }

    return { user: profile as unknown as UserProfile };
  },

  /**
   * Update avatar
   */
  updateAvatar: async (imageUri: string): Promise<{ avatarUrl: string }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { url, error } = await uploadFile('avatars', imageUri, user.id);
    if (error) throw error;
    if (!url) throw new Error('Upload failed');

    // Update user profile
    await userService.updateProfile({ avatar: url } as any);

    return { avatarUrl: url };
  },

  /**
   * Update cover image
   */
  updateCoverImage: async (imageUri: string): Promise<{ coverUrl: string }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Assuming 'avatars' bucket is used for covers too, or create 'covers' bucket
    // Using 'avatars' for now as per storage service buckets
    const { url, error } = await uploadFile('avatars', imageUri, user.id);
    if (error) throw error;
    if (!url) throw new Error('Upload failed');

    await userService.updateProfile({ coverImage: url } as any);

    return { coverUrl: url };
  },

  /**
   * Delete avatar
   */
  deleteAvatar: async (): Promise<{ success: boolean }> => {
    // Just set avatar to default or null
    await userService.updateProfile({ avatar: '' } as any);
    return { success: true };
  },

  // --- Follow/Unfollow ---

  /**
   * Follow a user
   */
  followUser: async (userId: string): Promise<{ success: boolean }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await dbUsersService.follow(user.id, userId);
    if (error) throw error;
    return { success: true };
  },

  /**
   * Unfollow a user
   */
  unfollowUser: async (userId: string): Promise<{ success: boolean }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await dbUsersService.unfollow(user.id, userId);
    if (error) throw error;
    return { success: true };
  },

  /**
   * Get followers list
   */
  getFollowers: async (
    userId: string,
    params?: { page?: number; pageSize?: number },
  ): Promise<{ followers: FollowUser[]; total: number }> => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    // Get followers from DB
    const { data, count, error } = await dbUsersService.getFollowers(userId);

    if (error) throw error;

    // If authenticated, fetch my relationships to check status
    let myFollowingIds: Set<string> = new Set();
    let myFollowerIds: Set<string> = new Set();

    if (currentUser) {
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUser.id);
      
      const { data: followers } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', currentUser.id);

      if (following) following.forEach((f: any) => myFollowingIds.add(f.following_id));
      if (followers) followers.forEach((f: any) => myFollowerIds.add(f.follower_id));
    }

    const allFollowers = (data || []).map((follower: any) => ({
      id: follower.id,
      name: follower.full_name || follower.name || 'Unknown',
      username: follower.email ? follower.email.split('@')[0] : '',
      avatar: follower.avatar_url || follower.avatar || '',
      isVerified: follower.verified || false,
      isFollowing: myFollowingIds.has(follower.id),
      isFollowedBy: myFollowerIds.has(follower.id),
    }));

    // Manual pagination since db service returns all
    const start = (params?.page || 0) * (params?.pageSize || 10);
    const end = start + (params?.pageSize || 10);
    const paginatedFollowers = allFollowers.slice(start, end);

    return { followers: paginatedFollowers, total: count || 0 };
  },

  /**
   * Get following list
   */
  getFollowing: async (
    userId: string,
    params?: { page?: number; pageSize?: number },
  ): Promise<{ following: FollowUser[]; total: number }> => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    const { data, count, error } = await dbUsersService.getFollowing(userId);

    if (error) throw error;

    // If authenticated, fetch my relationships to check status
    let myFollowingIds: Set<string> = new Set();
    let myFollowerIds: Set<string> = new Set();

    if (currentUser) {
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUser.id);
      
      const { data: followers } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', currentUser.id);

      if (following) following.forEach((f: any) => myFollowingIds.add(f.following_id));
      if (followers) followers.forEach((f: any) => myFollowerIds.add(f.follower_id));
    }

    const allFollowing = (data || []).map((followingUser: any) => ({
      id: followingUser.id,
      name: followingUser.full_name || followingUser.name || 'Unknown',
      username: followingUser.email ? followingUser.email.split('@')[0] : '',
      avatar: followingUser.avatar_url || followingUser.avatar || '',
      isVerified: followingUser.verified || false,
      isFollowing: myFollowingIds.has(followingUser.id),
      isFollowedBy: myFollowerIds.has(followingUser.id),
    }));

    // Manual pagination
    const start = (params?.page || 0) * (params?.pageSize || 10);
    const end = start + (params?.pageSize || 10);
    const paginatedFollowing = allFollowing.slice(start, end);

    return { following: paginatedFollowing, total: count || 0 };
  },

  /**
   * Remove a follower
   */
  removeFollower: async (userId: string): Promise<{ success: boolean }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await dbUsersService.unfollow(userId, user.id);
    
    if (error) throw error;
    return { success: true };
  },

  // --- Preferences ---

  /**
   * Get user preferences
   */
  getPreferences: async (): Promise<{ preferences: UserPreferences }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: userData, error } = await dbUsersService.getById(user.id);
    if (error) throw error;
    if (!userData) throw new Error('User not found');

    const notifPrefs = userData.notification_preferences as any || {};
    const privacySettings = userData.privacy_settings as any || {};

    const preferences: UserPreferences = {
      emailNotifications: notifPrefs.email ?? true,
      pushNotifications: notifPrefs.push ?? true,
      marketingEmails: notifPrefs.marketing ?? false,
      
      showLocation: privacySettings.showLocation ?? true,
      showLastActive: privacySettings.showLastSeen ?? true,
      allowMessages: privacySettings.allowMessages ?? 'everyone',

      language: (userData.languages && userData.languages[0]) || 'en',
      currency: userData.currency || 'USD',
      timezone: privacySettings.timezone || 'UTC',

      autoAcceptRequests: privacySettings.autoAcceptRequests ?? false,
      instantBooking: privacySettings.instantBooking ?? false,
    };

    return { preferences };
  },

  /**
   * Update user preferences
   */
  updatePreferences: async (
    data: Partial<UserPreferences>,
  ): Promise<{ preferences: UserPreferences }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Fetch current to merge
    const { data: currentUser } = await dbUsersService.getById(user.id);
    const currentNotif = currentUser?.notification_preferences as any || {};
    const currentPrivacy = currentUser?.privacy_settings as any || {};

    const updates: any = {};

    if (data.emailNotifications !== undefined) currentNotif.email = data.emailNotifications;
    if (data.pushNotifications !== undefined) currentNotif.push = data.pushNotifications;
    if (data.marketingEmails !== undefined) currentNotif.marketing = data.marketingEmails;
    
    if (Object.keys(currentNotif).length > 0) updates.notification_preferences = currentNotif;

    if (data.showLocation !== undefined) currentPrivacy.showLocation = data.showLocation;
    if (data.showLastActive !== undefined) currentPrivacy.showLastSeen = data.showLastActive;
    if (data.allowMessages !== undefined) currentPrivacy.allowMessages = data.allowMessages;
    if (data.timezone !== undefined) currentPrivacy.timezone = data.timezone;
    if (data.autoAcceptRequests !== undefined) currentPrivacy.autoAcceptRequests = data.autoAcceptRequests;
    if (data.instantBooking !== undefined) currentPrivacy.instantBooking = data.instantBooking;

    if (Object.keys(currentPrivacy).length > 0) updates.privacy_settings = currentPrivacy;

    if (data.currency) updates.currency = data.currency;
    if (data.language) updates.languages = [data.language];

    const { data: updatedUser, error } = await dbUsersService.update(user.id, updates);
    if (error) throw error;

    const newNotif = updatedUser?.notification_preferences as any || {};
    const newPrivacy = updatedUser?.privacy_settings as any || {};

    const preferences: UserPreferences = {
      emailNotifications: newNotif.email ?? true,
      pushNotifications: newNotif.push ?? true,
      marketingEmails: newNotif.marketing ?? false,
      
      showLocation: newPrivacy.showLocation ?? true,
      showLastActive: newPrivacy.showLastSeen ?? true,
      allowMessages: newPrivacy.allowMessages ?? 'everyone',

      language: (updatedUser?.languages && updatedUser.languages[0]) || 'en',
      currency: updatedUser?.currency || 'USD',
      timezone: newPrivacy.timezone || 'UTC',

      autoAcceptRequests: newPrivacy.autoAcceptRequests ?? false,
      instantBooking: newPrivacy.instantBooking ?? false,
    };

    return { preferences };
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await dbUsersService.update(user.id, { deleted_at: new Date().toISOString() } as any);
    if (error) throw error;
    
    await supabase.auth.signOut();
    return { success: true };
  },

  /**
   * Delete account permanently
   */
  deleteAccount: async (password: string): Promise<{ success: boolean }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Soft delete for now
    const { error } = await dbUsersService.update(user.id, { deleted_at: new Date().toISOString() } as any);
    if (error) throw error;

    await supabase.auth.signOut();
    return { success: true };
  },

  /**
   * Export user data (GDPR)
   */
  exportData: async (): Promise<{ downloadUrl: string }> => {
    // TODO: Implement real data export via Supabase Edge Function
    throw new Error('Data export is not yet implemented.');
  },

  // --- Search ---

  /**
   * Search users
   */
  searchUsers: async (
    query: string,
    params?: { page?: number; pageSize?: number },
  ): Promise<{ users: UserProfile[]; total: number }> => {
    const { data, count, error } = await dbUsersService.search(query, params?.pageSize || 10);
    if (error) throw error;

    const users = (data || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.full_name || u.name || 'Unknown',
      username: u.email ? u.email.split('@')[0] : '',
      avatar: u.avatar_url || u.avatar || '',
      languages: u.languages || [],
      interests: u.interests || [],
      isVerified: u.verified || false,
      kycStatus: u.kyc_status || 'unverified',
      rating: u.rating || 0,
      reviewCount: u.review_count || 0,
      momentCount: 0,
      followerCount: 0,
      followingCount: 0,
      giftsSent: 0,
      giftsReceived: 0,
      createdAt: u.created_at,
      lastActiveAt: u.last_seen_at || u.updated_at,
    }));

    return { users, total: count || 0 };
  },

  /**
   * Get suggested users to follow
   */
  getSuggestedUsers: async (
    limit?: number,
  ): Promise<{ users: UserProfile[] }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { users: [] };

    const { data, error } = await dbUsersService.getSuggested(user.id, limit || 5);
    if (error) throw error;

    const users = (data || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.full_name || u.name || 'Unknown',
      username: u.email ? u.email.split('@')[0] : '',
      avatar: u.avatar_url || u.avatar || '',
      languages: u.languages || [],
      interests: u.interests || [],
      isVerified: u.verified || false,
      kycStatus: u.kyc_status || 'unverified',
      rating: u.rating || 0,
      reviewCount: u.review_count || 0,
      momentCount: 0,
      followerCount: 0,
      followingCount: 0,
      giftsSent: 0,
      giftsReceived: 0,
      createdAt: u.created_at,
      lastActiveAt: u.last_seen_at || u.updated_at,
    }));

    return { users };
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
