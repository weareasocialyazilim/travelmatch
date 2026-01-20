/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { z } from 'https://deno.land/x/zod@v3.21.4/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  createUpstashRateLimiter,
  RateLimitPresets,
} from '../_shared/upstashRateLimit.ts';
import { getCorsHeaders } from '../_shared/cors.ts';

/**
 * Whitelist of secrets that can be fetched from client
 * These are all public/client-safe secrets
 * NEVER add sensitive secrets like API keys here
 */
const ALLOWED_SECRETS = new Set([
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_SENTRY_DSN',
  'EXPO_PUBLIC_POSTHOG_API_KEY',
  'EXPO_PUBLIC_POSTHOG_HOST',
  'EXPO_PUBLIC_MAPBOX_TOKEN',
  'EXPO_PUBLIC_CLOUDFLARE_ACCOUNT_HASH',
]);

const RequestSchema = z.object({
  secretName: z.string().min(1).max(100),
});

// Rate limiter: 30 requests per minute (standard)
const rateLimiter = createUpstashRateLimiter(RateLimitPresets.STANDARD);

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Check rate limit first
    const rateLimitResult = await rateLimiter.check(req);
    if (!rateLimitResult.ok) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          retryAfter: rateLimitResult.retryAfter,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimitResult.retryAfter || 60),
          },
        },
      );
    }

    // Authenticate the user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      },
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse and validate request
    const json = await req.json();
    const { secretName } = RequestSchema.parse(json);

    // Check if secret is in whitelist
    if (!ALLOWED_SECRETS.has(secretName)) {
      return new Response(
        JSON.stringify({
          error: 'Secret not allowed',
          message: 'This secret cannot be fetched from client',
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Get secret from environment
    // In production, these are injected from Infisical via CI/CD
    const secretValue = Deno.env.get(secretName);

    if (!secretValue) {
      return new Response(
        JSON.stringify({
          error: 'Secret not found',
          message: 'The requested secret is not configured',
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Return the secret value
    return new Response(
      JSON.stringify({
        secretName,
        secretValue,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          // Prevent caching of secrets
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
