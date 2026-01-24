import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const REVENUECAT_SECRET = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log("RevenueCat Webhook Function Initialized");

serve(async (req) => {
  try {
    // EK-P0-4: SECURITY - Fail closed if secret is not configured
    // Never accept requests without proper authentication
    if (!REVENUECAT_SECRET) {
      console.error("CRITICAL: REVENUECAT_WEBHOOK_SECRET is not configured");
      return new Response(
        JSON.stringify({ error: "Service misconfigured" }),
        { status: 500 }
      );
    }

    // 1. Verify Authentication - Bearer token format
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (token !== REVENUECAT_SECRET) {
      console.warn("Unauthorized webhook attempt");
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { event, api_version } = await req.json();
    
    // We only care about purchase events
    // For consumables, RevenueCat might send 'NON_RENEWING_PURCHASE'
    if (!event || !['INITIAL_PURCHASE', 'NON_RENEWING_PURCHASE', 'RENEWAL'].includes(event.type)) {
      return new Response(JSON.stringify({ message: "Event ignored" }), { status: 200 });
    }

    const userId = event.app_user_id;
    const productId = event.product_id;
    const transactionId = event.transaction_id;
    const price = event.price;
    const currency = event.currency;

    console.log(`Processing purchase: User=${userId}, Product=${productId}, Tx=${transactionId}`);

    // 2. Validate User
    // Ensure userId is a valid UUID (Supabase ID)
    // If RevenueCat uses anonymous IDs, this will fail. Client MUST call Purchases.logIn(uid).
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
        console.error("Invalid User ID format (not UUID):", userId);
        // Return 200 to acknowledge receipt even if we fail logic, to stop retries if it's a structural issue
        return new Response(JSON.stringify({ error: "Invalid User ID" }), { status: 200 }); 
    }

    // 3. Lookup Package to get Coin Amount
    const { data: packageData, error: packageError } = await supabase
        .from('coin_packages')
        .select('coin_amount, name')
        .eq('store_product_id', productId)
        .single();
    
    if (packageError || !packageData) {
        console.error("Package not found for product:", productId);
        // Maybe log to a 'failed_purchases' table
        return new Response(JSON.stringify({ error: "Package not found" }), { status: 200 });
    }

    const coinAmount = packageData.coin_amount;

    // 4. Check if transaction already processed
    const { data: existingTx } = await supabase
        .from('coin_transactions')
        .select('id')
        .eq('reference_id', transactionId) // Assuming reference_id stores the IAP transaction ID
        .maybeSingle();

    if (existingTx) {
        return new Response(JSON.stringify({ message: "Transaction already processed" }), { status: 200 });
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
            store: event.store
        }
    });

    if (rpcError) {
        console.error("Failed to credit coins:", rpcError);
        return new Response(JSON.stringify({ error: "Failed to credit coins" }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, coins_added: coinAmount }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
    });

  } catch (error) {
    console.error("Webhook Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
