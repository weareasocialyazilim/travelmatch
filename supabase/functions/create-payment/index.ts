/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { z } from 'https://deno.land/x/zod@v3.21.4/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno';
import {
  createUpstashRateLimiter,
  RateLimitPresets,
} from '../_shared/upstashRateLimit.ts';
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
  amount: z
    .number()
    .min(1, 'Amount must be at least 1')
    .max(1000000, 'Amount exceeds maximum'),
  currency: z.string().length(3).default('usd'),
  momentId: z.string().uuid().optional(),
  paymentMethodId: z.string().optional(),
  description: z.string().max(500).optional(),
  metadata: z.record(z.string()).optional(),
});

// Rate limiter: 100 requests per 15 minutes for payment creation
const paymentLimiter = createUpstashRateLimiter(RateLimitPresets.PAYMENT);

// Initialize Stripe
const getStripe = () => {
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required');
  }
  return new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
  });
};

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

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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

    const {
      amount,
      currency,
      momentId,
      paymentMethodId,
      description,
      metadata,
    } = validationResult.data;

    // Initialize Stripe and create PaymentIntent
    const stripe = getStripe();

    // Build payment intent parameters
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        user_id: user.id,
        user_email: user.email || '',
        ...(momentId && { moment_id: momentId }),
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    };

    if (description) {
      paymentIntentParams.description = description;
    }

    if (paymentMethodId) {
      paymentIntentParams.payment_method = paymentMethodId;
    }

    // Create PaymentIntent with Stripe
    const paymentIntent =
      await stripe.paymentIntents.create(paymentIntentParams);

    // Log to audit
    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      action: 'payment_intent.created',
      metadata: {
        payment_intent_id: paymentIntent.id,
        amount,
        currency,
        moment_id: momentId,
      },
    });

    const success = createSuccessResponse(
      {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount,
        currency,
        status: paymentIntent.status,
      },
      'Payment intent created successfully',
    );
    return toHttpSuccessResponse(success, 200, corsHeaders);
  } catch (error) {
    // Handle Stripe-specific errors
    if (error instanceof Stripe.errors.StripeError) {
      const stripeError = createErrorResponse(
        error.message,
        ErrorCode.VALIDATION_ERROR,
        { stripeCode: error.code, stripeType: error.type },
      );
      return toHttpResponse(stripeError, corsHeaders);
    }

    const errorResponse = handleUnexpectedError(error);
    return toHttpResponse(errorResponse, corsHeaders);
  }
});
