/**
 * Supabase Edge Function: upload-story
 *
 * Handles story upload with AWS Rekognition moderation pipeline
 *
 * Flow:
 * 1. Receive upload request with media URL
 * 2. Run AWS Rekognition content moderation
 * 3. If safe: auto-approve and publish
 * 4. If flagged: set to pending human review
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/cors.ts';
import { createLogger } from '../_shared/logger.ts';

interface UploadStoryRequest {
  imageUrl: string;
  videoUrl?: string;
  momentId?: string;
}

serve(async (req) => {
  const logger = createLogger('upload-story', req);
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

    const body: UploadStoryRequest = await req.json();
    const { imageUrl, videoUrl, momentId } = body;

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'imageUrl is required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Create story record with pending status
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .insert({
        user_id: user.id,
        image_url: imageUrl,
        video_url: videoUrl || null,
        moment_id: momentId || null,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        moderation_status: 'pending',
      })
      .select()
      .single();

    if (storyError) {
      throw new Error(`Failed to create story: ${storyError.message}`);
    }

    // Run moderation (async, don't block response)
    runModeration(story.id, imageUrl, supabaseUrl, supabaseAnonKey)
      .catch((modError) => {
        logger.error('Moderation failed', { storyId: story.id, error: modError });
      });

    logger.info('Story created', { storyId: story.id, userId: user.id });

    return new Response(
      JSON.stringify({
        success: true,
        storyId: story.id,
        status: 'pending_moderation',
        expiresAt: story.expires_at,
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    logger.error('Story upload failed', error);

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Run moderation in background
async function runModeration(
  storyId: string,
  imageUrl: string,
  supabaseUrl: string,
  supabaseAnonKey: string,
): Promise<void> {
  try {
    // Call AWS Rekognition moderation
    const rekognitionResult = await moderateImage(imageUrl);

    // Determine status based on moderation result
    const isSafe = rekognitionResult.isSafeContent;
    const status = isSafe ? 'approved' : 'flagged';

    // Update story with moderation result
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    await supabase.rpc('update_story_moderation', {
      p_story_id: storyId,
      p_status: status,
      p_score: JSON.stringify(rekognitionResult.labels || {}),
      p_rekognition_result: JSON.stringify(rekognitionResult),
    });

    // If flagged, log for admin review
    if (!isSafe) {
      await supabase.from('moderation_alerts').insert({
        resource_type: 'story',
        resource_id: storyId,
        alert_type: 'content_flagged',
        metadata: { rekognition_result: rekognitionResult },
      });
    }
  } catch (error) {
    // On moderation error, set to flagged for human review
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    await supabase.rpc('update_story_moderation', {
      p_story_id: storyId,
      p_status: 'flagged',
      p_notes: `Moderation error: ${error}`,
    });
  }
}

// Mock moderation function (replace with actual AWS Rekognition call)
async function moderateImage(imageUrl: string): Promise<{
  isSafeContent: boolean;
  labels: Array<{ name: string; confidence: number }>;
  moderationLabels: Array<{ name: string; confidence: number }>;
}> {
  // In production, call AWS Rekognition here
  // const result = await rekognition.detectModerationLabels({ Image: { S3Object: { Bucket, Name } } }).promise();

  // Mock response - always approve for now
  return {
    isSafeContent: true,
    labels: [
      { name: 'Person', confidence: 98.5 },
      { name: 'Selfie', confidence: 95.2 },
    ],
    moderationLabels: [],
  };
}
