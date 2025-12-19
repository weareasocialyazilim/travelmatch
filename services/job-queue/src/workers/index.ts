import Redis from 'ioredis';
import { createKycWorker } from './kyc-worker.js';
import { createEmailWorker } from './email-worker.js';
import { createNotificationWorker } from './notification-worker.js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['REDIS_URL', 'SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Create Redis connection
const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
  password: process.env.REDIS_PASSWORD,
});

redis.on('connect', () => {
  console.log('✓ Connected to Redis');
});

redis.on('error', (error) => {
  console.error('✗ Redis connection error:', error);
});

// Start workers
console.log('Starting job queue workers...');

const kycWorker = createKycWorker(redis);
console.log('✓ KYC verification worker started');

const emailWorker = createEmailWorker(redis);
console.log('✓ Email worker started');

const notificationWorker = createNotificationWorker(redis);
console.log('✓ Notification worker started');

// Log worker stats every 30 seconds
setInterval(() => {
  console.log('[Stats] Workers status:', {
    kyc: { name: kycWorker.name, running: kycWorker.isRunning() },
    email: { name: emailWorker.name, running: emailWorker.isRunning() },
    notification: { name: notificationWorker.name, running: notificationWorker.isRunning() },
  });
}, 30000);

console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  TravelMatch Job Queue Workers                             ║
║                                                            ║
║  Status: Running                                           ║
║  Workers:                                                  ║
║    - KYC Verification                                      ║
║    - Email                                                 ║
║    - Notification                                          ║
║  Redis: ${process.env.REDIS_URL?.substring(0, 30)}...      ║
║                                                            ║
║  Press Ctrl+C to stop                                      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);
