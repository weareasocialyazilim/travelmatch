/**
 * Auth Proxy Edge Function
 *
 * Secure authentication proxy with:
 * - Upstash Redis rate limiting (with in-memory fallback)
 * - Origin-based CORS
 * - Proper error handling and logging
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Redis } from 'https://esm.sh/@upstash/redis@1.28.0';
import { Ratelimit } from 'https://esm.sh/@upstash/ratelimit@1.0.0';

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://lovendo.app',
  'https://www.lovendo.app',
  'https://admin.lovendo.app',
  'http://localhost:3000',
  'http://localhost:8081',
  'exp://localhost:8081',
];

/**
 * Get CORS headers based on origin
 */
function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
  };

  if (origin && ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed) || allowed === origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  } else if (origin?.includes('localhost') || origin?.startsWith('exp://')) {
    // Allow localhost and Expo for development
    headers['Access-Control-Allow-Origin'] = origin;
  } else {
    // Default to main app origin
    headers['Access-Control-Allow-Origin'] = 'https://lovendo.app';
  }

  return headers;
}

// Initialize Upstash Redis if configured
let redis: Redis | null = null;
let rateLimiter: Ratelimit | null = null;

const UPSTASH_REDIS_REST_URL = Deno.env.get('UPSTASH_REDIS_REST_URL');
const UPSTASH_REDIS_REST_TOKEN = Deno.env.get('UPSTASH_REDIS_REST_TOKEN');

if (UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN) {
  try {
    redis = new Redis({
      url: UPSTASH_REDIS_REST_URL,
      token: UPSTASH_REDIS_REST_TOKEN,
    });

    rateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '60 s'), // 5 attempts per minute
      analytics: true,
      prefix: 'lovendo:auth-proxy',
    });

    console.log('[Auth Proxy] Upstash Redis rate limiting initialized');
  } catch (error) {
    console.warn('[Auth Proxy] Failed to initialize Upstash, using in-memory fallback:', error);
  }
}

// In-memory fallback rate limiting
const memoryRateLimit = new Map<string, { count: number; resetAt: number }>();
const BLOCK_DURATION = 60 * 1000; // 1 minute
const MAX_ATTEMPTS = 5;

/**
 * Check rate limit using Upstash or in-memory fallback
 */
async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  // Try Upstash first
  if (rateLimiter) {
    try {
      const result = await rateLimiter.limit(ip);
      return { allowed: result.success, remaining: result.remaining };
    } catch (error) {
      console.warn('[Auth Proxy] Upstash error, using in-memory fallback:', error);
    }
  }

  // In-memory fallback
  const now = Date.now();
  let entry = memoryRateLimit.get(ip);

  if (!entry || now > entry.resetAt) {
    entry = { count: 1, resetAt: now + BLOCK_DURATION };
    memoryRateLimit.set(ip, entry);
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  entry.count++;

  if (entry.count > MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: MAX_ATTEMPTS - entry.count };
}

/**
 * Increment failed attempt count
 */
async function incrementFailedAttempt(ip: string): Promise<void> {
  // For Upstash, the limit() call already incremented
  // For in-memory, we need to increment manually on failure
  if (!rateLimiter) {
    const entry = memoryRateLimit.get(ip);
    if (entry) {
      entry.count++;
    }
  }
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, password, type, token, options } = await req.json();

    // Get client IP (handle proxy headers carefully)
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    // Take first IP from forwarded-for, or use real-ip, or fallback to 'unknown'
    const ip = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';

    // 1. Rate Limiting Check
    const rateCheck = await checkRateLimit(ip);

    if (!rateCheck.allowed) {
      console.warn(`[Auth Proxy] Rate limit exceeded for IP: ${ip.substring(0, 10)}...`);
      return new Response(
        JSON.stringify({
          error: 'Too many attempts. Please try again later.',
          retryAfter: 60,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      );
    }

    // 2. Turnstile / Captcha Check (if token provided)
    if (token) {
      const turnstileSecret = Deno.env.get('CLOUDFLARE_TURNSTILE_SECRET');
      if (turnstileSecret) {
        try {
          const verifyResponse = await fetch(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: `secret=${turnstileSecret}&response=${token}&remoteip=${ip}`,
            }
          );
          const verifyResult = await verifyResponse.json();
          if (!verifyResult.success) {
            console.warn('[Auth Proxy] Turnstile verification failed');
            return new Response(
              JSON.stringify({ error: 'Captcha verification failed' }),
              {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              }
            );
          }
        } catch (error) {
          console.error('[Auth Proxy] Turnstile verification error:', error);
          // Continue without blocking if verification service fails
        }
      }
    }

    // 3. Initialize Supabase Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[Auth Proxy] Supabase credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization') || '' },
      },
    });

    // 4. Perform Authentication
    let result;
    if (type === 'signup') {
      result = await supabaseClient.auth.signUp({
        email,
        password,
        options: options || {},
      });
    } else {
      result = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });
    }

    const { data, error } = result;

    if (error) {
      // Increment rate limit counter on failure
      await incrementFailedAttempt(ip);

      console.warn(`[Auth Proxy] Auth failed for ${email?.substring(0, 5)}...: ${error.message}`);

      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[Auth Proxy] ${type === 'signup' ? 'Signup' : 'Login'} successful for user`);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Auth Proxy] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
