/**
 * Send Notification Edge Function
 * EK-P0-1: Move critical writes to Edge Functions
 *
 * Handles notification creation.
 * Previously done directly in client (security risk), now secured server-side.
 *
 * SECURITY:
 * - Requires authenticated user (JWT)
 * - Validates notification type against whitelist
 * - Rate limited per user
 * - Uses service_role for DB operations
 *
 * ALLOWED NOTIFICATION TYPES (user-initiated):
 * - gratitude_received: When host sends thank you note
 * - message_received: When user sends a message (handled by realtime, but fallback)
 *
 * SYSTEM-ONLY TYPES (not allowed via this endpoint):
 * - chat_unlocked: Created by gift-approve function
 * - kyc_*, payment_*, system_*: Internal use only
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createSupabaseClients, requireAuth } from '../_shared/supabase.ts';
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { Logger } from '../_shared/logger.ts';

const logger = new Logger('send-notification');

// Rate limiting
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = { maxRequests: 20, windowMs: 60000 }; // 20 per minute

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(userId);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(userId, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return true;
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// Whitelist of notification types users can create
const ALLOWED_TYPES = new Set([
  'gratitude_received',
  'message_received',
]);

interface SendNotificationRequest {
  user_id: string;      // Target user
  type: string;         // Notification type
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // Only POST allowed
  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405, req);
  }

  try {
    logger.setRequestContext(req);

    // Get authenticated user
    const { userClient, adminClient } = createSupabaseClients({ request: req });
    const user = await requireAuth(userClient);

    logger.setContext({ userId: user.id });

    // Rate limit check
    if (!checkRateLimit(user.id)) {
      logger.warn('Rate limit exceeded');
      return errorResponse('Too many requests', 429, req);
    }

    // Parse request
    const body: SendNotificationRequest = await req.json();
    const { user_id, type, title, body: notifBody, data } = body;

    // Validate required fields
    if (!user_id || !type || !title || !notifBody) {
      return errorResponse('Missing required fields: user_id, type, title, body', 400, req);
    }

    // Validate notification type
    if (!ALLOWED_TYPES.has(type)) {
      logger.securityEvent('Attempted to send disallowed notification type', { type });
      return errorResponse(`Notification type '${type}' is not allowed`, 403, req);
    }

    // Prevent self-notifications (potential spam vector)
    if (user_id === user.id) {
      return errorResponse('Cannot send notification to yourself', 400, req);
    }

    // For gratitude_received, validate the sender has permission
    // (e.g., they received a gift from the target user)
    if (type === 'gratitude_received') {
      const { data: gift, error: giftError } = await adminClient
        .from('gifts')
        .select('id')
        .eq('giver_id', user_id)
        .eq('receiver_id', user.id)
        .limit(1)
        .maybeSingle();

      if (giftError || !gift) {
        logger.securityEvent('Attempted gratitude without gift relationship', {
          senderId: user.id,
          targetId: user_id,
        });
        return errorResponse('Cannot send gratitude to this user', 403, req);
      }
    }

    // Create notification via RPC
    const { data: notifId, error: rpcError } = await adminClient.rpc('create_notification', {
      p_user_id: user_id,
      p_type: type,
      p_title: title,
      p_body: notifBody,
      p_data: {
        ...data,
        sender_id: user.id, // Always include sender for audit
      },
    });

    if (rpcError) {
      logger.error('Failed to create notification', new Error(rpcError.message));
      return errorResponse('Failed to send notification', 500, req);
    }

    logger.info('Notification sent', { notifId, type, targetUser: user_id });

    return jsonResponse({
      success: true,
      notification_id: notifId,
    }, 200, req);

  } catch (error) {
    const err = error as Error;
    logger.error('Unexpected error', err);

    if (err.message === 'Authentication required') {
      return errorResponse('Unauthorized', 401, req);
    }

    return errorResponse(err.message || 'Internal server error', 500, req);
  }
});
