/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { z } from 'https://deno.land/x/zod@v3.21.4/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createUpstashRateLimiter, RateLimitPresets } from '../_shared/upstashRateLimit.ts';
import { getCorsHeaders } from '../_shared/security-middleware.ts';
import {
  ErrorCode,
  createErrorResponse,
  createSuccessResponse,
  toHttpResponse,
  toHttpSuccessResponse,
  createValidationError,
  handleUnexpectedError,
} from '../_shared/errorHandler.ts';

const PaymentSchema = z.object({
  amount: z.number().min(1, 'Amount must be at least 1'),
  currency: z.string().length(3),
  paymentMethodId: z.string().optional(),
});

// Rate limiter: 100 requests per 15 minutes for payment creation
const paymentLimiter = createUpstashRateLimiter(RateLimitPresets.PAYMENT);

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Check rate limit first
    const rateLimitResult = await paymentLimiter.check(req);
    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Limit': String(rateLimitResult.limit),
          },
        },
      );
    }

    const supabase = createClient(
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
    } = await supabase.auth.getUser();

    if (!user) {
      const error = createErrorResponse(
        'Authentication required',
        ErrorCode.UNAUTHORIZED,
      );
      return toHttpResponse(error, corsHeaders);
    }

    const json = await req.json();
    
    // Validate with Zod
    const validationResult = PaymentSchema.safeParse(json);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string[]> = {};
      validationResult.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        if (!fieldErrors[path]) fieldErrors[path] = [];
        fieldErrors[path].push(issue.message);
      });
      const error = createValidationError(fieldErrors);
      return toHttpResponse(error, corsHeaders);
    }
    
    const { amount, currency } = validationResult.data;

    // Mock Payment Provider (e.g. Stripe) Logic
    // In a real app, you would initialize Stripe here and create a PaymentIntent
    console.log(
      `Creating payment intent for user ${user.id}: ${amount} ${currency}`,
    );

    // Simulate successful payment intent creation
    const clientSecret = `pi_mock_${crypto.randomUUID()}_secret_${crypto.randomUUID()}`;

    const success = createSuccessResponse(
      {
        clientSecret,
        amount,
        currency,
      },
      'Payment intent created successfully',
    );
    return toHttpSuccessResponse(success, 200, corsHeaders);
  } catch (error) {
    const errorResponse = handleUnexpectedError(error);
    return toHttpResponse(errorResponse, corsHeaders);
  }
});
