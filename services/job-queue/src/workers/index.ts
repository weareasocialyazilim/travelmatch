import Redis from 'ioredis';
import { createKycWorker } from './kyc-worker.js';

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

// Log worker stats every 30 seconds
setInterval(async () => {
  const stats = await kycWorker.getMetrics();
  console.log('[Stats]', {
    completed: stats.completed.count,
    failed: stats.failed.count,
  });
}, 30000);

console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  TravelMatch Job Queue Workers                             ║
║                                                            ║
║  Status: Running                                           ║
║  Workers: KYC Verification                                 ║
║  Redis: ${process.env.REDIS_URL}                           ║
║                                                            ║
║  Press Ctrl+C to stop                                      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);
