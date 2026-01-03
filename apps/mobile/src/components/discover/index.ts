/**
 * @deprecated Import from '@/features/discover/components' instead.
 *
 * Migration Guide:
 * ================
 *
 * BEFORE:
 * ```tsx
 * import { DiscoverHeader, StoryViewer } from '@/components/discover';
 * ```
 *
 * AFTER:
 * ```tsx
 * import { DiscoverHeader, StoryViewer } from '@/features/discover/components';
 * ```
 *
 * This file re-exports for backward compatibility.
 */

// Re-export all from new location
export {
  // Map Components
  NeonPulseMarker,
  // Category Components
  CategoryChips,
  CategoryFilter,
  GlassCategorySelector,
  // Header & Search
  DiscoverHeader,
  EnhancedSearchBar,
  // Filters & Modals
  FilterModal,
  LocationModal,
  // Moment Cards
  GridMomentCard,
  ImmersiveMomentCard,
  LiquidMomentCard,
  SingleMomentCard,
  // Welcome Card
  HomeWelcomeCard,
  // Stories
  StoriesRow,
  StoryActionBar,
  StoryItem,
  StoryViewer,
} from '@/features/discover/components';

// Re-export constants
export * from '@/features/discover/components/constants';

// Local types (kept here as they may be specific to legacy usage)
export * from './types';

// Legacy aliases - these named exports may be used in existing code
export { DiscoverHeader as AnimatedDiscoverHeader } from '@/features/discover/components';
export { DiscoverHeader as AwwwardsDiscoverHeader } from '@/features/discover/components';
export { CategoryChips as TabChips } from '@/features/discover/components';
