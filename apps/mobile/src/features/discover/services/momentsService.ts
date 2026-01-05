/**
 * Moments Service - Re-export for Discover Feature
 *
 * The canonical momentsService lives in features/moments/services/momentsService.ts.
 * This file provides backward compatibility for imports from features/discover/services/
 *
 * @deprecated Import from '@/features/moments/services/momentsService' or '@/features/moments' instead.
 */
export {
  momentsApi,
  type SubscriptionTier,
  type ProfileWithSubscription,
  type ExperienceCategory,
  type MomentStatus,
  type MomentFilters,
  type MomentResult,
  type CreateMomentDto,
  type UpdateMomentDto,
} from '@/features/moments/services/momentsService';
