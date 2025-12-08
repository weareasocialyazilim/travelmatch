import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.21.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const QuerySchema = z.object({
  since_version: z.string().transform((v) => parseInt(v, 10)).default('0'),
  limit: z.string().transform((v) => parseInt(v, 10)).default('100'),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get query parameters
    const url = new URL(req.url);
    const queryParams = QuerySchema.parse({
      since_version: url.searchParams.get('since_version') || '0',
      limit: url.searchParams.get('limit') || '100',
    });

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Query feed_delta for changes since version
    const { data: changes, error: changesError } = await supabaseClient
      .from('feed_delta')
      .select('*')
      .eq('user_id', user.id)
      .gt('version', queryParams.since_version)
      .order('version', { ascending: true })
      .limit(queryParams.limit);

    if (changesError) {
      return new Response(
        JSON.stringify({
          error: 'Failed to fetch feed delta',
          details: changesError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!changes || changes.length === 0) {
      // No changes since last sync
      return new Response(
        JSON.stringify({
          changes: {
            added: [],
            updated: [],
            deleted: [],
          },
          next_version: queryParams.since_version,
          has_more: false,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Group changes by operation
    const added = changes
      .filter((c) => c.operation === 'insert')
      .map((c) => ({
        version: c.version,
        type: c.item_type,
        id: c.item_id,
        data: c.data,
      }));

    const updated = changes
      .filter((c) => c.operation === 'update')
      .map((c) => ({
        version: c.version,
        type: c.item_type,
        id: c.item_id,
        data: c.data,
      }));

    const deleted = changes
      .filter((c) => c.operation === 'delete')
      .map((c) => ({
        version: c.version,
        type: c.item_type,
        id: c.item_id,
      }));

    const nextVersion = changes[changes.length - 1].version;
    const hasMore = changes.length === queryParams.limit;

    return new Response(
      JSON.stringify({
        changes: {
          added,
          updated,
          deleted,
        },
        next_version: nextVersion,
        has_more: hasMore,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Feed delta error:', error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: 'Invalid query parameters',
          details: error.errors,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
