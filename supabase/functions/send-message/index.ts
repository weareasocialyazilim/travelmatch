/**
 * Send Message Edge Function
 *
 * Handles message sending with content moderation.
 * Validates content before allowing it to be stored.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import {
  getCorsHeaders,
  jsonResponse,
  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '../_shared/responses.ts';
import { createLogger } from '../_shared/logger.ts';
import {
  moderateContent,
  getViolationMessage,
  type ModerationResult,
} from '../_shared/content-moderation.ts';

const logger = createLogger('send-message');

interface SendMessageRequest {
  conversationId: string;
  content: string;
  messageType?: 'text' | 'image' | 'system';
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only allow POST
    if (req.method !== 'POST') {
      return badRequestResponse('Method not allowed', corsHeaders);
    }

    // Verify authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return unauthorizedResponse('Missing authorization', corsHeaders);
    }

    // Get user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return unauthorizedResponse('Invalid token', corsHeaders);
    }

    // ==========================================================================
    // 0. Risk & Moderation Check (User Status)
    // ==========================================================================
    // Use user_safety table for moderation status
    const { data: userInfo, error: userError } = await supabase
      .from('user_safety')
      .select('risk_score, status, ban_reason')
      .eq('user_id', user.id)
      .single();

    if (userError) {
      // If no safety record exists, create one (self-healing)
      if (userError.code === 'PGRST116') {
        logger.warn(
          `Missing safety record for user ${user.id}, creating default.`,
        );
        // We can continue with default values if insert is async or we just use defaults here.
        // For now, assume active.
      } else {
        logger.error('Failed to fetch user safety info', userError);
        return jsonResponse(
          { success: false, error: 'Service temporary unavailable' },
          { status: 503, headers: corsHeaders },
        );
      }
    }

    const userStatus = userInfo?.status || 'active';
    const riskScore = userInfo?.risk_score || 0;

    // ⛔ Permanent Ban Check
    if (userStatus === 'permanent_ban') {
      return jsonResponse(
        {
          success: false,
          error: 'Your account has been closed due to violations.',
          code: 'ACCOUNT_BANNED',
        },
        { status: 403, headers: corsHeaders },
      );
    }

    // 🔒 Temp Lock Check
    if (userStatus === 'temp_locked') {
      return jsonResponse(
        {
          success: false,
          error: 'Account under review. Please contact support.',
          code: 'ACCOUNT_LOCKED',
        },
        { status: 403, headers: corsHeaders },
      );
    }

    // ⏳ Soft Throttle Check (Simulated Delay or Rejection)
    if (userStatus === 'throttled') {
      // We can reject 1 out of 3 requests or just add a random delay
      // For simplicity, let's reject bursty behavior aggressively here
      const random = Math.random();
      if (random > 0.7) {
        // 30% chance to fail
        return jsonResponse(
          {
            success: false,
            error: 'You are sending messages too fast. Slow down.',
            code: 'THROTTLED',
          },
          { status: 429, headers: corsHeaders },
        );
      }
    }

    // ==========================================================================
    // Rate Limiting (Hardening)
    // ==========================================================================
    try {
      const { data: allowed, error: rateLimitError } = await supabase.rpc(
        'check_rate_limit',
        {
          identifier: user.id,
          endpoint: 'send-message',
        },
      );

      // Fail closed (if error, allow request but log it - or fail open? Let's stay safe and assume allow unless explicitly blocked for UX)
      // Actually strictly, we should probably block if rate limit system is down, but for user experience let's log error.
      // However, if allowed is false, we BLOCK.

      if (rateLimitError) {
        logger.error('Rate limit check failed', rateLimitError);
      } else if (allowed === false) {
        return jsonResponse(
          {
            success: false,
            error: 'Too many messages. Please slow down.',
            code: 'RATE_LIMITED',
          },
          { status: 429, headers: corsHeaders },
        );
      }
    } catch (err) {
      logger.error('Rate limit exception', err);
    }

    // Parse request
    const body: SendMessageRequest = await req.json();
    const { conversationId, content, messageType = 'text' } = body;

    if (!conversationId || !content) {
      return badRequestResponse(
        'conversationId and content are required',
        corsHeaders,
      );
    }

    // Verify user is part of conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id, user1_id, user2_id')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return badRequestResponse('Conversation not found', corsHeaders);
    }

    if (
      conversation.user1_id !== user.id &&
      conversation.user2_id !== user.id
    ) {
      return forbiddenResponse('Not a participant', corsHeaders);
    }

    // ==========================================================================
    // Content Moderation
    // ==========================================================================

    const moderationResult: ModerationResult = moderateContent(content, {
      blockBadWords: true,
      blockPhoneNumbers: true,
      blockPII: true,
      blockSpam: true,
      blockExternalLinks: true,
      strictMode: false,
    });

    // Log moderation result for analytics
    if (moderationResult.violations.length > 0) {
      logger.warn('Content moderation triggered', {
        userId: user.id,
        conversationId,
        severity: moderationResult.severity,
        violationTypes: moderationResult.violations.map((v) => v.type),
      });

      // Log to analytics table
      await supabase
        .from('moderation_logs')
        .insert({
          user_id: user.id,
          content_type: 'message',
          content_hash: await hashContent(content),
          severity: moderationResult.severity,
          violations: moderationResult.violations,
          action_taken: moderationResult.allowed ? 'allowed' : 'blocked',
          created_at: new Date().toISOString(),
        })
        .catch(() => {}); // Don't fail if logging fails
    }

    // Block if not allowed
    if (!moderationResult.allowed) {
      const errorMessage =
        getViolationMessage(moderationResult) || 'Mesaj gönderilemedi';

      return jsonResponse(
        {
          success: false,
          error: errorMessage,
          code: 'CONTENT_MODERATION_BLOCKED',
          severity: moderationResult.severity,
        },
        { status: 400, headers: corsHeaders },
      );
    }

    // ==========================================================================
    // 1. Behavioral Risk Analysis (Triggers)
    // ==========================================================================

    let riskIncrement = 0;
    const triggers: string[] = [];

    // Check 1: Link Detection (Social media, URL)
    const linkRegex =
      /(http|https|www\.|t\.me|wa\.me|instagram\.com|instagram|whatsapp|telegram)/i;
    if (linkRegex.test(content)) {
      riskIncrement += 25; // High risk for taking users off-platform
      triggers.push('link_in_message');
    }

    // Check 2: Message Burst (Last 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count: burstCount } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('sender_id', user.id)
      .gt('created_at', tenMinutesAgo);

    if ((burstCount || 0) > 15) {
      riskIncrement += 20;
      triggers.push('message_burst');
    }

    // Check 3: Unique Recipients (Last 1 hour) -- Detecting "Shotgun" spam
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    // This query might be expensive, optimize in prod (maybe a materialized view or redis)
    // For now, raw query is fine for v1
    const { data: uniqueRecipients } = await supabase
      .from('messages')
      .select('receiver_id')
      .eq('sender_id', user.id)
      .gt('created_at', oneHourAgo);

    if (uniqueRecipients) {
      const uniqueSet = new Set(uniqueRecipients.map((m) => m.receiver_id));
      if (uniqueSet.size > 12) {
        riskIncrement += 25;
        triggers.push('dm_many_uniques');
      }
    }

    // Check 4: Repeat Message (Spam)
    // Basic check: Has sent EXACT same message to 3 different people in 24h?
    // Omitting for now to save DB calls, can act on "burst" mostly. Use Edge function state if possible later.

    // --- Apply Risk Updates ---
    if (riskIncrement > 0) {
      // Increment risk score securely via RPC
      await supabase.rpc('increment_risk_score', {
        target_user_id: user.id,
        increment_amount: riskIncrement,
        reason_text: `Triggers: ${triggers.join(', ')}`,
      });

      logger.warn(`User ${user.id} risk increased by +${riskIncrement}`, {
        triggers,
      });
    }

    // ==========================================================================
    // Send Message
    // ==========================================================================

    // Determine the other user
    const receiverId =
      conversation.user1_id === user.id
        ? conversation.user2_id
        : conversation.user1_id;

    // Check if user is now Shadowbanned (after risk update or before)
    // We re-check status locally if we incremented risk significantly, or just rely on 'userInfo' we fetched at start.
    // If riskIncrement was huge, maybe we should act immediately. Let's assume standard flow.

    // Ghost Mode Logic
    let visibility = 'public';
    // Use local variables userStatus and riskScore derived from user_safety
    if (userStatus === 'shadowbanned' || riskScore + riskIncrement >= 50) {
      visibility = 'ghost';
      logger.info(
        `Shadowban active for user ${user.id}. Message will be ghosted.`,
      );
    }

    // Insert message
    const { data: message, error: insertError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        receiver_id: receiverId,
        content: content.trim(),
        visibility: visibility,
        type: messageType,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      logger.error('Failed to insert message', insertError);
      return jsonResponse(
        { success: false, error: 'Failed to send message' },
        { status: 500, headers: corsHeaders },
      );
    }

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    // Send push notification (async, don't wait)
    // ONLY if message is public
    if (visibility === 'public') {
      sendPushNotification(supabase, receiverId, user.id, content).catch(
        (err) => logger.error('Push notification failed', err),
      );
    }

    logger.info('Message sent successfully', {
      messageId: message.id,
      conversationId,
      senderId: user.id,
    });

    return jsonResponse(
      {
        success: true,
        message: {
          id: message.id,
          conversationId: message.conversation_id,
          content: message.content,
          messageType: message.message_type,
          createdAt: message.created_at,
        },
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    logger.error('Send message error', error);

    return jsonResponse(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: getCorsHeaders(req.headers.get('origin')) },
    );
  }
});

// =============================================================================
// Helpers
// =============================================================================

async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sendPushNotification(
  supabase: ReturnType<typeof createClient>,
  receiverId: string,
  senderId: string,
  _content: string,
): Promise<void> {
  // Check Quiet Hours
  try {
    const { data: receiverSettings } = await supabase
      .from('users')
      .select('quiet_hours_start, quiet_hours_end')
      .eq('id', receiverId)
      .single();

    if (
      receiverSettings?.quiet_hours_start &&
      receiverSettings?.quiet_hours_end
    ) {
      const now = new Date();
      const currentHour = now.getUTCHours();
      const currentMinute = now.getUTCMinutes();
      const currentTime = currentHour * 60 + currentMinute;

      const [startH, startM] = receiverSettings.quiet_hours_start
        .split(':')
        .map(Number);
      const [endH, endM] = receiverSettings.quiet_hours_end
        .split(':')
        .map(Number);

      const startTime = startH * 60 + startM;
      const endTime = endH * 60 + endM;

      let isQuietTime = false;
      if (startTime < endTime) {
        isQuietTime = currentTime >= startTime && currentTime < endTime;
      } else {
        isQuietTime = currentTime >= startTime || currentTime < endTime;
      }

      if (isQuietTime) return;
    }
  } catch (_e) {
    /* ignore */
  }

  // Get sender name
  const { data: sender } = await supabase
    .from('profiles')
    .select('full_name, username')
    .eq('id', senderId)
    .single();

  if (!sender) return;

  // Get receiver's push tokens
  const { data: tokens } = await supabase
    .from('push_tokens')
    .select('token, platform')
    .eq('user_id', receiverId);

  if (!tokens || tokens.length === 0) return;

  // Create notification
  await supabase.from('notifications').insert({
    user_id: receiverId,
    type: 'new_message',
    title: 'Yeni Mesaj',
    body: `${sender.full_name || sender.username}: Yeni bir mesaj aldınız`,
    data: { senderId },
    created_at: new Date().toISOString(),
  });
}
