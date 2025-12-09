# Network & Offline Infrastructure

**Status:** ✅ Finalized - Infrastructure Ready (Not Applied to Screens)

## 📦 Infrastructure Components

### 1. NetworkContext & useNetworkStatus Hook

**Location:** `/apps/mobile/src/context/NetworkContext.tsx`

Clean, finalized API for network status monitoring:

```typescript
import { useNetworkStatus } from '@/context';

function MyComponent() {
  const { isConnected, status, refresh } = useNetworkStatus();
  
  // Simple boolean check
  if (!isConnected) {
    return <OfflineState />;
  }
  
  // Detailed network info
  console.log(status.type); // 'wifi' | 'cellular' | null
  console.log(status.isWifi); // boolean
  console.log(status.isCellular); // boolean
}
```

**API:**
```typescript
interface NetworkContextValue {
  // Primary - simple boolean
  isConnected: boolean;
  
  // Detailed network info
  status: {
    isConnected: boolean;
    isInternetReachable: boolean | null;
    type: string | null;
    isWifi: boolean;
    isCellular: boolean;
  };
  
  // Actions
  refresh: () => Promise<void>;
}
```

### 2. NetworkGuard Component

**Location:** `/apps/mobile/src/components/NetworkGuard.tsx`

Wraps children and shows offline state when disconnected:

```typescript
import { NetworkGuard } from '@/components';

// Basic usage - full screen offline state
<NetworkGuard>
  <MyNetworkDependentContent />
</NetworkGuard>

// With custom retry
<NetworkGuard onRetry={refetchData}>
  <DataList />
</NetworkGuard>

// Compact banner mode
<NetworkGuard compact>
  <Content />
</NetworkGuard>

// Custom offline message
<NetworkGuard offlineMessage="Bu özellik internet bağlantısı gerektirir">
  <Feature />
</NetworkGuard>
```

**Props:**
```typescript
interface NetworkGuardProps {
  children: React.ReactNode;
  offlineMessage?: string;
  onRetry?: () => void | Promise<void>;
  compact?: boolean; // Show banner instead of full screen
  offlineProps?: Partial<OfflineStateProps>;
}
```

### 3. OfflineState Component

**Location:** `/apps/mobile/src/components/OfflineState.tsx`

Single source for offline UI - finalized:

```typescript
import { OfflineState } from '@/components';

// Full screen (default)
<OfflineState onRetry={handleRetry} />

// Compact banner
<OfflineState compact onRetry={handleRetry} />

// Custom message
<OfflineState 
  message="Mesajları görmek için internet gerekli"
  retryText="Yeniden Bağlan"
  onRetry={handleRetry}
/>
```

**Props:**
```typescript
interface OfflineStateProps {
  message?: string; // Default: "Bağlantı Yok"
  onRetry?: () => void | Promise<void>;
  retryText?: string; // Default: "Tekrar Dene"
  compact?: boolean; // Default: false
  style?: ViewStyle;
  testID?: string;
}
```

### 4. API Client with Offline Check

**Location:** `/apps/mobile/src/services/apiV1Service.ts`

API client automatically checks network before making requests:

```typescript
import { apiClient } from '@/services/apiV1Service';

// Automatic offline check
const response = await apiClient.get('/moments');

// If offline, returns:
// {
//   success: false,
//   error: {
//     code: 'NETWORK_ERROR',
//     message: 'İnternet bağlantısı yok. Lütfen bağlantınızı kontrol edin.'
//   }
// }
```

**Features:**
- ✅ Checks `NetInfo` before every request
- ✅ Returns meaningful Turkish error messages
- ✅ Prevents unnecessary network calls
- ✅ Fail-open: assumes online if NetInfo fails

### 5. Offline-aware Supabase Hook

**Location:** `/apps/mobile/src/hooks/useOfflineSupabase.ts`

Wraps Supabase queries with automatic offline detection:

```typescript
import { useOfflineSupabase, OfflineError } from '@/hooks';

function MyComponent() {
  const { query } = useOfflineSupabase();
  
  try {
    // Automatic offline check
    const { data, error } = await query('moments')
      .select('*')
      .eq('status', 'active');
    
  } catch (err) {
    if (err instanceof OfflineError) {
      // Handle offline error
      showOfflineMessage();
    }
  }
}
```

**Utility:**
```typescript
import { withOfflineCheck } from '@/hooks';

// Wrap any async function
const safeFetch = withOfflineCheck(async () => {
  return await fetch('https://api.example.com');
});

await safeFetch(); // Throws OfflineError if offline
```

## 🏗️ Architecture

```
App
├── NetworkProvider (context)
│   └── Monitors NetInfo state
│       └── Provides isConnected, status, refresh
│
├── Components
│   ├── NetworkGuard
│   │   └── if (!isConnected) return <OfflineState />
│   │
│   └── OfflineState
│       └── Full screen or compact banner
│
├── API Layer
│   ├── apiV1Service
│   │   └── checkNetwork() before each request
│   │
│   └── useOfflineSupabase
│       └── Proxy wraps supabase.from().select()
│
└── Screens (not yet applied)
    └── Can use NetworkGuard or useNetworkStatus
```

## 📋 Usage Examples

### Example 1: Protect entire screen
```typescript
function MessagesScreen() {
  return (
    <NetworkGuard>
      <MessagesList />
    </NetworkGuard>
  );
}
```

### Example 2: Show banner at top
```typescript
function HomeScreen() {
  const { isConnected } = useNetworkStatus();
  
  return (
    <View>
      {!isConnected && <OfflineState compact />}
      <Content />
    </View>
  );
}
```

### Example 3: Custom retry logic
```typescript
function DataScreen() {
  const { refetch } = useQuery();
  
  return (
    <NetworkGuard 
      onRetry={refetch}
      offlineMessage="Verileri görmek için internet gerekli"
    >
      <DataView />
    </NetworkGuard>
  );
}
```

### Example 4: Conditional rendering
```typescript
function ProfileScreen() {
  const { isConnected } = useNetworkStatus();
  
  if (!isConnected) {
    return <OfflineState onRetry={handleRefresh} />;
  }
  
  return <ProfileContent />;
}
```

## 🎯 Key Features

### ✅ Completed
- [x] Clean `useNetworkStatus` hook with simple API
- [x] `NetworkGuard` component for wrapping sections
- [x] Finalized `OfflineState` component (single source)
- [x] API client with automatic offline checks
- [x] Supabase wrapper with offline detection
- [x] Turkish error messages
- [x] Full screen and compact modes
- [x] Retry button with loading state
- [x] Export all infrastructure components

### 📦 Infrastructure Only
- **Not applied to screens yet** - ready to use when needed
- All components exported and available
- Zero breaking changes to existing code
- Can be gradually adopted screen by screen

## 🔧 Technical Details

### Network Detection Strategy
1. **NetInfo** - Primary source of truth
2. **isConnected** - Device connected to network
3. **isInternetReachable** - Can reach internet
4. **Fail-open** - If NetInfo fails, assume online

### Error Codes
- `NETWORK_ERROR` - No internet connection
- `OFFLINE` - OfflineError thrown from hooks
- `REQUEST_ERROR` - Other fetch errors

### Performance
- Network check adds ~10-50ms to requests
- Prevents failed requests = saves battery
- Uses native NetInfo (fast)
- No polling, event-based updates

## 📁 File Structure

```
apps/mobile/src/
├── context/
│   └── NetworkContext.tsx       ✅ FINALIZED
├── components/
│   ├── NetworkGuard.tsx         ✅ FINALIZED  
│   ├── OfflineState.tsx         ✅ FINALIZED
│   └── index.ts                 ✅ EXPORTS ADDED
├── hooks/
│   ├── useOfflineSupabase.ts    ✅ FINALIZED
│   └── index.ts                 ✅ EXPORTS ADDED
└── services/
    └── apiV1Service.ts          ✅ OFFLINE CHECK ADDED
```

## 🚀 Next Steps (When Ready)

1. **Apply to critical screens:**
   - MessagesScreen
   - ChatScreen
   - DiscoverScreen
   
2. **Add to features that require network:**
   - Payment flows
   - Upload features
   - Real-time features

3. **Custom implementations:**
   - Offline mode for cached data
   - Queue failed requests
   - Sync when back online

## 🧪 Testing

```typescript
// Test offline behavior
import { OfflineError } from '@/hooks';

test('should throw OfflineError when offline', async () => {
  // Mock NetInfo
  NetInfo.fetch.mockResolvedValue({ 
    isConnected: false 
  });
  
  const { query } = useOfflineSupabase();
  
  await expect(
    query('moments').select('*')
  ).rejects.toThrow(OfflineError);
});
```

## 💡 Best Practices

1. **Use NetworkGuard** for sections that absolutely need network
2. **Use useNetworkStatus** for conditional rendering
3. **Always provide retry callback** for better UX
4. **Use compact mode** for non-critical offline states
5. **Provide context-specific messages** instead of generic ones

## ⚠️ Important Notes

- Infrastructure is **ready but not applied** to screens
- No breaking changes to existing code
- All exports are available in component/hook indexes
- API client automatically checks network (transparent)
- Can be adopted gradually, screen by screen
- Turkish error messages for user-facing content
