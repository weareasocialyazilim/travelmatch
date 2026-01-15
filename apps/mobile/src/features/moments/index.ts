/**
 * Moments Feature - Barrel Exports
 *
 * ELEVATED: Moments are the core of Lovendo, not just a profile feature.
 * This is the single source of truth for ALL moment-related functionality:
 * - Discovery (browse moments)
 * - Creation (the drop)
 * - Detail viewing
 * - Gift flow
 */

// ===================================
// SCREENS
// ===================================
// DiscoverScreen - canonical source is features/discover
export { default as DiscoverScreen } from '@/features/discover/screens/DiscoverScreen';
export { default as CreateMomentScreen } from './screens/CreateMomentScreen';
// MomentDetailScreen - canonical source is features/profile
export { default as MomentDetailScreen } from '@/features/profile/screens/MomentDetailScreen';

// ===================================
// COMPONENTS
// ===================================
// SetPriceBottomSheet - For setting moment prices
export { SetPriceBottomSheet } from './components/SetPriceBottomSheet';

// CreateMoment sub-components
export {
  PhotoSection,
  AwwwardsPhotoSection,
  TitleInput,
  AwwwardsTitleInput,
  CategorySelector,
  CATEGORIES,
  getCategoryEmoji,
  DetailsSection,
  StorySection,
  MomentPreview,
} from './components/createMoment';
export type { Category } from './components/createMoment';
export type { Place } from './components/createMoment';

// ===================================
// SERVICES - Single Truth for Moments API
// ===================================
export {
  momentsApi,
  momentsApi as momentsService,
  getUserSubscriptionTier,
  canMakeSubscriberOffer,
} from './services/momentsService';
export type {
  SubscriptionTier,
  ProfileWithSubscription,
  MomentFilters,
  CreateMomentDto,
  UpdateMomentDto,
} from './services/momentsService';

// ===================================
// TYPES - Re-export from discover for backward compatibility
// ===================================
export type {
  Moment,
  MomentData,
  MomentUser,
  MomentLocation,
} from '@/features/discover/types';
