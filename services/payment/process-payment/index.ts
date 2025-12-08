/**
 * Payment Processing Service
 * Handles payment creation, processing, and webhooks
 */

import { serve } from '@supabase/edge-runtime';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { handleCors, validateAuth, handleError } from '../../shared/middleware';
import { successResponse, createdResponse } from '../../shared/utils/response.ts';
import { logger } from '../../shared/utils/logger.ts';
import { validateRequest } from '../../shared/utils/validation.ts';
import { z } from 'zod';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-12-18.acacia',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_KEY') ?? ''
);

// Validation schemas
const createPaymentIntentSchema = z.object({
  momentId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.enum(['usd', 'eur', 'try']),
  paymentMethodId: z.string().optional(),
});

const confirmPaymentSchema = z.object({
  paymentIntentId: z.string(),
  paymentMethodId: z.string(),
});

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const url = new URL(req.url);
    const path = url.pathname;

    // Route requests
    if (path.endsWith('/create-payment-intent')) {
      return await createPaymentIntent(req);
    } else if (path.endsWith('/confirm-payment')) {
      return await confirmPayment(req);
    } else if (path.endsWith('/webhook')) {
      return await handleWebhook(req);
    } else if (path.endsWith('/refund')) {
      return await processRefund(req);
    } else {
      throw new Error('Invalid endpoint');
    }

  } catch (error) {
    logger.error('Payment service error', error as Error);
    return handleError(error);
  }
});

/**
 * Create Payment Intent
 */
async function createPaymentIntent(req: Request) {
  const { user, supabase: userSupabase } = await validateAuth(req);
  const body = await validateRequest(req, createPaymentIntentSchema);

  logger.info('Creating payment intent', {
    userId: user.id,
    momentId: body.momentId,
    amount: body.amount,
  });

  // 1. Verify moment exists and is active
  const { data: moment, error: momentError } = await supabase
    .from('moments')
    .select('*')
    .eq('id', body.momentId)
    .single();

  if (momentError || !moment) {
    throw new Error('Moment not found');
  }

  if (moment.status !== 'active') {
    throw new Error('Moment is not active');
  }

  // 2. Check if user already gifted this moment
  const { data: existingGift } = await supabase
    .from('gifts')
    .select('id')
    .eq('moment_id', body.momentId)
    .eq('giver_id', user.id)
    .single();

  if (existingGift) {
    throw new Error('You have already gifted this moment');
  }

  // 3. Get or create Stripe customer
  const customerId = await getOrCreateStripeCustomer(user);

  // 4. Calculate platform fee (10%)
  const platformFee = Math.round(body.amount * 0.1);

  // 5. Create Stripe Payment Intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: body.amount,
    currency: body.currency,
    customer: customerId,
    payment_method: body.paymentMethodId,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: 'never',
    },
    metadata: {
      momentId: body.momentId,
      giverId: user.id,
      receiverId: moment.user_id,
      platformFee: platformFee.toString(),
    },
    application_fee_amount: platformFee,
    transfer_data: {
      destination: moment.stripe_account_id, // Connected account
    },
  });

  // 6. Store transaction in database
  const { data: transaction, error: txError } = await supabase
    .from('transactions')
    .insert({
      moment_id: body.momentId,
      giver_id: user.id,
      receiver_id: moment.user_id,
      amount: body.amount,
      currency: body.currency,
      platform_fee: platformFee,
      stripe_payment_intent_id: paymentIntent.id,
      status: 'pending',
      type: 'gift',
    })
    .select()
    .single();

  if (txError) {
    logger.error('Failed to create transaction record', txError);
    throw txError;
  }

  logger.info('Payment intent created', {
    paymentIntentId: paymentIntent.id,
    transactionId: transaction.id,
  });

  return createdResponse({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    transactionId: transaction.id,
  });
}

/**
 * Confirm Payment
 */
async function confirmPayment(req: Request) {
  const { user } = await validateAuth(req);
  const body = await validateRequest(req, confirmPaymentSchema);

  logger.info('Confirming payment', {
    userId: user.id,
    paymentIntentId: body.paymentIntentId,
  });

  // 1. Retrieve payment intent
  const paymentIntent = await stripe.paymentIntents.retrieve(
    body.paymentIntentId
  );

  if (paymentIntent.status === 'succeeded') {
    // Payment already confirmed
    return successResponse({ status: 'succeeded' });
  }

  // 2. Confirm payment intent
  const confirmed = await stripe.paymentIntents.confirm(
    body.paymentIntentId,
    {
      payment_method: body.paymentMethodId,
    }
  );

  // 3. Update transaction status
  if (confirmed.status === 'succeeded') {
    await supabase
      .from('transactions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', body.paymentIntentId);

    logger.info('Payment confirmed successfully', {
      paymentIntentId: body.paymentIntentId,
    });
  }

  return successResponse({
    status: confirmed.status,
    paymentIntentId: confirmed.id,
  });
}

/**
 * Handle Stripe Webhook
 */
async function handleWebhook(req: Request) {
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    throw new Error('Missing stripe-signature header');
  }

  const body = await req.text();

  // Verify webhook signature
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
    );
  } catch (error) {
    logger.error('Webhook signature verification failed', error as Error);
    throw new Error('Invalid signature');
  }

  logger.info('Processing webhook event', { type: event.type });

  // Handle different event types
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;

    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
      break;

    case 'charge.refunded':
      await handleRefund(event.data.object as Stripe.Charge);
      break;

    case 'transfer.paid':
      await handleTransferPaid(event.data.object as Stripe.Transfer);
      break;

    default:
      logger.info('Unhandled webhook event type', { type: event.type });
  }

  return successResponse({ received: true });
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const { momentId, giverId, receiverId } = paymentIntent.metadata;

  logger.info('Payment succeeded', { paymentIntentId: paymentIntent.id });

  // 1. Update transaction status
  await supabase
    .from('transactions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  // 2. Create gift record
  await supabase
    .from('gifts')
    .insert({
      moment_id: momentId,
      giver_id: giverId,
      receiver_id: receiverId,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: 'pending_proof',
    });

  // 3. Update moment progress
  const { data: moment } = await supabase
    .from('moments')
    .select('total_amount, collected_amount')
    .eq('id', momentId)
    .single();

  if (moment) {
    const newCollectedAmount = moment.collected_amount + paymentIntent.amount;
    const progress = (newCollectedAmount / moment.total_amount) * 100;

    await supabase
      .from('moments')
      .update({
        collected_amount: newCollectedAmount,
        status: progress >= 100 ? 'funded' : 'active',
      })
      .eq('id', momentId);
  }

  // 4. Send notification to receiver
  await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/smart-notifications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_KEY')}`,
    },
    body: JSON.stringify({
      userId: receiverId,
      type: 'gift_received',
      priority: 'high',
      data: {
        momentId,
        giverId,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
    }),
  });

  logger.info('Payment processing completed', {
    momentId,
    paymentIntentId: paymentIntent.id,
  });
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  logger.warn('Payment failed', {
    paymentIntentId: paymentIntent.id,
    error: paymentIntent.last_payment_error?.message,
  });

  await supabase
    .from('transactions')
    .update({
      status: 'failed',
      error_message: paymentIntent.last_payment_error?.message,
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);
}

/**
 * Process refund
 */
async function processRefund(req: Request) {
  const { user } = await validateAuth(req);
  const { paymentIntentId, reason } = await req.json();

  logger.info('Processing refund', {
    userId: user.id,
    paymentIntentId,
    reason,
  });

  // Create refund
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    reason: reason || 'requested_by_customer',
  });

  // Update transaction
  await supabase
    .from('transactions')
    .update({
      status: 'refunded',
      refunded_at: new Date().toISOString(),
    })
    .eq('stripe_payment_intent_id', paymentIntentId);

  logger.info('Refund processed', { refundId: refund.id });

  return successResponse({ refund });
}

/**
 * Handle refund webhook
 */
async function handleRefund(charge: Stripe.Charge): Promise<void> {
  logger.info('Charge refunded', { chargeId: charge.id });

  await supabase
    .from('transactions')
    .update({
      status: 'refunded',
      refunded_at: new Date().toISOString(),
    })
    .eq('stripe_charge_id', charge.id);
}

/**
 * Handle transfer paid
 */
async function handleTransferPaid(transfer: Stripe.Transfer): Promise<void> {
  logger.info('Transfer paid', { transferId: transfer.id });

  await supabase
    .from('payouts')
    .insert({
      stripe_transfer_id: transfer.id,
      amount: transfer.amount,
      currency: transfer.currency,
      destination: transfer.destination as string,
      status: 'completed',
    });
}

/**
 * Get or create Stripe customer for user
 */
async function getOrCreateStripeCustomer(user: any): Promise<string> {
  // Check if user has Stripe customer ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email, full_name')
    .eq('id', user.id)
    .single();

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: profile?.email || user.email,
    name: profile?.full_name,
    metadata: {
      userId: user.id,
    },
  });

  // Save customer ID
  await supabase
    .from('profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('id', user.id);

  logger.info('Created Stripe customer', {
    userId: user.id,
    customerId: customer.id,
  });

  return customer.id;
}
