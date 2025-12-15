import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { z } from 'https://deno.land/x/zod@v3.21.4/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createRateLimiter, RateLimitPresets } from '../_shared/rateLimit.ts';
import { createHash } from 'https://deno.land/std@0.168.0/hash/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const KycSchema = z.object({
  documentType: z.enum(['passport', 'id_card', 'driving_license']),
  documentNumber: z.string().min(5),
  frontImage: z.string().url(),
  backImage: z.string().url().optional(),
});

// Rate limiter: 5 requests per 15 minutes (KYC is sensitive)
const kycLimiter = createRateLimiter(RateLimitPresets.auth);

/**
 * Hash document number for audit logging (PII protection)
 */
function hashDocumentNumber(documentNumber: string): string {
  const hash = createHash('sha256');
  hash.update(documentNumber);
  return hash.toString('hex').substring(0, 16); // First 16 chars
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Check rate limit first
    const rateLimitResult = await kycLimiter.check(req);
    if (!rateLimitResult.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests',
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

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      },
    );

    // Admin client to update status
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
    const data = KycSchema.parse(json);

    // Audit log KYC attempt (instead of console.log)
    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      action: 'kyc_verification_attempt',
      metadata: {
        document_type: data.documentType,
        document_number_hash: hashDocumentNumber(data.documentNumber),
      },
    });

    // ⚠️ PRODUCTION TODO: Replace mock with real KYC provider
    // Options:
    // 1. Onfido: https://documentation.onfido.com/
    // 2. Stripe Identity: https://stripe.com/docs/identity
    // 3. Jumio: https://www.jumio.com/
    //
    // Example (Onfido):
    // const onfidoResult = await verifyWithOnfido(data);
    // const isValid = onfidoResult.status === 'complete';

    const isValid = true; // ⚠️ MOCK - Replace before production launch

    if (isValid) {
      const { error } = await supabaseAdmin
        .from('users')
        .update({
          kyc_status: 'verified',
          verified: true,
        })
        .eq('id', user.id);

      if (error) throw error;
    }

    return new Response(
      JSON.stringify({
        status: 'verified',
        message: 'KYC verification successful',
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
