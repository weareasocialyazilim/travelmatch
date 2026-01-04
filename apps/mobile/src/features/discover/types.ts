/**
 * Discover Feature Types
 * Re-exports from global types for feature-level access
 */

export type {
  Moment,
  MomentData,
  MomentUser,
  MomentLocation,
  User,
} from '@/types';

// UserProfile is an alias for User in this context
export type UserProfile = import('@/types').User;

// Re-export component types for feature-level access
export type {
  UserStory,
  Story,
  Category,
  SortOption,
  City,
  StoryViewerState,
} from './components/types';
