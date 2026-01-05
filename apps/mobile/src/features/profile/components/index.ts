/**
 * Profile Feature Components - Barrel exports
 *
 * All Profile-specific components following feature-based architecture.
 */

// Design System Components (migrated)
// TrustOrb - Premium trust score visualization
export {
  TrustOrb,
  TrustConstellation,
} from '@travelmatch/design-system/native';
export type {
  TrustOrbProps,
  TrustConstellationProps,
  TrustFactor,
} from '@travelmatch/design-system/native';

// Existing components
export { AchievementCard } from './AchievementCard';
export type { default as AchievementCardProps } from './AchievementCard';

// Migrated components from components/ folder
// LeaveTrustNoteBottomSheet artık @/components/ui altında (tek kaynak)
export { UnblockUserBottomSheet } from './UnblockUserBottomSheet';
export { KYCBadge, getKYCLabel, getNextKYCLevel } from './KYCBadge';
export type { KYCLevel } from './KYCBadge';

// Migrated components
export { MomentsTabs } from './MomentsTabs';
export { ProfileHeaderSection } from './ProfileHeaderSection';
export { ProfileMomentCard } from './ProfileMomentCard';
export { QuickLinks } from './QuickLinks';
export { StatsRow } from './StatsRow';
export { WalletCard } from './WalletCard';

// Create Moment Components
export * from './createMoment';
