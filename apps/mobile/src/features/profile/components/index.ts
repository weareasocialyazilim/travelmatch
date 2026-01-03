/**
 * Profile Feature Components - Barrel exports
 *
 * All Profile-specific components following feature-based architecture.
 */

// Existing components
export { AchievementCard } from './AchievementCard';
export type { default as AchievementCardProps } from './AchievementCard';
export { TrustConstellation } from './TrustConstellation';

// Migrated components
export { MomentsTabs } from './MomentsTabs';
export { ProfileHeaderSection } from './ProfileHeaderSection';
export { ProfileMomentCard } from './ProfileMomentCard';
export { QuickLinks } from './QuickLinks';
export { StatsRow } from './StatsRow';
export { WalletCard } from './WalletCard';

// Create Moment Components
export * from './createMoment';
