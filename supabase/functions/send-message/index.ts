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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return unauthorizedResponse('Invalid token', corsHeaders);
    }

    // Parse request
    const body: SendMessageRequest = await req.json();
    const { conversationId, content, messageType = 'text' } = body;

    if (!conversationId || !content) {
      return badRequestResponse(
        'conversationId and content are required',
        corsHeaders
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
      await supabase.from('moderation_logs').insert({
        user_id: user.id,
        content_type: 'message',
        content_hash: await hashContent(content),
        severity: moderationResult.severity,
        violations: moderationResult.violations,
        action_taken: moderationResult.allowed ? 'allowed' : 'blocked',
        created_at: new Date().toISOString(),
      }).catch(() => {}); // Don't fail if logging fails
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
        { status: 400, headers: corsHeaders }
      );
    }

    // ==========================================================================
    // Send Message
    // ==========================================================================

    // Determine the other user
    const receiverId =
      conversation.user1_id === user.id
        ? conversation.user2_id
        : conversation.user1_id;

    // Insert message
    const { data: message, error: insertError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        receiver_id: receiverId,
        content: content.trim(),
        message_type: messageType,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      logger.error('Failed to insert message', insertError);
      return jsonResponse(
        { success: false, error: 'Failed to send message' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    // Send push notification (async, don't wait)
    sendPushNotification(supabase, receiverId, user.id, content).catch((err) =>
      logger.error('Push notification failed', err)
    );

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
      { headers: corsHeaders }
    );
  } catch (error) {
    logger.error('Send message error', error);

    return jsonResponse(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: getCorsHeaders(req.headers.get('origin')) }
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
  _content: string
): Promise<void> {
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
