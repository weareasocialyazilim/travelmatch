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
  time?: string; // Display time like "2 saat önce"
  momentId?: string; // Links to the associated moment
}

export type SubscriptionTierType = 'free' | 'premium' | 'platinum';

export interface UserStory {
  id: string;
  name: string;
  avatar: string;
  hasStory: boolean;
  isNew?: boolean;
  subscriptionTier?: SubscriptionTierType;
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
  location?: string;
  locationDisabled?: boolean;
  locationDisabledMessage?: string;
  activeFiltersCount?: number;
  onLocationPress?: () => void;
  onFilterPress?: () => void;
  viewMode?: 'immersive' | 'grid';
  onToggleView?: () => void;
}

// =============================================================================
// CARD TYPES
// =============================================================================

export interface MomentUser {
  id: string;
  name: string;
  avatar?: string;
  verified?: boolean;
  tier?: string;
}

export interface MomentStory {
  excerpt?: string;
  fullText?: string;
}

export interface MomentCardProps {
  id: string;
  imageUrl: string;
  title: string;
  price?: number;
  currency?: string;
  location?: string;
  distance?: string;
  onPress?: (item?: MomentCardProps) => void;
  onGiftPress?: () => void;
  style?: object;
  // For FlatList rendering
  item?: MomentCardProps;
  index?: number;
  // User and story info
  user?: MomentUser;
  story?: MomentStory;
}

export interface GridCardProps {
  columns?: number;
  /** The moment item - required for grid rendering */
  item: MomentCardProps;
  /** The item index in the list - required for grid layout */
  index: number;
  /** Press handler for the card */
  onPress: (item: MomentCardProps) => void;
  /** Optional formatted price for display */
  priceDisplay?: string;
  /** Optional secondary price (e.g., original currency) */
  priceSecondary?: string;
}

// =============================================================================
// FILTER TYPES
// =============================================================================

export interface PriceRange {
  min: number;
  max: number;
}

export interface CategoryFilterProps {
  categories: Category[];
  selectedId?: string;
  selectedCategory?: string; // Alias for selectedId
  onSelect: (id: string) => void;
}

// =============================================================================
// STORY VIEWER TYPES
// =============================================================================

export interface StoryViewerState {
  isVisible: boolean;
  currentStoryIndex: number;
  currentUserIndex: number;
  stories: UserStory[];
}

export interface StoryItemProps {
  story?: UserStory;
  item: UserStory; // Required for StoryItem component
  isActive?: boolean;
  onPress: (story: UserStory) => void;
}
