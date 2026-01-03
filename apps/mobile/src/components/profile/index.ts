/**
 * @deprecated Import from '@/features/profile/components' instead.
 *
 * Migration Guide:
 * ================
 *
 * BEFORE:
 * ```tsx
 * import { ProfileHeaderSection, StatsRow } from '@/components/profile';
 * ```
 *
 * AFTER:
 * ```tsx
 * import { ProfileHeaderSection, StatsRow } from '@/features/profile/components';
 * ```
 *
 * This file re-exports for backward compatibility.
 */

// Re-export from new location
export {
  ProfileHeaderSection,
  StatsRow,
  WalletCard,
  QuickLinks,
  ProfileMomentCard,
  MomentsTabs,
  AchievementCard,
  TrustConstellation,
} from '@/features/profile/components';

// Default exports for legacy code
export { ProfileHeaderSection as default } from '@/features/profile/components';
