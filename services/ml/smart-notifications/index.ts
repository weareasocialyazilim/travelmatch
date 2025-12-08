/**
 * Smart Notification Service
 * Intelligent notification timing and content generation
 */

import { serve } from '@supabase/edge-runtime';
import { createClient } from '@supabase/supabase-js';
import { handleCors, validateAuth, handleError } from '../../shared/middleware';
import { logger } from '../../shared/utils/logger.ts';
import { extractUserFeatures } from '../../shared/ml/feature-store.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_KEY') ?? ''
);

interface NotificationRequest {
  userId: string;
  type: 'gift_received' | 'moment_liked' | 'proof_verified' | 'payment_completed' | 'reminder';
  data: Record<string, any>;
  priority?: 'low' | 'medium' | 'high';
}

interface NotificationSchedule {
  sendAt: string;
  channel: 'push' | 'email' | 'sms';
  content: {
    title: string;
    body: string;
    data?: Record<string, any>;
  };
}

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    await validateAuth(req);

    const notificationReq: NotificationRequest = await req.json();

    logger.info('Processing notification request', {
      userId: notificationReq.userId,
      type: notificationReq.type,
    });

    // 1. Extract user features (for timing optimization)
    const userFeatures = await extractUserFeatures(notificationReq.userId);

    // 2. Determine optimal send time
    const optimalTime = await determineOptimalSendTime(
      userFeatures,
      notificationReq.priority || 'medium'
    );

    // 3. Generate notification content
    const content = await generateNotificationContent(
      notificationReq.type,
      notificationReq.data
    );

    // 4. Select best channel
    const channel = selectBestChannel(userFeatures, notificationReq.type);

    // 5. Schedule notification
    const schedule: NotificationSchedule = {
      sendAt: optimalTime,
      channel,
      content,
    };

    // 6. Store in database
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: notificationReq.userId,
        type: notificationReq.type,
        channel,
        content,
        scheduled_at: optimalTime,
        status: 'scheduled',
        metadata: notificationReq.data,
      })
      .select()
      .single();

    if (error) throw error;

    // 7. If immediate priority, send now
    if (notificationReq.priority === 'high') {
      await sendNotification(notification.id, channel, content);
    }

    logger.info('Notification scheduled', {
      notificationId: notification.id,
      sendAt: optimalTime,
      channel,
    });

    return new Response(JSON.stringify({ notification, schedule }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    logger.error('Notification processing failed', error as Error);
    return handleError(error);
  }
});

/**
 * Determine optimal send time based on user behavior
 */
async function determineOptimalSendTime(
  userFeatures: any,
  priority: string
): Promise<string> {
  // If high priority, send immediately
  if (priority === 'high') {
    return new Date().toISOString();
  }

  // Get user's peak activity hours
  const peakHours = userFeatures.peakActivityHours || [9, 13, 19];
  
  // Get current hour
  const now = new Date();
  const currentHour = now.getHours();

  // Find next peak hour
  let nextPeakHour = peakHours.find((h: number) => h > currentHour);
  
  // If no peak hour found today, use first peak hour tomorrow
  if (!nextPeakHour) {
    nextPeakHour = peakHours[0];
    now.setDate(now.getDate() + 1);
  }

  now.setHours(nextPeakHour, 0, 0, 0);

  return now.toISOString();
}

/**
 * Generate personalized notification content
 */
async function generateNotificationContent(
  type: string,
  data: Record<string, any>
): Promise<any> {
  const templates: Record<string, any> = {
    gift_received: {
      title: '🎁 You received a gift!',
      body: `${data.giverName} gifted you ${data.amount} ${data.currency} for "${data.momentTitle}"`,
    },
    moment_liked: {
      title: '❤️ Someone liked your moment',
      body: `${data.likerName} liked "${data.momentTitle}"`,
    },
    proof_verified: {
      title: '✅ Proof verified!',
      body: `Your proof for "${data.momentTitle}" has been verified`,
    },
    payment_completed: {
      title: '💰 Payment completed',
      body: `Payment of ${data.amount} ${data.currency} has been processed`,
    },
    reminder: {
      title: '⏰ Reminder',
      body: data.message || 'You have a pending action',
    },
  };

  const template = templates[type] || {
    title: 'TravelMatch',
    body: 'You have a new notification',
  };

  return {
    ...template,
    data,
  };
}

/**
 * Select best notification channel
 */
function selectBestChannel(
  userFeatures: any,
  notificationType: string
): 'push' | 'email' | 'sms' {
  // High-value notifications -> SMS
  if (notificationType === 'payment_completed') {
    return 'sms';
  }

  // Engagement notifications -> Push (if user is active)
  if (userFeatures.daysActive > 7) {
    return 'push';
  }

  // Dormant users -> Email
  return 'email';
}

/**
 * Send notification immediately
 */
async function sendNotification(
  notificationId: string,
  channel: string,
  content: any
): Promise<void> {
  logger.info('Sending immediate notification', {
    notificationId,
    channel,
  });

  // TODO: Integrate with notification providers
  // - Push: Firebase Cloud Messaging / Apple Push Notification
  // - Email: SendGrid / Resend
  // - SMS: Twilio

  // Update notification status
  await supabase
    .from('notifications')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', notificationId);
}
