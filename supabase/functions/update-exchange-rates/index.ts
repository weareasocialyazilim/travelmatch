import { Logger } from '..//_shared/logger.ts';
const logger = new Logger();

/**
 * Exchange Rate Update Edge Function
 * Fetches live rates from ExchangeRate-API (free tier)
 *
 * Runs every hour via pg_cron or external scheduler
 *
 * Deploy: supabase functions deploy update-exchange-rates
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Supported currencies
const CURRENCIES = ['TRY', 'EUR', 'USD', 'GBP'];
const BASE_CURRENCY = 'USD'; // API uses USD as base

// Free API: https://www.exchangerate-api.com/docs/free
const API_URL = `https://open.er-api.com/v6/latest/${BASE_CURRENCY}`;

interface ExchangeRateResponse {
  result: string;
  time_last_update_utc: string;
  time_next_update_utc: string;
  base_code: string;
  rates: Record<string, number>;
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    logger.info('[ExchangeRates] Fetching rates from API...');

    // Fetch rates from free API
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data: ExchangeRateResponse = await response.json();

    if (data.result !== 'success') {
      throw new Error('API returned error');
    }

    logger.info('[ExchangeRates] API response:', {
      base: data.base_code,
      lastUpdate: data.time_last_update_utc,
      rateCount: Object.keys(data.rates).length,
    });

    // Filter to only supported currencies
    const supportedRates: Record<string, number> = {};
    for (const currency of CURRENCIES) {
      if (data.rates[currency]) {
        supportedRates[currency] = data.rates[currency];
      }
    }

    logger.info('[ExchangeRates] Supported rates:', supportedRates);

    // Generate all currency pairs
    const ratesToInsert: Array<{
      base: string;
      target: string;
      rate: number;
    }> = [];

    // USD → others (from API directly)
    for (const [currency, rate] of Object.entries(supportedRates)) {
      if (currency !== BASE_CURRENCY) {
        ratesToInsert.push({
          base: BASE_CURRENCY,
          target: currency,
          rate: rate,
        });
        // Reverse rate
        ratesToInsert.push({
          base: currency,
          target: BASE_CURRENCY,
          rate: 1 / rate,
        });
      }
    }

    // Cross rates (EUR/TRY, EUR/GBP, GBP/TRY)
    for (const from of CURRENCIES) {
      for (const to of CURRENCIES) {
        if (from !== to && from !== BASE_CURRENCY && to !== BASE_CURRENCY) {
          const fromRate = supportedRates[from];
          const toRate = supportedRates[to];
          if (fromRate && toRate) {
            ratesToInsert.push({
              base: from,
              target: to,
              rate: toRate / fromRate,
            });
          }
        }
      }
    }

    logger.info('[ExchangeRates] Inserting', ratesToInsert.length, 'rates...');

    // Insert rates using the upsert function
    let successCount = 0;
    let errorCount = 0;

    for (const rateData of ratesToInsert) {
      const { error } = await supabase.rpc('upsert_exchange_rate', {
        p_base: rateData.base,
        p_target: rateData.target,
        p_rate: rateData.rate,
        p_source: 'exchangerate-api',
      });

      if (error) {
        console.error(
          `[ExchangeRates] Error inserting ${rateData.base}/${rateData.target}:`,
          error
        );
        errorCount++;
      } else {
        successCount++;
      }
    }

    // Log important rates for monitoring
    const tryRate = supportedRates['TRY'];
    const eurRate = supportedRates['EUR'];
    const gbpRate = supportedRates['GBP'];

    logger.info('[ExchangeRates] Key rates (1 USD =):', {
      TRY: tryRate?.toFixed(4),
      EUR: eurRate?.toFixed(4),
      GBP: gbpRate?.toFixed(4),
    });

    // Calculate EUR/TRY for logging
    if (tryRate && eurRate) {
      const eurTry = tryRate / eurRate;
      console.log(`[ExchangeRates] 1 EUR = ${eurTry.toFixed(4)} TRY`);
    }

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      apiLastUpdate: data.time_last_update_utc,
      ratesProcessed: ratesToInsert.length,
      successCount,
      errorCount,
      keyRates: {
        'USD/TRY': tryRate,
        'EUR/TRY': tryRate && eurRate ? tryRate / eurRate : null,
        'GBP/TRY': tryRate && gbpRate ? tryRate / gbpRate : null,
      },
    };

    logger.info('[ExchangeRates] Complete:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    logger.error('[ExchangeRates] Error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
