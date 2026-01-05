// Profile Feature Exports
export { default as ProfileScreen } from './screens/ProfileScreen';

// Components
// AchievementCard moved to @/features/gamification
export { ProfileDetailScreen } from './screens/ProfileDetailScreen';
export { default as EditProfileScreen } from './screens/EditProfileScreen';
export { UserProfileScreen } from './screens/UserProfileScreen';

// Reputation & Trust
// ReputationScreen removed - use TrustGardenDetailScreen instead
export { default as TrustGardenDetailScreen } from './screens/TrustGardenDetailScreen';
export { TrustNotesScreen } from './screens/TrustNotesScreen';

// Proof System - canonical source is features/verifications
// Re-exported here for backward compatibility only
export {
  ProofFlowScreen,
  ProofDetailScreen,
  ProofHistoryScreen,
} from '@/features/verifications';

// Note: ReviewScreen is in features/reviews

// ===================================
// ACHIEVEMENTS - ELEVATED TO features/gamification
// ===================================
// AchievementsScreen moved to @/features/gamification
// AchievementCard moved to @/features/gamification/components

// ===================================
// MOMENTS - ELEVATED TO features/moments
// ===================================
// CreateMomentScreen moved to @/features/moments
// momentsService moved to @/features/moments/services

// Re-export for backward compatibility (will be deprecated)
export { default as MyMomentsScreen } from './screens/MyMomentsScreen';
export { MyHostedMomentsScreen } from './screens/MyHostedMomentsScreen';
export { EditMomentScreen } from './screens/EditMomentScreen';
export { default as MomentDetailScreen } from './screens/MomentDetailScreen';
export { MomentGalleryScreen } from './screens/MomentGalleryScreen';
export { ShareMomentScreen } from './screens/ShareMomentScreen';
// ReportMomentScreen moved to @/features/moderation
export { SavedMomentsScreen } from './screens/SavedMomentsScreen';
export { DeletedMomentsScreen } from './screens/DeletedMomentsScreen';
export { MomentCommentsScreen } from './screens/MomentCommentsScreen';

// Hooks
export {
  useProfile,
  useMyProfile,
  useUpdateProfile,
  useReputation,
  useTrustScore,
  useProofHistory,
  useMyMoments,
  useCreateMoment,
  useDeleteMoment,
} from './hooks/useProfile';

// Services
export { profileApi as profileService } from './services/profileService';
/** @deprecated Use profileService instead */
export { profileApi } from './services/profileService';
export type { UpdateProfileDto } from './services/profileService';

// Types
export type {
  Moment,
  MomentData,
  MomentUser,
  MomentLocation,
  User,
  Proof,
  ProofType,
  ProofStatus,
  UserProfile,
} from './types';
