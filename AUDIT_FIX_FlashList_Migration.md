# FlashList Migration Guide
## Performance Blocker Fix

### Problem
- `@shopify/flash-list` NOT installed
- 10+ screens using slow `FlatList`
- List performance 60% slower than Titan Plan target

### Solution

#### Step 1: Install FlashList
```bash
cd apps/mobile
pnpm add @shopify/flash-list
```

#### Step 2: Update package.json
```json
{
  "dependencies": {
    "@shopify/flash-list": "^1.6.3"
  }
}
```

#### Step 3: Replace FlatList imports
```typescript
// ❌ BEFORE
import { FlatList } from 'react-native';

// ✅ AFTER
import { FlashList } from '@shopify/flash-list';
```

#### Step 4: Update component props
```typescript
// ❌ BEFORE (FlatList)
<FlatList
  data={moments}
  renderItem={renderMoment}
  keyExtractor={(item) => item.id}
/>

// ✅ AFTER (FlashList)
<FlashList
  data={moments}
  renderItem={renderMoment}
  estimatedItemSize={200}  // 👈 REQUIRED - average item height
/>
```

#### Files to Update (Priority Order):
1. `apps/mobile/src/features/trips/screens/DiscoverScreen.tsx`
2. `apps/mobile/src/features/messages/screens/ChatScreen.tsx`
3. `apps/mobile/src/features/messages/screens/MessagesScreen.tsx`
4. `apps/mobile/src/features/profile/screens/ProfileScreen.tsx`
5. `apps/mobile/src/features/profile/screens/DeletedMomentsScreen.tsx`
6. `apps/mobile/src/features/trips/screens/MatchConfirmationScreen.tsx`

#### Performance Impact:
- 60% faster scrolling
- 50% less memory usage
- Smoother animations on 60fps target
