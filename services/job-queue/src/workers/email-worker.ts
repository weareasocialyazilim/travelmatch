import { Worker, Job, ConnectionOptions } from 'bullmq';
import { createClient } from '@supabase/supabase-js';
import { EmailJobData, EmailJobSchema, QueueNames } from '../jobs/index.js';
import Redis from 'ioredis';

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

// Email templates
const EMAIL_TEMPLATES: Record<
  string,
  { subject: string; html: (data: Record<string, unknown>) => string }
> = {
  welcome: {
    subject: 'Welcome to Lovendo!',
    html: (data) => `
      <h1>Welcome to Lovendo, ${data.name}!</h1>
      <p>We're excited to have you join our community of travelers.</p>
      <p>Start exploring moments and connect with fellow travelers today!</p>
    `,
  },
  password_reset: {
    subject: 'Reset Your Password',
    html: (data) => `
      <h1>Password Reset Request</h1>
      <p>Hi ${data.name},</p>
      <p>We received a request to reset your password. Click the link below to set a new password:</p>
      <p><a href="${data.resetLink}">Reset Password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
    `,
  },
  verification: {
    subject: 'Verify Your Email',
    html: (data) => `
      <h1>Verify Your Email</h1>
      <p>Hi ${data.name},</p>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${data.verificationLink}">Verify Email</a></p>
    `,
  },
  booking_confirmation: {
    subject: 'Booking Confirmed!',
    html: (data) => `
      <h1>Booking Confirmed</h1>
      <p>Hi ${data.name},</p>
      <p>Your booking for "${data.momentTitle}" has been confirmed.</p>
      <p>Date: ${data.date}</p>
      <p>Location: ${data.location}</p>
      <p>See you there!</p>
    `,
  },
  payment_receipt: {
    subject: 'Payment Receipt',
    html: (data) => `
      <h1>Payment Receipt</h1>
      <p>Hi ${data.name},</p>
      <p>Your payment of $${data.amount} has been processed successfully.</p>
      <p>Transaction ID: ${data.transactionId}</p>
      <p>Thank you for using Lovendo!</p>
    `,
  },
  gift_received: {
    subject: "You've received a gift! 🎁",
    html: (data) => `
      <h1>You've Received a Gift!</h1>
      <p>Hi ${data.name},</p>
      <p>${data.senderName} sent you a gift worth $${data.amount}!</p>
      ${data.message ? `<p>Message: "${data.message}"</p>` : ''}
      <p><a href="${data.momentLink}">View the moment</a></p>
    `,
  },
  kyc_verified: {
    subject: 'Identity Verified ✓',
    html: (data) => `
      <h1>Identity Verified</h1>
      <p>Hi ${data.name},</p>
      <p>Your identity has been verified successfully. You now have full access to all Lovendo features!</p>
    `,
  },
  kyc_rejected: {
    subject: 'Identity Verification Issue',
    html: (data) => `
      <h1>Identity Verification Issue</h1>
      <p>Hi ${data.name},</p>
      <p>We were unable to verify your identity. Please try again with clearer documents.</p>
      ${data.reasons ? `<p>Reasons: ${(data.reasons as string[]).join(', ')}</p>` : ''}
    `,
  },
};

/**
 * Send email via SendGrid
 */
async function sendWithSendGrid(
  data: EmailJobData,
): Promise<{ success: boolean; messageId?: string }> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    throw new Error('SENDGRID_API_KEY not configured');
  }

  const template = EMAIL_TEMPLATES[data.template];
  if (!template) {
    throw new Error(`Unknown email template: ${data.template}`);
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: data.to }] }],
      from: {
        email:
          data.from || process.env.SENDGRID_FROM_EMAIL || 'noreply@lovendo.xyz',
      },
      reply_to: data.replyTo ? { email: data.replyTo } : undefined,
      subject: template.subject,
      content: [{ type: 'text/html', value: template.html(data.data) }],
      attachments: data.attachments?.map((att) => ({
        filename: att.filename,
        content: att.content,
        type: att.contentType,
        disposition: 'attachment',
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid error: ${error}`);
  }

  const messageId = response.headers.get('x-message-id');
  return { success: true, messageId: messageId ?? undefined };
}

/**
 * Send email via Mailgun
 */
async function sendWithMailgun(
  data: EmailJobData,
): Promise<{ success: boolean; messageId?: string }> {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;

  if (!apiKey || !domain) {
    throw new Error('MAILGUN_API_KEY or MAILGUN_DOMAIN not configured');
  }

  const template = EMAIL_TEMPLATES[data.template];
  if (!template) {
    throw new Error(`Unknown email template: ${data.template}`);
  }

  const formData = new FormData();
  formData.append('from', data.from || `noreply@${domain}`);
  formData.append('to', data.to);
  formData.append('subject', template.subject);
  formData.append('html', template.html(data.data));

  if (data.replyTo) {
    formData.append('h:Reply-To', data.replyTo);
  }

  const response = await fetch(
    `https://api.mailgun.net/v3/${domain}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mailgun error: ${error}`);
  }

  const result = (await response.json()) as { id: string };
  return { success: true, messageId: result.id };
}

/**
 * Log email to database for tracking
 */
async function logEmail(
  data: EmailJobData,
  result: { success: boolean; messageId?: string; error?: string },
): Promise<void> {
  try {
    await supabase.from('email_logs').insert({
      to_email: data.to,
      template: data.template,
      provider: data.provider,
      message_id: result.messageId,
      status: result.success ? 'sent' : 'failed',
      error: result.error,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Email Worker] Failed to log email:', error);
  }
}

/**
 * Email Worker
 * Processes email jobs from the queue
 */
export function createEmailWorker(connection: Redis) {
  const worker = new Worker<
    EmailJobData,
    { success: boolean; messageId?: string }
  >(
    QueueNames.EMAIL,
    async (job: Job<EmailJobData>) => {
      console.info(`[Email Worker] Processing job ${job.id} to ${job.data.to}`);

      try {
        // 1. Validate job data
        const validatedData = EmailJobSchema.parse(job.data);
        await job.updateProgress(10);

        // 2. Send email based on provider
        let result: { success: boolean; messageId?: string };

        if (
          process.env.NODE_ENV === 'development' &&
          !process.env.SENDGRID_API_KEY
        ) {
          // Mock in development without API key
          console.info(
            '[Email Worker] Using mock email (no API key configured)',
          );
          result = { success: true, messageId: `mock_${Date.now()}` };
        } else if (validatedData.provider === 'mailgun') {
          result = await sendWithMailgun(validatedData);
        } else {
          result = await sendWithSendGrid(validatedData);
        }

        await job.updateProgress(80);

        // 3. Log to database
        await logEmail(validatedData, result);
        await job.updateProgress(100);

        console.info(
          `[Email Worker] Job ${job.id} completed - messageId: ${result.messageId}`,
        );
        return result;
      } catch (error) {
        console.error(`[Email Worker] Job ${job.id} failed:`, error);

        // Log failure
        await logEmail(job.data, {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        throw error;
      }
    },
    {
      connection: connection as unknown as ConnectionOptions,
      concurrency: 10, // Process up to 10 emails in parallel
      limiter: {
        max: 100, // Max 100 emails per interval
        duration: 60000, // 1 minute
      },
    },
  );

  // Event handlers
  worker.on('completed', (job) => {
    console.info(`[Email Worker] ✓ Job ${job.id} completed`);
  });

  worker.on('failed', (job, error) => {
    console.error(`[Email Worker] ✗ Job ${job?.id} failed:`, error.message);
  });

  worker.on('stalled', (jobId) => {
    console.warn(`[Email Worker] ⚠ Job ${jobId} stalled`);
  });

  worker.on('error', (error) => {
    console.error('[Email Worker] Worker error:', error);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.info(
      '[Email Worker] Received SIGTERM, shutting down gracefully...',
    );
    await worker.close();
  });

  return worker;
}
