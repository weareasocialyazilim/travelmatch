/**
 * Supabase Edge Function: get-conversations
 *
 * Returns active or archived conversations for the calling user
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/cors.ts';
import { createLogger } from '../_shared/logger.ts';

interface GetConversationsRequest {
  type: 'active' | 'archived';
  limit?: number;
  offset?: number;
}

serve(async (req) => {
  const logger = createLogger('get-conversations', req);
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

    const body: GetConversationsRequest = await req.json();
    const { type = 'active', limit = 50, offset = 0 } = body;

    let conversations;
    let count;

    if (type === 'active') {
      // Get active conversations using RPC
      const { data, error } = await supabase
        .rpc('get_active_conversations', { p_user_id: user.id })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      conversations = data;

      // Get total count
      const { count: totalCount } = await supabase
        .from('conversation_participants')
        .select('conversation_id', { count: 'exact' })
        .eq('user_id', user.id);

      count = totalCount || 0;
    } else {
      // Get archived conversations using RPC
      const { data, error } = await supabase
        .rpc('get_archived_conversations', { p_user_id: user.id })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      conversations = data;

      // Get archived count
      const { count: archivedCount } = await supabase
        .from('conversation_archive_state')
        .select('conversation_id', { count: 'exact' })
        .eq('user_id', user.id)
        .not('archived_at', 'is', null);

      count = archivedCount || 0;
    }

    logger.info('Conversations retrieved', {
      userId: user.id,
      type,
      returned: conversations?.length || 0,
      total: count,
    });

    return new Response(
      JSON.stringify({
        success: true,
        type,
        conversations: conversations || [],
        pagination: {
          limit,
          offset,
          total: count,
          hasMore: (conversations?.length || 0) === limit,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    logger.error('Get conversations failed', error);

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
