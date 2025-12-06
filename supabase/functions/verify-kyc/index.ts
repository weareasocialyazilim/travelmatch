import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.21.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const KycSchema = z.object({
  documentType: z.enum(['passport', 'id_card', 'driving_license']),
  documentNumber: z.string().min(5),
  frontImage: z.string().url(),
  backImage: z.string().url().optional(),
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Admin client to update status
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('Not authenticated')
    }

    const json = await req.json()
    const data = KycSchema.parse(json)

    console.log(`Processing KYC for user ${user.id}`, data)

    // Mock Verification Logic (e.g. Onfido, Stripe Identity)
    // In reality, this would call an external API and might be async (webhook based)
    // For this demo, we'll auto-verify after a "check"

    const isValid = true // Mock result

    if (isValid) {
      const { error } = await supabaseAdmin
        .from('users')
        .update({ 
          kyc_status: 'verified',
          verified: true 
        })
        .eq('id', user.id)

      if (error) throw error
    }

    return new Response(
      JSON.stringify({ status: 'verified', message: 'KYC verification successful' }),
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
