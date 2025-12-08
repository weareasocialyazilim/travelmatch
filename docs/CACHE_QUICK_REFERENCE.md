# Cache Service v2.0 - Quick Reference

## Installation

```bash
npm install pako @types/pako
```

## Initialization

```typescript
// App.tsx
import { cacheService } from '@/services/cacheService';

useEffect(() => {
  cacheService.initialize();
  return () => cacheService.destroy();
}, []);
```

## Basic Usage

```typescript
// Set cache (with 5 minute TTL)
await cacheService.set('key', data, { expiryMs: 5 * 60 * 1000 });

// Get cache
const data = await cacheService.get('key');

// Remove cache
await cacheService.remove('key');

// Clear all expired
await cacheService.clearExpired();

// Clear everything
await cacheService.clearAll();
```

## Advanced Usage

```typescript
// Get statistics
const stats = await cacheService.getStats();
console.log(`Cache: ${stats.totalSizeFormatted} / ${stats.maxSizeFormatted}`);
console.log(`Usage: ${stats.usagePercentage.toFixed(1)}%`);
console.log(`Compressed: ${stats.compressedItems} items`);

// Invalidate by pattern
await cacheService.invalidateByPattern('user_profile_');

// Check if exists
const exists = await cacheService.has('key');
```

## Configuration

```typescript
// In cacheService.ts
const MAX_CACHE_SIZE_MB = 50;           // Total: 50MB
const MAX_MEMORY_CACHE_ITEMS = 100;     // Memory: 100 items
const COMPRESSION_THRESHOLD_BYTES = 10 * 1024;  // Compress >10KB
const CLEANUP_INTERVAL_MS = 60 * 1000;  // Cleanup: 60s
```

## Cache Keys

```typescript
import { CACHE_KEYS } from '@/services/cacheService';

CACHE_KEYS.MOMENTS               // 'moments'
CACHE_KEYS.MY_MOMENTS            // 'my_moments'
CACHE_KEYS.WALLET                // 'wallet'
CACHE_KEYS.USER_PROFILE(userId)  // 'user_profile_{userId}'
CACHE_KEYS.MOMENT_DETAIL(id)     // 'moment_{id}'
```

## Monitoring

```typescript
// Get stats periodically
setInterval(async () => {
  const stats = await cacheService.getStats();
  
  if (stats.usagePercentage > 90) {
    console.warn('Cache almost full!');
  }
  
  console.log('Top accessed:', stats.mostAccessed);
}, 60000); // Every minute
```

## Best Practices

### ✅ DO

```typescript
// 1. Use appropriate TTL
await cacheService.set('profile', data, { expiryMs: 5 * 60 * 1000 });

// 2. Clear on logout
await cacheService.clearAll();

// 3. Monitor usage
const stats = await cacheService.getStats();
logger.info('Cache stats', stats);
```

### ❌ DON'T

```typescript
// 1. Don't cache sensitive data
await cacheService.set('password', pass); // BAD

// 2. Don't cache huge items
await cacheService.set('video', 5MB_buffer); // BAD

// 3. Don't ignore errors
await cacheService.set(key, data).catch(() => {}); // BAD
```

## Debugging

```typescript
// Enable debug logs
import { logger } from '@/utils/logger';
logger.setLevel('debug');

// Check cache state
const allKeys = await AsyncStorage.getAllKeys();
const cacheKeys = allKeys.filter(k => k.startsWith('@travelmatch_cache_'));
console.log('Cache keys:', cacheKeys.length);

// Inspect item
const item = await cacheService.get('moments');
console.log('Moments:', item);
```

## Performance

| Operation | Time |
|-----------|------|
| Memory get (hit) | <1ms |
| Storage get | 5-10ms |
| Set | 2-5ms |
| Compress (50KB) | 8ms |
| Decompress (50KB) | 3ms |

## Limits

| Resource | Limit |
|----------|-------|
| Total cache size | 50MB |
| Memory items | 100 |
| Item before compression | 10KB |
| Cleanup interval | 60s |

## Edge Functions Deployment

```bash
# Deploy payment functions
supabase functions deploy create-payment-intent
supabase functions deploy confirm-payment
supabase functions deploy stripe-webhook

# Set secrets
supabase secrets set STRIPE_SECRET_KEY=sk_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

## Troubleshooting

### Cache Full
```typescript
// Clear old data
await cacheService.clearExpired();

// Reduce TTL
await cacheService.set('key', data, { expiryMs: 60000 }); // 1 min
```

### Memory Leak
```typescript
// Ensure cleanup
useEffect(() => {
  return () => cacheService.destroy();
}, []);

// Force cleanup
cacheService.clearMemoryCache();
```

### Poor Compression
```typescript
// Check stats
const stats = await cacheService.getStats();
console.log('Avg size:', stats.averageItemSize);

// Only cache necessary data
await cacheService.set('user', { id, name, imageUrl });
```

---

**Quick Help**: Check `docs/CACHE_IMPROVEMENTS.md` for full documentation
