/**
 * Stripe Payment Intent Proxy
 * 
 * Server-side Stripe API wrapper to prevent exposing secret keys
 * Handles payment intent creation with proper validation
 * 
 * Security:
 * - Stripe secret key stored server-side only
 * - Request validation (amount, currency)
 * - Rate limiting (10 requests/hour per user)
 * - Auth required (Supabase JWT)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.0.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createUpstashRateLimiter, RateLimitPresets } from '../_shared/upstashRateLimit.ts';
import { corsHeaders } from '../_shared/security-middleware.ts';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');

if (!STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

// Rate limiter: 10 payment requests per hour (strict)
const rateLimiter = createUpstashRateLimiter(RateLimitPresets.PAYMENT);

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting check
    const rateLimit = await rateLimiter.check(req);
    if (!rateLimit.success) {
      return new Response(
        JSON.stringify({
          error: 'Too many payment requests',
          retryAfter: Math.ceil((rateLimit.reset - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((rateLimit.reset - Date.now()) / 1000)),
          },
        }
      );
    }

    const { amount, currency = 'usd', metadata = {} } = await req.json();

    // Validate amount
    if (!amount || amount < 50) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount. Minimum is 50 cents.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (amount > 100000000) { // $1M limit
      return new Response(
        JSON.stringify({ error: 'Amount exceeds maximum limit' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Ensure integer
      currency: currency.toLowerCase(),
      metadata: {
        ...metadata,
        user_id: user.id,
        created_at: new Date().toISOString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Log transaction (audit trail)
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'payment_intent_created',
      resource_type: 'payment',
      resource_id: paymentIntent.id,
      metadata: {
        amount,
        currency,
        status: paymentIntent.status,
      },
    });

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Payment intent creation error:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
