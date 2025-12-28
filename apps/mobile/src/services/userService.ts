/**
 * User Service
 * User profile, follow/unfollow, preferences, and account operations
 */

import { supabase } from '../config/supabase';
import { COLORS } from '../constants/colors';
import { logger } from '../utils/logger';
import { encryptionService } from './encryptionService';
import { usersService as dbUsersService } from './supabaseDbService';
import type { Database } from '../types/database.types';
import { uploadFile } from './supabaseStorageService';
import { isNotNull } from '../types/guards';
import type {
  UserRow,
  UpdateProfilePayload,
  NotificationPreferences,
  PrivacySettings,
} from '../types/database-manual.types';

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
  fullName?: string;
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

// Lightweight DB user shape used for mapping - includes snake_case fields returned from PostgREST
type DBUserRowLike = Partial<{
  id: string;
  email: string | null;
  full_name: string | null;
  name: string | null;
  avatar_url: string | null;
  avatar: string | null;
  languages: string[] | null;
  interests: string[] | null;
  verified: boolean | null;
  kyc_status: 'unverified' | 'pending' | 'verified' | 'rejected' | null;
  rating: number | null;
  review_count: number | null;
  created_at: string | null;
  last_seen_at: string | null;
  updated_at: string | null;
  public_key: string | null;
}>;

// User Service
export const userService = {
  /**
   * Initialize and sync encryption keys
   */
  syncKeys: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Ensure local keys exist
      const keys = await encryptionService.initializeKeys();

      // 2. Check remote key
      const { data: profile } = await dbUsersService.getById(user.id);

      // Upload public key if not already set
      const typedProfile = profile as DBUserRowLike | null;
      if (typedProfile && !typedProfile.public_key) {
        logger.info('[User] Uploading public key');
        await dbUsersService.update(user.id, {
          public_key: keys.publicKey,
        } as Database['public']['Tables']['users']['Update']);
      }
    } catch (error) {
      logger.error('[User] Failed to sync keys', error);
    }
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<{
    user: UserProfile | null;
    error: Error | null;
  }> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // SECURITY: Only select public profile fields - never expose sensitive data like balance, kyc_status
    const { data: profile, error } = await supabase
      .from('users')
      .select(
        `
        id,
        username,
        full_name,
        email,
        avatar_url,
        bio,
        location,
        verified,
        rating,
        review_count,
        joined_at,
        languages,
        interests,
        instagram,
        twitter,
        website,
        public_key,
        notification_preferences,
        created_at,
        updated_at
      `,
      )
      .eq('id', user.id)
      .single();

    if (error) {
      logger.error('Error fetching current user profile:', error);
      throw error;
    }

    return { user: profile as unknown as UserProfile, error: null };
  },

  /**
   * Get user profile by ID
   */
  getUserById: async (userId: string): Promise<{ user: UserProfile }> => {
    // SECURITY: Only select public profile fields
    const { data: profile, error } = await supabase
      .from('users')
      .select(
        `
        id,
        username,
        full_name,
        avatar_url,
        bio,
        location,
        verified,
        rating,
        review_count,
        joined_at,
        languages,
        interests,
        instagram,
        twitter,
        website
      `,
      )
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
    // SECURITY: Only select public profile fields
    const { data: profile, error } = await supabase
      .from('users')
      .select(
        `
        id,
        username,
        full_name,
        avatar_url,
        bio,
        location,
        verified,
        rating,
        review_count,
        joined_at,
        languages,
        interests,
        instagram,
        twitter,
        website
      `,
      )
      .eq('username', username)
      .single();

    if (error) {
      logger.error(`Error fetching user by username ${username}:`, error);
      throw error;
    }

    return { user: profile as unknown as UserProfile };
  },

  /**
   * Check if username is available
   */
  checkUsernameAvailability: async (username: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      logger.error(`Error checking username availability:`, error);
      return false;
    }

    return data === null;
  },

  /**
   * Update current user profile
   */
  updateProfile: async (
    data: UpdateProfileData | UpdateProfilePayload,
  ): Promise<{ user: UserProfile }> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile, error } = await supabase
      .from('users')
      .update(data as Database['public']['Tables']['users']['Update'])
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { url, error } = await uploadFile('avatars', imageUri, user.id);
    if (error) throw error;
    if (!url) throw new Error('Upload failed');

    // Update user profile
    const updatePayload: UpdateProfilePayload = { avatar: url };
    await userService.updateProfile(updatePayload);

    return { avatarUrl: url };
  },

  /**
   * Update cover image
   */
  updateCoverImage: async (imageUri: string): Promise<{ coverUrl: string }> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Assuming 'avatars' bucket is used for covers too, or create 'covers' bucket
    // Using 'avatars' for now as per storage service buckets
    const { url, error } = await uploadFile('avatars', imageUri, user.id);
    if (error) throw error;
    if (!url) throw new Error('Upload failed');

    const updatePayload: UpdateProfilePayload = { cover_image: url };
    await userService.updateProfile(updatePayload);

    return { coverUrl: url };
  },

  /**
   * Delete avatar
   */
  deleteAvatar: async (): Promise<{ success: boolean }> => {
    // Just set avatar to default or null
    const updatePayload: UpdateProfilePayload = { avatar: '' };
    await userService.updateProfile(updatePayload);
    return { success: true };
  },

  // --- Follow/Unfollow ---

  /**
   * Follow a user
   */
  followUser: async (userId: string): Promise<{ success: boolean }> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await dbUsersService.follow(user.id, userId);
    if (error) throw error;
    return { success: true };
  },

  /**
   * Unfollow a user
   */
  unfollowUser: async (userId: string): Promise<{ success: boolean }> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
    const {
      data: { user: _currentUser },
    } = await supabase.auth.getUser();

    // Get followers from DB
    const { data, count, error } = await dbUsersService.getFollowers(userId);

    if (error) throw error;

    // NOTE: Follow system not implemented - platform does not have social follow features
    // Returning empty relationships for backward compatibility
    const myFollowingIds: Set<string> = new Set();
    const myFollowerIds: Set<string> = new Set();

    const allFollowers = ((data as unknown as UserRow[]) || []).map(
      (follower) => ({
        id: follower.id,
        name: follower.full_name || follower.name || 'Unknown',
        username: follower.email ? follower.email.split('@')[0] : '',
        avatar: follower.avatar_url || follower.avatar || '',
        isVerified: follower.verified || false,
        isFollowing: myFollowingIds.has(follower.id),
        isFollowedBy: myFollowerIds.has(follower.id),
      }),
    );

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
    const {
      data: { user: _currentUser },
    } = await supabase.auth.getUser();

    const { data, count, error } = await dbUsersService.getFollowing(userId);

    if (error) throw error;

    // NOTE: Follow system not implemented - platform does not have social follow features
    // Returning empty relationships for backward compatibility
    const myFollowingIds: Set<string> = new Set();
    const myFollowerIds: Set<string> = new Set();

    const allFollowing = ((data as unknown as UserRow[]) || []).map(
      (followingUser) => ({
        id: followingUser.id,
        name: followingUser.full_name || followingUser.name || 'Unknown',
        username: followingUser.email ? followingUser.email.split('@')[0] : '',
        avatar: followingUser.avatar_url || followingUser.avatar || '',
        isVerified: followingUser.verified || false,
        isFollowing: myFollowingIds.has(followingUser.id),
        isFollowedBy: myFollowerIds.has(followingUser.id),
      }),
    );

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
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: userData, error } = await dbUsersService.getById(user.id);
    if (error) throw error;
    if (!userData) throw new Error('User not found');

    const typedUserData = userData as UserRow;
    const notifPrefs: NotificationPreferences =
      typedUserData.notification_preferences || {};
    const privacySettings: PrivacySettings =
      typedUserData.privacy_settings || {};

    const preferences: UserPreferences = {
      emailNotifications: notifPrefs.email ?? true,
      pushNotifications: notifPrefs.push ?? true,
      marketingEmails: notifPrefs.marketing ?? false,

      showLocation: privacySettings.showLocation ?? true,
      showLastActive: privacySettings.showLastSeen ?? true,
      allowMessages: privacySettings.allowMessages ?? 'everyone',

      language: typedUserData.languages?.[0] || 'en',
      currency: typedUserData.currency || 'USD',
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Fetch current to merge
    const { data: currentUser } = await dbUsersService.getById(user.id);
    const typedCurrentUser = currentUser as UserRow | null;
    const currentNotif: NotificationPreferences =
      typedCurrentUser?.notification_preferences || {};
    const currentPrivacy: PrivacySettings =
      typedCurrentUser?.privacy_settings || {};

    const updates: Partial<UserRow> = {};

    if (data.emailNotifications !== undefined)
      currentNotif.email = data.emailNotifications;
    if (data.pushNotifications !== undefined)
      currentNotif.push = data.pushNotifications;
    if (data.marketingEmails !== undefined)
      currentNotif.marketing = data.marketingEmails;

    if (Object.keys(currentNotif).length > 0)
      updates.notification_preferences = currentNotif;

    if (data.showLocation !== undefined)
      currentPrivacy.showLocation = data.showLocation;
    if (data.showLastActive !== undefined)
      currentPrivacy.showLastSeen = data.showLastActive;
    if (data.allowMessages !== undefined)
      currentPrivacy.allowMessages = data.allowMessages;
    if (data.timezone !== undefined) currentPrivacy.timezone = data.timezone;
    if (data.autoAcceptRequests !== undefined)
      currentPrivacy.autoAcceptRequests = data.autoAcceptRequests;
    if (data.instantBooking !== undefined)
      currentPrivacy.instantBooking = data.instantBooking;

    if (Object.keys(currentPrivacy).length > 0)
      updates.privacy_settings = currentPrivacy;

    if (data.currency) updates.currency = data.currency;
    if (data.language) updates.languages = [data.language];

    const { data: updatedUser, error } = await dbUsersService.update(
      user.id,
      updates as Database['public']['Tables']['users']['Update'],
    );
    if (error) throw error;

    const typedUpdatedUser = updatedUser as UserRow | null;
    const newNotif: NotificationPreferences =
      typedUpdatedUser?.notification_preferences || {};
    const newPrivacy: PrivacySettings =
      typedUpdatedUser?.privacy_settings || {};

    const preferences: UserPreferences = {
      emailNotifications: newNotif.email ?? true,
      pushNotifications: newNotif.push ?? true,
      marketingEmails: newNotif.marketing ?? false,

      showLocation: newPrivacy.showLocation ?? true,
      showLastActive: newPrivacy.showLastSeen ?? true,
      allowMessages: newPrivacy.allowMessages ?? 'everyone',

      language: typedUpdatedUser?.languages?.[0] || 'en',
      currency: typedUpdatedUser?.currency || 'USD',
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
    const { error } = await supabase.auth.updateUser({
      password: data.newPassword,
    });
    if (error) throw error;
    return { success: true };
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (
    email: string,
  ): Promise<{ success: boolean }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return { success: true };
  },

  /**
   * Verify email - not directly supported in Supabase, handled via magic links
   */
  verifyEmail: async (_token: string): Promise<{ success: boolean }> => {
    // Supabase handles email verification automatically
    return { success: true };
  },

  /**
   * Resend verification email
   */
  resendVerificationEmail: async (): Promise<{ success: boolean }> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) throw new Error('No user email found');
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
    });
    if (error) throw error;
    return { success: true };
  },

  /**
   * Deactivate account
   */
  deactivateAccount: async (
    _password: string,
  ): Promise<{ success: boolean }> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await dbUsersService.update(user.id, {
      deleted_at: new Date().toISOString(),
    } as Database['public']['Tables']['users']['Update']);
    if (error) throw error;

    await supabase.auth.signOut();
    return { success: true };
  },

  /**
   * Delete account permanently
   */
  deleteAccount: async (_password: string): Promise<{ success: boolean }> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Soft delete for now
    const { error: delError } = await dbUsersService.update(user.id, {
      deleted_at: new Date().toISOString(),
    } as Database['public']['Tables']['users']['Update']);
    if (delError) throw delError;

    await supabase.auth.signOut();
    return { success: true };
  },

  /**
   * Export user data (GDPR Article 20 - Right to Data Portability)
   * Calls Supabase Edge Function to generate comprehensive data export
   */
  exportData: async (): Promise<{ data: any; error: Error | null }> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('User not authenticated');
      }

      // Call the GDPR data export edge function
      const { data, error } = await supabase.functions.invoke(
        'export-user-data',
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (error) {
        logger.error('[UserService] GDPR export failed', { error });
        throw error;
      }

      logger.info('[UserService] GDPR data export successful', {
        userId: session.user.id,
        exportDate: data.exportDate,
        itemCounts: data.metadata,
      });

      return { data, error: null };
    } catch (error) {
      logger.error('[UserService] GDPR export exception', { error });
      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  // --- Search ---

  /**
   * Search users
   */
  searchUsers: async (
    query: string,
    params?: { page?: number; pageSize?: number },
  ): Promise<{ users: UserProfile[]; total: number }> => {
    const { data, count, error } = await dbUsersService.search(
      query,
      params?.pageSize || 10,
    );
    if (error) throw error;

    const users = (data || []).filter(isNotNull).map((user) => {
      const u = user as DBUserRowLike;
      return {
        id: u.id || '',
        email: u.email || '',
        name: u.full_name || u.name || 'Unknown',
        username: u.email ? u.email.split('@')[0] : '',
        avatar: u.avatar_url || u.avatar || '',
        languages: Array.isArray(u.languages) ? u.languages : [],
        interests: Array.isArray(u.interests) ? u.interests : [],
        isVerified: Boolean(u.verified),
        kycStatus:
          (u.kyc_status as
            | 'unverified'
            | 'pending'
            | 'verified'
            | 'rejected') || 'unverified',
        rating: Number(u.rating) || 0,
        reviewCount: Number(u.review_count) || 0,
        momentCount: 0,
        followerCount: 0,
        followingCount: 0,
        giftsSent: 0,
        giftsReceived: 0,
        createdAt: u.created_at || '',
        lastActiveAt: u.last_seen_at || u.updated_at || '',
      };
    });

    return { users, total: count || 0 };
  },

  /**
   * Get suggested users to follow
   */
  getSuggestedUsers: async (
    limit?: number,
  ): Promise<{ users: UserProfile[] }> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { users: [] };

    const { data, error } = await dbUsersService.getSuggested(
      user.id,
      limit || 5,
    );
    if (error) throw error;

    const users = (data || []).filter(isNotNull).map((user) => {
      const u = user as DBUserRowLike;
      return {
        id: u.id || '',
        email: u.email || '',
        name: u.full_name || u.name || 'Unknown',
        username: u.email ? u.email.split('@')[0] : '',
        avatar: u.avatar_url || u.avatar || '',
        languages: Array.isArray(u.languages) ? u.languages : [],
        interests: Array.isArray(u.interests) ? u.interests : [],
        isVerified: Boolean(u.verified),
        kycStatus:
          (u.kyc_status as
            | 'unverified'
            | 'pending'
            | 'verified'
            | 'rejected') || 'unverified',
        rating: Number(u.rating) || 0,
        reviewCount: Number(u.review_count) || 0,
        momentCount: 0,
        followerCount: 0,
        followingCount: 0,
        giftsSent: 0,
        giftsReceived: 0,
        createdAt: u.created_at || '',
        lastActiveAt: u.last_seen_at || u.updated_at || '',
      };
    });

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
        color: COLORS.trust.primary,
        label: 'Verified',
      };
    case 'pending':
      return {
        icon: 'time',
        color: COLORS.feedback.warning,
        label: 'Verification Pending',
      };
    case 'rejected':
      return {
        icon: 'close-circle',
        color: COLORS.feedback.error,
        label: 'Verification Failed',
      };
    default:
      return null;
  }
};

export default userService;
