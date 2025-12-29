import { Logger } from '..//_shared/logger.ts';
const logger = new Logger();

/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { z } from 'https://deno.land/x/zod@v3.21.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CLOUDFLARE_ZONE_ID = Deno.env.get('CLOUDFLARE_ZONE_ID');
const CLOUDFLARE_API_TOKEN = Deno.env.get('CLOUDFLARE_API_TOKEN');
const CDN_BASE_URL = Deno.env.get('CDN_BASE_URL') || 'https://cdn.travelmatch.com';

const InvalidateRequestSchema = z.object({
  type: z.enum(['profile', 'moment', 'image', 'custom']),
  ids: z.array(z.string()).optional(),
  urls: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
  purge_everything: z.boolean().optional(),
});

type InvalidateRequest = z.infer<typeof InvalidateRequestSchema>;

/**
 * Purge Cloudflare cache
 */
async function purgeCloudflare(payload: {
  files?: string[];
  tags?: string[];
  purge_everything?: boolean;
}): Promise<any> {
  if (!CLOUDFLARE_ZONE_ID || !CLOUDFLARE_API_TOKEN) {
    throw new Error('Cloudflare credentials not configured');
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cloudflare purge failed: ${error}`);
  }

  return await response.json();
}

/**
 * Generate CDN URLs based on type and IDs
 */
function generateUrls(type: string, ids: string[]): string[] {
  const urls: string[] = [];

  switch (type) {
    case 'profile':
      // Purge user profile images
      for (const id of ids) {
        urls.push(`${CDN_BASE_URL}/users/${id}/avatar.jpg`);
        urls.push(`${CDN_BASE_URL}/users/${id}/avatar-thumb.jpg`);
        urls.push(`${CDN_BASE_URL}/users/${id}/cover.jpg`);
      }
      break;

    case 'moment':
      // Purge moment images and thumbnails
      for (const id of ids) {
        urls.push(`${CDN_BASE_URL}/moments/${id}/image.jpg`);
        urls.push(`${CDN_BASE_URL}/moments/${id}/image-thumb.jpg`);
        urls.push(`${CDN_BASE_URL}/moments/${id}/image-medium.jpg`);
      }
      break;

    case 'image':
      // Purge specific image IDs
      for (const id of ids) {
        urls.push(`${CDN_BASE_URL}/images/${id}`);
        urls.push(`${CDN_BASE_URL}/images/${id}-thumb`);
      }
      break;
  }

  return urls;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Parse and validate request body
    const body: InvalidateRequest = InvalidateRequestSchema.parse(await req.json());

    let urls: string[] = [];
    let tags: string[] = [];
    let purgeEverything = false;

    // Generate URLs from IDs
    if (body.ids && body.ids.length > 0) {
      urls = generateUrls(body.type, body.ids);
    }

    // Add custom URLs
    if (body.urls && body.urls.length > 0) {
      urls.push(...body.urls);
    }

    // Add tags
    if (body.tags && body.tags.length > 0) {
      tags = body.tags;
    }

    // Purge everything flag
    if (body.purge_everything) {
      purgeEverything = true;
    }

    // Validate at least one purge method specified
    if (urls.length === 0 && tags.length === 0 && !purgeEverything) {
      return new Response(
        JSON.stringify({
          error: 'No URLs, tags, or purge_everything specified',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Build Cloudflare purge payload
    const purgePayload: any = {};

    if (purgeEverything) {
      purgePayload.purge_everything = true;
    } else {
      if (urls.length > 0) {
        purgePayload.files = urls;
      }
      if (tags.length > 0) {
        purgePayload.tags = tags;
      }
    }

    // Execute purge
    logger.info('Purging Cloudflare cache:', purgePayload);
    const result = await purgeCloudflare(purgePayload);

    const latencyMs = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        success: true,
        purged_count: urls.length + tags.length,
        urls,
        tags,
        purge_everything: purgeEverything,
        cloudflare_result: result,
        latency_ms: latencyMs,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    logger.error('CDN invalidation error:', error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request body',
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
        error: 'CDN invalidation failed',
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
