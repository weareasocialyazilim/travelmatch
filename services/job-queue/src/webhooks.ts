import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Security: Disable X-Powered-By header to prevent information disclosure
app.disable('x-powered-by');

app.use(express.json());

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Webhook endpoint for job completion notifications
 * Called by workers when jobs complete (success or failure)
 */
app.post('/webhooks/job-complete', async (req, res) => {
  try {
    const { jobId, userId, type, status, result, error } = req.body;

    console.log(`Webhook received: ${type} job ${jobId} for user ${userId} - ${status}`);

    // Handle different job types
    switch (type) {
      case 'kyc-verification':
        await handleKycComplete(userId, status, result, error);
        break;

      case 'image-processing':
        await handleImageComplete(userId, status, result, error);
        break;

      case 'email':
        await handleEmailComplete(userId, status, result, error);
        break;

      default:
        console.warn(`Unknown job type: ${type}`);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

interface KycResult {
  status: 'verified' | 'rejected' | 'pending';
  provider?: string;
  rejectionReasons?: string[];
}

interface JobError {
  message?: string;
  code?: string;
}

/**
 * Handle KYC verification completion
 */
async function handleKycComplete(
  userId: string,
  status: string,
  result: KycResult | null,
  error: JobError | null
): Promise<void> {
  if (status === 'completed') {
    // Update user KYC status
    await supabase
      .from('users')
      .update({
        kyc_status: result.status, // 'verified' or 'rejected'
        kyc_updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    // Send notification
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'kyc_update',
      title: result.status === 'verified' ? 'KYC Verified ✓' : 'KYC Verification Failed',
      body:
        result.status === 'verified'
          ? 'Your identity has been verified successfully!'
          : `Verification ${result.status}. ${result.rejectionReasons?.join(', ') || ''}`,
      data: {
        status: result.status,
        provider: result.provider,
      },
      read: false,
      created_at: new Date().toISOString(),
    });

    console.log(`KYC verification ${result.status} for user ${userId}`);
  } else if (status === 'failed') {
    // Update to failed status
    await supabase
      .from('users')
      .update({
        kyc_status: 'failed',
        kyc_updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    // Send error notification
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'kyc_update',
      title: 'KYC Verification Error',
      body: 'There was an error processing your verification. Please try again.',
      data: {
        error: error || 'Unknown error',
      },
      read: false,
      created_at: new Date().toISOString(),
    });

    // Sanitize error for logging to prevent log injection
    const sanitizedError = typeof error === 'string' 
      ? error.replace(/[\n\r\t]/g, ' ').slice(0, 500) 
      : JSON.stringify(error).slice(0, 500);
    console.error(`KYC verification failed for user ${userId}:`, sanitizedError);
  }
}

/**
 * Handle image processing completion
 */
async function handleImageComplete(
  userId: string,
  status: string,
  _result: unknown,
  error: unknown
): Promise<void> {
  if (status === 'completed') {
    console.log(`Image processing completed for user ${userId}`);
    // Update image URLs in database
    // Send notification if needed
  } else {
    // Sanitize error for logging to prevent log injection
    const sanitizedError = typeof error === 'string' 
      ? error.replace(/[\n\r\t]/g, ' ').slice(0, 500) 
      : JSON.stringify(error).slice(0, 500);
    console.error(`Image processing failed for user ${userId}:`, sanitizedError);
  }
}

/**
 * Handle email sending completion
 */
async function handleEmailComplete(
  userId: string,
  status: string,
  _result: unknown,
  error: unknown
): Promise<void> {
  if (status === 'completed') {
    console.log(`Email sent successfully to user ${userId}`);
  } else {
    // Sanitize error for logging to prevent log injection
    const sanitizedError = typeof error === 'string' 
      ? error.replace(/[\n\r\t]/g, ' ').slice(0, 500) 
      : JSON.stringify(error).slice(0, 500);
    console.error(`Email sending failed for user ${userId}:`, sanitizedError);
    // Retry logic or alert admin
  }
}

/**
 * Health check endpoint
 */
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy' });
});

const PORT = process.env.WEBHOOK_PORT || 3003;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  Job Queue Webhooks                                        ║
║                                                            ║
║  Listening on: http://localhost:${PORT}                   ║
║                                                            ║
║  Endpoints:                                                ║
║  • POST /webhooks/job-complete                             ║
║  • GET  /health                                            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});
