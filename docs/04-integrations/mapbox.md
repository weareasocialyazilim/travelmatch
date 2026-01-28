# Mapbox Integration

## Overview

Mapbox provides geocoding, maps, and location services for moment discovery.

## Usage

| Feature    | API            | Purpose                 |
| ---------- | -------------- | ----------------------- |
| Geocoding  | Geocoding API  | City/location search    |
| Maps       | Maps SDK       | Interactive map display |
| Directions | Directions API | Distance calculations   |

## Environment Configuration

```bash
MAPBOX_ACCESS_TOKEN=pk.xxx
```

## Code References

| Feature          | Location                                                        |
| ---------------- | --------------------------------------------------------------- |
| Map config       | `apps/mobile/src/config/mapbox.ts`                              |
| Map screen       | `apps/mobile/src/features/discover/screens/SearchMapScreen.tsx` |
| Location service | `apps/mobile/src/services/locationService.ts`                   |
| Discover RPC     | `supabase/functions/discover_moments/index.ts`                  |

## Privacy Considerations

- Guest users see only city-level location
- Exact coordinates masked for non-authenticated users
- Location data not persisted beyond session

## NOT IMPLEMENTED

- Turn-by-turn navigation
- Offline maps
- Custom map styles
- Geofencing
- Real-time tracking
