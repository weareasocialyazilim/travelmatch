import { Logger } from '..//_shared/logger.ts';
const logger = new Logger();

/**
 * PayTR Webhook Handler
 *
 * Handles payment callbacks from PayTR.
 * Updates gift/escrow status and initiates transfers for direct pay.
 *
 * POST /paytr-webhook
 *
 * IMPORTANT: This endpoint must be registered in PayTR dashboard:
 * Mağaza Paneli > Ayarlar > Bildirim URL
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createAdminClient } from '../_shared/supabase.ts';
import {
  getPayTRConfig,
  verifyWebhookHash,
  PayTRWebhookPayload,
} from '../_shared/paytr.ts';

// =============================================================================
// CORS HEADERS
// =============================================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

// =============================================================================
// MAIN HANDLER
// =============================================================================

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const adminClient = createAdminClient();

  try {
    // Parse form data from PayTR
    const formData = await req.formData();

    const payload: PayTRWebhookPayload = {
      merchant_oid: formData.get('merchant_oid') as string,
      status: formData.get('status') as 'success' | 'failed',
      total_amount: formData.get('total_amount') as string,
      hash: formData.get('hash') as string,
      failed_reason_code: formData.get('failed_reason_code') as string,
      failed_reason_msg: formData.get('failed_reason_msg') as string,
      test_mode: formData.get('test_mode') as string,
      payment_type: formData.get('payment_type') as string,
      currency: formData.get('currency') as string,
      payment_amount: formData.get('payment_amount') as string,
      // Card storage fields
      utoken: formData.get('utoken') as string,
      ctoken: formData.get('ctoken') as string,
      card_last_four: (formData.get('masked_pan') as string)?.slice(-4),
      card_brand: formData.get('card_brand') as string,
      card_bank: formData.get('card_bank') as string,
    };

    logger.info('PayTR Webhook received:', {
      merchant_oid: payload.merchant_oid,
      status: payload.status,
      total_amount: payload.total_amount,
    });

    // Check for duplicate webhook (idempotency)
    const { data: existingEvent } = await adminClient
      .from('processed_webhook_events')
      .select('id')
      .eq('event_id', `paytr_${payload.merchant_oid}`)
      .single();

    if (existingEvent) {
      logger.info('Duplicate webhook, returning OK');
      return new Response('OK', {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Verify webhook hash
    const paytrConfig = getPayTRConfig();
    const isValid = verifyWebhookHash(paytrConfig, payload);

    if (!isValid) {
      logger.error('Invalid webhook hash');

      // Log security event
      await adminClient.from('security_logs').insert({
        event_type: 'webhook_invalid_hash',
        event_status: 'failure',
        event_details: { merchant_oid: payload.merchant_oid },
        ip_address: req.headers.get('x-forwarded-for') || null,
      });

      return new Response('Invalid hash', {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Get commission ledger entry
    const { data: ledger } = await adminClient
      .from('commission_ledger')
      .select(
        `
        *,
        gifts:gift_id (
          id,
          giver_id,
          receiver_id,
          moment_id,
          is_direct_pay
        )
      `,
      )
      .eq('paytr_merchant_oid', payload.merchant_oid)
      .single();

    if (!ledger) {
      logger.error('Ledger entry not found for:', payload.merchant_oid);
      return new Response('Order not found', {
        status: 404,
        headers: corsHeaders,
      });
    }

    // Process based on status
    if (payload.status === 'success') {
      // Update commission ledger
      await adminClient
        .from('commission_ledger')
        .update({
          status: 'collected',
          collected_at: new Date().toISOString(),
        })
        .eq('id', ledger.id);

      // Handle card storage if tokens received
      if (payload.utoken && payload.ctoken && ledger.gifts) {
        const { data: existingCard } = await adminClient
          .from('saved_cards')
          .select('id')
          .eq('paytr_ctoken', payload.ctoken)
          .single();

        if (!existingCard) {
          await adminClient.from('saved_cards').insert({
            user_id: ledger.gifts.giver_id,
            paytr_utoken: payload.utoken,
            paytr_ctoken: payload.ctoken,
            card_last_four: payload.card_last_four || '****',
            card_brand: payload.card_brand || 'unknown',
            card_bank: payload.card_bank,
            card_holder_name: 'Kart Sahibi', // PayTR doesn't provide this
            is_default: false,
          });
        }
      }

      // Handle direct pay vs escrow
      if (ledger.gifts?.is_direct_pay) {
        // Direct pay: Process immediate transfer
        const { data: transferResult } = await adminClient.rpc(
          'process_direct_pay_transfer',
          {
            p_gift_id: ledger.gifts.id,
            p_paytr_merchant_oid: payload.merchant_oid,
          },
        );

        logger.info('Direct pay transfer result:', transferResult);

        // NOTE: PayTR direct transfer to receiver's IBAN is handled via process_direct_pay_transfer RPC
        // Bank account verification and IBAN transfer will be processed by PayTR settlement API
        // The receiver must have verified bank account (KYC) before receiving funds
      } else {
        // Escrow: Update escrow status to funded
        if (ledger.escrow_id) {
          await adminClient
            .from('escrow_transactions')
            .update({
              status: 'pending', // Awaiting proof
              funded_at: new Date().toISOString(),
            })
            .eq('id', ledger.escrow_id);
        }

        // Notify giver
        await adminClient.from('notifications').insert({
          user_id: ledger.giver_id,
          type: 'payment_success',
          title: 'Ödeme Başarılı! ✅',
          body: `${ledger.base_amount} TL tutarındaki hediye ödemesi alındı. Alıcı kanıt yükledikten sonra para aktarılacak.`,
          data: {
            gift_id: ledger.gifts?.id,
            amount: ledger.base_amount,
          },
        });

        // Notify receiver
        await adminClient.from('notifications').insert({
          user_id: ledger.receiver_id,
          type: 'gift_pending',
          title: 'Hediye Bekliyor! 🎁',
          body: `${ledger.base_amount} TL değerinde bir hediye aldın! Deneyimi gerçekleştirip kanıt yükle.`,
          data: {
            gift_id: ledger.gifts?.id,
            amount: ledger.receiver_gets,
          },
        });
      }

      // Log security event
      await adminClient.from('security_logs').insert({
        user_id: ledger.giver_id,
        event_type: 'payment_success',
        event_status: 'success',
        event_details: {
          merchant_oid: payload.merchant_oid,
          amount: ledger.giver_pays,
          is_direct_pay: ledger.gifts?.is_direct_pay,
        },
        ip_address: req.headers.get('x-forwarded-for') || null,
      });

      // Check and award badges
      await adminClient.rpc('check_and_award_badges', {
        p_user_id: ledger.giver_id,
      });
    } else {
      // Payment failed
      await adminClient
        .from('commission_ledger')
        .update({
          status: 'failed',
        })
        .eq('id', ledger.id);

      // Update gift status
      if (ledger.gift_id) {
        await adminClient
          .from('gifts')
          .update({
            status: 'cancelled',
          })
          .eq('id', ledger.gift_id);
      }

      // Cancel escrow if exists
      if (ledger.escrow_id) {
        await adminClient
          .from('escrow_transactions')
          .update({
            status: 'cancelled',
          })
          .eq('id', ledger.escrow_id);
      }

      // Notify giver
      await adminClient.from('notifications').insert({
        user_id: ledger.giver_id,
        type: 'payment_failed',
        title: 'Ödeme Başarısız ❌',
        body:
          payload.failed_reason_msg ||
          'Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin.',
        data: {
          merchant_oid: payload.merchant_oid,
          reason: payload.failed_reason_msg,
        },
      });

      // Log security event
      await adminClient.from('security_logs').insert({
        user_id: ledger.giver_id,
        event_type: 'payment_failed',
        event_status: 'failure',
        event_details: {
          merchant_oid: payload.merchant_oid,
          reason_code: payload.failed_reason_code,
          reason_msg: payload.failed_reason_msg,
        },
        ip_address: req.headers.get('x-forwarded-for') || null,
      });
    }

    // Mark webhook as processed (idempotency)
    await adminClient.from('processed_webhook_events').insert({
      event_id: `paytr_${payload.merchant_oid}`,
      event_type: 'paytr_payment',
      payload: payload,
      processed_at: new Date().toISOString(),
    });

    // PayTR expects "OK" response
    return new Response('OK', {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    logger.error('PayTR Webhook Error:', error);

    // Still return OK to prevent PayTR from retrying
    // Log the error for investigation
    await adminClient.from('security_logs').insert({
      event_type: 'webhook_error',
      event_status: 'failure',
      event_details: { error: error.message },
      ip_address: req.headers.get('x-forwarded-for') || null,
    });

    return new Response('OK', {
      status: 200,
      headers: corsHeaders,
    });
  }
});
