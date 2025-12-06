import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.21.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PaymentSchema = z.object({
  amount: z.number().min(1, "Amount must be at least 1"),
  currency: z.string().length(3),
  paymentMethodId: z.string().optional(),
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Not authenticated')
    }

    const json = await req.json()
    const { amount, currency } = PaymentSchema.parse(json)

    // Mock Payment Provider (e.g. Stripe) Logic
    // In a real app, you would initialize Stripe here and create a PaymentIntent
    console.log(`Creating payment intent for user ${user.id}: ${amount} ${currency}`)

    // Simulate successful payment intent creation
    const clientSecret = `pi_mock_${crypto.randomUUID()}_secret_${crypto.randomUUID()}`

    return new Response(
      JSON.stringify({ 
        clientSecret, 
        amount, 
        currency 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
