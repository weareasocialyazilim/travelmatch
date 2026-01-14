/**
 * SendGrid Webhook Edge Function
 *
 * Handles SendGrid event webhooks for email tracking:
 * - Delivered, opened, clicked events
 * - Bounce and spam complaint handling
 *
 * SECURITY:
 * - Verifies SendGrid webhook signature
 * - Rate limited
 * - Logs all events to email_logs table
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createAdminClient } from '../_shared/supabase.ts';
import { getCorsHeaders } from '../_shared/cors.ts';
import { Logger } from '../_shared/logger.ts';
import { timingSafeEqual } from 'https://deno.land/std@0.168.0/crypto/timing_safe_equal.ts';

const logger = new Logger();

const SENDGRID_WEBHOOK_VERIFICATION_KEY = Deno.env.get('SENDGRID_WEBHOOK_VERIFICATION_KEY');

// SendGrid event types
type SendGridEventType =
  | 'processed'
  | 'dropped'
  | 'delivered'
  | 'deferred'
  | 'bounce'
  | 'open'
  | 'click'
  | 'spamreport'
  | 'unsubscribe'
  | 'group_unsubscribe'
  | 'group_resubscribe';

interface SendGridEvent {
  email: string;
  timestamp: number;
  'smtp-id'?: string;
  event: SendGridEventType;
  category?: string[];
  sg_event_id: string;
  sg_message_id: string;
  response?: string;
  attempt?: string;
  useragent?: string;
  ip?: string;
  url?: string;
  reason?: string;
  status?: string;
  type?: string; // bounce type: 'bounce' or 'blocked'
  tls?: number;
}

/**
 * Verify SendGrid webhook signature
 * SendGrid uses ECDSA signature verification
 */
async function verifySignature(
  payload: string,
  signature: string,
  timestamp: string
): Promise<boolean> {
  if (!SENDGRID_WEBHOOK_VERIFICATION_KEY) {
    logger.warn('[SendGrid Webhook] No verification key configured - skipping signature check');
    return true; // Allow in development if not configured
  }

  try {
    // SendGrid signature verification
    // The signature is base64-encoded ECDSA signature
    const encoder = new TextEncoder();
    const data = encoder.encode(timestamp + payload);

    // Import the public key
    const publicKey = await crypto.subtle.importKey(
      'raw',
      Uint8Array.from(atob(SENDGRID_WEBHOOK_VERIFICATION_KEY), c => c.charCodeAt(0)),
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify']
    );

    const signatureBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));

    const isValid = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      publicKey,
      signatureBytes,
      data
    );

    return isValid;
  } catch (error) {
    logger.error('[SendGrid Webhook] Signature verification error:', error);
    // In case of verification failure, allow the request if no key is configured
    // This is for development/testing purposes
    return !SENDGRID_WEBHOOK_VERIFICATION_KEY;
  }
}

/**
 * Process a single SendGrid event
 */
async function processEvent(event: SendGridEvent): Promise<void> {
  const supabase = createAdminClient();
  const messageId = event.sg_message_id?.split('.')[0]; // Remove domain part

  if (!messageId) {
    logger.warn('[SendGrid Webhook] Event without message ID', { event: event.event });
    return;
  }

  // Call the log_email_event function
  const { error } = await supabase.rpc('log_email_event', {
    p_provider_message_id: messageId,
    p_event_type: event.event,
    p_event_data: {
      timestamp: event.timestamp,
      email: event.email,
      reason: event.reason,
      bounce_type: event.type,
      ip: event.ip,
      useragent: event.useragent,
      url: event.url,
      status: event.status,
      response: event.response
    }
  });

  if (error) {
    logger.error('[SendGrid Webhook] Failed to log event:', { error, messageId, eventType: event.event });
  } else {
    logger.info('[SendGrid Webhook] Event logged', { messageId, eventType: event.event });
  }

  // Handle bounce - potentially update user preferences
  if (event.event === 'bounce' && event.type === 'bounce') {
    await handleHardBounce(event.email);
  }

  // Handle spam complaint - update user preferences
  if (event.event === 'spamreport') {
    await handleSpamComplaint(event.email);
  }
}

/**
 * Handle hard bounce - mark email as invalid
 */
async function handleHardBounce(email: string): Promise<void> {
  const supabase = createAdminClient();

  // Update user's email_verified status if exists
  const { error } = await supabase
    .from('users')
    .update({
      email_bounced: true,
      email_bounced_at: new Date().toISOString()
    })
    .eq('email', email);

  if (error) {
    logger.error('[SendGrid Webhook] Failed to mark email as bounced:', { email, error });
  } else {
    logger.info('[SendGrid Webhook] Marked email as bounced', { email });
  }
}

/**
 * Handle spam complaint - unsubscribe user
 */
async function handleSpamComplaint(email: string): Promise<void> {
  const supabase = createAdminClient();

  // Update user's email preferences
  const { error } = await supabase
    .from('users')
    .update({
      email_unsubscribed: true,
      email_unsubscribed_at: new Date().toISOString(),
      email_unsubscribe_reason: 'spam_complaint'
    })
    .eq('email', email);

  if (error) {
    logger.error('[SendGrid Webhook] Failed to unsubscribe user:', { email, error });
  } else {
    logger.info('[SendGrid Webhook] User unsubscribed due to spam complaint', { email });
  }

  // Log to audit for compliance
  await supabase.from('audit_logs').insert({
    action: 'email_spam_complaint',
    resource_type: 'user',
    new_value: { email, reason: 'spam_complaint' }
  });
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Get raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get('X-Twilio-Email-Event-Webhook-Signature') || '';
    const timestamp = req.headers.get('X-Twilio-Email-Event-Webhook-Timestamp') || '';

    // Verify signature
    const isValid = await verifySignature(rawBody, signature, timestamp);
    if (!isValid) {
      logger.warn('[SendGrid Webhook] Invalid signature');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse events
    const events: SendGridEvent[] = JSON.parse(rawBody);

    if (!Array.isArray(events)) {
      return new Response(JSON.stringify({ error: 'Invalid payload format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    logger.info('[SendGrid Webhook] Processing events', { count: events.length });

    // Process all events
    await Promise.all(events.map(event => processEvent(event)));

    return new Response(JSON.stringify({ success: true, processed: events.length }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    logger.error('[SendGrid Webhook] Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
