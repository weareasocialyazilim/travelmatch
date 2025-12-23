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
  },
);

/**
 * Webhook endpoint for job completion notifications
 * Called by workers when jobs complete (success or failure)
 */
app.post('/webhooks/job-complete', async (req, res) => {
  try {
    const { jobId, userId, type, status, result, error } = req.body;

    // Sanitize userId to prevent log injection (UUID format validation)
    const sanitizedUserId =
      typeof userId === 'string' && /^[0-9a-f-]{36}$/i.test(userId)
        ? userId
        : 'invalid-user-id';
    const sanitizedType =
      typeof type === 'string'
        ? type.replace(/[\n\r\t]/g, '').slice(0, 50)
        : 'unknown';
    const sanitizedJobId =
      typeof jobId === 'string'
        ? jobId.replace(/[\n\r\t]/g, '').slice(0, 100)
        : 'unknown';
    const sanitizedStatus =
      typeof status === 'string'
        ? status.replace(/[\n\r\t]/g, '').slice(0, 20)
        : 'unknown';

    console.log(
      `Webhook received: ${sanitizedType} job ${sanitizedJobId} for user ${sanitizedUserId} - ${sanitizedStatus}`,
    );

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
  error: any,
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
      title:
        result.status === 'verified'
          ? 'KYC Verified ✓'
          : 'KYC Verification Failed',
      body:
        result.status === 'verified'
          ? 'Your identity has been verified successfully!'
          : `Verification ${result.status}. ${
              Array.isArray(result.rejectionReasons)
                ? result.rejectionReasons.join(', ')
                : ''
            }`,
      data: {
        status: result.status,
        provider: result.provider,
      },
      read: false,
      created_at: new Date().toISOString(),
    });

    console.log(`KYC verification ${result.status} for user [sanitized]`);
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
    const sanitizedError =
      typeof error === 'string'
        ? error.replace(/[\n\r\t]/g, ' ').slice(0, 500)
        : JSON.stringify(error).slice(0, 500);
    // Sanitize userId (already validated as UUID in request handler)
    const safeUserId =
      typeof userId === 'string' && /^[0-9a-f-]{36}$/i.test(userId)
        ? userId
        : '[invalid]';
    console.error(
      `KYC verification failed for user ${safeUserId}:`,
      sanitizedError,
    );
  }
}

/**
 * Handle image processing completion
 */
async function handleImageComplete(
  userId: string,
  status: string,
  _result: unknown,
  error: unknown,
): Promise<void> {
  // Sanitize userId (should be UUID format)
  const safeUserId =
    typeof userId === 'string' && /^[0-9a-f-]{36}$/i.test(userId)
      ? userId
      : '[invalid]';

  if (status === 'completed') {
    console.log(`Image processing completed for user ${safeUserId}`);
    // Update image URLs in database
    // Send notification if needed
  } else {
    // Sanitize error for logging to prevent log injection
    const sanitizedError =
      typeof error === 'string'
        ? error.replace(/[\n\r\t]/g, ' ').slice(0, 500)
        : JSON.stringify(error).slice(0, 500);
    console.error(
      `Image processing failed for user ${safeUserId}:`,
      sanitizedError,
    );
  }
}

/**
 * Handle email sending completion
 */
async function handleEmailComplete(
  userId: string,
  status: string,
  _result: unknown,
  error: unknown,
): Promise<void> {
  // Sanitize userId (should be UUID format)
  const safeUserId =
    typeof userId === 'string' && /^[0-9a-f-]{36}$/i.test(userId)
      ? userId
      : '[invalid]';

  if (status === 'completed') {
    console.log(`Email sent successfully to user ${safeUserId}`);
  } else {
    // Sanitize error for logging to prevent log injection
    const sanitizedError =
      typeof error === 'string'
        ? error.replace(/[\n\r\t]/g, ' ').slice(0, 500)
        : JSON.stringify(error).slice(0, 500);
    console.error(
      `Email sending failed for user ${safeUserId}:`,
      sanitizedError,
    );
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
