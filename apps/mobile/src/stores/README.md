# Stores

Zustand state management stores for global application state.

## Available Stores

| Store            | Description                               |
| ---------------- | ----------------------------------------- |
| `favoritesStore` | User favorites/bookmarks                  |
| `searchStore`    | Search filters and history                |
| `modalStore`     | Centralized modal/bottom sheet management |

> **Note:** UI state is managed via `I18nContext` (language) and `useOnboarding()` hook.
> Authentication is handled by Supabase Auth directly via `sessionManager`.

## Usage

### favoritesStore

Manages user's saved moments:

```typescript
import { useFavoritesStore } from '@/stores/favoritesStore';

function MomentCard({ moment }) {
  const { favorites, addFavorite, removeFavorite } = useFavoritesStore();
  const isFavorite = favorites.includes(moment.id);

  const handleToggle = () => {
    isFavorite ? removeFavorite(moment.id) : addFavorite(moment.id);
  };
}
```

### searchStore

Manages search state and filters:

```typescript
import { useSearchStore } from '@/stores/searchStore';

function SearchScreen() {
  const { filters, setFilters, clearFilters, recentSearches } = useSearchStore();

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };
}
```

## Persistence

Stores use Zustand's persist middleware with MMKV (10-20x faster than AsyncStorage):

```typescript
import { Storage } from '../utils/storage';

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      // ... state and actions
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => Storage),
    },
  ),
);
```

## Best Practices

1. **Selectors**: Use selectors for derived state

   ```typescript
   const isLoggedIn = useAuthStore((state) => state.isAuthenticated);
   ```

2. **Actions**: Keep actions pure, handle side effects in components

   ```typescript
   // ✅ Good - pure action
   logout: () => set({ user: null, token: null });

   // ❌ Bad - side effect in action
   logout: () => {
     navigation.navigate('Login'); // Don't do this
     set({ user: null });
   };
   ```

3. **Subscriptions**: Use subscribe for external effects
   ```typescript
   useEffect(() => {
     const unsubscribe = useAuthStore.subscribe(
       (state) => state.token,
       (token) => {
         // Token changed, update headers
         api.setToken(token);
       },
     );
     return unsubscribe;
   }, []);
   ```

## Testing

```typescript
import { useFavoritesStore } from '../favoritesStore';
import { act, renderHook } from '@testing-library/react-native';

beforeEach(() => {
  // Reset store before each test
  act(() => {
    useFavoritesStore.setState({ favorites: [] });
  });
});

test('addFavorite adds moment to favorites', () => {
  const { result } = renderHook(() => useFavoritesStore());

  act(() => {
    result.current.addFavorite('moment-123');
  });

  expect(result.current.favorites).toContain('moment-123');
});
```
