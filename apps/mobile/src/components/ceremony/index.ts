/**
 * @deprecated Import from '@/features/discover/components/ceremony' instead.
 *
 * Migration Guide:
 * ================
 *
 * BEFORE:
 * ```tsx
 * import { TrustConstellation, ProofCeremonyFlow } from '@/components/ceremony';
 * ```
 *
 * AFTER:
 * ```tsx
 * import { TrustConstellation, ProofCeremonyFlow } from '@/features/discover/components/ceremony';
 * ```
 *
 * This file re-exports for backward compatibility.
 */

export {
  TrustConstellation,
  SunsetClock,
  PassportBook,
  MomentAuthenticator,
  SacredMoments,
  GiftVault,
  ThankYouCardCreator,
  MemoryCard,
  CeremonyProgress,
  ProofCeremonyFlow,
} from '@/features/discover/components/ceremony';

export type { AuthenticationResult } from '@/features/discover/components/ceremony';
