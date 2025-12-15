/**
 * Video Processing Edge Function
 * 
 * Handles video operations that require service role access:
 * - Video upload to Cloudflare Stream
 * - Video deletion
 * - Analytics retrieval
 * 
 * SECURITY: This function runs server-side with service_role access
 * Client calls this via authenticated HTTP request
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Video configuration
const VIDEO_CONFIG = {
  maxFileSize: 500 * 1024 * 1024, // 500MB
  maxDuration: 300, // 5 minutes
  supportedFormats: ['mp4', 'mov', 'avi', 'webm'],
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's token for RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin client for service operations (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    switch (action) {
      case 'upload':
        return await handleUpload(req, user, supabaseAdmin);
      case 'delete':
        return await handleDelete(req, user, supabaseAdmin);
      case 'analytics':
        return await handleAnalytics(req, user, supabaseAdmin);
      case 'process':
        return await handleProcess(req, user, supabaseAdmin);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Video processing error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Handle video upload to Cloudflare Stream
 */
async function handleUpload(
  req: Request,
  user: { id: string },
  supabase: ReturnType<typeof createClient>
): Promise<Response> {
  const body = await req.json();
  const { momentId, title, description, uploadUrl } = body;

  if (!momentId || !uploadUrl) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields: momentId, uploadUrl' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Verify user owns the moment
  const { data: moment, error: momentError } = await supabase
    .from('moments')
    .select('id, user_id')
    .eq('id', momentId)
    .single();

  if (momentError || !moment) {
    return new Response(
      JSON.stringify({ error: 'Moment not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (moment.user_id !== user.id) {
    return new Response(
      JSON.stringify({ error: 'Not authorized to upload video to this moment' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Upload to Cloudflare Stream
  const streamApiKey = Deno.env.get('CLOUDFLARE_STREAM_API_KEY');
  const streamAccountId = Deno.env.get('CLOUDFLARE_STREAM_ACCOUNT_ID');

  if (!streamApiKey || !streamAccountId) {
    return new Response(
      JSON.stringify({ error: 'Video service not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Create upload URL for client-side upload
  const streamResponse = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${streamAccountId}/stream?direct_user=true`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${streamApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        maxDurationSeconds: VIDEO_CONFIG.maxDuration,
        meta: {
          momentId,
          userId: user.id,
          title,
          description,
        },
      }),
    }
  );

  const streamResult = await streamResponse.json();

  if (!streamResult.success) {
    return new Response(
      JSON.stringify({ error: 'Failed to create upload URL' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Save video record to database
  const { data: video, error: videoError } = await supabase
    .from('videos')
    .insert({
      moment_id: momentId,
      user_id: user.id,
      cloudflare_uid: streamResult.result.uid,
      title,
      description,
      status: 'pending',
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (videoError) {
    console.error('Failed to save video record:', videoError);
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        videoId: video?.id,
        cloudflareUid: streamResult.result.uid,
        uploadUrl: streamResult.result.uploadURL,
      },
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Handle video deletion
 */
async function handleDelete(
  req: Request,
  user: { id: string },
  supabase: ReturnType<typeof createClient>
): Promise<Response> {
  const body = await req.json();
  const { videoId } = body;

  if (!videoId) {
    return new Response(
      JSON.stringify({ error: 'Missing videoId' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get video and verify ownership
  const { data: video, error: videoError } = await supabase
    .from('videos')
    .select('id, user_id, cloudflare_uid')
    .eq('id', videoId)
    .single();

  if (videoError || !video) {
    return new Response(
      JSON.stringify({ error: 'Video not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (video.user_id !== user.id) {
    return new Response(
      JSON.stringify({ error: 'Not authorized to delete this video' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Delete from Cloudflare Stream
  const streamApiKey = Deno.env.get('CLOUDFLARE_STREAM_API_KEY');
  const streamAccountId = Deno.env.get('CLOUDFLARE_STREAM_ACCOUNT_ID');

  if (video.cloudflare_uid && streamApiKey && streamAccountId) {
    await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${streamAccountId}/stream/${video.cloudflare_uid}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${streamApiKey}`,
        },
      }
    );
  }

  // Delete from database
  await supabase.from('video_captions').delete().eq('video_id', videoId);
  await supabase.from('video_transcripts').delete().eq('video_id', videoId);
  await supabase.from('videos').delete().eq('id', videoId);

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Handle video analytics retrieval
 */
async function handleAnalytics(
  req: Request,
  user: { id: string },
  supabase: ReturnType<typeof createClient>
): Promise<Response> {
  const url = new URL(req.url);
  const videoId = url.searchParams.get('videoId');

  if (!videoId) {
    return new Response(
      JSON.stringify({ error: 'Missing videoId' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get video and verify ownership
  const { data: video, error: videoError } = await supabase
    .from('videos')
    .select('id, user_id, cloudflare_uid')
    .eq('id', videoId)
    .single();

  if (videoError || !video) {
    return new Response(
      JSON.stringify({ error: 'Video not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (video.user_id !== user.id) {
    return new Response(
      JSON.stringify({ error: 'Not authorized to view analytics' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get analytics from Cloudflare
  const streamApiKey = Deno.env.get('CLOUDFLARE_STREAM_API_KEY');
  const streamAccountId = Deno.env.get('CLOUDFLARE_STREAM_ACCOUNT_ID');

  if (!streamApiKey || !streamAccountId || !video.cloudflare_uid) {
    return new Response(
      JSON.stringify({
        success: true,
        data: { views: 0, watchTime: 0, avgWatchTime: 0, completionRate: 0 },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const analyticsResponse = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${streamAccountId}/stream/analytics/views?videoUID=${video.cloudflare_uid}`,
    {
      headers: {
        'Authorization': `Bearer ${streamApiKey}`,
      },
    }
  );

  const analyticsResult = await analyticsResponse.json();

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        views: analyticsResult.result?.totalViews || 0,
        watchTime: analyticsResult.result?.totalTimeViewedMinutes || 0,
        avgWatchTime: analyticsResult.result?.avgTimeViewedMinutes || 0,
        completionRate: analyticsResult.result?.completionRate || 0,
      },
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Handle video processing status update
 */
async function handleProcess(
  req: Request,
  user: { id: string },
  supabase: ReturnType<typeof createClient>
): Promise<Response> {
  const body = await req.json();
  const { videoId, status, playbackUrl, thumbnailUrl, duration } = body;

  if (!videoId) {
    return new Response(
      JSON.stringify({ error: 'Missing videoId' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Update video status
  const { error: updateError } = await supabase
    .from('videos')
    .update({
      status,
      playback_url: playbackUrl,
      thumbnail_url: thumbnailUrl,
      duration,
      updated_at: new Date().toISOString(),
    })
    .eq('id', videoId)
    .eq('user_id', user.id); // Ensure ownership

  if (updateError) {
    return new Response(
      JSON.stringify({ error: 'Failed to update video status' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
