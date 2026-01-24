// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Authenticate User
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Parse Request
    const { giftId, senderId } = await req.json()
    if (!giftId || !senderId) {
      return new Response(
        JSON.stringify({ error: 'Missing giftId or senderId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Initialize Admin Client (for privileged updates)
    // We need this because we revoked update permissions from authenticated users
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 4. Validate Gift Ownership & Rules
    // Fetch gift securely to ensure the current user is the receiver
    const { data: gift, error: fetchError } = await supabaseAdmin
      .from('gifts')
      .select('id, amount, currency, status, receiver_id')
      .eq('id', giftId)
      .single()

    if (fetchError || !gift) {
      return new Response(
        JSON.stringify({ error: 'Gift not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Security check: Only receiver can unlock
    if (gift.receiver_id !== user.id) {
       return new Response(
        JSON.stringify({ error: 'Forbidden: You are not the recipient of this gift' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. Enforce Business Logic (Minimum Amount)
    const ESCROW_DIRECT_MAX = 30 // $30 threshold from mobile constants
    // Note: robust implementation should handle currency conversion or store standardized USD amount
    // Assuming 'amount' is already normalized or logic matches mobile simplified check
    if ((gift.amount || 0) < ESCROW_DIRECT_MAX) {
       return new Response(
        JSON.stringify({ error: 'Gift amount too low for chat unlock' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 6. Perform Updates (Atomic Logic)
    // Update gift status
    const { error: updateError } = await supabaseAdmin
      .from('gifts')
      .update({
        host_approved: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', giftId)

    if (updateError) {
      throw updateError
    }

    // Create notification
    const { error: notifError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: senderId,
        type: 'chat_unlocked',
        title: 'Sohbet Başladı! 💬',
        body: 'Hediyeni kabul etti ve seninle sohbet başlattı!',
        data: { gift_id: giftId, host_id: user.id },
      })

    if (notifError) {
      console.error('Notification failed:', notifError)
      // Non-blocking error
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
