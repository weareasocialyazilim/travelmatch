# MMKV Storage Migration Guide
## Performance Blocker Fix

### Problem
- `react-native-mmkv` NOT installed
- `AsyncStorage` still in use (10x slower disk I/O)
- Cache operations blocking UI thread

### Solution

#### Step 1: Install MMKV
```bash
cd apps/mobile
pnpm add react-native-mmkv
cd ios && pod install && cd ..
```

#### Step 2: Update package.json
```json
{
  "dependencies": {
    "react-native-mmkv": "^2.12.2"
  }
}
```

#### Step 3: Create MMKV storage wrapper
```typescript
// apps/mobile/src/utils/storage.ts
import { MMKV } from 'react-native-mmkv';

// Create default storage instance
export const storage = new MMKV({
  id: 'travelmatch-storage',
  encryptionKey: 'your-encryption-key', // Use secure key from env
});

// Storage API (drop-in AsyncStorage replacement)
export const Storage = {
  setItem: (key: string, value: string) => {
    storage.set(key, value);
    return Promise.resolve();
  },

  getItem: (key: string) => {
    const value = storage.getString(key);
    return Promise.resolve(value ?? null);
  },

  removeItem: (key: string) => {
    storage.delete(key);
    return Promise.resolve();
  },

  clear: () => {
    storage.clearAll();
    return Promise.resolve();
  },

  // Additional MMKV-specific methods
  setObject: <T>(key: string, value: T) => {
    storage.set(key, JSON.stringify(value));
  },

  getObject: <T>(key: string): T | null => {
    const value = storage.getString(key);
    return value ? JSON.parse(value) : null;
  },

  setNumber: (key: string, value: number) => {
    storage.set(key, value);
  },

  getNumber: (key: string): number | undefined => {
    return storage.getNumber(key);
  },

  setBoolean: (key: string, value: boolean) => {
    storage.set(key, value);
  },

  getBoolean: (key: string): boolean | undefined => {
    return storage.getBoolean(key);
  },
};
```

#### Step 4: Replace AsyncStorage usage
```typescript
// ❌ BEFORE
import AsyncStorage from '@react-native-async-storage/async-storage';

await AsyncStorage.setItem('key', 'value');
const value = await AsyncStorage.getItem('key');

// ✅ AFTER
import { Storage } from '@/utils/storage';

Storage.setItem('key', 'value');  // No await needed (synchronous)
const value = Storage.getItem('key');  // But returns Promise for compatibility
```

#### Files to Update:
1. `apps/mobile/src/utils/secureStorage.ts` (HIGH PRIORITY)
2. `apps/mobile/src/stores/searchStore.ts`
3. `apps/mobile/src/stores/uiStore.ts`
4. `apps/mobile/src/stores/favoritesStore.ts`
5. `apps/mobile/src/utils/errorRecovery.ts`
6. `apps/mobile/src/utils/featureFlags.tsx`

#### Performance Impact:
- 10-20x faster read/write operations
- Synchronous API (no async overhead)
- Type-safe (number, boolean, object support)
- Encrypted storage out of the box
- Smaller memory footprint
