import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
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
  } catch (err: any) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Handle KYC verification completion
 */
async function handleKycComplete(
  userId: string,
  status: string,
  result: any,
  error: any
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

    console.error(`KYC verification failed for user ${userId}:`, error);
  }
}

/**
 * Handle image processing completion
 */
async function handleImageComplete(
  userId: string,
  status: string,
  result: any,
  error: any
): Promise<void> {
  if (status === 'completed') {
    console.log(`Image processing completed for user ${userId}`);
    // Update image URLs in database
    // Send notification if needed
  } else {
    console.error(`Image processing failed for user ${userId}:`, error);
  }
}

/**
 * Handle email sending completion
 */
async function handleEmailComplete(
  userId: string,
  status: string,
  result: any,
  error: any
): Promise<void> {
  if (status === 'completed') {
    console.log(`Email sent successfully to user ${userId}`);
  } else {
    console.error(`Email sending failed for user ${userId}:`, error);
    // Retry logic or alert admin
  }
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
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
