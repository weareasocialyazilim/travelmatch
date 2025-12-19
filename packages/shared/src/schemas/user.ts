/**
 * User Schemas
 * Validation schemas for user profile operations
 *
 * Note: Auth schemas (login, register, password reset) are in auth.ts
 */

import { z } from 'zod';
import { phoneSchema, coordinatesSchema } from './common';

/**
 * Notification Preferences Schema
 */
export const NotificationPreferencesSchema = z.object({
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
  typeof NotificationPreferencesSchema
>;

/**
 * Privacy Settings Schema
 */
export const PrivacySettingsSchema = z.object({
  profile_visibility: z
    .enum(['public', 'friends', 'private'])
    .default('public'),
  show_online_status: z.boolean().default(true),
  show_last_seen: z.boolean().default(true),
  allow_friend_requests: z.boolean().default(true),
  show_moments_on_profile: z.boolean().default(true),
  show_reviews_on_profile: z.boolean().default(true),
});

export type PrivacySettings = z.infer<typeof PrivacySettingsSchema>;

/**
 * Update profile schema
 */
export const updateProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50)
    .optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  avatar_url: z.string().url().optional(),
  phone: phoneSchema.optional(),
  date_of_birth: z.string().datetime().optional(),
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
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * User Profile Update Schema (extended)
 * Alias for mobile app compatibility
 */
export const UpdateUserProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  full_name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  cover_image: z.string().url().optional().or(z.literal('')),
  location: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal('')),
  notification_preferences: NotificationPreferencesSchema.optional(),
  privacy_settings: PrivacySettingsSchema.optional(),
});

export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileSchema>;

/**
 * User Follow Status
 */
export const UserFollowStatusSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  full_name: z.string().nullable(),
  avatar: z.string().nullable(),
  bio: z.string().nullable(),
  is_following: z.boolean(),
  is_follower: z.boolean(),
  is_friend: z.boolean(),
});

export type UserFollowStatus = z.infer<typeof UserFollowStatusSchema>;
