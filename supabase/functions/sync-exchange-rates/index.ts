import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Sync Exchange Rates Edge Function
 * Fetches latest exchange rates for TRY, USD, EUR, GBP
 * and updates the public.exchange_rates table.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Fetching exchange rates...");

    // Using ExchangeRate-API (Free tier for TRY base)
    // In production, use a dedicated key from Fixer.io or similar
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/TRY`);
    const data = await response.json();

    if (!data || !data.rates) {
      throw new Error("Failed to fetch rates from API");
    }

    const rates = data.rates;
    const targetCurrencies = ['USD', 'EUR', 'GBP'];
    const rateDate = data.date;

    const upsertData = targetCurrencies.map(target => ({
      base_currency: 'TRY',
      target_currency: target,
      rate: rates[target],
      rate_date: rateDate,
      source: 'ExchangeRateAPI'
    }));

    // Add reciprocal rates
    upsertData.push(...targetCurrencies.map(target => ({
        base_currency: target,
        target_currency: 'TRY',
        rate: 1 / rates[target],
        rate_date: rateDate,
        source: 'ExchangeRateAPI'
    })));

    console.log(`Upserting ${upsertData.length} rates for date ${rateDate}`);

    const { error } = await supabase
      .from('exchange_rates')
      .upsert(upsertData, { onConflict: 'base_currency,target_currency,rate_date' });

    if (error) throw error;

    return new Response(JSON.stringify({ 
      success: true, 
      date: rateDate, 
      rates_count: upsertData.length 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Sync Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
