// ============================================
// BLOCKER #1 FIX: Edge Function Update
// File: supabase/functions/transfer-funds/index.ts
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { z } from 'https://deno.land/x/zod@v3.21.4/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createRateLimiter, RateLimitPresets } from '../_shared/rateLimit.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TransferSchema = z.object({
  recipientId: z.string().uuid(),
  amount: z.number().positive('Amount must be positive'),
  momentId: z.string().uuid().optional(),
  message: z.string().optional(),
});

const transferLimiter = createRateLimiter(RateLimitPresets.api);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Rate limit check
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
          },
        }
      );
    }

    // Create Supabase client with user auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    // Parse and validate request
    const json = await req.json();
    const { recipientId, amount, momentId, message } = TransferSchema.parse(json);

    if (user.id === recipientId) {
      throw new Error('Cannot transfer funds to yourself');
    }

    // ✅ FIX: Call atomic RPC function instead of manual JS updates
    // This ensures ALL operations (debit + credit + logging) are atomic
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

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        newBalance: data.newSenderBalance,
        transactionId: data.senderTxnId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Transfer error:', error);

    return new Response(
      JSON.stringify({
        error: error.message || 'Transfer failed',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

/* ============================================
 * BEFORE vs AFTER Comparison:
 * ============================================
 *
 * ❌ BEFORE (Non-Atomic):
 * 1. await supabaseAdmin.from('users').update({ balance: X - amount })
 * 2. await supabaseAdmin.from('users').update({ balance: Y + amount })
 * 3. await supabaseAdmin.from('transactions').insert([...])
 *
 * Problem: If step 2 fails, step 1 already executed. Manual rollback
 * in step 3 can also fail. Race conditions possible if two transfers
 * happen simultaneously.
 *
 * ✅ AFTER (Atomic):
 * 1. await supabaseClient.rpc('atomic_transfer', { ... })
 *
 * Benefit: SQL function wraps ALL operations in a transaction.
 * Either ALL succeed or ALL rollback automatically.
 * Row-level locks prevent race conditions.
 * ============================================
 */
