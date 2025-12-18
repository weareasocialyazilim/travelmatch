import { Worker, Job } from 'bullmq';
import { createClient } from '@supabase/supabase-js';
import { NotificationJobData, NotificationJobSchema, QueueNames } from '../jobs/index.js';
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
  }
);

interface PushResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Get user's push tokens from database
 */
async function getUserPushTokens(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('push_tokens')
    .select('token')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error) {
    console.error('[Notification Worker] Failed to get push tokens:', error);
    return [];
  }

  return (data || []).map((row) => row.token);
}

/**
 * Send push notification via Expo Push
 */
async function sendWithExpoPush(
  tokens: string[],
  data: NotificationJobData
): Promise<PushResult> {
  if (tokens.length === 0) {
    return { success: false, error: 'No push tokens found' };
  }

  const messages = tokens.map((token) => ({
    to: token,
    title: data.title,
    body: data.body,
    data: data.data,
    sound: data.sound || 'default',
    badge: data.badge,
  }));

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Expo Push error: ${error}`);
  }

  const result = (await response.json()) as { data: Array<{ id: string; status: string }> };
  const successCount = result.data.filter((r) => r.status === 'ok').length;

  return {
    success: successCount > 0,
    messageId: result.data[0]?.id,
    error: successCount === 0 ? 'All push sends failed' : undefined,
  };
}

/**
 * Send push notification via Firebase Cloud Messaging (FCM)
 */
async function sendWithFCM(
  tokens: string[],
  data: NotificationJobData
): Promise<PushResult> {
  const serverKey = process.env.FCM_SERVER_KEY;
  if (!serverKey) {
    throw new Error('FCM_SERVER_KEY not configured');
  }

  if (tokens.length === 0) {
    return { success: false, error: 'No push tokens found' };
  }

  const response = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      Authorization: `key=${serverKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      registration_ids: tokens,
      notification: {
        title: data.title,
        body: data.body,
        sound: data.sound || 'default',
        badge: data.badge,
        icon: data.icon,
        click_action: data.deepLink,
      },
      data: data.data,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`FCM error: ${error}`);
  }

  const result = (await response.json()) as { success: number; failure: number; results: Array<{ message_id?: string }> };
  return {
    success: result.success > 0,
    messageId: result.results[0]?.message_id,
    error: result.success === 0 ? 'All push sends failed' : undefined,
  };
}

/**
 * Send SMS notification via Twilio
 */
async function sendSMS(userId: string, data: NotificationJobData): Promise<PushResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Twilio configuration missing');
  }

  // Get user's phone number
  const { data: user, error } = await supabase
    .from('users')
    .select('phone')
    .eq('id', userId)
    .single();

  if (error || !user?.phone) {
    return { success: false, error: 'User phone number not found' };
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: user.phone,
        From: fromNumber,
        Body: `${data.title}\n${data.body}`,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Twilio error: ${error}`);
  }

  const result = (await response.json()) as { sid: string };
  return { success: true, messageId: result.sid };
}

/**
 * Store in-app notification
 */
async function storeInAppNotification(
  userId: string,
  data: NotificationJobData
): Promise<PushResult> {
  const { error, data: inserted } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type: 'in_app',
      title: data.title,
      body: data.body,
      data: data.data,
      deep_link: data.deepLink,
      read: false,
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to store notification: ${error.message}`);
  }

  return { success: true, messageId: inserted.id };
}

/**
 * Log notification to database for tracking
 */
async function logNotification(
  userId: string,
  data: NotificationJobData,
  result: PushResult
): Promise<void> {
  try {
    await supabase.from('notification_logs').insert({
      user_id: userId,
      type: data.type,
      title: data.title,
      body: data.body,
      status: result.success ? 'sent' : 'failed',
      message_id: result.messageId,
      error: result.error,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Notification Worker] Failed to log notification:', error);
  }
}

/**
 * Notification Worker
 * Processes notification jobs from the queue
 */
export function createNotificationWorker(connection: Redis) {
  const worker = new Worker<NotificationJobData, PushResult>(
    QueueNames.NOTIFICATION,
    async (job: Job<NotificationJobData>) => {
      console.log(`[Notification Worker] Processing job ${job.id} for user ${job.data.userId}`);

      try {
        // 1. Validate job data
        const validatedData = NotificationJobSchema.parse(job.data);
        await job.updateProgress(10);

        let result: PushResult;

        // 2. Send notification based on type
        switch (validatedData.type) {
          case 'push': {
            const tokens = await getUserPushTokens(validatedData.userId);
            await job.updateProgress(30);

            if (process.env.NODE_ENV === 'development' && !process.env.FCM_SERVER_KEY) {
              // Use Expo Push in development
              result = await sendWithExpoPush(tokens, validatedData);
            } else {
              result = await sendWithFCM(tokens, validatedData);
            }
            break;
          }

          case 'sms': {
            result = await sendSMS(validatedData.userId, validatedData);
            break;
          }

          case 'in_app': {
            result = await storeInAppNotification(validatedData.userId, validatedData);
            break;
          }

          default: {
            throw new Error(`Unsupported notification type: ${validatedData.type}`);
          }
        }

        await job.updateProgress(80);

        // 3. Log to database
        await logNotification(validatedData.userId, validatedData, result);
        await job.updateProgress(100);

        console.log(`[Notification Worker] Job ${job.id} completed - type: ${validatedData.type}`);
        return result;
      } catch (error) {
        console.error(`[Notification Worker] Job ${job.id} failed:`, error);

        // Log failure
        await logNotification(job.data.userId, job.data, {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        throw error;
      }
    },
    {
      connection,
      concurrency: 20, // Process up to 20 notifications in parallel
      limiter: {
        max: 500, // Max 500 notifications per interval
        duration: 60000, // 1 minute
      },
    }
  );

  // Event handlers
  worker.on('completed', (job) => {
    console.log(`[Notification Worker] ✓ Job ${job.id} completed`);
  });

  worker.on('failed', (job, error) => {
    console.error(`[Notification Worker] ✗ Job ${job?.id} failed:`, error.message);
  });

  worker.on('stalled', (jobId) => {
    console.warn(`[Notification Worker] ⚠ Job ${jobId} stalled`);
  });

  worker.on('error', (error) => {
    console.error('[Notification Worker] Worker error:', error);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('[Notification Worker] Received SIGTERM, shutting down gracefully...');
    await worker.close();
  });

  return worker;
}
