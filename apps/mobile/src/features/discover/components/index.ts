/**
 * Discover Feature Components - Barrel exports
 *
 * All Discover-specific components are now located here following
 * feature-based architecture for better encapsulation.
 */

// Map Components
export { NeonPulseMarker } from './NeonPulseMarker';

// Category Components
export { CategoryChips } from './CategoryChips';
export { CategoryFilter } from './CategoryFilter';
export { GlassCategorySelector } from './GlassCategorySelector';

// Header & Search
export {
  DiscoverHeader,
  AwwwardsDiscoverHeader,
  AnimatedDiscoverHeader,
} from './DiscoverHeader';
export { EnhancedSearchBar } from './EnhancedSearchBar';

// Filters & Modals
export { FilterModal } from './FilterModal';
export { LocationModal } from './LocationModal';

// Moment Cards
export { GridMomentCard } from './GridMomentCard';
export { ImmersiveMomentCard } from './ImmersiveMomentCard';
export { LiquidMomentCard } from './LiquidMomentCard';
export { SingleMomentCard } from './SingleMomentCard';

// Welcome Card
export { HomeWelcomeCard } from './HomeWelcomeCard';

// Stories
export { StoriesRow } from './StoriesRow';
export { StoryActionBar } from './StoryActionBar';
export { StoryItem } from './StoryItem';
export { StoryViewer } from './StoryViewer';

// Constants
export * from './constants';

// Ceremony Components (Trust/Proof Flow)
export * from './ceremony';

// Moment Detail Components
export * from './moment-detail';

// Types
export type {
  Story,
  UserStory,
  Category,
  SortOption,
  City,
  DiscoverHeaderProps,
} from './types';
