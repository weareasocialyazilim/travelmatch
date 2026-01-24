/**
 * Gift Approve Edge Function
 * EK-P0-1: Move critical writes to Edge Functions
 *
 * Handles gift chat unlock approval from hosts.
 * Previously done directly in client, now secured server-side.
 *
 * SECURITY:
 * - Requires authenticated user (JWT)
 * - Validates gift ownership (receiver_id must match user)
 * - Enforces $30 minimum for chat unlock
 * - Uses service_role for DB operations
 * - Rate limited per user
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createSupabaseClients, requireAuth } from '../_shared/supabase.ts';
import { getCorsHeaders, handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { Logger } from '../_shared/logger.ts';

const logger = new Logger('gift-approve');

// Rate limiting: Simple in-memory store (consider Redis/KV for production scale)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = { maxRequests: 10, windowMs: 60000 }; // 10 requests per minute

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

interface ApproveGiftRequest {
  gift_id: string;
  sender_id: string; // The gift giver (for notification)
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
    logger.info('Gift approval request received');

    // Rate limit check
    if (!checkRateLimit(user.id)) {
      logger.warn('Rate limit exceeded', { userId: user.id });
      return errorResponse('Too many requests', 429, req);
    }

    // Parse request
    const body: ApproveGiftRequest = await req.json();
    const { gift_id, sender_id } = body;

    if (!gift_id) {
      return errorResponse('gift_id is required', 400, req);
    }

    // Call the secure RPC function (uses service_role)
    const { data: result, error: rpcError } = await adminClient.rpc('approve_gift_chat', {
      p_gift_id: gift_id,
      p_receiver_id: user.id,
    });

    if (rpcError) {
      logger.error('Gift approval failed', new Error(rpcError.message), { gift_id });
      return errorResponse(rpcError.message, 400, req);
    }

    // If already approved, return success without notification
    if (result?.already_approved) {
      logger.info('Gift already approved', { gift_id });
      return jsonResponse({ success: true, already_approved: true }, 200, req);
    }

    // Create notification for sender (the gift giver)
    const notificationTarget = sender_id || result?.giver_id;
    if (notificationTarget) {
      const { error: notifError } = await adminClient.rpc('create_notification', {
        p_user_id: notificationTarget,
        p_type: 'chat_unlocked',
        p_title: 'Sohbet Başladı! 💬',
        p_body: 'Hediyeni kabul etti ve seninle sohbet başlattı!',
        p_data: { gift_id, host_id: user.id },
      });

      if (notifError) {
        // Log but don't fail the request
        logger.warn('Failed to create notification', { error: notifError.message });
      }
    }

    logger.info('Gift approved successfully', { gift_id });

    return jsonResponse({
      success: true,
      gift_id,
      message: 'Chat unlocked successfully',
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
