# @lovendo/monitoring

Production monitoring package for Lovendo using Datadog RUM.

## Usage

### In Mobile App

```typescript
import { monitoringService } from '@lovendo/monitoring/service';
import { useScreenTracking } from '@lovendo/monitoring/hooks';

// Initialize in App.tsx
await monitoringService.initialize({
  applicationId: process.env.DD_APP_ID!,
  clientToken: process.env.DD_CLIENT_TOKEN!,
  env: 'production',
  serviceName: 'lovendo-mobile',
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
