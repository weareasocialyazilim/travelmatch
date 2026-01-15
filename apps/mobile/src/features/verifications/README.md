# Verifications Feature

The **security heart** of Lovendo. This feature handles all proof ceremonies, moment authentication,
and trust verification.

## Why a Separate Feature?

The verification system was previously scattered across `features/discover/components/ceremony` and
`features/profile/screens`. This was a **Master decision** to consolidate because:

1. **Proof verification is not a "side feature"** - It's the core trust mechanism
2. **Single responsibility** - All verification logic in one place
3. **Security auditing** - Easier to audit and secure a focused module
4. **Team ownership** - Clear ownership for the verification team

## Architecture

```
features/verifications/
├── components/           # Ceremony UI components
│   ├── TrustConstellation.tsx    # Visual trust milestone map
│   ├── SunsetClock.tsx           # Proof deadline visualization
│   ├── ProofCeremonyFlow.tsx     # Main orchestrator
│   ├── MomentAuthenticator.tsx   # AI verification UI
│   ├── CeremonyProgress.tsx      # Step progress indicator
│   ├── ThankYouCardCreator.tsx   # Post-proof gratitude
│   ├── MemoryCard.tsx            # Shareable proof card
│   ├── SacredMoments.tsx         # Privacy-first media viewer
│   ├── PassportBook.tsx          # Verification passport
│   ├── GiftVault.tsx             # Secure gift display
│   └── __tests__/                # Component tests
├── screens/              # Verification screens
│   ├── ProofFlowScreen.tsx       # Main proof submission flow
│   ├── ProofDetailScreen.tsx     # Individual proof view
│   └── ProofHistoryScreen.tsx    # Verification history (Moment Verification)
└── index.ts              # Feature exports
```

## Key Components

### ProofCeremonyFlow

The main orchestrator that transforms proof verification into a "Sacred Moment" experience.

**Steps:**

1. **Intro** - Show deadline with SunsetClock, gift info
2. **Capture** - Camera interface with haptic feedback (Heavy on capture)
3. **Authenticate** - AI verification with MomentAuthenticator
4. **Thank You** - Optional gratitude card creation
5. **Celebrate** - Confetti, success haptics, shareable memory card

### TrustConstellation

Visual star map showing trust milestones. **Terminology updated:**

- `İletişim Doğrulandı` (Email Verified)
- `Hesap Güvenliği` (Account Security)
- `Kimlik Doğrulaması` (Identity Verification)
- `Ödeme Güvenilirliği` (Payment Reliability)
- `İlk Anı Hediyesi` (First Moment Gift)
- `Hediye Tutarlılığı` (Gifting Consistency)
- `Anı Ustası` (Moment Master)
- `Anı Doğrulaması` (Moment Verification)

Badge: "Moment Master" (not "Trusted Traveler")

## Backend Integration

### EXIF Location Verification

The `verify-proof` Edge Function now validates EXIF metadata:

```typescript
// Request includes optional EXIF data
interface VerifyProofRequest {
  videoUrl: string;
  claimedLocation: string;
  exifLocation?: {
    latitude: number;
    longitude: number;
  };
}

// EXIF match boosts confidence +10%
// EXIF mismatch penalizes confidence -30% (fraud indicator)
```

### PayTR Escrow Release

When proof is verified, the Edge Function automatically triggers PayTR release:

```typescript
if (finalResult.status === 'verified') {
  // Update moment
  await supabase.from('moments').update({ proof_verified: true });

  // Trigger PayTR escrow release
  await fetch(`${supabaseUrl}/functions/v1/paytr-transfer`, {
    body: JSON.stringify({
      escrowId: pendingEscrow.id,
      action: 'release',
      reason: 'proof_verified',
    }),
  });
}
```

### Trust Score Calculation

**Never calculate client-side!** Use the DB function:

```typescript
// Call from userService
const stats = await userService.getDetailedTrustStats(userId);

// Returns breakdown:
// - Payment score (max 30)
// - Proof score (max 30)
// - Trust notes score (max 15)
// - KYC score (max 15)
// - Social score (max 10)
```

## UX Guidelines

### Haptic Feedback

| Action                      | Haptic Type          |
| --------------------------- | -------------------- |
| Photo captured              | Heavy                |
| Submit proof                | Medium               |
| Step transition             | Light                |
| Verification success        | Success notification |
| Phase warning (SunsetClock) | Warning notification |

### Liquid Animations

All ceremony animations respect `useLowPowerMode()`:

- Reduced confetti count on low-power devices
- Skippable step transitions
- Shimmer effects use 60fps timing

## Migration Notes

Old imports still work but are deprecated:

```typescript
// ❌ Deprecated
import { ProofCeremonyFlow } from '@/features/discover/components/ceremony';

// ✅ New
import { ProofCeremonyFlow } from '@/features/verifications';
```

The old index.ts re-exports from the new location for backward compatibility.

## Security Checklist

- [ ] EXIF data validated server-side (not trusted from client)
- [ ] Trust score calculated in PostgreSQL function
- [ ] Escrow release requires verified proof (DB trigger enforces)
- [ ] Rate limited: 10 verifications per hour per user
- [ ] AI model: Claude 3.5 Sonnet (cost-optimized)
