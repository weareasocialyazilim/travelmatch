/**
 * Profile Feature Components - Barrel exports
 *
 * All Profile-specific components following feature-based architecture.
 */

// Design System Components (migrated) - commented out until package is ready
// export { TrustOrb, TrustConstellation } from '@travelmatch/design-system/native';
// export type { TrustOrbProps, TrustConstellationProps, TrustFactor } from '@travelmatch/design-system/native';

// Existing components - AchievementCard moved to another location
// export { AchievementCard } from './AchievementCard';
// export type { default as AchievementCardProps } from './AchievementCard';

// Migrated components from components/ folder
// LeaveTrustNoteBottomSheet artık @/components/ui altında (tek kaynak)
export { UnblockUserBottomSheet } from './UnblockUserBottomSheet';
export { KYCBadge, getKYCLabel, getNextKYCLevel } from './KYCBadge';
export type { KYCLevel } from './KYCBadge';

// Migrated components
export { default as MomentsTabs } from './MomentsTabs';
export { ProfileHeaderSection } from './ProfileHeaderSection';
export { default as ProfileMomentCard } from './ProfileMomentCard';
export { default as QuickLinks } from './QuickLinks';
export { StatsRow } from './StatsRow';
export { default as WalletCard } from './WalletCard';

// Create Moment Components - moved to moments feature
// export * from './createMoment';
