import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { logger } from '../shared/utils/logger.js';

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

    // Sanitize input for logging to prevent log injection
    const safeUserId = String(userId || '')
      .replace(/[\n\r\t%]/g, '')
      .slice(0, 100);
    const safeJobId = String(jobId || '')
      .replace(/[\n\r\t%]/g, '')
      .slice(0, 100);
    const safeType = String(type || '')
      .replace(/[\n\r\t%]/g, '')
      .slice(0, 50);
    const safeStatus = String(status || '')
      .replace(/[\n\r\t%]/g, '')
      .slice(0, 50);

    logger.info('Webhook received', {
      type: safeType,
      jobId: safeJobId,
      userId: safeUserId,
      status: safeStatus,
    });

    // Handle different job types
    switch (type) {
      case 'kyc-verification':
        await handleKycComplete(safeUserId, status, result, error);
        break;

      case 'image-processing':
        await handleImageComplete(safeUserId, status, result, error);
        break;

      case 'email':
        await handleEmailComplete(safeUserId, status, result, error);
        break;

      default:
        logger.warn('Unknown job type', { type: safeType });
    }

    res.json({ success: true });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Webhook error', err instanceof Error ? err : undefined, { message: errorMessage });
    res.status(500).json({ error: 'Internal server error' });
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
          : `Verification ${result.status}. ${Array.isArray(result?.rejectionReasons) ? result.rejectionReasons.filter((r: unknown): r is string => typeof r === 'string').join(', ') : ''}`,
      data: {
        status: result.status,
        provider: result.provider,
      },
      read: false,
      created_at: new Date().toISOString(),
    });

    logger.info('KYC verification completed', {
      status: result.status,
      userId,
    });
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
        ? error.replace(/[\n\r\t%]/g, ' ').slice(0, 500)
        : JSON.stringify(error).slice(0, 500);
    logger.error('KYC verification failed', undefined, {
      userId,
      error: sanitizedError,
    });
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
    logger.info('Image processing completed', { userId });
    // Update image URLs in database
    // Send notification if needed
  } else {
    // Sanitize error for logging to prevent log injection
    const sanitizedError =
      typeof error === 'string'
        ? error.replace(/[\n\r\t%]/g, ' ').slice(0, 500)
        : JSON.stringify(error).slice(0, 500);
    logger.error('Image processing failed', undefined, {
      userId,
      error: sanitizedError,
    });
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
    logger.info('Email sent successfully', { userId });
  } else {
    // Sanitize error for logging to prevent log injection
    const sanitizedError =
      typeof error === 'string'
        ? error.replace(/[\n\r\t%]/g, ' ').slice(0, 500)
        : JSON.stringify(error).slice(0, 500);
    logger.error('Email sending failed', undefined, { userId, error: sanitizedError });
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
  logger.info('Job Queue Webhooks server started', {
    port: PORT,
    url: `http://localhost:${PORT}`,
  });
});
