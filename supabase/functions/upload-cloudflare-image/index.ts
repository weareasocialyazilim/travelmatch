/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

/**
 * Upload Cloudflare Image Edge Function
 *
 * SECURITY: API token is stored server-side only.
 * Client sends base64 image data, server handles Cloudflare API.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/security-middleware.ts';

const CLOUDFLARE_ACCOUNT_ID = Deno.env.get('CLOUDFLARE_ACCOUNT_ID') || '';
const CLOUDFLARE_IMAGES_TOKEN = Deno.env.get('CLOUDFLARE_IMAGES_TOKEN') || '';
const CLOUDFLARE_IMAGES_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`;

interface UploadRequest {
  imageBase64: string;
  mimeType: string;
  options?: {
    requireSignedURLs?: boolean;
    metadata?: Record<string, string>;
    customId?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Verify user is authenticated
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const body: UploadRequest = await req.json();
    const { imageBase64, mimeType, options = {} } = body;

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'Missing imageBase64' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Convert base64 to binary
    const binaryString = atob(imageBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create form data for Cloudflare
    const formData = new FormData();
    const blob = new Blob([bytes], { type: mimeType });
    formData.append(
      'file',
      blob,
      `upload-${Date.now()}.${mimeType.split('/')[1] || 'jpg'}`,
    );

    if (options.requireSignedURLs) {
      formData.append('requireSignedURLs', 'true');
    }

    if (options.metadata) {
      // Add user ID to metadata for tracking
      const metadata = { ...options.metadata, uploadedBy: user.id };
      formData.append('metadata', JSON.stringify(metadata));
    } else {
      formData.append('metadata', JSON.stringify({ uploadedBy: user.id }));
    }

    if (options.customId) {
      formData.append('id', options.customId);
    }

    // Upload to Cloudflare
    const response = await fetch(CLOUDFLARE_IMAGES_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_IMAGES_TOKEN}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[upload-cloudflare-image] Cloudflare error:', errorText);
      return new Response(
        JSON.stringify({
          error: 'Cloudflare upload failed',
          details: errorText,
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const result = await response.json();

    // Log upload for audit
    console.log('[upload-cloudflare-image] Success:', {
      imageId: result.result.id,
      userId: user.id,
      size: bytes.length,
    });

    return new Response(JSON.stringify(result.result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[upload-cloudflare-image] Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
