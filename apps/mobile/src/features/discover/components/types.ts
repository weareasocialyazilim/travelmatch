/**
 * Discover Components Types
 *
 * Type definitions for Discover feature components.
 * Used by StoriesRow, StoryViewer, constants, and DiscoverHeader.
 */

// =============================================================================
// STORY TYPES
// =============================================================================

export interface Story {
  id: string;
  imageUrl: string;
  title?: string;
  description?: string;
  location?: string;
  distance?: string;
  price?: number;
  timestamp?: number;
}

export interface UserStory {
  id: string;
  name: string;
  avatar: string;
  hasStory: boolean;
  isNew?: boolean;
  stories: Story[];
}

// =============================================================================
// CATEGORY & FILTER TYPES
// =============================================================================

export interface Category {
  id: string;
  label: string;
  emoji: string;
}

export interface SortOption {
  id: string;
  label: string;
  icon: string;
}

export interface City {
  id: string;
  name: string;
  country: string;
  emoji: string;
}

// =============================================================================
// HEADER TYPES
// =============================================================================

export interface DiscoverHeaderProps {
  onSearchPress?: () => void;
  onNotificationsPress?: () => void;
  onAvatarPress?: () => void;
  notificationCount?: number;
  userName?: string;
  userAvatar?: string;
}
