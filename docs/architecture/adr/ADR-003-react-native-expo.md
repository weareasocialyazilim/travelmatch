# ADR-003: React Native with Expo

## Status

Accepted

## Date

December 2024

## Context

TravelMatch's primary interface is a mobile application for iOS and Android. We needed to decide on a mobile development approach that would:

1. Support both iOS and Android from a single codebase
2. Enable rapid development and iteration
3. Provide access to native features (camera, location, notifications)
4. Support over-the-air updates
5. Integrate well with our React-based web ecosystem

### Options Considered

1. **Native Development**: Separate iOS (Swift) and Android (Kotlin) apps
2. **Flutter**: Google's cross-platform framework with Dart
3. **React Native (Bare)**: Facebook's cross-platform framework
4. **React Native with Expo**: Managed React Native workflow

## Decision

We chose **React Native with Expo SDK 54** as our mobile development platform.

### Stack Details

```
Framework:     React Native 0.83
Expo SDK:      54.0
Navigation:    React Navigation v7
State:         Zustand
Forms:         React Hook Form + Zod
Maps:          Mapbox (@rnmapbox/maps)
Testing:       Jest + React Native Testing Library
E2E:           Maestro
```

### Project Configuration

```javascript
// app.config.ts
export default {
  expo: {
    name: 'TravelMatch',
    slug: 'travelmatch',
    version: '1.0.0',
    sdkVersion: '54.0.0',
    platforms: ['ios', 'android'],
    ios: {
      bundleIdentifier: 'com.travelmatch.app',
    },
    android: {
      package: 'com.travelmatch.app',
    },
  },
};
```

## Consequences

### Positive

1. **Code Reuse**: ~95% code shared between iOS and Android
2. **Developer Velocity**: Hot reloading, Expo Go for rapid testing
3. **OTA Updates**: Push updates without app store review
4. **Managed Workflow**: Expo handles native configuration
5. **EAS Build**: Cloud-based builds without local Xcode/Android Studio
6. **React Ecosystem**: Leverage existing React knowledge and packages

### Negative

1. **Bundle Size**: Larger than native apps (~50MB+)
2. **Native Modules**: Some require ejecting or custom dev clients
3. **Performance**: Slightly slower than native for complex animations
4. **Debugging**: Bridge-based debugging can be challenging

### Neutral

1. **Expo SDK Updates**: Need to update SDK periodically
2. **Custom Native Code**: Possible but requires development builds
3. **Third-party Libraries**: Most RN libraries work, some need patches

## Key Implementation Decisions

### Navigation Architecture

```typescript
// Using React Navigation v7 with typed routes
const Stack = createNativeStackNavigator<RootStackParamList>();

type RootStackParamList = {
  Home: undefined;
  MomentDetail: { momentId: string };
  Profile: { userId: string };
};
```

### State Management

```typescript
// Zustand stores for global state
const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  signIn: async (email, password) => {
    const { data } = await supabase.auth.signInWithPassword({ email, password });
    set({ user: data.user, session: data.session });
  },
}));
```

### Performance Optimizations

1. **Lazy Loading**: 85+ screens loaded on demand
2. **Sentry Lazy Init**: Deferred error tracking initialization
3. **Image Optimization**: LazyImage component with caching
4. **Flash List**: @shopify/flash-list for performant lists

### Build & Distribution

```yaml
# eas.json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

## Testing Strategy

### Unit & Component Tests

```typescript
// Jest + React Native Testing Library
describe('MomentCard', () => {
  it('renders moment details', () => {
    const { getByText } = render(<MomentCard moment={mockMoment} />);
    expect(getByText(mockMoment.title)).toBeTruthy();
  });
});
```

### E2E Tests

```yaml
# Maestro E2E flow
appId: com.travelmatch.app
---
- launchApp
- tapOn: "Email"
- inputText: "test@example.com"
- tapOn: "Password"
- inputText: "password123"
- tapOn: "Sign In"
- assertVisible: "Welcome back"
```

## Related

- [ADR-004: Zustand State Management](./ADR-004-zustand-state-management.md)
- [Expo Documentation](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org)
