/**
 * Re-export useProfile from features/profile for convenience
 *
 * Note: The proper implementation is in @/features/profile/hooks/useProfile
 * This re-export provides a shorter import path for common usage.
 */
export { useProfile } from '@/features/profile/hooks/useProfile';
export { useMyProfile, useUpdateProfile } from '@/features/profile/hooks/useProfile';
export { default } from '@/features/profile/hooks/useProfile';
