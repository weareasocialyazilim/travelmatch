# @travelmatch/monitoring

Production monitoring package for TravelMatch using Datadog RUM.

## Usage

### In Mobile App

```typescript
import { monitoringService } from '@travelmatch/monitoring/service';
import { useScreenTracking } from '@travelmatch/monitoring/hooks';

// Initialize in App.tsx
await monitoringService.initialize({
  applicationId: process.env.DD_APP_ID!,
  clientToken: process.env.DD_CLIENT_TOKEN!,
  env: 'production',
  serviceName: 'travelmatch-mobile',
});

// Use in screens
function MomentDetailScreen() {
  useScreenTracking('MomentDetail');
  return <View>...</View>;
}
```

## Features

- Screen view tracking
- Navigation monitoring
- Error tracking
- Performance metrics
- User interaction tracking
