# App Store and Play Store

## Store Submissions

| Store      | Platform | Submission Method   |
| ---------- | -------- | ------------------- |
| App Store  | iOS      | App Store Connect   |
| Play Store | Android  | Google Play Console |

## Build Commands

```bash
# iOS
pnpm ios:build        # Development build
pnpm ios:prod         # Production build

# Android
pnpm android:build    # Development build
pnpm android:prod     # Production build
```

## Required Assets

| Asset             | Store | Status     |
| ----------------- | ----- | ---------- |
| App icon          | Both  | Configured |
| Screenshots       | Both  | Required   |
| Privacy policy    | Both  | Required   |
| Data safety form  | Play  | Required   |
| App Store listing | iOS   | Required   |

## Code References

| Feature          | Location                                 |
| ---------------- | ---------------------------------------- |
| App config       | `apps/mobile/app.json`                   |
| Build config     | `apps/mobile/eas.json`                   |
| Google Play data | `apps/mobile/GOOGLE_PLAY_DATA_SAFETY.md` |

## NOT IMPLEMENTED

- Automatic screenshot generation
- A/B testing listings
- Staged rollouts
- In-app updates
