import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createGuard, z } from '../_shared/guard-middleware.ts';
import {
  getPayTRConfig,
  initiateTransfer,
  toKurus,
  generateMerchantOid,
} from '../_shared/paytr.ts';

const WithdrawalSchema = z.object({
  amount: z.number().min(50, "En az 50 Coin çekebilirsiniz"), // Minimum 50 Coins
  bankAccountId: z.string().uuid(),
});

const handler = createGuard(
  {
    body: WithdrawalSchema,
    auth: 'required',
    methods: ['POST'],
    functionName: 'paytr-withdraw',
  },
  async ({ body, user, supabaseAdmin, logger }) => {
    const { amount: coinAmount, bankAccountId } = body;
    const userId = user!.id;

    // 1. Exchange Rate (Financial Constitution 2026: 1 LVND = 1 TRY)
    // NOTE: Rate is hardcoded for consistency. Future: fetch from exchange_rates table
    const COIN_TO_TRY_RATE = 1.0;
    const fiatAmountGross = coinAmount * COIN_TO_TRY_RATE;

    // 2. Determine Commission based on Subscription Tier
    const { data: userSub } = await supabaseAdmin
      .from('user_subscriptions')
      .select('plan_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    // Tier-based commission rates (aligned with subscription system)
    const planId = userSub?.plan_id || 'basic';
    const COMMISSION_RATES: Record<string, number> = {
      'basic': 0.15,    // Basic: 15% commission
      'premium': 0.10,  // Premium: 10% commission
      'platinum': 0.05, // Platinum: 5% commission
    };
    const commissionRate = COMMISSION_RATES[planId] || 0.15;

    const commissionAmount = fiatAmountGross * commissionRate;
    const fiatAmountNet = fiatAmountGross - commissionAmount;

    // 3. Check User Coin Balance from Wallets
    const { data: walletData, error: walletError } = await supabaseAdmin
      .from('wallets')
      .select('coins_balance')
      .eq('user_id', userId)
      .single();

    if (walletError || !walletData) {
      throw new Error('Wallet not found');
    }

    if ((walletData.coins_balance || 0) < coinAmount) {
      throw new Error('Yetersiz bakiye');
    }

    // 4. Get Bank Account
    const { data: bankAccount } = await supabaseAdmin
      .from('bank_accounts')
      .select('iban, account_holder_name')
      .eq('id', bankAccountId)
      .eq('user_id', userId)
      .single();

    if (!bankAccount) {
      throw new Error('Banka hesabı bulunamadı');
    }

    // 5. Determine if manual approval is required (> 1000 units)
    const APPROVAL_THRESHOLD = 1000;
    const requiresManualApproval = coinAmount > APPROVAL_THRESHOLD;
    const initialStatus = requiresManualApproval ? 'pending_approval' : 'pending_processing';

    // 6. Generate Settlement ID (used as idempotency key)
    const settlementId = generateMerchantOid('WTH');

    // 7. Burn Coins (Atomic Transaction with Idempotency)
    const { data: coinTxResult, error: coinIdxError } = await supabaseAdmin.rpc('handle_coin_transaction', {
        p_user_id: userId,
        p_amount: -coinAmount,
        p_type: 'withdrawal_burn',
        p_description: `Withdrawal: ${coinAmount} LVND. ${requiresManualApproval ? '(Manual Approval Required)' : ''}`,
        p_metadata: {
            fiat_gross: fiatAmountGross,
            fiat_net: fiatAmountNet,
            commission: commissionAmount,
            rate: COIN_TO_TRY_RATE,
            tier: planId,
            bank_account: bankAccountId,
            requires_approval: requiresManualApproval,
            settlement_id: settlementId
        },
        p_idempotency_key: settlementId  // Prevents duplicate burns
    });

    if (coinIdxError) {
        throw new Error('Coin düşümü başarısız: ' + coinIdxError.message);
    }

    // Check if this was a duplicate request
    const isDuplicate = coinTxResult?.message?.includes('idempotent');
    if (isDuplicate) {
        // Return existing withdrawal request
        const { data: existingRequest } = await supabaseAdmin
            .from('withdrawal_requests')
            .select('*')
            .eq('paytr_settlement_id', settlementId)
            .single();

        if (existingRequest) {
            return {
                success: true,
                settlementId: settlementId,
                coins_deducted: coinAmount,
                fiat_amount: fiatAmountNet,
                commission: commissionAmount,
                requires_approval: requiresManualApproval,
                status: existingRequest.status,
                duplicate_request: true
            };
        }
    }

    // 8. Log Withdrawal Request
    await supabaseAdmin.from('withdrawal_requests').insert({
        user_id: userId,
        amount: fiatAmountNet,
        currency: 'TRY',
        bank_account_id: bankAccountId,
        paytr_settlement_id: settlementId,
        status: initialStatus,
        withdrawal_approval_status: requiresManualApproval ? 'pending_approval' : 'approved',
        metadata: {
            coin_amount: coinAmount,
            commission_deducted: commissionAmount,
            plan_id: planId,
            requires_manual_approval: requiresManualApproval
        }
    });

    return {
        success: true,
        settlementId: settlementId,
        coins_deducted: coinAmount,
        fiat_amount: fiatAmountNet,
        commission: commissionAmount,
        requires_approval: requiresManualApproval,
        status: initialStatus
    };
  }
);

serve(handler);
