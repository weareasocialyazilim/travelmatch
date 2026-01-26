/**
 * Supabase Edge Function: archive-conversation
 *
 * Archives or unarchives a conversation for the calling user
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/cors.ts';
import { createLogger } from '../_shared/logger.ts';

interface ArchiveRequest {
  conversationId: string;
  action: 'archive' | 'unarchive';
}

serve(async (req) => {
  const logger = createLogger('archive-conversation', req);
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const body: ArchiveRequest = await req.json();
    const { conversationId, action } = body;

    if (!conversationId || !action) {
      return new Response(
        JSON.stringify({ error: 'conversationId and action are required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Verify user is participant in conversation
    const { data: participant, error: participantError } = await supabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (participantError || !participant) {
      return new Response(
        JSON.stringify({ error: 'You are not a participant in this conversation' }),
        { status: 403, headers: corsHeaders }
      );
    }

    let result;

    if (action === 'archive') {
      const { data, error } = await supabase
        .rpc('archive_conversation', {
          p_user_id: user.id,
          p_conversation_id: conversationId,
        });

      if (error) throw error;

      logger.info('Conversation archived', { userId: user.id, conversationId });

      result = {
        success: true,
        conversationId,
        action: 'archived',
        archivedAt: new Date().toISOString(),
      };
    } else {
      const { data, error } = await supabase
        .rpc('unarchive_conversation', {
          p_user_id: user.id,
          p_conversation_id: conversationId,
        });

      if (error) throw error;

      logger.info('Conversation unarchived', { userId: user.id, conversationId });

      result = {
        success: true,
        conversationId,
        action: 'unarchived',
        unarchivedAt: new Date().toISOString(),
      };
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    logger.error('Archive operation failed', error);

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
