/**
 * User Schemas
 * Validation schemas for user profile operations
 *
 * Note: Auth schemas (login, register, password reset) are in auth.ts
 */

import { z } from 'zod';
import { phoneSchema, coordinatesSchema } from './common';

// =============================================================================
// SETTINGS SCHEMAS
// =============================================================================

/**
 * Notification Preferences Schema
 */
export const notificationPreferencesSchema = z.object({
  push_enabled: z.boolean().default(true),
  email_enabled: z.boolean().default(true),
  message_notifications: z.boolean().default(true),
  request_notifications: z.boolean().default(true),
  review_notifications: z.boolean().default(true),
  marketing_notifications: z.boolean().default(false),
  moment_updates: z.boolean().default(true),
  payment_notifications: z.boolean().default(true),
});

export type NotificationPreferences = z.infer<
  typeof notificationPreferencesSchema
>;

/**
 * Privacy Settings Schema
 */
export const privacySettingsSchema = z.object({
  profile_visibility: z
    .enum(['public', 'friends', 'private'])
    .default('public'),
  show_online_status: z.boolean().default(true),
  show_last_seen: z.boolean().default(true),
  allow_friend_requests: z.boolean().default(true),
  show_moments_on_profile: z.boolean().default(true),
  show_reviews_on_profile: z.boolean().default(true),
});

export type PrivacySettings = z.infer<typeof privacySettingsSchema>;

// =============================================================================
// PROFILE SCHEMAS
// =============================================================================

/**
 * Update profile schema (extended with settings)
 */
export const updateProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100)
    .optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  avatar_url: z.string().url().optional(), // Legacy field
  cover_image: z.string().url().optional().or(z.literal('')),
  phone: phoneSchema.optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .optional(),
  languages: z.array(z.string()).optional(),
  interests: z
    .array(z.string())
    .max(10, 'Maximum 10 interests allowed')
    .optional(),
  location: coordinatesSchema
    .extend({
      city: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  website: z.string().url().optional().or(z.literal('')),
  notification_preferences: notificationPreferencesSchema.optional(),
  privacy_settings: privacySettingsSchema.optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * User Follow Status Schema
 */
export const userFollowStatusSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().nullable(),
  avatar: z.string().nullable(),
  bio: z.string().nullable(),
  is_following: z.boolean(),
  is_follower: z.boolean(),
  is_friend: z.boolean(),
});

export type UserFollowStatus = z.infer<typeof userFollowStatusSchema>;

// =============================================================================
// LEGACY EXPORTS (for backward compatibility with mobile)
// =============================================================================

/** @deprecated Use notificationPreferencesSchema */
export const NotificationPreferencesSchema = notificationPreferencesSchema;
/** @deprecated Use privacySettingsSchema */
export const PrivacySettingsSchema = privacySettingsSchema;
/** @deprecated Use updateProfileSchema */
export const UpdateUserProfileSchema = updateProfileSchema;
/** @deprecated Use updateProfileSchema */
export type UpdateUserProfileInput = UpdateProfileInput;
/** @deprecated Use userFollowStatusSchema */
export const UserFollowStatusSchema = userFollowStatusSchema;
