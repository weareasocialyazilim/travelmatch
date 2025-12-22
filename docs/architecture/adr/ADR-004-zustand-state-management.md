# ADR-004: Zustand for State Management

## Status

Accepted

## Date

December 2024

## Context

TravelMatch's mobile app requires client-side state management for:

1. Authentication state (user, session, tokens)
2. Application data (moments, conversations, notifications)
3. UI state (filters, navigation state, modals)
4. Cache management (offline support)

### Options Considered

1. **Redux + Redux Toolkit**: Industry standard, verbose
2. **MobX**: Observable-based, class-heavy
3. **Recoil**: Facebook's atomic state management
4. **Zustand**: Minimal, hooks-based state management
5. **Jotai**: Atomic model similar to Recoil
6. **React Context**: Built-in, but re-render issues

## Decision

We chose **Zustand v5** as our primary state management solution.

### Key Reasons

1. **Minimal API**: Simple hooks-based interface
2. **TypeScript First**: Excellent type inference
3. **Small Bundle**: ~2KB minified
4. **No Boilerplate**: No actions, reducers, selectors
5. **React 19 Compatible**: Works with concurrent features

## Implementation

### Store Structure

```
stores/
├── authStore.ts       # Authentication state
├── momentStore.ts     # Moments/experiences
├── chatStore.ts       # Messaging
├── notificationStore.ts
├── uiStore.ts         # UI state
└── index.ts           # Re-exports
```

### Basic Store Example

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;

  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: false,

      signIn: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          set({ user: data.user, session: data.session });
        } finally {
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null });
      },

      refreshSession: async () => {
        const { data } = await supabase.auth.refreshSession();
        set({ session: data.session });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        // Don't persist session - handle via Supabase
      }),
    }
  )
);
```

### Computed Values (Selectors)

```typescript
// Selectors with shallow comparison
export const useIsAuthenticated = () =>
  useAuthStore((state) => !!state.session);

export const useUserProfile = () =>
  useAuthStore((state) => state.user?.profile);
```

### Store with Async Actions

```typescript
// stores/momentStore.ts
interface MomentState {
  moments: Moment[];
  isLoading: boolean;
  error: string | null;
  filters: FilterState;

  fetchMoments: () => Promise<void>;
  createMoment: (data: CreateMomentInput) => Promise<Moment>;
  setFilters: (filters: Partial<FilterState>) => void;
}

export const useMomentStore = create<MomentState>((set, get) => ({
  moments: [],
  isLoading: false,
  error: null,
  filters: defaultFilters,

  fetchMoments: async () => {
    const { filters } = get();
    set({ isLoading: true, error: null });

    try {
      let query = supabase
        .from('moments')
        .select('*, user:users(*)')
        .eq('status', 'active');

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;
      if (error) throw error;

      set({ moments: data });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  createMoment: async (input) => {
    const { data, error } = await supabase
      .from('moments')
      .insert(input)
      .select()
      .single();

    if (error) throw error;

    set((state) => ({
      moments: [data, ...state.moments],
    }));

    return data;
  },

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
}));
```

### Real-time Subscriptions

```typescript
// stores/chatStore.ts
export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],

  subscribeToMessages: (conversationId: string) => {
    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          set((state) => ({
            messages: [...state.messages, payload.new as Message],
          }));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },
}));
```

## Consequences

### Positive

1. **Simple Mental Model**: State is just objects, actions are just functions
2. **TypeScript Excellence**: Full type inference without casting
3. **Performance**: Automatic render optimization with selector functions
4. **Middleware**: Easy persistence, devtools, immer integration
5. **Testing**: Stores are easily testable pure functions
6. **Bundle Size**: Minimal impact on app size

### Negative

1. **No DevTools Out-of-box**: Need middleware for Redux DevTools
2. **No Structure**: Teams need to establish conventions
3. **Scaling**: Large apps need store organization patterns

### Neutral

1. **Migration**: Easy to migrate from Redux or Context
2. **Learning**: Different paradigm from Redux
3. **Community**: Smaller than Redux but growing

## Best Practices

### 1. Store Organization

```
stores/
├── auth/
│   ├── store.ts
│   ├── selectors.ts
│   └── types.ts
├── moments/
│   ├── store.ts
│   └── selectors.ts
└── index.ts
```

### 2. Selector Usage

```typescript
// Bad: Re-renders on any state change
const { user, settings } = useAuthStore();

// Good: Re-renders only when user changes
const user = useAuthStore((state) => state.user);
```

### 3. Actions Outside Components

```typescript
// Access store outside React
const { signOut } = useAuthStore.getState();
await signOut();
```

## Related

- [ADR-003: React Native with Expo](./ADR-003-react-native-expo.md)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
