/**
 * PayTR Transfer Edge Function
 *
 * Initiates transfer of funds to receiver after proof verification.
 * Uses PayTR Platform Transfer API.
 *
 * POST /paytr-transfer
 *
 * SECURITY: Requires authentication. Only the sender or recipient of the escrow
 * can trigger the transfer.
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createGuard, z } from '../_shared/guard-middleware.ts';
import {
  getPayTRConfig,
  initiateTransfer,
  toKurus,
  generateMerchantOid,
} from '../_shared/paytr.ts';

// =============================================================================
// SCHEMAS
// =============================================================================

const TransferRequestSchema = z.object({
  escrowId: z.string().uuid('Invalid escrow ID format'),
});

// =============================================================================
// MAIN HANDLER
// =============================================================================

const handler = createGuard(
  {
    body: TransferRequestSchema,
    auth: 'required', // ← Authentication required
    methods: ['POST'],
    functionName: 'paytr-transfer',
  },
  async ({ body, user, supabaseAdmin, logger }) => {
    const { escrowId } = body;

    // Get escrow transaction
    const { data: escrow, error: escrowError } = await supabaseAdmin
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
      .eq('id', escrowId)
      .single();

    if (escrowError || !escrow) {
      throw new Error('Escrow transaction not found');
    }

    // SECURITY: Verify user is authorized to trigger this transfer
    // Only sender (payer_id) or recipient can trigger transfer
    if (escrow.payer_id !== user!.id && escrow.recipient_id !== user!.id) {
      logger.warn('Unauthorized transfer attempt', {
        userId: user!.id,
        escrowId,
        payerId: escrow.payer_id,
        recipientId: escrow.recipient_id,
      });
      throw new Error('You are not authorized to trigger this transfer');
    }

    // Verify escrow is in released state
    if (escrow.status !== 'released') {
      throw new Error(`Escrow is not released. Current status: ${escrow.status}`);
    }

    // Get receiver's bank account
    const { data: bankAccount } = await supabaseAdmin
      .from('user_bank_accounts')
      .select('*')
      .eq('user_id', escrow.recipient_id)
      .eq('is_active', true)
      .eq('is_default', true)
      .single();

    if (!bankAccount) {
      // Check for any active bank account
      const { data: anyBankAccount } = await supabaseAdmin
        .from('user_bank_accounts')
        .select('*')
        .eq('user_id', escrow.recipient_id)
        .eq('is_active', true)
        .limit(1)
        .single();

      if (!anyBankAccount) {
        throw new Error('Receiver has no bank account configured');
      }
    }

    const targetBankAccount = bankAccount || null;

    if (!targetBankAccount) {
      throw new Error('No valid bank account found');
    }

    // Validate IBAN
    const { data: ibanValidation } = await supabaseAdmin.rpc(
      'validate_turkish_iban',
      {
        p_iban: targetBankAccount.iban,
      },
    );

    if (!ibanValidation?.is_valid) {
      throw new Error('Invalid receiver IBAN');
    }

    // Get commission ledger
    const ledgerData = Array.isArray(escrow.commission_ledger)
      ? escrow.commission_ledger[0]
      : escrow.commission_ledger;

    if (!ledgerData) {
      throw new Error('Commission ledger not found');
    }

    // Generate transfer ID
    const transferId = generateMerchantOid('TRF');

    // Get PayTR config
    const paytrConfig = getPayTRConfig();

    // Initiate PayTR transfer with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const transferResult = await initiateTransfer(paytrConfig, {
        platformTransferId: transferId,
        subMerchantOid: ledgerData.paytr_merchant_oid,
        amount: toKurus(ledgerData.receiver_gets),
        iban: targetBankAccount.iban,
        accountHolderName: targetBankAccount.account_holder_name,
      });

      clearTimeout(timeoutId);

      if (!transferResult.success) {
        // Log failed transfer attempt
        await supabaseAdmin.from('security_logs').insert({
          user_id: escrow.recipient_id,
          event_type: 'transfer_failed',
          event_status: 'failure',
          event_details: {
            escrow_id: escrowId,
            transfer_id: transferId,
            error: transferResult.error,
            triggered_by: user!.id,
          },
        });

        throw new Error(transferResult.error || 'Transfer failed');
      }

      // Update commission ledger
      await supabaseAdmin
        .from('commission_ledger')
        .update({
          status: 'transferred',
          paytr_transfer_id: transferId,
          transferred_at: new Date().toISOString(),
        })
        .eq('id', ledgerData.id);

      // Log successful transfer
      await supabaseAdmin.from('security_logs').insert({
        user_id: escrow.recipient_id,
        event_type: 'transfer_success',
        event_status: 'success',
        event_details: {
          escrow_id: escrowId,
          transfer_id: transferId,
          amount: ledgerData.receiver_gets,
          iban_last_four: targetBankAccount.iban.slice(-4),
          triggered_by: user!.id,
        },
      });

      // Notify receiver
      await supabaseAdmin.from('notifications').insert({
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
      await supabaseAdmin.rpc('check_and_award_badges', {
        p_user_id: escrow.recipient_id,
      });

      return {
        transferId,
        amount: ledgerData.receiver_gets,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Transfer request timed out. Please try again.');
      }
      throw error;
    }
  },
);

serve(handler);
