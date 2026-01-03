/**
 * @deprecated Import from '@/features/discover/components/moment-detail' instead.
 *
 * Migration Guide:
 * ================
 *
 * BEFORE:
 * ```tsx
 * import { MomentHeader, HostSection } from '@/components/moment-detail';
 * ```
 *
 * AFTER:
 * ```tsx
 * import { MomentHeader, HostSection } from '@/features/discover/components/moment-detail';
 * ```
 *
 * This file re-exports for backward compatibility.
 */

export {
  MomentHeader,
  MomentGallery,
  MomentInfo,
  HostSection,
  ReviewsSection,
  RequestsSection,
  SummarySection,
  ActionBar,
  ContributorSlotsSection,
} from '@/features/discover/components/moment-detail';

export type { Contributor } from '@/features/discover/components/moment-detail';
export * from '@/features/discover/components/moment-detail/types';
