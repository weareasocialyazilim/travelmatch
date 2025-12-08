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

    // 1. Check Sender Balance
    const { data: senderData, error: senderError } = await supabaseAdmin
      .from('users')
      .select('balance')
      .eq('id', user.id)
      .single();

    if (senderError || !senderData) throw new Error('Sender not found');
    if (senderData.balance < amount) throw new Error('Insufficient funds');

    // 2. Perform Transaction (Atomic would be better with RPC, but this simulates the logic)
    // Decrement Sender
    const { error: debitError } = await supabaseAdmin
      .from('users')
      .update({ balance: senderData.balance - amount })
      .eq('id', user.id);

    if (debitError) throw new Error('Failed to debit sender');

    // Increment Recipient
    const { data: recipientData } = await supabaseAdmin
      .from('users')
      .select('balance')
      .eq('id', recipientId)
      .single();

    if (!recipientData) throw new Error('Recipient not found');

    const { error: creditError } = await supabaseAdmin
      .from('users')
      .update({ balance: recipientData.balance + amount })
      .eq('id', recipientId);

    if (creditError) {
      // CRITICAL: Rollback debit (simplified for this example)
      await supabaseAdmin
        .from('users')
        .update({ balance: senderData.balance })
        .eq('id', user.id);
      throw new Error('Failed to credit recipient');
    }

    // 3. Log Transaction
    await supabaseAdmin.from('transactions').insert([
      {
        user_id: user.id,
        type: 'gift',
        amount: -amount,
        status: 'completed',
        description: `Sent gift to user ${recipientId}`,
        moment_id: momentId,
        metadata: { message, recipientId },
      },
      {
        user_id: recipientId,
        type: 'gift',
        amount: amount,
        status: 'completed',
        description: `Received gift from user ${user.id}`,
        moment_id: momentId,
        metadata: { message, senderId: user.id },
      },
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        newBalance: senderData.balance - amount,
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
