/**
 * Supabase Edge Function: cleanup-expired-stories
 *
 * MASTER Revizyonu: Stories 24 Saat Kuralı
 *
 * Bu Edge Function her saat başı çalışır ve:
 * 1. expires_at süresi geçmiş story'leri soft-delete yapar
 * 2. 7 günden eski soft-deleted story'leri tamamen siler
 * 3. İstatistikleri loglar
 *
 * Cron Schedule: 0 * * * * (her saat başı)
 *
 * @edge-function cleanup-expired-stories
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface CleanupResult {
  expiredCount: number;
  deletedCount: number;
  errors: string[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const now = new Date().toISOString();
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const result: CleanupResult = {
      expiredCount: 0,
      deletedCount: 0,
      errors: [],
    };

    // Step 1: Soft-delete expired stories (24h rule)
    const { data: expiredStories, error: expireError } = await supabase
      .from('stories')
      .update({
        is_deleted: true,
        deleted_at: now,
      })
      .lt('expires_at', now)
      .eq('is_deleted', false)
      .select('id');

    if (expireError) {
      result.errors.push(`Expire error: ${expireError.message}`);
    } else {
      result.expiredCount = expiredStories?.length || 0;
    }

    // Step 2: Hard delete stories that were soft-deleted more than 7 days ago
    const { data: deletedStories, error: deleteError } = await supabase
      .from('stories')
      .delete()
      .eq('is_deleted', true)
      .lt('deleted_at', sevenDaysAgo)
      .select('id');

    if (deleteError) {
      result.errors.push(`Delete error: ${deleteError.message}`);
    } else {
      result.deletedCount = deletedStories?.length || 0;
    }

    // Step 3: Also cleanup orphaned story_views for deleted stories
    const { error: viewsCleanupError } = await supabase
      .from('story_views')
      .delete()
      .not(
        'story_id',
        'in',
        `(SELECT id FROM stories WHERE is_deleted = false)`,
      );

    if (viewsCleanupError) {
      result.errors.push(`Views cleanup error: ${viewsCleanupError.message}`);
    }

    // Log results
    console.log('Stories cleanup completed:', {
      timestamp: now,
      expiredCount: result.expiredCount,
      deletedCount: result.deletedCount,
      errors: result.errors,
    });

    return new Response(
      JSON.stringify({
        success: result.errors.length === 0,
        message: `Cleanup completed: ${result.expiredCount} expired, ${result.deletedCount} permanently deleted`,
        details: result,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Stories cleanup error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      },
    );
  }
});
