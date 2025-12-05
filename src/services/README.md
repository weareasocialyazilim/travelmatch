# Services

This directory contains service modules that handle API communication and external integrations.

## Service Modules

### API Services

| Service | Description |
|---------|-------------|
| `api.ts` | Base API client with interceptors, token refresh, retry logic |
| `paymentService.ts` | Payment processing, wallet, transactions |
| `cacheService.ts` | Offline caching with AsyncStorage |
| `notificationService.ts` | Push notification handling |
| `analyticsService.ts` | Analytics event tracking |

### Usage

```typescript
import { paymentService } from '@/services/paymentService';

// Get wallet balance
const { balance } = await paymentService.getWalletBalance();

// Create payment intent
const { paymentIntent } = await paymentService.createPaymentIntent({
  momentId: 'moment-123',
  amount: 50,
});
```

## API Client

The base API client (`api.ts`) provides:

- **Token Management**: Automatic token refresh on 401 errors
- **Retry Logic**: Exponential backoff for failed requests
- **Error Handling**: Standardized error responses
- **Timeout Handling**: Request timeout with abort controller
- **Logging**: Debug logging for API calls

### Configuration

```typescript
// API configuration in config/api.ts
export const API_CONFIG = {
  BASE_URL: 'https://api.travelmatch.com',
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
};
```

## Caching

The cache service provides offline support:

```typescript
import { cacheService } from '@/services/cacheService';

// Set with expiry (30 minutes default)
await cacheService.set('moments', data, 30 * 60 * 1000);

// Get with stale-while-revalidate support
const { data, isStale } = await cacheService.getWithStale('moments');

// Clear all cache
await cacheService.clearAll();
```

## Error Handling

All services use centralized error handling:

```typescript
import { ErrorHandler } from '@/utils/errorHandler';

try {
  await paymentService.confirmPayment(intentId);
} catch (error) {
  ErrorHandler.handle(error, 'PaymentConfirmation');
}
```

## Testing

Tests are located in `__tests__/` directory:

```bash
npm test -- --testPathPattern="services"
```
