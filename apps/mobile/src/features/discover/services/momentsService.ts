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
  type MomentFilters,
  type CreateMomentDto,
  type UpdateMomentDto,
} from '@/features/moments/services/momentsService';

// Re-export missing types with local definitions
export type MomentStatus =
  | 'active'
  | 'paused'
  | 'draft'
  | 'deleted'
  | 'completed';
export type MomentResult<T> = { data: T | null; error: Error | null };
