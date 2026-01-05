/**
 * Verification Components
 *
 * Export barrel for all ceremony and verification-related UI components.
 * These components transform the proof verification process
 * into an emotional, shareable "Sacred Moment" experience.
 */

// Core ceremony components
// TrustMilestones - Milestone-based trust visualization (renamed from TrustConstellation)
export { TrustMilestones, TrustConstellation } from './TrustMilestones';
export type {
  TrustMilestonesProps,
  TrustConstellationProps,
} from './TrustMilestones';
export { SunsetClock } from './SunsetClock';
export { PassportBook } from './PassportBook';
export { MomentAuthenticator } from './MomentAuthenticator';
export { SacredMoments } from './SacredMoments';
export { GiftVault } from './GiftVault';
export { ThankYouCardCreator } from './ThankYouCardCreator';
export { MemoryCard } from './MemoryCard';
export { CeremonyProgress } from './CeremonyProgress';

// Main flow orchestrator
export { ProofCeremonyFlow } from './ProofCeremonyFlow';

// Types
export type { AuthenticationResult } from './MomentAuthenticator';
