# Deep Links

## Overview

Deep links enable navigation to specific content from external sources.

## Supported Deep Link Patterns

| Pattern                  | Destination          |
| ------------------------ | -------------------- |
| `lovendo://moment/[id]`  | Moment detail screen |
| `lovendo://profile/[id]` | User profile screen  |

## Code References

| Feature           | Location                                      |
| ----------------- | --------------------------------------------- |
| Navigation config | `apps/mobile/src/navigation/AppNavigator.tsx` |
| Linking config    | `apps/mobile/src/navigation/linking.ts`       |

## NOT IMPLEMENTED

- Universal links (iOS)
- App links (Android)
- Deferred deep linking
- Deep link analytics
