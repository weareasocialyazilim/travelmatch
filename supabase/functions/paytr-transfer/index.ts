import { Logger } from '..//_shared/logger.ts';
const logger = new Logger();

/**
 * PayTR Transfer Edge Function
 *
 * Initiates transfer of funds to receiver after proof verification.
 * Uses PayTR Platform Transfer API.
 *
 * POST /paytr-transfer
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createAdminClient } from '../_shared/supabase.ts';
import {
  getPayTRConfig,
  initiateTransfer,
  toKurus,
  generateMerchantOid,
} from '../_shared/paytr.ts';
import { getCorsHeaders } from '../_shared/cors.ts';

// =============================================================================
// TYPES
// =============================================================================

interface TransferRequest {
  escrowId: string;
}

interface TransferResponse {
  success: boolean;
  transferId?: string;
  amount?: number;
  error?: string;
}

// =============================================================================
// MAIN HANDLER
// =============================================================================

serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const adminClient = createAdminClient();

  try {
    const body: TransferRequest = await req.json();

    if (!body.escrowId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing escrowId',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Get escrow transaction
    const { data: escrow, error: escrowError } = await adminClient
      .from('escrow_transactions')
      .select(
        `
        *,
        commission_ledger:commission_ledger!escrow_id (
          id,
          receiver_gets,
          paytr_merchant_oid,
          status
        )
      `,
      )
      .eq('id', body.escrowId)
      .single();

    if (escrowError || !escrow) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Escrow transaction not found',
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Verify escrow is in released state
    if (escrow.status !== 'released') {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Escrow is not released. Current status: ${escrow.status}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Get receiver's bank account
    const { data: bankAccount } = await adminClient
      .from('user_bank_accounts')
      .select('*')
      .eq('user_id', escrow.recipient_id)
      .eq('is_active', true)
      .eq('is_default', true)
      .single();

    if (!bankAccount) {
      // Check for any active bank account
      const { data: anyBankAccount } = await adminClient
        .from('user_bank_accounts')
        .select('*')
        .eq('user_id', escrow.recipient_id)
        .eq('is_active', true)
        .limit(1)
        .single();

      if (!anyBankAccount) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Receiver has no bank account configured',
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      }
    }

    const targetBankAccount = bankAccount || null;

    if (!targetBankAccount) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No valid bank account found',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Validate IBAN
    const { data: ibanValidation } = await adminClient.rpc(
      'validate_turkish_iban',
      {
        p_iban: targetBankAccount.iban,
      },
    );

    if (!ibanValidation?.is_valid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid receiver IBAN',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Get commission ledger
    const ledgerData = Array.isArray(escrow.commission_ledger)
      ? escrow.commission_ledger[0]
      : escrow.commission_ledger;

    if (!ledgerData) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Commission ledger not found',
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Generate transfer ID
    const transferId = generateMerchantOid('TRF');

    // Get PayTR config
    const paytrConfig = getPayTRConfig();

    // Initiate PayTR transfer
    const transferResult = await initiateTransfer(paytrConfig, {
      platformTransferId: transferId,
      subMerchantOid: ledgerData.paytr_merchant_oid,
      amount: toKurus(ledgerData.receiver_gets),
      iban: targetBankAccount.iban,
      accountHolderName: targetBankAccount.account_holder_name,
    });

    if (!transferResult.success) {
      // Log failed transfer attempt
      await adminClient.from('security_logs').insert({
        user_id: escrow.recipient_id,
        event_type: 'transfer_failed',
        event_status: 'failure',
        event_details: {
          escrow_id: body.escrowId,
          transfer_id: transferId,
          error: transferResult.error,
        },
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: transferResult.error || 'Transfer failed',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Update commission ledger
    await adminClient
      .from('commission_ledger')
      .update({
        status: 'transferred',
        paytr_transfer_id: transferId,
        transferred_at: new Date().toISOString(),
      })
      .eq('id', ledgerData.id);

    // Log successful transfer
    await adminClient.from('security_logs').insert({
      user_id: escrow.recipient_id,
      event_type: 'transfer_success',
      event_status: 'success',
      event_details: {
        escrow_id: body.escrowId,
        transfer_id: transferId,
        amount: ledgerData.receiver_gets,
        iban_last_four: targetBankAccount.iban.slice(-4),
      },
    });

    // Notify receiver
    await adminClient.from('notifications').insert({
      user_id: escrow.recipient_id,
      type: 'transfer_completed',
      title: 'Para Yolda! 💰',
      body: `${ledgerData.receiver_gets} TL banka hesabına transfer edildi. 1-2 iş günü içinde hesabında olacak.`,
      data: {
        transfer_id: transferId,
        amount: ledgerData.receiver_gets,
      },
    });

    // Check and award badges
    await adminClient.rpc('check_and_award_badges', {
      p_user_id: escrow.recipient_id,
    });

    const response: TransferResponse = {
      success: true,
      transferId,
      amount: ledgerData.receiver_gets,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    logger.error('PayTR Transfer Error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
