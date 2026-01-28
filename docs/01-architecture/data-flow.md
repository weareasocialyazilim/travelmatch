# Data Flow Diagrams

## Moment Creation Flow

```
User (Mobile)
    │
    ▼
┌─────────────────┐
│ CreateMoment    │  Input validation (apps/mobile/src/features/moments/screens/CreateMomentScreen.tsx)
└────────┬────────┘
         │
         ▼ (POST /api/moments)
┌─────────────────────────────────────┐
│ Supabase Edge Function / RPC        │
│ - Validate input                    │
│ - Create moment record              │
│ - Set status = 'active'             │
│ - Trigger AI scan (async)           │
└──────────────┬──────────────────────┘
               │
               ▼ (if AI flags)
    ┌────────────────────┐
    │ Admin Queue        │  Review in admin panel
    └────────────────────┘
```

## Moment Discovery Flow

```
User (Mobile/Web)
    │
    ▼
┌─────────────────┐
│ DiscoverScreen  │  Filter UI (apps/mobile/src/features/discover/screens/DiscoverScreen.tsx)
└────────┬────────┘
         │
         ▼ (RPC: discover_moments)
┌─────────────────────────────────────┐
│ Supabase RPC                        │
│ - Apply RLS                          │
│ - Apply filters                     │
│ - Return moment list                │
└──────────────┬──────────────────────┘
               │
               ▼
    ┌────────────────────┐
    │ MomentCard/Story   │  Render on client
    └────────────────────┘
```

## Claim Flow

```
User
    │
    ▼
┌─────────────────┐
│ Claim Button    │  Tier check (apps/mobile/src/features/discover/components/moment-detail/)
└────────┬────────┘
         │
         ▼ (POST /api/moments/[id]/claim)
┌─────────────────────────────────────┐
│ Claim RPC                            │
│ - Validate user not creator         │
│ - Check no active claim exists      │
│ - Create claim record               │
│ - Update moment status              │
└──────────────┬──────────────────────┘
               │
               ▼
    ┌────────────────────┐
    │ ClaimConfirmed     │  UI update
    └────────────────────┘
```

## Gift/Escrow Flow

```
User
    │
    ▼
┌─────────────────┐
│ Gift Screen     │  Amount input (apps/mobile/src/features/payments/screens/UnifiedGiftFlowScreen.tsx)
└────────┬────────┘
         │
         ▼ (Tier check)
┌─────────────────────────────────────┐
│ Gift RPC                             │
│ - Determine escrow requirement      │
│ - 0-30: Direct transfer             │
│ - 30-100: Optional escrow           │
│ - 100+: Mandatory escrow            │
│ - Create escrow record if needed    │
└──────────────┬──────────────────────┘
               │
               ├───────────────────────────────┐
               ▼                               ▼
    ┌────────────────────┐           ┌────────────────────┐
    │ Direct Transfer    │           │ Escrow Held        │
    └────────────────────┘           │ - Hold payment     │
                                      │ - Release on proof │
                                      └────────────────────┘
```

## Proof Submission Flow

```
User
    │
    ▼
┌─────────────────┐
│ Submit Proof    │  Upload photos/videos
└────────┬────────┘
         │
         ▼ (POST /api/moments/[id]/proof)
┌─────────────────────────────────────┐
│ Proof RPC                            │
│ - Upload to Storage                 │
│ - Create proof record               │
│ - Update moment status              │
│ - Notify admin queue                │
└──────────────┬──────────────────────┘
               │
               ▼ (Async AI scan)
    ┌────────────────────┐
    │ AWS Rekognition    │  Flag if suspicious
    └────────────────────┘
               │
               ▼
    ┌────────────────────┐
    │ Admin Review       │  Manual approval/rejection
    └────────────────────┘
```

## Admin Moderation Flow

```
Report Created / AI Flag
    │
    ▼
┌─────────────────┐
│ Admin Queue     │  (apps/admin/src/app/(dashboard)/moderation/page.tsx)
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Moderation Action                   │
│ - Review content                    │
│ - Take action (approve/reject/ban)  │
│ - Log action                        │
└─────────────────────────────────────┘
```

## Payout Flow (Creator Withdrawal)

```
Creator Request
    │
    ▼
┌─────────────────┐
│ Withdraw Screen │  (apps/mobile/src/features/wallet/screens/BankTransferScreen.tsx)
└────────┬────────┘
         │
         ▼ (POST /api/wallet/payouts)
┌─────────────────────────────────────┐
│ Payout RPC                           │
│ - Verify KYC status                 │
│ - Check balance                     │
│ - Validate amount                   │
│ - Create payout record              │
│ - Submit to PayTR                   │
└──────────────────────────────────────┘
```
