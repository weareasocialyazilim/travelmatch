/**
 * Database Type Aliases
 *
 * SINGLE SOURCE OF TRUTH for all database-related types.
 * These types are derived from the auto-generated database.types.ts
 *
 * DO NOT create manual interfaces that mirror these database tables.
 * Instead, extend these types if you need frontend-specific fields.
 *
 * @see README.md for the type strategy documentation
 */

import type { Database, Json } from './database.types';

// ============================================
// TABLE TYPE ALIASES
// ============================================

type Tables = Database['public']['Tables'];

// Row types (for reading data)
export type DbUser = Tables['users']['Row'];
export type DbMoment = Tables['moments']['Row'];
export type DbMessage = Tables['messages']['Row'];
export type DbConversation = Tables['conversations']['Row'];
export type DbTransaction = Tables['transactions']['Row'];
export type DbRequest = Tables['requests']['Row'];
export type DbReview = Tables['reviews']['Row'];
export type DbNotification = Tables['notifications']['Row'];
export type DbFavorite = Tables['favorites']['Row'];
export type DbBlock = Tables['blocks']['Row'];
export type DbReport = Tables['reports']['Row'];
export type DbAuditLog = Tables['audit_logs']['Row'];
export type DbConversationParticipant =
  Tables['conversation_participants']['Row'];
export type DbKycVerification = Tables['kyc_verifications']['Row'];
export type DbSubscriptionPlan = Tables['subscription_plans']['Row'];
export type DbUserSubscription = Tables['user_subscriptions']['Row'];

// Note: escrow_transactions table may not exist in all environments
// Uncomment when migration is applied:
// export type DbEscrowTransaction = Tables['escrow_transactions']['Row'];

// Insert types (for creating data)
export type DbUserInsert = Tables['users']['Insert'];
export type DbMomentInsert = Tables['moments']['Insert'];
export type DbMessageInsert = Tables['messages']['Insert'];
export type DbConversationInsert = Tables['conversations']['Insert'];
export type DbTransactionInsert = Tables['transactions']['Insert'];
export type DbRequestInsert = Tables['requests']['Insert'];
export type DbReviewInsert = Tables['reviews']['Insert'];
export type DbNotificationInsert = Tables['notifications']['Insert'];
export type DbFavoriteInsert = Tables['favorites']['Insert'];

// Update types (for modifying data)
export type DbUserUpdate = Tables['users']['Update'];
export type DbMomentUpdate = Tables['moments']['Update'];
export type DbMessageUpdate = Tables['messages']['Update'];
export type DbConversationUpdate = Tables['conversations']['Update'];
export type DbTransactionUpdate = Tables['transactions']['Update'];
export type DbRequestUpdate = Tables['requests']['Update'];

// ============================================
// EXTENDED TYPES (Database + Frontend Fields)
// ============================================

/**
 * User with frontend-specific computed fields
 * Extends DbUser with UI-only properties
 */
export interface User extends DbUser {
  // Computed display fields
  displayName?: string;
  isOnline?: boolean;

  // Legacy field mappings (for backward compatibility)
  name?: string; // Maps to full_name
  avatar?: string; // Maps to avatar_url
  avatarUrl?: string; // Alias for avatar_url
  photoUrl?: string; // Alias for avatar_url

  // Frontend-only state
  trustScore?: number;
  isVerified?: boolean; // Computed from verified
}

/**
 * Moment with frontend-specific fields
 */
export interface Moment extends DbMoment {
  // Host info (joined from users table)
  host?: Pick<
    DbUser,
    'id' | 'full_name' | 'avatar_url' | 'rating' | 'review_count' | 'verified'
  >;
  hostId?: string; // Alias for user_id
  hostName?: string;
  hostAvatar?: string;
  hostRating?: number;
  hostReviewCount?: number;

  // Computed fields
  imageUrl?: string; // First image from images[]
  image?: string; // Alias for imageUrl
  pricePerGuest?: number; // Alias for price
  distance?: string; // Computed from coordinates

  // UI state
  isSaved?: boolean;
  saves?: number;
  requestCount?: number;
}

/**
 * Message with frontend-specific fields
 */
export interface Message extends DbMessage {
  // UI state
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  isMine?: boolean;

  // Parsed location from metadata
  location?: {
    lat: number;
    lng: number;
    name?: string;
  };

  // Image URL from metadata
  imageUrl?: string;
}

/**
 * Conversation with joined participant data
 */
export interface Conversation extends DbConversation {
  // Participant info (joined)
  participantId?: string;
  participantName?: string;
  participantAvatar?: string;
  participantVerified?: boolean;

  // Last message info
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;

  // Related moment
  momentTitle?: string;
}

/**
 * Transaction with frontend display fields
 */
export interface Transaction extends DbTransaction {
  // UI display fields
  title?: string;
  transactionId?: string;
  date?: string;

  // Participant info
  giver?: {
    id: string;
    name: string;
    avatar: string;
  };
  receiver?: {
    id: string;
    name: string;
    avatar: string;
  };
}

/**
 * Request with joined moment and user data
 */
export interface Request extends DbRequest {
  // Joined data
  moment?: Pick<DbMoment, 'id' | 'title' | 'images' | 'location' | 'date'>;
  user?: Pick<DbUser, 'id' | 'full_name' | 'avatar_url' | 'verified'>;
}

/**
 * Notification with typed data payload
 */
export type Notification = DbNotification;

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Extract table names from Database
 */
export type TableName = keyof Tables;

/**
 * Get Row type for a table
 */
export type TableRow<T extends TableName> = Tables[T]['Row'];

/**
 * Get Insert type for a table
 */
export type TableInsert<T extends TableName> = Tables[T]['Insert'];

/**
 * Get Update type for a table
 */
export type TableUpdate<T extends TableName> = Tables[T]['Update'];

// Re-export Json type for convenience
export type { Json };

// ============================================
// JSONB FIELD TYPES
// ============================================

/**
 * Notification preferences JSONB type
 * Used in users.notification_preferences
 */
export interface NotificationPreferences {
  email?: boolean;
  push?: boolean;
  marketing?: boolean;
  [key: string]: boolean | undefined;
}

/**
 * Privacy settings JSONB type
 * Used in users.privacy_settings
 */
export interface PrivacySettings {
  showLocation?: boolean;
  showLastSeen?: boolean;
  allowMessages?: 'everyone' | 'followers' | 'none';
  timezone?: string;
  autoAcceptRequests?: boolean;
  instantBooking?: boolean;
  [key: string]: string | boolean | undefined;
}

/**
 * Profile update payload
 * Used for userService.updateProfile()
 */
export interface UpdateProfilePayload {
  avatar?: string;
  coverImage?: string;
  cover_image?: string;
  full_name?: string;
  bio?: string;
  location?: unknown;
  languages?: string[];
  interests?: string[];
  instagram?: string;
  twitter?: string;
  notification_preferences?: NotificationPreferences;
  privacy_settings?: PrivacySettings;
}

// ============================================
// TYPE GUARDS
// ============================================

export function isDbUser(obj: unknown): obj is DbUser {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj &&
    'full_name' in obj
  );
}

export function isDbMoment(obj: unknown): obj is DbMoment {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'title' in obj &&
    'user_id' in obj &&
    'category' in obj
  );
}

export function isDbMessage(obj: unknown): obj is DbMessage {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'conversation_id' in obj &&
    'sender_id' in obj &&
    'content' in obj
  );
}
