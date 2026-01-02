/**
 * Re-export useProfile from features/profile for convenience
 *
 * Note: The proper implementation is in @/features/profile/hooks/useProfile
 * This re-export provides a shorter import path for common usage.
 */
export { useProfile, useMyProfile, useUpdateProfile, useReputation, useTrustScore, useProofHistory, useMyMoments, useCreateMoment, useDeleteMoment } from '@/features/profile/hooks/useProfile';

// Default export for convenience
export { useProfile as default } from '@/features/profile/hooks/useProfile';
