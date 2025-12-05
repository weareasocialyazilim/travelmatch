# Stores

Zustand state management stores for global application state.

## Available Stores

| Store | Description |
|-------|-------------|
| `authStore` | Authentication state, user session, tokens |
| `favoritesStore` | User favorites/bookmarks |
| `searchStore` | Search filters and history |
| `uiStore` | UI state (modals, toasts, theme) |

## Usage

### authStore

Manages user authentication and session:

```typescript
import { useAuthStore } from '@/stores/authStore';

function LoginScreen() {
  const { login, isLoading, user } = useAuthStore();
  
  const handleLogin = async () => {
    await login(email, password);
  };
  
  if (user) {
    return <Text>Welcome, {user.name}!</Text>;
  }
}
```

**Actions:**
- `login(email, password)` - Authenticate user
- `register(name, email, password)` - Create new account
- `logout()` - Clear session
- `updateUser(updates)` - Update user profile
- `refreshAuth()` - Refresh access token
- `setTokens(token, refreshToken)` - Set auth tokens

**State:**
- `user` - Current user object
- `token` - Access token
- `refreshToken` - Refresh token
- `isAuthenticated` - Auth status
- `isLoading` - Loading state

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

### uiStore

Manages global UI state:

```typescript
import { useUIStore } from '@/stores/uiStore';

function App() {
  const { theme, setTheme, showToast } = useUIStore();
  
  const handleSuccess = () => {
    showToast({ message: 'Success!', type: 'success' });
  };
}
```

## Persistence

Stores use Zustand's persist middleware with AsyncStorage:

```typescript
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // ... state and actions
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist these fields
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
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
       }
     );
     return unsubscribe;
   }, []);
   ```

## Testing

```typescript
import { useAuthStore } from '../authStore';
import { act } from '@testing-library/react-native';

beforeEach(() => {
  // Reset store before each test
  act(() => {
    useAuthStore.getState().logout();
  });
});

test('login sets user and tokens', async () => {
  await act(async () => {
    await useAuthStore.getState().login('test@example.com', 'password');
  });
  
  const { user, isAuthenticated } = useAuthStore.getState();
  expect(user).not.toBeNull();
  expect(isAuthenticated).toBe(true);
});
```
