import { Logger } from '..//_shared/logger.ts';
const logger = new Logger();

/**
 * PayTR Create Payment Edge Function
 *
 * Creates a PayTR payment token for iFrame checkout.
 * Handles commission calculation and escrow setup.
 *
 * POST /paytr-create-payment
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createSupabaseClients, requireAuth } from '../_shared/supabase.ts';
import {
  getPayTRConfig,
  getPaymentToken,
  toKurus,
  generateMerchantOid,
  createBasketItem,
} from '../_shared/paytr.ts';
import { getCorsHeaders } from '../_shared/cors.ts';

// =============================================================================
// TYPES
// =============================================================================

interface CreatePaymentRequest {
  momentId: string;
  receiverId: string;
  baseAmount: number; // Amount in TL
  currency?: 'TL' | 'USD' | 'EUR';
  requestProof?: boolean; // For optional tier
  storeCard?: boolean;
  successUrl: string;
  failUrl: string;
}

interface CreatePaymentResponse {
  success: boolean;
  token?: string;
  merchantOid?: string;
  giverPays?: number;
  receiverGets?: number;
  commission?: number;
  isDirectPay?: boolean;
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

  try {
    // Parse request
    const body: CreatePaymentRequest = await req.json();

    // Validate required fields
    if (!body.momentId || !body.receiverId || !body.baseAmount) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: momentId, receiverId, baseAmount',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Validate amount
    if (body.baseAmount < 10 || body.baseAmount > 10000) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Amount must be between 10 and 10,000 TL',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Get Supabase clients
    const { userClient, adminClient } = createSupabaseClients({
      request: req,
    });

    // Authenticate user (giver)
    const user = await requireAuth(userClient);
    const giverId = user.id;

    // Get giver profile
    const { data: giverProfile } = await adminClient
      .from('profiles')
      .select('full_name, phone')
      .eq('id', giverId)
      .single();

    if (!giverProfile) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Giver profile not found',
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Get moment details
    const { data: moment } = await adminClient
      .from('moments')
      .select('id, title, user_id')
      .eq('id', body.momentId)
      .single();

    if (!moment) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Moment not found',
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Verify receiver matches moment owner
    if (moment.user_id !== body.receiverId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Receiver does not match moment owner',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Get client context for compliance checks
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '0.0.0.0';
    const deviceId = req.headers.get('x-device-id') || '';
    const userAgent = req.headers.get('user-agent') || '';

    // ==========================================================================
    // COMPLIANCE CHECK: User limits + AML + Fraud (all-in-one)
    // ==========================================================================
    const currency =
      body.currency === 'USD' ? 'USD' : body.currency === 'EUR' ? 'EUR' : 'TRY';

    const { data: complianceCheck, error: complianceError } =
      await adminClient.rpc('check_transaction_compliance', {
        p_user_id: giverId,
        p_amount: body.baseAmount,
        p_currency: currency,
        p_transaction_type: 'send',
        p_recipient_id: body.receiverId,
        p_metadata: {
          moment_id: body.momentId,
          ip_address: clientIp,
          device_id: deviceId,
          user_agent: userAgent,
        },
      });

    if (complianceError) {
      logger.error('Compliance check error:', complianceError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Compliance check failed',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Block if compliance check fails
    if (!complianceCheck?.allowed) {
      const blockReasons = complianceCheck?.block_reasons || [
        'Transaction not allowed',
      ];

      // Log security event
      await adminClient.from('security_logs').insert({
        user_id: giverId,
        event_type: 'payment_blocked',
        event_status: 'blocked',
        event_details: {
          compliance_check: complianceCheck,
          block_reasons: blockReasons,
        },
        ip_address: clientIp,
        user_agent: userAgent,
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: blockReasons[0],
          errors: blockReasons,
          kyc_required: complianceCheck?.requires_kyc || false,
          risk_level: complianceCheck?.risk_level || 'unknown',
        }),
        {
          status: complianceCheck?.requires_kyc ? 403 : 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // If requires manual review, still allow but flag
    if (complianceCheck?.requires_review) {
      logger.info('Transaction flagged for review:', {
        userId: giverId,
        amount: body.baseAmount,
        currency,
        riskScore: complianceCheck.risk_score,
      });
    }

    // ==========================================================================
    // Legacy check_payment_limits (backup - will be removed after testing)
    // ==========================================================================
    const { data: limitCheck } = await adminClient.rpc('check_payment_limits', {
      p_user_id: giverId,
      p_amount: body.baseAmount,
      p_currency: body.currency || 'TL',
    });

    if (limitCheck && !limitCheck.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: limitCheck.errors?.[0] || 'Payment limit exceeded',
          errors: limitCheck.errors,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Legacy check_fraud_signals (backup - will be removed after testing)
    const { data: fraudCheck } = await adminClient.rpc('check_fraud_signals', {
      p_user_id: giverId,
      p_amount: body.baseAmount,
      p_ip_address: clientIp,
      p_device_id: deviceId,
    });

    if (fraudCheck?.should_block) {
      // Log security event
      await adminClient.from('security_logs').insert({
        user_id: giverId,
        event_type: 'payment_blocked',
        event_status: 'blocked',
        event_details: { fraud_check: fraudCheck },
        ip_address: clientIp,
        user_agent: userAgent,
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Payment blocked for security reasons',
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Calculate commission
    const { data: commission } = await adminClient.rpc('calculate_commission', {
      p_amount: body.baseAmount,
      p_receiver_id: body.receiverId,
      p_currency: body.currency || 'TL',
    });

    if (!commission || commission.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to calculate commission',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const commissionData = commission[0];

    // Get proof requirement
    const { data: proofTier } = await adminClient.rpc('get_proof_requirement', {
      p_amount: body.baseAmount,
    });

    const isDirectPay =
      proofTier?.[0]?.requirement === 'none' ||
      (proofTier?.[0]?.requirement === 'optional' && !body.requestProof);

    // Generate merchant order ID
    const merchantOid = generateMerchantOid();

    // Create pending gift record
    const { data: giftResult, error: giftError } = await adminClient.rpc(
      'create_gift_with_proof_requirement',
      {
        p_giver_id: giverId,
        p_receiver_id: body.receiverId,
        p_moment_id: body.momentId,
        p_base_amount: body.baseAmount,
        p_currency: body.currency || 'TRY',
        p_giver_requests_proof: body.requestProof || false,
      },
    );

    if (giftError || !giftResult?.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: giftError?.message || 'Failed to create gift record',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Update commission ledger with merchant_oid
    await adminClient
      .from('commission_ledger')
      .update({ paytr_merchant_oid: merchantOid })
      .eq('gift_id', giftResult.gift_id);

    // Get PayTR config
    const paytrConfig = getPayTRConfig();

    // Prepare basket
    const basket = [
      createBasketItem(
        `Lovendo Hediye: ${moment.title.substring(0, 50)}`,
        commissionData.giver_pays,
        1,
      ),
    ];

    // Get PayTR token
    const tokenResponse = await getPaymentToken(paytrConfig, {
      userIp: clientIp,
      userEmail: user.email || '',
      userName: giverProfile.full_name || 'Kullanıcı',
      userPhone: giverProfile.phone || '',
      merchantOid,
      paymentAmount: toKurus(commissionData.giver_pays),
      currency: (body.currency || 'TL') as 'TL' | 'USD' | 'EUR',
      basket,
      merchantOkUrl: body.successUrl,
      merchantFailUrl: body.failUrl,
      noInstallment: true, // Disable installments for gifts
      storeCard: body.storeCard,
      debug: paytrConfig.testMode,
    });

    if (tokenResponse.status !== 'success' || !tokenResponse.token) {
      // Rollback: Delete the gift record
      await adminClient.from('gifts').delete().eq('id', giftResult.gift_id);

      return new Response(
        JSON.stringify({
          success: false,
          error: tokenResponse.reason || 'Failed to get PayTR token',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Log security event
    await adminClient.from('security_logs').insert({
      user_id: giverId,
      event_type: 'payment_initiated',
      event_status: 'success',
      event_details: {
        merchant_oid: merchantOid,
        amount: commissionData.giver_pays,
        is_direct_pay: isDirectPay,
      },
      ip_address: clientIp,
      user_agent: req.headers.get('user-agent'),
    });

    // Return response
    const response: CreatePaymentResponse = {
      success: true,
      token: tokenResponse.token,
      merchantOid,
      giverPays: commissionData.giver_pays,
      receiverGets: commissionData.receiver_gets,
      commission: commissionData.total_commission,
      isDirectPay,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    logger.error('PayTR Create Payment Error:', error);

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
