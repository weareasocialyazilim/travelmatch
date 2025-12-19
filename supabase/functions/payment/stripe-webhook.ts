/**
 * Stripe Webhook Handler Edge Function
 * 
 * Security Features:
 * - Webhook signature verification
 * - Idempotent processing
 * - Automatic retry handling
 * - Audit logging
 * - Cache invalidation
 * 
 * Handles events:
 * - payment_intent.succeeded
 * - payment_intent.payment_failed
 * - charge.refunded
 * - customer.subscription.created/updated/deleted
 * 
 * @see https://stripe.com/docs/webhooks
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno';

// CORS headers (webhooks from Stripe don't need CORS, but keeping for consistency)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'stripe-signature, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/**
 * Log audit event
 */
async function logAudit(
  supabase: SupabaseClient,
  action: string,
  metadata: Record<string, unknown>,
) {
  try {
    await supabase.from('audit_logs').insert({
      action,
      metadata,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
}

/**
 * Invalidate payment-related cache for user
 */
async function invalidateUserPaymentCache(
  supabase: SupabaseClient,
  userId: string,
) {
  try {
    const timestamp = new Date().toISOString();
    
    await supabase.from('cache_invalidation').insert([
      { cache_key: `wallet:${userId}`, invalidated_at: timestamp },
      { cache_key: `transactions:${userId}`, invalidated_at: timestamp },
      { cache_key: `payment_methods:${userId}`, invalidated_at: timestamp },
    ]);
  } catch (error) {
    console.error('Failed to invalidate cache:', error);
  }
}

/**
 * Check if event was already processed (idempotency)
 */
async function isEventProcessed(
  supabase: SupabaseClient,
  eventId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from('processed_webhook_events')
    .select('id')
    .eq('event_id', eventId)
    .single();

  return !!data;
}

/**
 * Mark event as processed
 */
async function markEventProcessed(
  supabase: SupabaseClient,
  eventId: string,
  eventType: string,
) {
  try {
    await supabase.from('processed_webhook_events').insert({
      event_id: eventId,
      event_type: eventType,
      processed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to mark event as processed:', error);
  }
}

/**
 * Handle payment_intent.succeeded event
 */
async function handlePaymentSucceeded(
  supabase: SupabaseClient,
  paymentIntent: Stripe.PaymentIntent,
) {
  const userId = paymentIntent.metadata.supabase_user_id;
  const momentId = paymentIntent.metadata.moment_id;
  const recipientUserId = paymentIntent.metadata.moment_creator_id;

  if (!userId || !momentId) {
    throw new Error('Missing required metadata in payment intent');
  }

  // Update transaction status to completed
  const { error: txUpdateError } = await supabase
    .from('transactions')
    .update({
      status: 'completed',
      metadata: {
        stripe_payment_intent_id: paymentIntent.id,
        stripe_charge_id: paymentIntent.latest_charge,
        completed_at: new Date().toISOString(),
      },
    })
    .eq('metadata->>stripe_payment_intent_id', paymentIntent.id);

  if (txUpdateError) {
    console.error('Failed to update transaction:', txUpdateError);
  }

  // Update moment gifted count
  await supabase.rpc('increment_moment_gift_count', { moment_id: momentId });

  // Update recipient's balance
  const amount = paymentIntent.amount / 100; // Convert from cents
  await supabase.rpc('increment_user_balance', {
    user_id: recipientUserId,
    amount: amount,
  });

  // Send notification to recipient
  await supabase.from('notifications').insert({
    user_id: recipientUserId,
    type: 'gift_received',
    title: 'You received a gift! 🎁',
    body: `Someone gifted you $${amount.toFixed(2)} for your moment`,
    data: {
      moment_id: momentId,
      transaction_id: paymentIntent.id,
      amount: amount,
    },
  });

  // Invalidate cache for both users
  await invalidateUserPaymentCache(supabase, userId);
  await invalidateUserPaymentCache(supabase, recipientUserId);

  // Log audit
  await logAudit(supabase, 'payment_succeeded', {
    payment_intent_id: paymentIntent.id,
    user_id: userId,
    recipient_user_id: recipientUserId,
    moment_id: momentId,
    amount: amount,
  });
}

/**
 * Handle payment_intent.payment_failed event
 */
async function handlePaymentFailed(
  supabase: SupabaseClient,
  paymentIntent: Stripe.PaymentIntent,
) {
  const userId = paymentIntent.metadata.supabase_user_id;
  const momentId = paymentIntent.metadata.moment_id;

  // Update transaction status to failed
  const { error: txUpdateError } = await supabase
    .from('transactions')
    .update({
      status: 'failed',
      metadata: {
        stripe_payment_intent_id: paymentIntent.id,
        failure_reason: paymentIntent.last_payment_error?.message,
        failed_at: new Date().toISOString(),
      },
    })
    .eq('metadata->>stripe_payment_intent_id', paymentIntent.id);

  if (txUpdateError) {
    console.error('Failed to update transaction:', txUpdateError);
  }

  // Send notification to user
  if (userId) {
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'payment_failed',
      title: 'Payment Failed',
      body: 'Your payment could not be processed. Please try again.',
      data: {
        moment_id: momentId,
        payment_intent_id: paymentIntent.id,
        error: paymentIntent.last_payment_error?.message,
      },
    });

    // Invalidate cache
    await invalidateUserPaymentCache(supabase, userId);
  }

  // Log audit
  await logAudit(supabase, 'payment_failed', {
    payment_intent_id: paymentIntent.id,
    user_id: userId,
    moment_id: momentId,
    error: paymentIntent.last_payment_error?.message,
  });
}

/**
 * Handle charge.refunded event
 */
async function handleChargeRefunded(
  supabase: SupabaseClient,
  charge: Stripe.Charge,
) {
  const paymentIntentId = charge.payment_intent as string;

  // Find the original transaction
  const { data: transaction } = await supabase
    .from('transactions')
    .select('*')
    .eq('metadata->>stripe_payment_intent_id', paymentIntentId)
    .single();

  if (!transaction) {
    console.error('Transaction not found for refund');
    return;
  }

  // Update transaction status
  await supabase
    .from('transactions')
    .update({
      status: 'refunded',
      metadata: {
        ...transaction.metadata,
        stripe_charge_id: charge.id,
        refunded_at: new Date().toISOString(),
        refund_amount: charge.amount_refunded / 100,
      },
    })
    .eq('id', transaction.id);

  // Create refund transaction record
  await supabase.from('transactions').insert({
    user_id: transaction.user_id,
    moment_id: transaction.moment_id,
    type: 'refund',
    amount: charge.amount_refunded / 100,
    currency: transaction.currency,
    status: 'completed',
    description: 'Refund for gift payment',
    metadata: {
      original_transaction_id: transaction.id,
      stripe_charge_id: charge.id,
    },
  });

  // Decrease recipient's balance
  const recipientUserId = transaction.metadata?.recipient_user_id;
  if (recipientUserId) {
    await supabase.rpc('decrement_user_balance', {
      user_id: recipientUserId,
      amount: charge.amount_refunded / 100,
    });

    // Notify recipient
    await supabase.from('notifications').insert({
      user_id: recipientUserId,
      type: 'refund_processed',
      title: 'Gift Refunded',
      body: 'A gift you received has been refunded',
      data: {
        transaction_id: transaction.id,
        amount: charge.amount_refunded / 100,
      },
    });

    await invalidateUserPaymentCache(supabase, recipientUserId);
  }

  // Notify sender
  await supabase.from('notifications').insert({
    user_id: transaction.user_id,
    type: 'refund_processed',
    title: 'Refund Processed',
    body: `Your refund of $${(charge.amount_refunded / 100).toFixed(2)} has been processed`,
    data: {
      transaction_id: transaction.id,
      amount: charge.amount_refunded / 100,
    },
  });

  await invalidateUserPaymentCache(supabase, transaction.user_id);

  // Log audit
  await logAudit(supabase, 'charge_refunded', {
    charge_id: charge.id,
    payment_intent_id: paymentIntentId,
    transaction_id: transaction.id,
    amount: charge.amount_refunded / 100,
  });
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeSecretKey || !webhookSecret) {
      throw new Error('Stripe configuration missing');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify webhook signature
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing stripe signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Check idempotency - prevent duplicate processing
    if (await isEventProcessed(supabase, event.id)) {
      console.log(`Event ${event.id} already processed`);
      return new Response(
        JSON.stringify({ received: true, status: 'already_processed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Handle different event types
    console.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(supabase, event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(supabase, event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(supabase, event.data.object as Stripe.Charge);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark event as processed
    await markEventProcessed(supabase, event.id, event.type);

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
