# Background Job Queue Service

## Overview

High-performance background job processing using BullMQ and Redis for long-running tasks.

## Features

- ✅ **KYC Verification Queue** - Offload KYC processing from synchronous requests
- ✅ **Image Processing Queue** - Resize, optimize, and transform images
- ✅ **Email Queue** - Send emails asynchronously
- ✅ **Notification Queue** - Push notifications and SMS
- ✅ **Analytics Queue** - Process analytics events
- ✅ **Retry Logic** - Automatic retry with exponential backoff
- ✅ **Priority Support** - High/Medium/Low priority jobs
- ✅ **Job Monitoring** - Bull Board UI for monitoring
- ✅ **Dead Letter Queue** - Failed jobs for manual review

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    API/Edge Functions                        │
│  (Add jobs to queue instead of processing synchronously)    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Redis Queue                             │
│  • Fast in-memory job storage                                │
│  • Persistence enabled                                       │
│  • Pub/Sub for job events                                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    BullMQ Workers                            │
│  • Multiple workers for parallel processing                  │
│  • Auto-scaling based on queue depth                         │
│  • Graceful shutdown                                         │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              External Services / Database                    │
│  • Supabase (update status)                                  │
│  • KYC Providers (Onfido, idenfy)                             │
│  • Email Services (SendGrid, Mailgun)                        │
│  • Image Processing (Sharp, Cloudflare Images)               │
└─────────────────────────────────────────────────────────────┘
```

## Queues

### 1. KYC Verification Queue

**Purpose**: Offload KYC document verification from sync requests

**Before** (Synchronous - timeout risk):

```typescript
// Edge Function (timeout after 30s)
POST /verify-kyc
→ Call KYC provider (5-30s)
→ Update database
→ Return response
// Problem: Can timeout, blocking user
```

**After** (Asynchronous):

```typescript
// Edge Function (instant response)
POST /verify-kyc
→ Add job to queue (< 100ms)
→ Return job ID immediately

// Worker (background)
→ Process KYC (5-30s, no timeout)
→ Update database
→ Send notification to user
```

**Job Data**:

```typescript
{
  userId: string;
  documentType: 'passport' | 'id_card' | 'driving_license';
  documentNumber: string;
  frontImageUrl: string;
  backImageUrl?: string;
  provider: 'onfido' | 'idenfy';
}
```

**Configuration**:

- Priority: High
- Attempts: 3
- Backoff: Exponential (1min, 5min, 15min)
- Timeout: 60s per attempt

### 2. Image Processing Queue

**Purpose**: Resize and optimize images asynchronously

**Job Data**:

```typescript
{
  imageUrl: string;
  userId: string;
  type: 'profile' | 'moment' | 'proof';
  sizes: Array<{ width: number; height: number; format: 'webp' | 'jpeg' }>;
}
```

**Configuration**:

- Priority: Medium
- Attempts: 3
- Timeout: 30s

### 3. Email Queue

**Purpose**: Send emails without blocking requests

**Job Data**:

```typescript
{
  to: string;
  template: string;
  data: Record<string, any>;
  provider: 'sendgrid' | 'mailgun';
}
```

**Configuration**:

- Priority: Medium
- Attempts: 5
- Rate Limit: 100 emails/min

### 4. Notification Queue

**Purpose**: Send push notifications and SMS

**Job Data**:

```typescript
{
  userId: string;
  type: 'push' | 'sms';
  title: string;
  body: string;
  data?: Record<string, any>;
}
```

**Configuration**:

- Priority: High
- Attempts: 3

## Setup

### 1. Start Redis

```bash
# Using Docker
docker-compose up redis -d

# Or local Redis
redis-server
```

### 2. Install Dependencies

```bash
cd services/job-queue
pnpm install
```

### 3. Configure Environment

```bash
# .env
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-password

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key

# KYC Providers
ONFIDO_API_KEY=your-key
IDENFY_API_KEY=your-key

# Email
SENDGRID_API_KEY=your-key
```

### 4. Start Workers

```bash
# Development
pnpm dev

# Production
pnpm build
pnpm start
```

### 5. Monitor Jobs (Bull Board UI)

```bash
# Start dashboard
pnpm queue:ui

# Visit: http://localhost:3002
```

## Usage

### Add Job to Queue (from Edge Function)

```typescript
// supabase/functions/verify-kyc/index.ts
import { createClient } from '@supabase/supabase-js';
import { Queue } from 'bullmq';
import Redis from 'ioredis';

const redis = new Redis(Deno.env.get('REDIS_URL'));
const kycQueue = new Queue('kyc-verification', { connection: redis });

serve(async (req) => {
  const user = await getUser(req);
  const data = await req.json();

  // Add job to queue instead of processing immediately
  const job = await kycQueue.add(
    'verify',
    {
      userId: user.id,
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      frontImageUrl: data.frontImage,
      backImageUrl: data.backImage,
      provider: 'onfido',
    },
    {
      priority: 1, // High priority
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 60000, // 1 minute
      },
    },
  );

  // Return job ID immediately (instant response)
  return new Response(
    JSON.stringify({
      jobId: job.id,
      status: 'queued',
      message: 'KYC verification queued. You will be notified when complete.',
    }),
    {
      status: 202, // Accepted
      headers: { 'Content-Type': 'application/json' },
    },
  );
});
```

### Check Job Status

```typescript
// GET /job-status/:jobId
const job = await kycQueue.getJob(jobId);

if (!job) {
  return { status: 'not_found' };
}

return {
  id: job.id,
  status: await job.getState(), // 'completed', 'failed', 'active', 'waiting'
  progress: job.progress,
  result: job.returnvalue,
  failedReason: job.failedReason,
};
```

## Worker Implementation

### KYC Worker

```typescript
// src/workers/kyc-worker.ts
import { Worker, Job } from 'bullmq';
import { createClient } from '@supabase/supabase-js';

const worker = new Worker(
  'kyc-verification',
  async (job: Job) => {
    const { userId, documentType, frontImageUrl, provider } = job.data;

    try {
      // Update status to processing
      await updateKycStatus(userId, 'processing');

      // Call KYC provider (can take 5-30s, no timeout issue)
      let verificationResult;

      if (provider === 'onfido') {
        verificationResult = await verifyWithOnfido(job.data);
      } else if (provider === 'idenfy') {
        verificationResult = await verifyWithIdenfy(job.data);
      }

      // Update job progress
      job.updateProgress(50);

      // Update database
      await updateKycStatus(userId, verificationResult.status);

      // Update progress
      job.updateProgress(75);

      // Send notification to user
      await sendNotification(userId, {
        type: 'kyc_completed',
        status: verificationResult.status,
      });

      // Complete
      job.updateProgress(100);

      return {
        success: true,
        status: verificationResult.status,
        completedAt: new Date().toISOString(),
      };
    } catch (error) {
      // Log error
      console.error('KYC verification failed:', error);

      // Update status to failed
      await updateKycStatus(userId, 'failed');

      throw error; // Will trigger retry
    }
  },
  {
    connection: redis,
    concurrency: 5, // Process 5 jobs in parallel
  },
);

// Event handlers
worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on('failed', (job, error) => {
  console.error(`Job ${job?.id} failed:`, error);
});

worker.on('stalled', (jobId) => {
  console.warn(`Job ${jobId} stalled`);
});
```

## Performance

### Before (Synchronous)

- Request timeout: 30s
- Blocking: User waits entire time
- Failure rate: 10% (timeouts)
- Concurrent requests: Limited by function concurrency

### After (Queue-based)

- API response: < 100ms
- Blocking: None (job ID returned)
- Failure rate: < 1% (retries + no timeout)
- Concurrent processing: Unlimited (auto-scaling workers)

## Monitoring

### Bull Board Dashboard

```
http://localhost:3002

Features:
- View active/waiting/completed/failed jobs
- Retry failed jobs manually
- Clean old jobs
- Pause/Resume queues
- View job details and logs
```

### Metrics to Track

- Queue depth (waiting jobs)
- Processing time (p50, p95, p99)
- Success/failure rate
- Retry count
- Worker utilization

### Alerts

- Queue depth > 1000 → Scale workers
- Failure rate > 5% → Investigate errors
- Processing time > 60s → Check provider API
- Dead letter queue not empty → Manual review needed

## Scaling

### Horizontal Scaling

```bash
# Run multiple workers
docker-compose up --scale job-worker=5
```

### Auto-scaling (Kubernetes)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: job-worker
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: job-worker
  minReplicas: 2
  maxReplicas: 20
  metrics:
    - type: External
      external:
        metric:
          name: bullmq_queue_waiting
        target:
          type: AverageValue
          averageValue: '100' # Scale when > 100 jobs waiting
```

## Best Practices

1. **Idempotency**: Jobs should be safe to retry
2. **Timeouts**: Set reasonable timeouts per job
3. **Backoff**: Use exponential backoff for retries
4. **Dead Letter Queue**: Review failed jobs manually
5. **Monitoring**: Track queue depth and processing time
6. **Rate Limiting**: Prevent overwhelming external APIs
7. **Priority**: Use priority for time-sensitive jobs
8. **Cleanup**: Remove old completed jobs regularly

## Migration Guide

### Step 1: Update Edge Function

```typescript
// Before: Synchronous
const result = await verifyKyc(data); // Can timeout
return Response.json(result);

// After: Queue-based
const job = await kycQueue.add('verify', data);
return Response.json({ jobId: job.id, status: 'queued' }, { status: 202 });
```

### Step 2: Implement Worker

```typescript
// Create worker in job-queue service
const worker = new Worker('kyc-verification', processKyc);
```

### Step 3: Add Job Status Endpoint

```typescript
// GET /job-status/:jobId
const job = await kycQueue.getJob(jobId);
return Response.json({ status: await job.getState() });
```

### Step 4: Notify on Completion

```typescript
// Worker sends notification when done
await sendNotification(userId, { type: 'kyc_completed', status });
```

## Testing

```bash
# Add test job
pnpm test:add-job

# Process jobs
pnpm test:worker

# Check status
pnpm test:status
```

## Production Checklist

- [ ] Redis persistence enabled
- [ ] Redis password set
- [ ] Multiple workers running
- [ ] Bull Board secured (authentication)
- [ ] Monitoring/alerting configured
- [ ] Dead letter queue cleanup scheduled
- [ ] Rate limiting configured
- [ ] Auto-scaling enabled
- [ ] Logs aggregated (Datadog, CloudWatch)
- [ ] Graceful shutdown implemented

## Resources

- [BullMQ Docs](https://docs.bullmq.io/)
- [Bull Board](https://github.com/felixmosh/bull-board)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
