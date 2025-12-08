import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { createRateLimiter, RateLimitPresets } from '../_shared/rateLimit.ts';
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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create rate limiter for auth endpoints
const authLimiter = createRateLimiter(RateLimitPresets.auth);

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Check rate limit
    const rateLimitResult = await authLimiter.check(req);
    if (!rateLimitResult.ok) {
      const { response, headers: rateLimitHeaders } = createRateLimitError(
        rateLimitResult.retryAfter || 60,
        rateLimitResult.remaining,
      );
      return new Response(response.body, {
        status: response.status,
        headers: { ...corsHeaders, ...rateLimitHeaders },
      });
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
      console.error('Login error:', error);
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
