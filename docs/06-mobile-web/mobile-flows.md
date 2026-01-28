# Mobile App Flows

## App Structure

```
┌─────────────────────────────────────┐
│            App Container            │
├─────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐           │
│  │ Auth    │  │ Main    │           │
│  │ Stack   │  │ Stack   │           │
│  └─────────┘  └─────────┘           │
└─────────────────────────────────────┘
```

## Navigation Flow

```
┌─────────────────┐
│   Splash Screen │  Auth check
└────────┬────────┘
         │
         ├────────────────────┐
         ▼                    ▼
    Not authenticated    Authenticated
         │                    │
         ▼                    ▼
    Welcome Screen      Home/Discover
         │                    │
         ▼                    ▼
    Login/Register      Bottom Nav:
                        - Discover
                        - Moments
                        - Wallet
                        - Profile
```

## Core Screens

| Screen        | Path              | Notes              |
| ------------- | ----------------- | ------------------ |
| Welcome       | `/welcome`        | Onboarding entry   |
| Login         | `/login`          | Phone/email auth   |
| Discover      | `/discover`       | Moment exploration |
| Create Moment | `/moments/create` | Creator flow       |
| Moment Detail | `/discover/[id]`  | Claim/gift UI      |
| Wallet        | `/wallet`         | Balance, payouts   |
| Profile       | `/profile`        | User settings      |

## Code References

| Feature          | Location                                          |
| ---------------- | ------------------------------------------------- |
| App Navigator    | `apps/mobile/src/navigation/AppNavigator.tsx`     |
| Tab Navigator    | `apps/mobile/src/navigation/MainTabNavigator.tsx` |
| Auth screens     | `apps/mobile/src/features/auth/`                  |
| Discover screens | `apps/mobile/src/features/discover/`              |
| Moments screens  | `apps/mobile/src/features/moments/`               |

## NOT IMPLEMENTED

- Deep linking for specific moments
- Push notifications
- Offline mode
- Background sync
