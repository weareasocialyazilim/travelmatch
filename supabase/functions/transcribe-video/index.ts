/**
 * Video Transcription Proxy - Server-side OpenAI Whisper API wrapper
 * 
 * Prevents exposing OpenAI API key in client bundle
 * Implements rate limiting, caching, and cost optimization
 * 
 * Endpoints:
 * - POST /transcribe-video - Transcribe audio from video
 * 
 * Security:
 * - OpenAI API key stored server-side only
 * - Rate limiting via Upstash Redis
 * - User authentication required
 * - Request validation
 * - Response caching (permanent for same audio)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createUpstashRateLimiter, RateLimitPresets } from '../_shared/upstashRateLimit.ts';
import { corsHeaders } from '../_shared/security-middleware.ts';
import {
  createErrorResponse,
  createSuccessResponse,
  createRateLimitError,
  createValidationError,
  toHttpResponse,
  toHttpSuccessResponse,
  handleUnexpectedError,
} from '../_shared/errorHandler.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

if (!OPENAI_API_KEY) {
  throw new Error('🔒 OPENAI_API_KEY is required');
}

// Rate limiter: 10 transcriptions per hour per user
const rateLimiter = createUpstashRateLimiter({
  maxRequests: 10,
  windowMs: 3600 * 1000, // 1 hour
});

interface TranscriptionRequest {
  videoId: string;
  audioUrl: string;
  language?: string; // ISO 639-1 code (e.g., 'en', 'tr', 'es')
}

interface TranscriptionResponse {
  text: string;
  language: string;
  duration?: number;
  cached?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      const error = createErrorResponse({
        code: 'UNAUTHORIZED',
        message: 'Missing authorization header',
      });
      return toHttpResponse(error, corsHeaders, 401);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      const error = createErrorResponse({
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      });
      return toHttpResponse(error, corsHeaders, 401);
    }

    // 2. Rate limiting check (per user)
    const rateLimit = await rateLimiter.check(req, user.id);
    if (!rateLimit.success) {
      const retryAfter = Math.ceil((rateLimit.reset - Date.now()) / 1000);
      const { response, headers: rateLimitHeaders } = createRateLimitError(retryAfter, rateLimit.remaining);
      return toHttpResponse(response, { ...corsHeaders, ...rateLimitHeaders }, 429);
    }

    // 3. Validate request
    const body: TranscriptionRequest = await req.json();
    const { videoId, audioUrl, language = 'en' } = body;

    if (!videoId || !audioUrl) {
      const error = createValidationError({
        fields: {
          videoId: !videoId ? ['Video ID is required'] : [],
          audioUrl: !audioUrl ? ['Audio URL is required'] : [],
        },
      });
      return toHttpResponse(error, corsHeaders, 400);
    }

    // Validate URL format
    try {
      new URL(audioUrl);
    } catch {
      const error = createValidationError({
        fields: { audioUrl: ['Invalid audio URL format'] },
      });
      return toHttpResponse(error, corsHeaders, 400);
    }

    // 4. Check cache first (check if this video was already transcribed)
    const { data: cachedTranscription } = await supabase
      .from('video_transcriptions')
      .select('transcription_text, language, duration')
      .eq('video_id', videoId)
      .single();

    if (cachedTranscription) {
      const response = createSuccessResponse<TranscriptionResponse>({
        text: cachedTranscription.transcription_text,
        language: cachedTranscription.language,
        duration: cachedTranscription.duration,
        cached: true,
      });
      return toHttpSuccessResponse(response, corsHeaders);
    }

    // 5. Download audio file
    console.log(`Downloading audio: ${audioUrl}`);
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      const error = createErrorResponse({
        code: 'AUDIO_DOWNLOAD_FAILED',
        message: 'Failed to download audio file',
      });
      return toHttpResponse(error, corsHeaders, 400);
    }

    const audioBlob = await audioResponse.blob();
    const audioFile = new File([audioBlob], 'audio.mp3', { type: 'audio/mpeg' });

    // 6. Call OpenAI Whisper API
    console.log(`Transcribing audio for video: ${videoId}`);
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');
    formData.append('language', language);
    formData.append('response_format', 'json');

    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      const errorData = await transcriptionResponse.text();
      console.error('OpenAI API error:', errorData);
      const error = createErrorResponse({
        code: 'TRANSCRIPTION_FAILED',
        message: 'Failed to transcribe audio',
      });
      return toHttpResponse(error, corsHeaders, 500);
    }

    const transcriptionData = await transcriptionResponse.json();

    // 7. Cache the result in database
    await supabase.from('video_transcriptions').insert({
      video_id: videoId,
      user_id: user.id,
      transcription_text: transcriptionData.text,
      language: transcriptionData.language || language,
      duration: transcriptionData.duration,
    });

    // 8. Return successful response
    const response = createSuccessResponse<TranscriptionResponse>({
      text: transcriptionData.text,
      language: transcriptionData.language || language,
      duration: transcriptionData.duration,
      cached: false,
    });

    return toHttpSuccessResponse(response, corsHeaders);
  } catch (error) {
    console.error('Unexpected error:', error);
    const errorResponse = handleUnexpectedError(error);
    return toHttpResponse(errorResponse, corsHeaders, 500);
  }
});
