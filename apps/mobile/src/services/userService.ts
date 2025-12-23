/**
 * User Service
 * User profile, preferences, and account operations
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
  allowMessages: 'everyone' | 'none';

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

// GDPR Export Data Types
export interface UserDataExport {
  exportDate: string;
  userId: string;
  profile: {
    email: string;
    name: string;
    username: string;
    bio?: string;
    location?: Record<string, string>;
    languages: string[];
    interests: string[];
    created_at: string;
  };
  moments: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    created_at: string;
  }>;
  transactions: Array<{
    id: string;
    amount: number;
    currency: string;
    type: string;
    created_at: string;
  }>;
  messages: Array<{
    id: string;
    content: string;
    created_at: string;
  }>;
  metadata: {
    profileCount: number;
    momentsCount: number;
    transactionsCount: number;
    messagesCount: number;
  };
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
    // Note: Using only columns that exist in the database schema
    const { data: profile, error } = await supabase
      .from('users')
      .select(
        `
        id,
        full_name,
        email,
        avatar_url,
        bio,
        location,
        verified,
        rating,
        review_count,
        languages,
        interests,
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
    // Note: Using only columns that exist in the database schema
    const { data: profile, error } = await supabase
      .from('users')
      .select(
        `
        id,
        full_name,
        avatar_url,
        bio,
        location,
        verified,
        rating,
        review_count,
        languages,
        interests,
        created_at
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
   * Get user profile by email (username not available in schema)
   * @deprecated Use getUserById instead
   */
  getUserByUsername: async (
    username: string,
  ): Promise<{ user: UserProfile }> => {
    // Note: username column doesn't exist in users table
    // This function attempts to find by email instead
    // SECURITY: Only select public profile fields
    const { data: profile, error } = await supabase
      .from('users')
      .select(
        `
        id,
        email,
        full_name,
        avatar_url,
        bio,
        location,
        verified,
        rating,
        review_count,
        created_at,
        languages,
        interests
      `,
      )
      .eq('email', username)
      .single();

    if (error) {
      logger.error(`Error fetching user by email ${username}:`, error);
      throw error;
    }

    return { user: profile as unknown as UserProfile };
  },

  /**
   * Check if email is available (username column doesn't exist)
   * @deprecated Use email-based check instead
   */
  checkUsernameAvailability: async (username: string): Promise<boolean> => {
    // Note: username column doesn't exist, checking email instead
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', username)
      .maybeSingle();

    if (error) {
      logger.error(`Error checking email availability:`, error);
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
    if (!user) {
      logger.error('updateProfile: Not authenticated - no user');
      throw new Error('Not authenticated');
    }

    logger.info('updateProfile: Updating user', user.id, 'with data:', data);

    const { data: profile, error } = await supabase
      .from('users')
      .update(data as Database['public']['Tables']['users']['Update'])
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      logger.error('updateProfile: Error updating profile:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }

    logger.info('updateProfile: Success, updated profile:', profile?.id);
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
    const updatePayload: UpdateProfilePayload = { avatar_url: url };
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
    const updatePayload: UpdateProfilePayload = { avatar_url: '' };
    await userService.updateProfile(updatePayload);
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
  exportData: async (): Promise<{
    data: UserDataExport | null;
    error: Error | null;
  }> => {
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
        username: u.email?.split('@')[0] ?? '',
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
        username: u.email?.split('@')[0] ?? '',
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
