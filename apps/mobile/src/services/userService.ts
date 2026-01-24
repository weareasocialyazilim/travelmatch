/**
 * User Service
 * User profile, follow/unfollow, preferences, and account operations
 */

import { supabase } from '../config/supabase';
import { COLORS } from '../constants/colors';
import { logger } from '../utils/logger';
import { encryptionService } from './encryptionService';
import { usersService as dbUsersService } from './supabaseDbService';
import { analytics } from './analytics';
import type { Database } from '../types/database.types';
import { uploadFile } from './supabaseStorageService';
import { isNotNull } from '../types/guards';
import type {
  DbUser as UserRow,
  UpdateProfilePayload,
  NotificationPreferences,
  PrivacySettings,
} from '../types/db';

// Types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
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
  kycStatus: 'not_started' | 'pending' | 'in_review' | 'verified' | 'rejected';

  // Stats
  rating: number;
  reviewCount: number;
  momentCount: number;
  giftsSent: number;
  giftsReceived: number;
  coinsBalance: number;
  pendingBalance: number;

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
  allowMessages: 'everyone' | 'followers' | 'none';

  // Display
  language: string;
  currency: string;
  timezone: string;

  // Features
  autoAcceptRequests: boolean;
  instantRequest: boolean;
}

export interface UpdateProfileData {
  name?: string;
  fullName?: string;
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
  kyc_status:
    | 'not_started'
    | 'pending'
    | 'in_review'
    | 'verified'
    | 'rejected'
    | null;
  rating: number | null;
  review_count: number | null;
  created_at: string | null;
  last_seen_at: string | null;
  updated_at: string | null;
  coins_balance: number | null;
  pending_balance: number | null;
}>;

// User Service
export const userService = {
  /**
   * Initialize and sync E2E encryption keys
   * - Generates keypair if not exists (stored in SecureStore)
   * - Syncs public key to database for other users to encrypt messages
   */
  syncKeys: async (): Promise<{ publicKey: string | null }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { publicKey: null };

      // 1. Ensure local keys exist (generates if not present)
      const keyPair = await encryptionService.initializeKeys();
      const localPublicKey = keyPair.publicKey;

      // 2. Check if remote public key matches local
      const { data: profile } = await supabase
        .from('users')
        .select('public_key')
        .eq('id', user.id)
        .single();

      const remotePublicKey = profile?.public_key;

      // 3. Sync public key to database if different or missing
      if (remotePublicKey !== localPublicKey) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ public_key: localPublicKey })
          .eq('id', user.id);

        if (updateError) {
          logger.error(
            '[User] Failed to sync public key to database',
            updateError,
          );
        } else {
          logger.info('[User] Public key synced to database');
        }
      } else {
        logger.debug('[User] Public key already synced');
      }

      return { publicKey: localPublicKey };
    } catch (error) {
      logger.error('[User] Failed to sync keys', error);
      return { publicKey: null };
    }
  },

  /**
   * Get a user's public key for E2E encryption
   * @param userId - The user ID to get public key for
   */
  getPublicKey: async (userId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('public_key')
        .eq('id', userId)
        .single();

      if (error || !data?.public_key) {
        logger.warn(`[User] No public key found for user ${userId}`);
        return null;
      }

      return data.public_key;
    } catch (error) {
      logger.error('[User] Failed to get public key', error);
      return null;
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
        coins_balance,
        pending_balance,
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

    // Map database fields to UserProfile interface
    const mappedProfile: UserProfile = {
      id: profile.id,
      email: profile.email || '',
      name: profile.full_name || 'User',
      avatar: profile.avatar_url || '',
      bio: profile.bio || undefined,
      location: profile.location
        ? typeof profile.location === 'string'
          ? { city: profile.location, country: '' }
          : (profile.location as { city: string; country: string })
        : undefined,
      languages: (profile.languages as string[]) || [],
      interests: (profile.interests as string[]) || [],
      isVerified: profile.verified || false,
      kycStatus: 'not_started',
      rating: profile.rating || 0,
      reviewCount: profile.review_count || 0,
      momentCount: 0,
      giftsSent: 0,
      giftsReceived: 0,
      coinsBalance: profile.coins_balance || 0,
      pendingBalance: profile.pending_balance || 0,
      createdAt: profile.created_at || '',
      lastActiveAt: profile.updated_at || '',
    };

    return { user: mappedProfile, error: null };
  },

  /**
   * Get user profile by ID
   */
  getUserById: async (userId: string): Promise<{ user: UserProfile }> => {
    // SECURITY: Only select public profile fields
    const { data: profile, error } = await supabase
      .from('public_profiles')
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
        created_at,
        last_seen_at
      `,
      )
      .eq('id', userId)
      .single();

    if (error) {
      logger.error(`Error fetching user ${userId}:`, error);
      throw error;
    }

    // Map database fields to UserProfile interface
    const profileData = profile as Record<string, any>;

    const mappedProfile: UserProfile = {
      id: profileData.id,
      email: '',
      name: profileData.full_name || 'User',
      avatar: profileData.avatar_url || '',
      bio: profileData.bio || undefined,
      location: profileData.location
        ? typeof profileData.location === 'string'
          ? { city: profileData.location, country: '' }
          : (profileData.location as { city: string; country: string })
        : undefined,
      languages: (profileData.languages as string[]) || [],
      interests: (profileData.interests as string[]) || [],
      isVerified: profileData.verified || false,
      kycStatus: 'not_started',
      rating: profileData.rating || 0,
      reviewCount: profileData.review_count || 0,
      momentCount: 0,
      giftsSent: 0,
      giftsReceived: 0,
      coinsBalance: 0,
      pendingBalance: 0,
      createdAt: profileData.created_at || '',
      lastActiveAt: profileData.last_seen_at || '',
    };

    return { user: mappedProfile };
  },

  /**
   * Get user profile by email search
   */
  getUserByEmail: async (email: string): Promise<{ user: UserProfile }> => {
    // SECURITY: Only select public profile fields
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
        interests
      `,
      )
      .ilike('email', `${email}%`)
      .single();

    if (error) {
      logger.error(`Error fetching user by email ${email}:`, error);
      throw error;
    }

    // Map database fields to UserProfile interface
    const mappedProfile: UserProfile = {
      id: profile.id,
      email: '',
      name: profile.full_name || 'User',
      avatar: profile.avatar_url || '',
      bio: profile.bio || undefined,
      location: profile.location
        ? typeof profile.location === 'string'
          ? { city: profile.location, country: '' }
          : (profile.location as { city: string; country: string })
        : undefined,
      languages: (profile.languages as string[]) || [],
      interests: (profile.interests as string[]) || [],
      isVerified: profile.verified || false,
      kycStatus: 'not_started',
      rating: profile.rating || 0,
      reviewCount: profile.review_count || 0,
      momentCount: 0,
      giftsSent: 0,
      giftsReceived: 0,
      coinsBalance: 0,
      pendingBalance: 0,
      createdAt: '',
      lastActiveAt: '',
    };

    return { user: mappedProfile };
  },

  // --- Profile Updates ---

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
    const notifPrefs = (typedUserData.notification_preferences ||
      {}) as NotificationPreferences;
    const privacySettings = (typedUserData.privacy_settings ||
      {}) as PrivacySettings;

    const preferences: UserPreferences = {
      emailNotifications: notifPrefs.email ?? true,
      pushNotifications: notifPrefs.push ?? true,
      marketingEmails: notifPrefs.marketing ?? false,

      showLocation: privacySettings.showLocation ?? true,
      allowMessages: privacySettings.allowMessages ?? 'everyone',

      language: typedUserData.languages?.[0] || 'en',
      currency: typedUserData.currency || 'USD',
      timezone: privacySettings.timezone || 'UTC',

      autoAcceptRequests: privacySettings.autoAcceptRequests ?? false,
      instantRequest: privacySettings.instantRequest ?? false,
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
    const currentNotif = (typedCurrentUser?.notification_preferences ||
      {}) as NotificationPreferences;
    const currentPrivacy = (typedCurrentUser?.privacy_settings ||
      {}) as PrivacySettings;

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
    if (data.allowMessages !== undefined)
      currentPrivacy.allowMessages = data.allowMessages;
    if (data.timezone !== undefined) currentPrivacy.timezone = data.timezone;
    if (data.autoAcceptRequests !== undefined)
      currentPrivacy.autoAcceptRequests = data.autoAcceptRequests;
    if (data.instantRequest !== undefined)
      currentPrivacy.instantRequest = data.instantRequest;

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
    const newNotif = (typedUpdatedUser?.notification_preferences ||
      {}) as NotificationPreferences;
    const newPrivacy = (typedUpdatedUser?.privacy_settings ||
      {}) as PrivacySettings;

    const preferences: UserPreferences = {
      emailNotifications: newNotif.email ?? true,
      pushNotifications: newNotif.push ?? true,
      marketingEmails: newNotif.marketing ?? false,

      showLocation: newPrivacy.showLocation ?? true,
      allowMessages: newPrivacy.allowMessages ?? 'everyone',

      language: typedUpdatedUser?.languages?.[0] || 'en',
      currency: typedUpdatedUser?.currency || 'USD',
      timezone: newPrivacy.timezone || 'UTC',

      autoAcceptRequests: newPrivacy.autoAcceptRequests ?? false,
      instantRequest: newPrivacy.instantRequest ?? false,
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
        avatar: u.avatar_url || u.avatar || '',
        languages: Array.isArray(u.languages) ? u.languages : [],
        interests: Array.isArray(u.interests) ? u.interests : [],
        isVerified: Boolean(u.verified),
        kycStatus:
          (u.kyc_status as
            | 'not_started'
            | 'pending'
            | 'in_review'
            | 'verified'
            | 'rejected') || 'not_started',
        rating: Number(u.rating) || 0,
        reviewCount: Number(u.review_count) || 0,
        momentCount: 0,
        giftsSent: 0,
        giftsReceived: 0,
        coinsBalance: 0,
        pendingBalance: 0,
        createdAt: u.created_at || '',
        lastActiveAt: u.last_seen_at || u.updated_at || '',
      };
    });

    return { users, total: count || 0 };
  },

  /**
   * Get suggested users
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
        avatar: u.avatar_url || u.avatar || '',
        languages: Array.isArray(u.languages) ? u.languages : [],
        interests: Array.isArray(u.interests) ? u.interests : [],
        isVerified: Boolean(u.verified),
        kycStatus:
          (u.kyc_status as
            | 'not_started'
            | 'pending'
            | 'in_review'
            | 'verified'
            | 'rejected') || 'not_started',
        rating: Number(u.rating) || 0,
        reviewCount: Number(u.review_count) || 0,
        momentCount: 0,
        giftsSent: 0,
        giftsReceived: 0,
        coinsBalance: 0,
        pendingBalance: 0,
        createdAt: u.created_at || '',
        lastActiveAt: u.last_seen_at || u.updated_at || '',
      };
    });

    return { users };
  },

  /**
   * Get detailed trust stats from database
   * Single source of truth - never calculate client-side
   */
  getDetailedTrustStats: async (
    userId?: string,
  ): Promise<{
    totalScore: number;
    trustLevel: string;
    levelProgress: number;
    breakdown: {
      payment: { score: number; max: number };
      proof: { score: number; max: number };
      trustNotes: { score: number; max: number };
      kyc: { score: number; max: number };
      social: { score: number; max: number };
    };
    counts: {
      successfulPayments: number;
      verifiedProofs: number;
      trustNotesReceived: number;
    };
    status: {
      hasInstagram: boolean;
      hasTwitter: boolean;
      hasWebsite: boolean;
      kycStatus: string;
    };
  }> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;

    if (!targetUserId) {
      throw new Error('Not authenticated');
    }

    // Call the database function
    const { data, error } = await (
      supabase.rpc as (
        fn: string,
        params: { p_user_id: string },
      ) => ReturnType<typeof supabase.rpc>
    )('get_detailed_trust_stats', {
      p_user_id: targetUserId,
    });

    if (error) {
      logger.error('Error fetching trust stats:', error);
      throw error;
    }

    // Map the database response to our interface
    const stats = Array.isArray(data) ? data[0] : data;

    return {
      totalScore: stats?.total_score ?? 0,
      trustLevel: stats?.trust_level ?? 'Sprout',
      levelProgress: stats?.level_progress ?? 0,
      breakdown: {
        payment: {
          score: stats?.payment_score ?? 0,
          max: stats?.payment_max ?? 30,
        },
        proof: {
          score: stats?.proof_score ?? 0,
          max: stats?.proof_max ?? 30,
        },
        trustNotes: {
          score: stats?.trust_notes_score ?? 0,
          max: stats?.trust_notes_max ?? 15,
        },
        kyc: {
          score: stats?.kyc_score ?? 0,
          max: stats?.kyc_max ?? 15,
        },
        social: {
          score: stats?.social_score ?? 0,
          max: stats?.social_max ?? 10,
        },
      },
      counts: {
        successfulPayments: stats?.successful_payments ?? 0,
        verifiedProofs: stats?.verified_proofs ?? 0,
        trustNotesReceived: stats?.trust_notes_received ?? 0,
      },
      status: {
        hasInstagram: stats?.has_instagram ?? false,
        hasTwitter: stats?.has_twitter ?? false,
        hasWebsite: stats?.has_website ?? false,
        kycStatus: stats?.kyc_status ?? 'not_started',
      },
    };
  },

  /**
   * Delete user account permanently
   * CRITICAL: KVKK/GDPR compliance - permanently removes all user data
   */
  deleteAccount: async (): Promise<{
    success: boolean;
    error: Error | null;
  }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: new Error('Not authenticated') };
      }

      logger.info(
        '[UserService] Initiating account deletion for user:',
        user.id,
      );

      // Call the RPC function for soft delete
      // This will handle cascading deletes/anonymization via DB logic
      const { data, error } = await supabase.rpc('soft_delete_user', {
        p_user_id: user.id,
      });

      if (error) {
        logger.error('[UserService] Account deletion failed:', error);
        return { success: false, error };
      }

      logger.info('[UserService] Account deletion successful:', data);

      // Track deletion before resetting analytics
      await analytics.trackEvent('user_deleted_account');

      // Reset analytics session
      await analytics.reset();

      // Sign out the user after successful deletion
      await supabase.auth.signOut();

      return { success: true, error: null };
    } catch (error) {
      logger.error('[UserService] Account deletion error:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
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
