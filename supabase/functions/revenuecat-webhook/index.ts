import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
import { timingSafeEqual } from 'https://deno.land/std@0.168.0/crypto/timing_safe_equal.ts';

const REVENUECAT_SECRET = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://api.revenuecat.com',
  'https://app.revenuecat.com',
];

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function secureCompare(a: string, b: string): boolean {
  if (!a || !b) return false;

  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);

  // If lengths differ, still do comparison to prevent timing leak
  if (aBytes.length !== bBytes.length) {
    // Compare against itself to maintain constant time
    timingSafeEqual(aBytes, aBytes);
    return false;
  }

  return timingSafeEqual(aBytes, bBytes);
}

/**
 * Get CORS headers
 */
function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
  };

  // Only allow specific origins
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  } else {
    // For webhooks, RevenueCat may not send origin header
    // In that case, we rely on the secret for authentication
    headers['Access-Control-Allow-Origin'] = 'https://api.revenuecat.com';
  }

  return headers;
}

console.log('[RevenueCat Webhook] Function initialized');

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Verify Authentication with timing-safe comparison
    const authHeader = req.headers.get('Authorization');

    // FAIL-CLOSED: If no secret configured, reject all requests
    if (!REVENUECAT_SECRET) {
      console.error('[RevenueCat Webhook] REVENUECAT_WEBHOOK_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the secret using timing-safe comparison
    if (!authHeader || !secureCompare(authHeader, REVENUECAT_SECRET)) {
      console.warn('[RevenueCat Webhook] Unauthorized request');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { event } = await req.json();

    // We only care about purchase events
    // For consumables, RevenueCat might send 'NON_RENEWING_PURCHASE'
    if (
      !event ||
      !['INITIAL_PURCHASE', 'NON_RENEWING_PURCHASE', 'RENEWAL'].includes(event.type)
    ) {
      return new Response(
        JSON.stringify({ message: 'Event ignored' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = event.app_user_id;
    const productId = event.product_id;
    const transactionId = event.transaction_id;
    const price = event.price;
    const currency = event.currency;

    console.log(
      `[RevenueCat Webhook] Processing purchase: User=${userId}, Product=${productId}, Tx=${transactionId}`
    );

    // 2. Validate User
    // Ensure userId is a valid UUID (Supabase ID)
    // If RevenueCat uses anonymous IDs, this will fail. Client MUST call Purchases.logIn(uid).
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.error('[RevenueCat Webhook] Invalid User ID format (not UUID):', userId);
      // Return 200 to acknowledge receipt even if we fail logic, to stop retries if it's a structural issue
      return new Response(
        JSON.stringify({ error: 'Invalid User ID' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Lookup Package to get Coin Amount
    const { data: packageData, error: packageError } = await supabase
      .from('coin_packages')
      .select('coin_amount, name')
      .eq('store_product_id', productId)
      .single();

    if (packageError || !packageData) {
      console.error('[RevenueCat Webhook] Package not found for product:', productId);
      // Maybe log to a 'failed_purchases' table
      return new Response(
        JSON.stringify({ error: 'Package not found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const coinAmount = packageData.coin_amount;

    // 4. Check if transaction already processed
    const { data: existingTx } = await supabase
      .from('coin_transactions')
      .select('id')
      .eq('reference_id', transactionId) // Assuming reference_id stores the IAP transaction ID
      .maybeSingle();

    if (existingTx) {
      return new Response(
        JSON.stringify({ message: 'Transaction already processed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Credit User (Idempotent)
    // Call the PostgreSQL function we created (handle_coin_transaction)
    const { error: rpcError } = await supabase.rpc('handle_coin_transaction', {
      p_user_id: userId,
      p_amount: coinAmount,
      p_type: 'purchase',
      p_description: `Purchase: ${packageData.name}`,
      p_reference_id: transactionId,
      p_metadata: {
        revenuecat_event_id: event.id,
        price: price,
        currency: currency,
        store: event.store,
      },
    });

    if (rpcError) {
      console.error('[RevenueCat Webhook] Failed to credit coins:', rpcError);
      return new Response(
        JSON.stringify({ error: 'Failed to credit coins' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(
      `[RevenueCat Webhook] Successfully credited ${coinAmount} coins to user ${userId}`
    );

    return new Response(
      JSON.stringify({ success: true, coins_added: coinAmount }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[RevenueCat Webhook] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
