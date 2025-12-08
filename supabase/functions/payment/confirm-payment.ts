/**
 * Confirm Payment Edge Function
 * 
 * Confirms a Stripe Payment Intent and processes the payment
 * 
 * Security Features:
 * - Authentication required
 * - Payment ownership verification
 * - Idempotent processing
 * - Rate limiting
 * - Audit logging
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno';
import { z } from 'https://deno.land/x/zod@v3.21.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ConfirmPaymentSchema = z.object({
  paymentIntentId: z.string().min(1, 'Payment intent ID required'),
  paymentMethodId: z.string().optional(),
});

type ConfirmPaymentRequest = z.infer<typeof ConfirmPaymentSchema>;

// Rate limiting
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitMap.set(userId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  userLimit.count++;
  return true;
}

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize services
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured');
    }
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

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
    if (!checkRateLimit(user.id)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Validate request
    const body = await req.json();
    const validatedData: ConfirmPaymentRequest = ConfirmPaymentSchema.parse(body);

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(
      validatedData.paymentIntentId,
    );

    // Verify ownership
    if (paymentIntent.metadata.supabase_user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Payment intent does not belong to user' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Check if already succeeded
    if (paymentIntent.status === 'succeeded') {
      return new Response(
        JSON.stringify({
          success: true,
          status: 'already_succeeded',
          paymentIntentId: paymentIntent.id,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Confirm payment intent
    let confirmedPaymentIntent: Stripe.PaymentIntent;

    if (validatedData.paymentMethodId) {
      confirmedPaymentIntent = await stripe.paymentIntents.confirm(
        validatedData.paymentIntentId,
        {
          payment_method: validatedData.paymentMethodId,
        },
      );
    } else {
      confirmedPaymentIntent = await stripe.paymentIntents.confirm(
        validatedData.paymentIntentId,
      );
    }

    // Log audit
    await logAudit(supabase, user.id, 'payment_confirmed', {
      payment_intent_id: confirmedPaymentIntent.id,
      status: confirmedPaymentIntent.status,
      amount: confirmedPaymentIntent.amount / 100,
    });

    return new Response(
      JSON.stringify({
        success: true,
        status: confirmedPaymentIntent.status,
        paymentIntentId: confirmedPaymentIntent.id,
        requiresAction: confirmedPaymentIntent.status === 'requires_action',
        clientSecret: confirmedPaymentIntent.client_secret,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Payment confirmation error:', error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: 'Validation error',
          details: error.errors,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (error.type) {
      return new Response(
        JSON.stringify({
          error: error.message || 'Payment processing error',
          type: error.type,
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
