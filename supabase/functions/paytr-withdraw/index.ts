import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createGuard, z } from '../_shared/guard-middleware.ts';
import {
  getPayTRConfig,
  initiateTransfer,
  toKurus,
  generateMerchantOid,
} from '../_shared/paytr.ts';

// Exchange Rate: 1 Coin = X TRY
// In a real app, this should be fetched from DB or config
const COIN_TO_TRY_RATE = 0.50;

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

    // P2 FIX: KYC Verification Required for Withdrawal
    // Check if user has completed KYC
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('kyc_status, kyc_verified_at')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      throw new Error('Kullanıcı bilgileri alınamadı');
    }

    // KYC must be verified for withdrawals
    if (userData.kyc_status !== 'verified') {
      logger.warn('[paytr-withdraw] KYC not verified for withdrawal', { userId });
      throw new Error(
        'Para çekimi için KYC doğrulaması zorunludur. Lütfen kimlik doğrulamanızı tamamlayın.',
      );
    }

    // 1. Exchange Rate (1:1 per Financial Constitution 2026)
    const COIN_TO_TRY_RATE = 1.0;
    const fiatAmountGross = coinAmount * COIN_TO_TRY_RATE;

    // 2. Determine Commission based on Subscription Tier
    const { data: userSub } = await supabaseAdmin
      .from('user_subscriptions')
      .select('plan_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    const planId = userSub?.plan_id || 'basic';
    let commissionRate = 0.15; // Free: 15%
    if (planId === 'premium') commissionRate = 0.10; // Pro: 10%
    if (planId === 'platinum') commissionRate = 0.05; // Elite: 5%

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

    // 6. Burn Coins (Atomic Transaction)
    const { error: coinIdxError } = await supabaseAdmin.rpc('handle_coin_transaction', {
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
            requires_approval: requiresManualApproval
        }
    });

    if (coinIdxError) {
        throw new Error('Coin düşümü başarısız: ' + coinIdxError.message);
    }

    // 7. P1 FIX: Actually initiate PayTR transfer (not mock!)
    const paytrConfig = getPayTRConfig();
    const settlementId = generateMerchantOid('WTH');

    // Only attempt transfer if not requiring manual approval
    let transferResult = null;
    if (!requiresManualApproval) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        transferResult = await initiateTransfer(paytrConfig, {
          platformTransferId: settlementId,
          subMerchantOid: userId, // Use user ID as sub-merchant identifier
          amount: toKurus(fiatAmountNet),
          iban: bankAccount.iban,
          accountHolderName: bankAccount.account_holder_name,
        });
        clearTimeout(timeoutId);

        if (!transferResult.success) {
          logger.error('[paytr-withdraw] Transfer failed', {
            settlementId,
            error: transferResult.error,
            userId
          });
          // Log failed transfer attempt
          await supabaseAdmin.from('security_logs').insert({
            user_id: userId,
            event_type: 'withdraw_transfer_failed',
            event_status: 'failure',
            event_details: {
              settlement_id: settlementId,
              amount: fiatAmountNet,
              error: transferResult.error,
            },
          });
          // Don't throw - the withdrawal is recorded, transfer can be retried
        } else {
          logger.info('[paytr-withdraw] Transfer initiated successfully', {
            settlementId,
            amount: fiatAmountNet,
            userId
          });
        }
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          logger.warn('[paytr-withdraw] Transfer timeout, will retry later', { settlementId });
        } else {
          logger.error('[paytr-withdraw] Transfer error', { settlementId, error });
        }
        // Don't throw - the withdrawal is recorded, transfer can be retried
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
            requires_manual_approval: requiresManualApproval,
            transfer_initiated: transferResult?.success || false,
            transfer_error: transferResult?.error || null
        }
    });

    // 9. Notify user
    await supabaseAdmin.from('notifications').insert({
      user_id: userId,
      type: 'withdrawal_initiated',
      title: 'Çekim Talebiniz Alındı 💰',
      body: requiresManualApproval
        ? `${coinAmount} Coin çekim talebiniz incelenmek üzere kuyruğa alındı. Onaylandıktan sonra banka hesabınıza aktarılacaktır.`
        : `${coinAmount} Coin çekim talebiniz işleme alındı. ${fiatAmountNet.toFixed(2)} TL banka hesabınıza 1-3 iş günü içinde aktarılacaktır.`,
      data: {
        settlement_id: settlementId,
        amount: coinAmount,
        fiat_amount: fiatAmountNet,
      },
    });

    return {
        success: true,
        settlementId: settlementId,
        coins_deducted: coinAmount,
        fiat_amount: fiatAmountNet,
        commission: commissionAmount,
        requires_approval: requiresManualApproval,
        status: initialStatus,
        transfer_initiated: transferResult?.success || false
    };
  }
);

serve(handler);
