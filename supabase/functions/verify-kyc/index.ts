import { Logger } from '..//_shared/logger.ts';
const logger = new Logger();

/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { z } from 'https://deno.land/x/zod@v3.21.4/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createRateLimiter, RateLimitPresets } from '../_shared/rateLimit.ts';
import { crypto } from 'https://deno.land/std@0.208.0/crypto/mod.ts';
import { getCorsHeaders } from '../_shared/cors.ts';

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
async function hashDocumentNumber(documentNumber: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(documentNumber);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex.substring(0, 16); // First 16 chars
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

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
        document_number_hash: await hashDocumentNumber(data.documentNumber),
      },
    });

    // KYC Verification using Stripe Identity
    // Documentation: https://stripe.com/docs/identity
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');

    if (!STRIPE_SECRET_KEY) {
      throw new Error('KYC service not configured');
    }

    // Create a Stripe Identity verification session
    const verificationResponse = await fetch(
      'https://api.stripe.com/v1/identity/verification_sessions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          type: 'document',
          'metadata[user_id]': user.id,
          'metadata[document_type]': data.documentType,
          'options[document][require_matching_selfie]': 'true',
        }).toString(),
      },
    );

    if (!verificationResponse.ok) {
      const errorData = await verificationResponse.json();
      throw new Error(
        errorData.error?.message || 'Failed to create verification session',
      );
    }

    const verificationSession = await verificationResponse.json();

    // Store the verification session for tracking
    // User must complete verification in Stripe Identity flow
    // Status will be updated via webhook when verification completes
    await supabaseAdmin.from('kyc_verifications').upsert({
      user_id: user.id,
      stripe_session_id: verificationSession.id,
      document_type: data.documentType,
      status: verificationSession.status,
      created_at: new Date().toISOString(),
    });

    // Set user status to pending - actual verification happens via webhook
    // IMPORTANT: Never mark as verified here - wait for Stripe webhook
    if (verificationSession.status === 'requires_input') {
      await supabaseAdmin
        .from('users')
        .update({
          kyc_status: 'pending',
        })
        .eq('id', user.id);
    }

    // Return the session URL for the client to complete verification
    return new Response(
      JSON.stringify({
        status: 'pending',
        message:
          'Verification session created. Please complete document verification.',
        sessionId: verificationSession.id,
        clientSecret: verificationSession.client_secret,
        url: verificationSession.url,
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
