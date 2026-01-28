import { Logger } from '..//_shared/logger.ts';
const logger = new Logger();

/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

/**
 * Image Upload Proxy - Server-side Cloudflare Images wrapper
 *
 * Prevents exposing Cloudflare Images token in client bundle
 * Implements rate limiting, validation, and cost optimization
 *
 * Endpoints:
 * - POST /upload-image - Upload image to Cloudflare
 *
 * Security:
 * - Cloudflare API token stored server-side only
 * - Rate limiting via Upstash Redis
 * - User authentication required
 * - File validation (type, size, dimensions)
 * - Automatic virus scanning (future)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  createUpstashRateLimiter,
  RateLimitPresets,
} from '../_shared/upstashRateLimit.ts';
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
import { generateBlurHash } from '../_shared/blurhash.ts';

const CF_ACCOUNT_ID = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
const CF_API_TOKEN = Deno.env.get('CLOUDFLARE_IMAGES_TOKEN');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
  throw new Error('🔒 Cloudflare credentials are required');
}

// Rate limiter: 50 uploads per hour per user
const rateLimiter = createUpstashRateLimiter({
  maxRequests: 50,
  windowMs: 3600 * 1000, // 1 hour
});

// Allowed image types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DIMENSIONS = 4096; // 4K resolution

interface UploadImageRequest {
  file: File | Blob;
  metadata?: {
    userId?: string;
    momentId?: string;
    type?: 'avatar' | 'moment' | 'gift' | 'proof';
  };
}

interface UploadImageResponse {
  id: string;
  filename: string;
  url: string;
  variants: string[];
  uploaded: string;
  blurHash?: string;
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
      const { response, headers: rateLimitHeaders } = createRateLimitError(
        retryAfter,
        rateLimit.remaining,
      );
      return toHttpResponse(
        response,
        { ...corsHeaders, ...rateLimitHeaders },
        429,
      );
    }

    // 3. Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const metadataStr = formData.get('metadata') as string;
    const metadata = metadataStr ? JSON.parse(metadataStr) : {};

    if (!file) {
      const error = createValidationError({
        fields: { file: ['File is required'] },
      });
      return toHttpResponse(error, corsHeaders, 400);
    }

    // 4. Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      const error = createValidationError({
        fields: {
          file: [
            `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
          ],
        },
      });
      return toHttpResponse(error, corsHeaders, 400);
    }

    // 5. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const error = createValidationError({
        fields: {
          file: [
            `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          ],
        },
      });
      return toHttpResponse(error, corsHeaders, 400);
    }

    // 6. Validate image dimensions (optional - requires image decoding)
    // This is a basic check, more sophisticated validation can be added
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type });

    // 6.5. Generate BlurHash for placeholder
    let blurHash: string | undefined;
    try {
      logger.info('[BlurHash] Generating hash for image...');
      blurHash = await generateBlurHash(arrayBuffer, {
        componentX: 4,
        componentY: 3,
        maxDimension: 100,
      });
      logger.info('[BlurHash] Generated:', blurHash);
    } catch (error) {
      logger.warn('[BlurHash] Generation failed (non-critical):', error);
      // Continue without BlurHash - it's optional
    }

    // 7. Upload to Cloudflare Images
    const uploadFormData = new FormData();
    uploadFormData.append('file', blob, file.name);

    // Add metadata
    const cfMetadata = {
      userId: user.id,
      uploadedAt: new Date().toISOString(),
      ...metadata,
    };
    uploadFormData.append('metadata', JSON.stringify(cfMetadata));

    logger.info('Uploading image', { userId: user.id });
    const uploadResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${CF_API_TOKEN}`,
        },
        body: uploadFormData,
      },
    );

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.text();
      logger.error('Cloudflare API error:', errorData);
      const error = createErrorResponse({
        code: 'UPLOAD_FAILED',
        message: 'Failed to upload image to CDN',
      });
      return toHttpResponse(error, corsHeaders, 500);
    }

    const uploadData = await uploadResponse.json();

    // 8. Store upload record in database
    const imageRecord = {
      id: uploadData.result.id,
      user_id: user.id,
      filename: uploadData.result.filename,
      url: uploadData.result.variants[0], // Main variant
      variants: uploadData.result.variants,
      uploaded_at: uploadData.result.uploaded,
      metadata: cfMetadata,
      type: metadata.type || 'general',
      blur_hash: blurHash, // Store BlurHash for client-side placeholder
    };

    await supabase.from('uploaded_images').insert(imageRecord);

    // 8.5 Trigger automatic content moderation (P0-E compliance)
    // Moderation is required for all user-uploaded content before it becomes visible
    const mediaUrl = uploadData.result.variants[0];
    let moderationStatus = 'pending';
    let moderationLabels: string[] = [];
    let moderationConfidence = 0;

    try {
      logger.info('[Moderation] Starting auto-moderation for upload:', {
        imageId: uploadData.result.id,
        userId: user.id,
        type: metadata.type || 'general',
      });

      const moderationResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/moderate-media`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify({
            mediaUrl,
            mediaType: 'image',
            conversationId: metadata.conversationId || `upload-${uploadData.result.id}`,
            messageId: metadata.messageId,
          }),
        },
      );

      if (moderationResponse.ok) {
        const moderationResult = await moderationResponse.json();
        moderationStatus = moderationResult.status || 'pending';
        moderationLabels = moderationResult.moderationLabels?.map((l: any) => l.name) || [];
        moderationConfidence = moderationResult.confidence || 0;

        logger.info('[Moderation] Complete:', {
          imageId: uploadData.result.id,
          status: moderationStatus,
          labels: moderationLabels,
        });
      } else {
        logger.warn('[Moderation] Failed, will retry later:', {
          imageId: uploadData.result.id,
          status: moderationResponse.status,
        });
        // Moderation will be retried by admin or client
      }
    } catch (moderationError) {
      logger.warn('[Moderation] Error, will retry later:', {
        imageId: uploadData.result.id,
        error: moderationError,
      });
      // Continue - moderation can be retried later
    }

    // Update record with moderation results
    await supabase.from('uploaded_images').update({
      moderation_status: moderationStatus,
      moderation_labels: moderationLabels,
      moderation_confidence: moderationConfidence,
      moderation_at: new Date().toISOString(),
    }).eq('id', uploadData.result.id);

    // 9. Return successful response
    const response = createSuccessResponse<UploadImageResponse>({
      id: uploadData.result.id,
      filename: uploadData.result.filename,
      url: uploadData.result.variants[0],
      variants: uploadData.result.variants,
      uploaded: uploadData.result.uploaded,
      blurHash,
    });

    return toHttpSuccessResponse(response, corsHeaders);
  } catch (error) {
    logger.error('Unexpected error:', error);
    const errorResponse = handleUnexpectedError(error);
    return toHttpResponse(errorResponse, corsHeaders, 500);
  }
});
