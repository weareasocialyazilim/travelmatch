import express, { Request, Response, NextFunction } from 'express';
import { Queue, ConnectionOptions } from 'bullmq';
import Redis from 'ioredis';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { ExpressAdapter } from '@bull-board/express';
import crypto from 'crypto';
import {
  KycJobSchema,
  ImageJobSchema,
  EmailJobSchema,
  NotificationJobSchema,
  AnalyticsJobSchema,
  JobPriorities,
  QueueNames,
} from './jobs/index.js';
import { logger } from '@lovendo/shared';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Security: Disable X-Powered-By header to prevent information disclosure
app.disable('x-powered-by');

app.use(express.json());

// ============================================================
// SECURITY: API Key Authentication Middleware (VULN-002 FIX)
// ============================================================
const JOB_QUEUE_API_KEY = process.env.JOB_QUEUE_API_KEY;

if (!JOB_QUEUE_API_KEY) {
  logger.error('CRITICAL: JOB_QUEUE_API_KEY environment variable is not set!');
  logger.error(
    'The job queue service will reject all requests until this is configured.',
  );
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/**
 * Authentication middleware for protected endpoints
 * Requires X-API-Key header with valid API key
 */
function authenticateApiKey(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const apiKey = req.headers['x-api-key'] as string | undefined;

  if (!JOB_QUEUE_API_KEY) {
    res.status(503).json({
      error: 'Service temporarily unavailable',
      message: 'API key not configured on server',
    });
    return;
  }

  if (!apiKey) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing X-API-Key header',
    });
    return;
  }

  if (!secureCompare(apiKey, JOB_QUEUE_API_KEY)) {
    // Log failed authentication attempts
    logger.warn('[SECURITY] Failed authentication attempt', { ip: req.ip });
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid API key',
    });
    return;
  }

  next();
}

// Rate limiting for job queue (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute per IP

function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const ip = req.ip || 'unknown';
  const now = Date.now();

  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    next();
    return;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    });
    return;
  }

  entry.count++;
  next();
}

// Clean up old rate limit entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW_MS);

// Create Redis connection
const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  password: process.env.REDIS_PASSWORD,
});

// Type assertion for BullMQ compatibility
const redisConnection = redis as unknown as ConnectionOptions;

// Create queues
const kycQueue = new Queue(QueueNames.KYC_VERIFICATION, {
  connection: redisConnection,
});
const imageQueue = new Queue(QueueNames.IMAGE_PROCESSING, {
  connection: redisConnection,
});
const emailQueue = new Queue(QueueNames.EMAIL, { connection: redisConnection });
const notificationQueue = new Queue(QueueNames.NOTIFICATION, {
  connection: redisConnection,
});
const analyticsQueue = new Queue(QueueNames.ANALYTICS, {
  connection: redisConnection,
});

// Setup Bull Board (job monitoring UI)
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [
    new BullMQAdapter(kycQueue) as unknown as Parameters<
      typeof createBullBoard
    >[0]['queues'][number],
    new BullMQAdapter(imageQueue) as unknown as Parameters<
      typeof createBullBoard
    >[0]['queues'][number],
    new BullMQAdapter(emailQueue) as unknown as Parameters<
      typeof createBullBoard
    >[0]['queues'][number],
    new BullMQAdapter(notificationQueue) as unknown as Parameters<
      typeof createBullBoard
    >[0]['queues'][number],
    new BullMQAdapter(analyticsQueue) as unknown as Parameters<
      typeof createBullBoard
    >[0]['queues'][number],
  ],
  serverAdapter,
});

// SECURITY: Protect Bull Board admin UI with authentication (VULN-002)
app.use('/admin/queues', authenticateApiKey, serverAdapter.getRouter());

// SECURITY: Apply rate limiting and authentication to all job endpoints (VULN-002)
app.use('/jobs', rateLimitMiddleware, authenticateApiKey);
app.use('/admin', authenticateApiKey);
app.use('/stats', authenticateApiKey);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    redis: redis.status,
    queues: {
      kyc: QueueNames.KYC_VERIFICATION,
      image: QueueNames.IMAGE_PROCESSING,
      email: QueueNames.EMAIL,
      notification: QueueNames.NOTIFICATION,
      analytics: QueueNames.ANALYTICS,
    },
  });
});

// Add KYC verification job
app.post('/jobs/kyc', async (req: Request, res: Response) => {
  try {
    const data = KycJobSchema.parse(req.body);

    const job = await kycQueue.add('verify', data, {
      ...JobPriorities.HIGH,
      removeOnComplete: 100, // Keep last 100 completed jobs
      removeOnFail: false, // Keep all failed jobs for debugging
    });

    res.status(202).json({
      jobId: job.id,
      status: 'queued',
      message: 'KYC verification queued successfully',
      statusUrl: `/jobs/${job.id}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({
      error: 'Invalid job data',
      details: message,
    });
  }
});

// Add image processing job
app.post('/jobs/image', async (req: Request, res: Response) => {
  try {
    const data = ImageJobSchema.parse(req.body);

    const job = await imageQueue.add('process', data, JobPriorities.NORMAL);

    res.status(202).json({
      jobId: job.id,
      status: 'queued',
      statusUrl: `/jobs/${job.id}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({
      error: 'Invalid job data',
      details: message,
    });
  }
});

// Add email job
app.post('/jobs/email', async (req: Request, res: Response) => {
  try {
    const data = EmailJobSchema.parse(req.body);

    const job = await emailQueue.add('send', data, {
      ...JobPriorities.NORMAL,
      removeOnComplete: 1000,
    });

    res.status(202).json({
      jobId: job.id,
      status: 'queued',
      statusUrl: `/jobs/${job.id}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({
      error: 'Invalid job data',
      details: message,
    });
  }
});

// Add notification job
app.post('/jobs/notification', async (req: Request, res: Response) => {
  try {
    const data = NotificationJobSchema.parse(req.body);

    const job = await notificationQueue.add('send', data, JobPriorities.HIGH);

    res.status(202).json({
      jobId: job.id,
      status: 'queued',
      statusUrl: `/jobs/${job.id}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({
      error: 'Invalid job data',
      details: message,
    });
  }
});

// Add analytics event job
app.post('/jobs/analytics', async (req: Request, res: Response) => {
  try {
    const data = AnalyticsJobSchema.parse(req.body);

    const job = await analyticsQueue.add('track', data, JobPriorities.LOW);

    res.status(202).json({
      jobId: job.id,
      status: 'queued',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({
      error: 'Invalid job data',
      details: message,
    });
  }
});

// Get job status
app.get('/jobs/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    // Try to find job in all queues
    const queues = [
      kycQueue,
      imageQueue,
      emailQueue,
      notificationQueue,
      analyticsQueue,
    ];
    let job = null;

    for (const queue of queues) {
      job = await queue.getJob(jobId!);
      if (job) break;
    }

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const state = await job.getState();
    const progress = job.progress;
    const result = job.returnvalue;
    const failedReason = job.failedReason;

    res.json({
      id: job.id,
      name: job.name,
      status: state,
      progress,
      result,
      failedReason,
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to get job status',
      details: message,
    });
  }
});

// Get queue stats
app.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await Promise.all([
      kycQueue.getJobCounts(),
      imageQueue.getJobCounts(),
      emailQueue.getJobCounts(),
      notificationQueue.getJobCounts(),
      analyticsQueue.getJobCounts(),
    ]);

    res.json({
      kyc: stats[0],
      image: stats[1],
      email: stats[2],
      notification: stats[3],
      analytics: stats[4],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to get queue stats',
      details: message,
    });
  }
});

// Clean completed jobs (manual cleanup)
app.post('/admin/clean', async (req: Request, res: Response) => {
  try {
    const { grace = 3600000 } = req.body; // Default: 1 hour

    await Promise.all([
      kycQueue.clean(grace, 100, 'completed'),
      imageQueue.clean(grace, 100, 'completed'),
      emailQueue.clean(grace, 100, 'completed'),
      notificationQueue.clean(grace, 100, 'completed'),
      analyticsQueue.clean(grace, 100, 'completed'),
    ]);

    res.json({ message: 'Queues cleaned successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to clean queues',
      details: message,
    });
  }
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  logger.info('Lovendo Job Queue Server started', {
    port: PORT,
    apiServer: `http://localhost:${PORT}`,
    bullBoard: `http://localhost:${PORT}/admin/queues`,
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Shutting down gracefully...');
  await Promise.all([
    kycQueue.close(),
    imageQueue.close(),
    emailQueue.close(),
    notificationQueue.close(),
    analyticsQueue.close(),
    redis.quit(),
  ]);
  process.exit(0);
});
