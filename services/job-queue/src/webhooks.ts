import express from 'express';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Security: Disable X-Powered-By header to prevent information disclosure
app.disable('x-powered-by');

// Parse raw body for signature verification before JSON parsing
app.use(
  express.json({
    verify: (req, _res, buf) => {
      // Store raw body for signature verification
      (req as express.Request & { rawBody?: Buffer }).rawBody = buf;
    },
  }),
);

// ============================================================================
// Webhook Signature Verification
// ============================================================================

const WEBHOOK_SECRET = process.env.WEBHOOK_SIGNING_SECRET;

/**
 * Verify webhook signature using HMAC-SHA256
 * Prevents unauthorized webhook calls from manipulating system state
 */
function verifyWebhookSignature(req: express.Request): boolean {
  if (!WEBHOOK_SECRET) {
    console.warn(
      '[Webhook] WEBHOOK_SIGNING_SECRET not configured - skipping verification in development',
    );
    return process.env.NODE_ENV === 'development';
  }

  const signature = req.headers['x-webhook-signature'] as string | undefined;
  const timestamp = req.headers['x-webhook-timestamp'] as string | undefined;

  if (!signature || !timestamp) {
    console.error('[Webhook] Missing signature or timestamp headers');
    return false;
  }

  // Prevent replay attacks - reject requests older than 5 minutes
  const requestTime = parseInt(timestamp, 10);
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - requestTime) > 300) {
    console.error('[Webhook] Request timestamp too old or in future');
    return false;
  }

  // Get raw body for signature calculation
  const rawBody = (req as express.Request & { rawBody?: Buffer }).rawBody;
  if (!rawBody) {
    console.error('[Webhook] No raw body available for signature verification');
    return false;
  }

  // Calculate expected signature
  const payload = `${timestamp}.${rawBody.toString('utf8')}`;
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  // Constant-time comparison to prevent timing attacks
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
}

/**
 * Middleware to verify webhook signatures
 */
function requireWebhookAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void {
  if (!verifyWebhookSignature(req)) {
    console.error('[Webhook] Invalid signature', {
      ip: req.ip,
      path: req.path,
    });
    res.status(401).json({ error: 'Invalid webhook signature' });
    return;
  }
  next();
}

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
 * SECURITY: Protected by webhook signature verification
 */
app.post('/webhooks/job-complete', requireWebhookAuth, async (req, res) => {
  try {
    const { jobId, userId, type, status, result, error } = req.body;

    console.log(
      `Webhook received: ${type} job ${jobId} for user ${userId} - ${status}`,
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
  error: JobError | null,
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
    const sanitizedError =
      typeof error === 'string'
        ? error.replace(/[\n\r\t]/g, ' ').slice(0, 500)
        : JSON.stringify(error).slice(0, 500);
    console.error(
      `KYC verification failed for user ${userId}:`,
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
  if (status === 'completed') {
    console.log(`Image processing completed for user ${userId}`);
    // Update image URLs in database
    // Send notification if needed
  } else {
    // Sanitize error for logging to prevent log injection
    const sanitizedError =
      typeof error === 'string'
        ? error.replace(/[\n\r\t]/g, ' ').slice(0, 500)
        : JSON.stringify(error).slice(0, 500);
    console.error(
      `Image processing failed for user ${userId}:`,
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
  if (status === 'completed') {
    console.log(`Email sent successfully to user ${userId}`);
  } else {
    // Sanitize error for logging to prevent log injection
    const sanitizedError =
      typeof error === 'string'
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
