/**
 * Manual Database Type Definitions
 *
 * These types are manually defined based on the Supabase schema.
 * Ideally, these should be auto-generated using:
 * `supabase gen types typescript --local > types/database.types.ts`
 *
 * TODO: Replace with auto-generated types when Docker is available
 */

// Notification preferences JSONB type
export interface NotificationPreferences {
  email?: boolean;
  push?: boolean;
  marketing?: boolean;
  [key: string]: boolean | undefined;
}

// Privacy settings JSONB type
export interface PrivacySettings {
  showLocation?: boolean;
  showLastSeen?: boolean;
  allowMessages?: 'everyone' | 'none';
  timezone?: string;
  autoAcceptRequests?: boolean;
  instantBooking?: boolean;
  [key: string]: string | boolean | undefined;
}

// User table partial (fields used in userService)
export interface UserRow {
  id: string;
  email?: string;
  full_name?: string | null;
  name?: string | null;
  username?: string | null;
  avatar?: string | null;
  avatar_url?: string | null;
  cover_image?: string | null;
  verified?: boolean;
  languages?: string[] | null;
  currency?: string | null;
  notification_preferences?: NotificationPreferences | null;
  privacy_settings?: PrivacySettings | null;
  created_at?: string;
  updated_at?: string;
}

// Update profile payload type
export interface UpdateProfilePayload {
  avatar_url?: string;
  coverImage?: string;
  cover_image?: string;
  full_name?: string;
  username?: string;
  bio?: string;
  location?: string | unknown; // Can be string (database) or object (legacy)
  languages?: string[];
  interests?: string[];
  instagram?: string;
  twitter?: string;
  notification_preferences?: NotificationPreferences;
  privacy_settings?: PrivacySettings;
}
