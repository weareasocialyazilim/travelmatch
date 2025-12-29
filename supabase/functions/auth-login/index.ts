import { Logger } from '..//_shared/logger.ts';
const logger = new Logger();

/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { createUpstashRateLimiter, RateLimitPresets } from '../_shared/upstashRateLimit.ts';
import {
  ErrorCode,
  createErrorResponse,
  createSuccessResponse,
  toHttpResponse,
  toHttpSuccessResponse,
  createRateLimitError,
  handleSupabaseAuthError,
  handleUnexpectedError,
} from '../_shared/errorHandler.ts';
import { getCorsHeaders } from '../_shared/security-middleware.ts';

// Create rate limiter for auth endpoints (5 attempts per 15 minutes)
const authLimiter = createUpstashRateLimiter(RateLimitPresets.AUTH);

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Check rate limit
    const rateLimitResult = await authLimiter.check(req);
    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
      const { response, headers: rateLimitHeaders } = createRateLimitError(
        retryAfter,
        rateLimitResult.remaining,
      );
      return toHttpResponse(response, { ...corsHeaders, ...rateLimitHeaders }, 429);
    }

    // Parse request body
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      const error = createErrorResponse(
        'Email and password are required',
        ErrorCode.MISSING_REQUIRED_FIELD,
        { fields: !email ? ['email'] : ['password'] },
      );
      return toHttpResponse(error, corsHeaders);
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.error('Login error:', error);
      const errorResponse = handleSupabaseAuthError(error);
      return toHttpResponse(errorResponse, corsHeaders);
    }

    // Return session
    const success = createSuccessResponse(
      {
        user: data.user,
        session: data.session,
      },
      'Login successful',
    );
    return toHttpSuccessResponse(success, 200, {
      ...corsHeaders,
      'X-RateLimit-Remaining': String(rateLimitResult.remaining),
    });
  } catch (error) {
    const errorResponse = handleUnexpectedError(error);
    return toHttpResponse(errorResponse, corsHeaders);
  }
});
