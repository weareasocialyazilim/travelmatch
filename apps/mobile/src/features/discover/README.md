# Discover Feature

Profile discovery and matching functionality.

## Overview

The discover feature handles the core matching experience:
- Swipeable profile cards
- Advanced filtering
- Match notifications
- Search functionality

## Structure

```
discover/
├── screens/
│   ├── DiscoverScreen.tsx       # Main swipe screen
│   ├── FiltersScreen.tsx        # Advanced filters
│   └── SearchResultsScreen.tsx  # Search results
├── components/
│   ├── ProfileCard.tsx          # Swipeable card
│   ├── MatchAnimation.tsx       # Match celebration
│   ├── FilterBottomSheet.tsx    # Filter UI
│   └── ActiveFilters.tsx        # Filter chips
├── hooks/
│   ├── useDiscover.ts          # Discovery feed
│   ├── useSwipe.ts             # Swipe actions
│   ├── useFilters.ts           # Filter state
│   └── useMatches.ts           # Matches list
├── services/
│   ├── discoverService.ts      # Discovery API
│   └── matchService.ts         # Matching logic
└── types/
    └── discover.types.ts       # Type definitions
```

## Screens

### DiscoverScreen
Main discovery screen with swipeable profile cards.

**Features:**
- Swipe right to like
- Swipe left to pass
- Super like gesture
- Undo last swipe
- Filter access

### FiltersScreen
Advanced filtering options.

**Filters:**
- Age range
- Distance
- Gender
- Interests
- Travel dates
- Destinations

### SearchResultsScreen
Search results with filtering.

## Components

### ProfileCard
Swipeable profile card with photo carousel.

### MatchAnimation
Celebration animation when users match.

### FilterBottomSheet
Bottom sheet for quick filters.

## Hooks

### useDiscover
```typescript
const {
  profiles,
  loading,
  hasMore,
  loadMore,
  filters,
} = useDiscover();
```

### useSwipe
```typescript
const {
  swipeLeft,
  swipeRight,
  superLike,
  undo,
} = useSwipe();
```

### useFilters
```typescript
const {
  filters,
  updateFilters,
  resetFilters,
  activeFilterCount,
} = useFilters();
```

## API

### Discovery Feed
- `GET /api/v1/discover` - Get discovery feed
- `POST /api/v1/discover/like` - Like profile
- `POST /api/v1/discover/pass` - Pass profile
- `POST /api/v1/discover/super-like` - Super like

### Matches
- `GET /api/v1/matches` - Get matches list
- `GET /api/v1/matches/:id` - Get match details

## State Management

Uses Zustand for filter state:
```typescript
interface FilterState {
  ageRange: [number, number];
  distance: number;
  gender: string[];
  interests: string[];
}
```

## Testing

```bash
# Unit tests
pnpm test:unit features/discover

# Integration tests
pnpm test:integration features/discover

# E2E tests
pnpm test:e2e features/discover
```

## Performance

- **Card prefetch**: Prefetch next 3 profiles
- **Image optimization**: Cloudflare CDN + local cache
- **Lazy loading**: Load profiles on demand
- **Debounced filters**: Debounce filter changes

## Dependencies

- `react-native-gesture-handler` - Swipe gestures
- `react-native-reanimated` - Animations
- `zustand` - Filter state
- `@tanstack/react-query` - Data fetching
