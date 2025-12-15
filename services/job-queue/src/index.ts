import express, { Request, Response } from 'express';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { ExpressAdapter } from '@bull-board/express';
import {
  KycJobSchema,
  ImageJobSchema,
  EmailJobSchema,
  NotificationJobSchema,
  AnalyticsJobSchema,
  JobPriorities,
  QueueNames,
} from './jobs/index.js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

// Create Redis connection
const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  password: process.env.REDIS_PASSWORD,
});

// Create queues
const kycQueue = new Queue(QueueNames.KYC_VERIFICATION, { connection: redis });
const imageQueue = new Queue(QueueNames.IMAGE_PROCESSING, { connection: redis });
const emailQueue = new Queue(QueueNames.EMAIL, { connection: redis });
const notificationQueue = new Queue(QueueNames.NOTIFICATION, { connection: redis });
const analyticsQueue = new Queue(QueueNames.ANALYTICS, { connection: redis });

// Setup Bull Board (job monitoring UI)
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [
    new BullMQAdapter(kycQueue) as unknown as Parameters<typeof createBullBoard>[0]['queues'][number],
    new BullMQAdapter(imageQueue) as unknown as Parameters<typeof createBullBoard>[0]['queues'][number],
    new BullMQAdapter(emailQueue) as unknown as Parameters<typeof createBullBoard>[0]['queues'][number],
    new BullMQAdapter(notificationQueue) as unknown as Parameters<typeof createBullBoard>[0]['queues'][number],
    new BullMQAdapter(analyticsQueue) as unknown as Parameters<typeof createBullBoard>[0]['queues'][number],
  ],
  serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());

// Health check
app.get('/health', (req: Request, res: Response) => {
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
    const queues = [kycQueue, imageQueue, emailQueue, notificationQueue, analyticsQueue];
    let job = null;

    for (const queue of queues) {
      job = await queue.getJob(jobId);
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
app.get('/stats', async (req: Request, res: Response) => {
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
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  TravelMatch Job Queue Server                              ║
║                                                            ║
║  API Server:   http://localhost:${PORT}                   ║
║  Bull Board:   http://localhost:${PORT}/admin/queues      ║
║                                                            ║
║  Endpoints:                                                ║
║  • POST /jobs/kyc              Add KYC verification        ║
║  • POST /jobs/image            Add image processing        ║
║  • POST /jobs/email            Add email job               ║
║  • POST /jobs/notification     Add notification            ║
║  • POST /jobs/analytics        Add analytics event         ║
║  • GET  /jobs/:jobId           Get job status              ║
║  • GET  /stats                 Get queue statistics        ║
║  • GET  /health                Health check                ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
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
