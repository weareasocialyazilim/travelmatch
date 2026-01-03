/**
 * @deprecated Import from '@travelmatch/shared' instead.
 *
 * Migration Guide:
 * ================
 *
 * BEFORE:
 * ```tsx
 * import { NotificationPreferencesSchema, UpdateUserProfileSchema } from '@/schemas/user.schema';
 * ```
 *
 * AFTER:
 * ```tsx
 * import { notificationPreferencesSchema, updateProfileSchema } from '@travelmatch/shared';
 * ```
 *
 * This file re-exports for backward compatibility.
 */

export {
  // Settings Schemas
  notificationPreferencesSchema,
  privacySettingsSchema,
  // Profile Schemas
  updateProfileSchema,
  userFollowStatusSchema,
  // Legacy PascalCase aliases
  NotificationPreferencesSchema,
  PrivacySettingsSchema,
  UpdateUserProfileSchema,
  UserFollowStatusSchema,
  // Types
  type NotificationPreferences,
  type PrivacySettings,
  type UpdateProfileInput,
  type UpdateUserProfileInput,
  type UserFollowStatus,
} from '@travelmatch/shared';
