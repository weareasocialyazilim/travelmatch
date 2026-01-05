import { Logger } from '..//_shared/logger.ts';
const logger = new Logger();

/**
 * PayTR Card Tokenization Edge Function
 *
 * Tokenizes card details for saved card payments.
 * Card data is forwarded directly to PayTR - NEVER stored on our servers.
 *
 * PCI-DSS Compliance:
 * - Card data is immediately forwarded to PayTR
 * - Only token is stored in our database
 * - Original card data is never logged or persisted
 *
 * POST /paytr-tokenize-card
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createSupabaseClients, requireAuth } from '../_shared/supabase.ts';
import { getPayTRConfig } from '../_shared/paytr.ts';
import { createHash } from 'https://deno.land/std@0.177.0/crypto/mod.ts';
import { getCorsHeaders } from '../_shared/cors.ts';

// =============================================================================
// TYPES
// =============================================================================

interface TokenizeCardRequest {
  cardNumber: string;
  cardHolderName: string;
  expireMonth: string;
  expireYear: string;
  cvv: string;
}

interface TokenizeCardResponse {
  success: boolean;
  cardToken?: string;
  last4?: string;
  brand?: string;
  error?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function detectCardBrand(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');

  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'amex';
  if (/^6(?:011|5)/.test(cleaned)) return 'discover';
  if (/^9792/.test(cleaned)) return 'troy';

  return 'unknown';
}

function maskCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  return cleaned.slice(-4);
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

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Method not allowed',
      }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }

  try {
    const { userClient, adminClient } = createSupabaseClients({
      request: req,
    });

    // Authenticate user
    const user = await requireAuth(userClient);
    const userId = user.id;

    // Parse request body
    const body: TokenizeCardRequest = await req.json();

    // Validate required fields (DO NOT LOG CARD DATA)
    if (
      !body.cardNumber ||
      !body.cardHolderName ||
      !body.expireMonth ||
      !body.expireYear ||
      !body.cvv
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required card fields',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Basic validation (without logging sensitive data)
    const cleanedNumber = body.cardNumber.replace(/\s/g, '');
    if (cleanedNumber.length < 13 || cleanedNumber.length > 19) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid card number',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Get PayTR config
    const config = getPayTRConfig();

    // Create PayTR store card request
    // PayTR Card Storage API: https://dev.paytr.com/en/single/saved-cards
    const merchantOid = `CARD_${userId}_${Date.now()}`;

    // Generate PayTR token hash
    // Hash = base64(sha256(merchant_id + user_ip + merchant_oid + email + card_owner + card_number + expire_month + expire_year + cvv + test_mode + merchant_salt))
    const userIp =
      req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const userEmail = user.email || 'user@travelmatch.app';
    const testMode = config.testMode ? '1' : '0';

    const hashStr = `${config.merchantId}${userIp}${merchantOid}${userEmail}${body.cardHolderName}${cleanedNumber}${body.expireMonth}${body.expireYear}${body.cvv}${testMode}${config.merchantSalt}`;

    const encoder = new TextEncoder();
    const data = encoder.encode(hashStr);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const paytrToken = btoa(String.fromCharCode(...hashArray));

    // Send to PayTR Card Storage API
    const formData = new URLSearchParams();
    formData.append('merchant_id', config.merchantId);
    formData.append('user_ip', userIp);
    formData.append('merchant_oid', merchantOid);
    formData.append('email', userEmail);
    formData.append('card_owner', body.cardHolderName);
    formData.append('card_number', cleanedNumber);
    formData.append('expire_month', body.expireMonth);
    formData.append('expire_year', body.expireYear);
    formData.append('cvv', body.cvv);
    formData.append('test_mode', testMode);
    formData.append('paytr_token', paytrToken);
    formData.append('store_card', '1');
    formData.append('non_3d', '1'); // For card storage only

    const paytrResponse = await fetch(
      'https://www.paytr.com/odeme/api/get-token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      },
    );

    const paytrResult = await paytrResponse.json();

    if (paytrResult.status !== 'success') {
      logger.error('PayTR card storage failed:', {
        reason: paytrResult.reason,
        // DO NOT log card details
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: paytrResult.reason || 'Card storage failed',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Store card token in database
    const cardToken = paytrResult.token;
    const last4 = maskCardNumber(cleanedNumber);
    const brand = detectCardBrand(cleanedNumber);

    // Check if user already has this card
    const { data: existingCard } = await adminClient
      .from('saved_cards')
      .select('id')
      .eq('user_id', userId)
      .eq('card_last_four', last4)
      .eq('card_brand', brand)
      .single();

    if (existingCard) {
      // Update existing card token
      await adminClient
        .from('saved_cards')
        .update({
          card_token: cardToken,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingCard.id);
    } else {
      // Check how many cards user has
      const { count } = await adminClient
        .from('saved_cards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const isFirstCard = (count || 0) === 0;

      // Insert new card
      await adminClient.from('saved_cards').insert({
        user_id: userId,
        card_token: cardToken,
        card_last_four: last4,
        card_brand: brand,
        card_holder_name: body.cardHolderName,
        expire_month: body.expireMonth,
        expire_year: body.expireYear,
        is_default: isFirstCard,
      });
    }

    logger.info('Card tokenized successfully', { userId, brand, last4 });

    return new Response(
      JSON.stringify({
        success: true,
        cardToken,
        last4,
        brand,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    logger.error('Tokenize card error:', error);

    if (error.message === 'Authentication required') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Authentication required',
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
