/**
 * Lovendo Verifications Feature
 *
 * The security heart of the platform.
 * Handles all proof ceremonies, moment authentication, and trust verification.
 *
 * This module centralizes the verification system which is critical
 * to the platform's integrity - not a "side feature" of discovery or profile.
 */

// Components - Ceremony UI Elements
export {
  TrustMilestones,
  TrustConstellation,
} from './components/TrustMilestones';
export { SunsetClock } from './components/SunsetClock';
// export { MomentAuthenticator } from './components/MomentAuthenticator';
export { SacredMoments } from './components/SacredMoments';
export { GiftVault } from './components/GiftVault';
export { ThankYouCardCreator } from './components/ThankYouCardCreator';
export { MemoryCard } from './components/MemoryCard';
export { CeremonyProgress } from './components/CeremonyProgress';

// Main Flow Orchestrator
export { ProofCeremonyFlow } from './components/ProofCeremonyFlow';

// Screens
export { ProofFlowScreen } from './screens/ProofFlowScreen';
export { ProofDetailScreen } from './screens/ProofDetailScreen';
export { ProofHistoryScreen } from './screens/ProofHistoryScreen';

// ===================================
// KYC (Identity Verification) - Güvenin Giriş Kapısı
// Moved from features/payments - KYC is core to Trust Garden
// ===================================
export { default as KYCIntroScreen } from './kyc/KYCIntroScreen';
export { default as KYCPendingScreen } from './kyc/KYCPendingScreen';

// Types
// export type { AuthenticationResult } from './components/MomentAuthenticator';
