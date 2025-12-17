/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

/**
 * Stripe Payment Intent Creation Edge Function
 * 
 * Security Features:
 * - Server-side Stripe API calls (PCI compliant)
 * - Authentication required
 * - Input validation with Zod
 * - Rate limiting (database-backed)
 * - Audit logging
 * 
 * @see https://stripe.com/docs/payments/payment-intents
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno';
import { z } from 'https://deno.land/x/zod@v3.21.4/mod.ts';
import { createUpstashRateLimiter, RateLimitPresets } from '../_shared/upstashRateLimit.ts';
import { getCorsHeaders } from '../_shared/security-middleware.ts';

// Request validation schema
const CreatePaymentIntentSchema = z.object({
  momentId: z.string().uuid('Invalid moment ID'),
  amount: z.number().min(1, 'Amount must be at least 1').max(1000000, 'Amount exceeds maximum'),
  currency: z.string().length(3, 'Currency must be 3 letters').default('USD'),
  paymentMethodId: z.string().optional(),
  metadata: z.record(z.string()).optional(),
  description: z.string().max(500).optional(),
});

type CreatePaymentIntentRequest = z.infer<typeof CreatePaymentIntentSchema>;

// Rate limiter: 10 requests per hour for payment operations
const paymentLimiter = createUpstashRateLimiter(RateLimitPresets.PAYMENT);

/**
 * Log audit event to database
 */
async function logAudit(
  supabase: any,
  userId: string,
  action: string,
  metadata: Record<string, any>,
) {
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      metadata,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
}

/**
 * Invalidate payment-related cache
 */
async function invalidatePaymentCache(
  supabase: any,
  userId: string,
  momentId: string,
) {
  try {
    // Invalidate user's wallet balance cache
    await supabase.from('cache_invalidation').insert({
      cache_key: `wallet:${userId}`,
      invalidated_at: new Date().toISOString(),
    });

    // Invalidate moment's payment data cache
    await supabase.from('cache_invalidation').insert({
      cache_key: `moment:${momentId}:payments`,
      invalidated_at: new Date().toISOString(),
    });

    // Invalidate user's transaction list cache
    await supabase.from('cache_invalidation').insert({
      cache_key: `transactions:${userId}`,
      invalidated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to invalidate cache:', error);
  }
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Stripe with secret key (server-side only)
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured');
    }
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Check rate limit
    const rateLimitResult = await paymentLimiter.check(req);
    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded. Please try again later.',
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

    // Parse and validate request body
    const body = await req.json();
    const validatedData: CreatePaymentIntentRequest = CreatePaymentIntentSchema.parse(body);

    // Verify moment exists and is available
    const { data: moment, error: momentError } = await supabase
      .from('moments')
      .select('id, user_id, price, currency, status')
      .eq('id', validatedData.momentId)
      .single();

    if (momentError || !moment) {
      return new Response(
        JSON.stringify({ error: 'Moment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (moment.status !== 'active') {
      return new Response(
        JSON.stringify({ error: 'Moment is not available for gifting' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Prevent self-gifting
    if (moment.user_id === user.id) {
      return new Response(
        JSON.stringify({ error: 'Cannot gift your own moment' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Verify amount matches moment price
    if (validatedData.amount !== moment.price) {
      return new Response(
        JSON.stringify({ error: 'Amount does not match moment price' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Get or create Stripe customer
    let stripeCustomerId: string;
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (userData?.stripe_customer_id) {
      stripeCustomerId = userData.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      stripeCustomerId = customer.id;

      // Save customer ID to database
      await supabase
        .from('users')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id);
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(validatedData.amount * 100), // Convert to cents
      currency: validatedData.currency.toLowerCase(),
      customer: stripeCustomerId,
      payment_method: validatedData.paymentMethodId,
      automatic_payment_methods: validatedData.paymentMethodId
        ? undefined
        : { enabled: true },
      description: validatedData.description || `Gift for moment ${validatedData.momentId}`,
      metadata: {
        supabase_user_id: user.id,
        moment_id: validatedData.momentId,
        moment_creator_id: moment.user_id,
        ...validatedData.metadata,
      },
    });

    // Create transaction record in database
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        moment_id: validatedData.momentId,
        type: 'gift',
        amount: validatedData.amount,
        currency: validatedData.currency,
        status: 'pending',
        description: validatedData.description || 'Gift payment',
        metadata: {
          stripe_payment_intent_id: paymentIntent.id,
          recipient_user_id: moment.user_id,
        },
      })
      .select()
      .single();

    if (txError) {
      console.error('Failed to create transaction record:', txError);
      // Continue anyway - webhook will handle reconciliation
    }

    // Log audit event
    await logAudit(supabase, user.id, 'payment_intent_created', {
      payment_intent_id: paymentIntent.id,
      moment_id: validatedData.momentId,
      amount: validatedData.amount,
      currency: validatedData.currency,
    });

    // Invalidate cache
    await invalidatePaymentCache(supabase, user.id, validatedData.momentId);

    // Return payment intent client secret
    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        transactionId: transaction?.id,
        amount: validatedData.amount,
        currency: validatedData.currency,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Payment intent creation error:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: 'Validation error',
          details: error.errors,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      );
    }

    // Handle Stripe errors
    if (error.type) {
      return new Response(
        JSON.stringify({
          error: error.message || 'Payment processing error',
          type: error.type,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 402,
        },
      );
    }

    // Generic error
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
