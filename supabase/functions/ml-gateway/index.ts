/**
 * ML Gateway Edge Function
 *
 * Central gateway for all ML service calls from mobile/admin.
 * Routes requests to the Python ML service with auth, rate limiting, and caching.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import {
  getCorsHeaders,
  createUpstashRateLimiter,
  type RateLimitConfig,
} from '../_shared/security-middleware.ts';
import { Logger } from '../_shared/logger.ts';
import { retry } from '../_shared/mod.ts';

const logger = new Logger('ml-gateway');

// ML Service URL (internal Docker network or external)
const ML_SERVICE_URL = Deno.env.get('ML_SERVICE_URL') || 'http://ml-service:8000';

// Rate limits per endpoint type
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  recommendations: { requests: 100, window: 60 },    // 100/min
  chat: { requests: 50, window: 60 },                // 50/min
  proof: { requests: 10, window: 3600 },             // 10/hour
  price: { requests: 200, window: 60 },              // 200/min
  nlp: { requests: 100, window: 60 },                // 100/min
  forecast: { requests: 30, window: 60 },            // 30/min
  experiments: { requests: 50, window: 60 },         // 50/min
  default: { requests: 60, window: 60 },             // 60/min
};

// Cache TTL per endpoint (seconds)
const CACHE_TTL: Record<string, number> = {
  'recommendations/trending': 300,    // 5 min
  'price/history': 600,               // 10 min
  'forecast/trends': 300,             // 5 min
  'nlp/hashtags': 3600,               // 1 hour
};

interface MLRequest {
  endpoint: string;
  method?: 'GET' | 'POST';
  body?: Record<string, unknown>;
  queryParams?: Record<string, string>;
}

// Simple in-memory cache for edge function
const cache = new Map<string, { data: unknown; expires: number }>();

function getCacheKey(endpoint: string, body?: Record<string, unknown>): string {
  return `ml:${endpoint}:${JSON.stringify(body || {})}`;
}

function getFromCache(key: string): unknown | null {
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown, ttlSeconds: number): void {
  cache.set(key, { data, expires: Date.now() + ttlSeconds * 1000 });
}

async function callMLService(request: MLRequest): Promise<{ data: unknown; cached: boolean }> {
  const { endpoint, method = 'POST', body, queryParams } = request;

  // Check cache for GET requests and specific endpoints
  const cacheKey = getCacheKey(endpoint, body);
  const cacheTTL = CACHE_TTL[endpoint];

  if (cacheTTL) {
    const cached = getFromCache(cacheKey);
    if (cached) {
      logger.info(`Cache hit for ${endpoint}`);
      return { data: cached, cached: true };
    }
  }

  // Build URL
  let url = `${ML_SERVICE_URL}/${endpoint}`;
  if (queryParams) {
    const params = new URLSearchParams(queryParams);
    url += `?${params.toString()}`;
  }

  // Call ML service with retry
  const response = await retry(
    async () => {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Auth': Deno.env.get('ML_SERVICE_SECRET') || 'internal-secret',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`ML Service error: ${res.status} - ${errorText}`);
      }

      return res.json();
    },
    { maxRetries: 2, baseDelayMs: 500 }
  );

  // Cache if applicable
  if (cacheTTL) {
    setCache(cacheKey, response, cacheTTL);
  }

  return { data: response, cached: false };
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);

    // Expected format: /ml-gateway/{category}/{action}
    // e.g., /ml-gateway/recommendations, /ml-gateway/chat, /ml-gateway/proof/verify
    const category = pathParts[1] || '';
    const action = pathParts.slice(2).join('/');
    const endpoint = action ? `${category}/${action}` : category;

    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: 'Missing endpoint' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Apply rate limiting
    const rateConfig = RATE_LIMITS[category] || RATE_LIMITS.default;
    const rateLimiter = createUpstashRateLimiter(rateConfig);
    const rateLimitResult = await rateLimiter.limit(`ml:${category}:${user.id}`);

    if (!rateLimitResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.reset
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': String(rateLimitResult.reset),
          }
        }
      );
    }

    // Parse body for POST requests
    let body: Record<string, unknown> | undefined;
    if (req.method === 'POST') {
      body = await req.json();
      // Inject user context
      body.userId = user.id;
    }

    // Parse query params for GET requests
    const queryParams: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    if (req.method === 'GET') {
      queryParams.userId = user.id;
    }

    // Call ML service
    const startTime = Date.now();
    const { data, cached } = await callMLService({
      endpoint,
      method: req.method as 'GET' | 'POST',
      body,
      queryParams,
    });
    const latency = Date.now() - startTime;

    logger.info(`ML request: ${endpoint}`, {
      userId: user.id,
      latency,
      cached,
      category,
    });

    // Log to analytics (async, don't wait)
    supabase
      .from('ml_analytics')
      .insert({
        user_id: user.id,
        endpoint,
        latency_ms: latency,
        cached,
        created_at: new Date().toISOString(),
      })
      .then(() => {})
      .catch((err) => logger.error('Failed to log analytics', err));

    return new Response(
      JSON.stringify(data),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-ML-Latency': String(latency),
          'X-ML-Cached': String(cached),
        }
      }
    );

  } catch (error) {
    logger.error('ML Gateway error', error);

    return new Response(
      JSON.stringify({
        error: 'ML service unavailable',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
