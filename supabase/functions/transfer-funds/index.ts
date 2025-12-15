import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { z } from 'https://deno.land/x/zod@v3.21.4/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createRateLimiter, RateLimitPresets } from '../_shared/rateLimit.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const TransferSchema = z.object({
  recipientId: z.string().uuid(),
  amount: z.number().positive('Amount must be positive'),
  momentId: z.string().uuid().optional(),
  message: z.string().optional(),
});

// Rate limiter: 100 requests per 15 minutes for financial operations
const transferLimiter = createRateLimiter(RateLimitPresets.api);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Check rate limit first
    const rateLimitResult = await transferLimiter.check(req);
    if (!rateLimitResult.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Too many transfer requests',
          retryAfter: rateLimitResult.retryAfter,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimitResult.retryAfter),
            'X-RateLimit-Remaining': '0',
          },
        },
      );
    }

    // Create a Supabase client with the Auth context of the user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      },
    );

    // Create a Supabase client with SERVICE ROLE to bypass RLS for balance updates
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    const json = await req.json();
    const { recipientId, amount, momentId, message } =
      TransferSchema.parse(json);

    if (user.id === recipientId) {
      throw new Error('Cannot transfer funds to yourself');
    }

    // ✅ BLOCKER #1 FIX: Use atomic RPC function
    // All operations (debit + credit + logging) happen atomically in a single transaction
    // If any step fails, entire transaction rolls back automatically
    // Row-level locks prevent race conditions
    const { data, error } = await supabaseClient.rpc('atomic_transfer', {
      p_sender_id: user.id,
      p_recipient_id: recipientId,
      p_amount: amount,
      p_moment_id: momentId,
      p_message: message,
    });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        newBalance: data.newSenderBalance,
        transactionId: data.senderTxnId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
