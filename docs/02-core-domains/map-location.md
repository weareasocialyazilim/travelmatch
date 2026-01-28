# Map and Location

## Overview

Location features enable moment discovery and user positioning. Privacy is paramount.

## Map Features

| Feature              | Implementation                     |
| -------------------- | ---------------------------------- |
| City search          | Mapbox Geocoding API               |
| Moment markers       | Mapbox Maps SDK                    |
| Distance calculation | Mapbox Directions API              |
| Location privacy     | Approximate coordinates for guests |

## Location Privacy Rules

| User Type | Precision Shown | Can Change Location |
| --------- | --------------- | ------------------- |
| Guest     | City only       | N/A                 |
| Free      | Approximate     | No                  |
| Premium   | Approximate     | Yes                 |

## Code References

| Feature          | Location                                                        |
| ---------------- | --------------------------------------------------------------- |
| Map screen       | `apps/mobile/src/features/discover/screens/SearchMapScreen.tsx` |
| Location service | `apps/mobile/src/services/locationService.ts`                   |
| Mapbox config    | `apps/mobile/src/config/mapbox.ts`                              |
| Discover RPC     | `supabase/functions/discover_moments/index.ts`                  |

## NOT IMPLEMENTED

- Real-time location sharing
- Location history/timeline
- Geofencing notifications
- Location-based recommendations
- Exact location display
- Check-in/check-out
- Location stories
