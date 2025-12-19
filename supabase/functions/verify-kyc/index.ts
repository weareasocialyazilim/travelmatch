/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { z } from 'https://deno.land/x/zod@v3.21.4/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createRateLimiter, RateLimitPresets } from '../_shared/rateLimit.ts';
import { crypto } from 'https://deno.land/std@0.208.0/crypto/mod.ts';

// CORS headers with origin validation
const getAllowedOrigins = () => {
  const origins = Deno.env.get('ALLOWED_ORIGINS') || '';
  return origins.split(',').filter(Boolean);
};

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigins = getAllowedOrigins();
  const isAllowed = !origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed && origin ? origin : (allowedOrigins[0] || '*'),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
};

/**
 * Validate document number format based on document type
 */
function validateDocumentFormat(docType: string, docNumber: string): { valid: boolean; error?: string } {
  const patterns: Record<string, { pattern: RegExp; message: string }> = {
    passport: {
      pattern: /^[A-Z0-9]{6,12}$/i,
      message: 'Passport number must be 6-12 alphanumeric characters',
    },
    id_card: {
      pattern: /^[0-9]{9,11}$/,
      message: 'ID card number must be 9-11 digits',
    },
    driving_license: {
      pattern: /^[A-Z0-9]{5,15}$/i,
      message: 'Driving license must be 5-15 alphanumeric characters',
    },
  };

  const validator = patterns[docType];
  if (!validator) {
    return { valid: false, error: 'Unknown document type' };
  }

  if (!validator.pattern.test(docNumber)) {
    return { valid: false, error: validator.message };
  }

  return { valid: true };
}

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
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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

    // KYC Verification Logic
    // In production, this integrates with a real KYC provider (Onfido/Stripe Identity/Jumio)
    // For now, we perform basic validation and queue for manual review

    const kycMode = Deno.env.get('KYC_MODE') || 'review'; // 'mock', 'review', 'onfido', 'stripe_identity'

    let isValid = false;
    let verificationResult: { status: string; provider?: string; reviewRequired?: boolean } = { status: 'pending' };

    if (kycMode === 'mock' && Deno.env.get('DENO_ENV') === 'development') {
      // Only allow mock in development environment
      console.warn('[KYC] Running in MOCK mode - only for development!');
      isValid = true;
      verificationResult = { status: 'mock_approved', provider: 'mock' };
    } else if (kycMode === 'onfido') {
      // Onfido Integration
      const onfidoApiKey = Deno.env.get('ONFIDO_API_KEY');
      if (!onfidoApiKey) {
        throw new Error('ONFIDO_API_KEY not configured');
      }

      // Create applicant and run check
      const applicantResponse = await fetch('https://api.onfido.com/v3.6/applicants', {
        method: 'POST',
        headers: {
          'Authorization': `Token token=${onfidoApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: user.user_metadata?.first_name || 'Unknown',
          last_name: user.user_metadata?.last_name || 'User',
        }),
      });

      if (!applicantResponse.ok) {
        throw new Error('Failed to create Onfido applicant');
      }

      const applicant = await applicantResponse.json();

      // Upload document
      const docFormData = new FormData();
      docFormData.append('type', data.documentType === 'passport' ? 'passport' : 'national_identity_card');
      docFormData.append('file', data.frontImage);
      docFormData.append('applicant_id', applicant.id);

      const docResponse = await fetch('https://api.onfido.com/v3.6/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Token token=${onfidoApiKey}`,
        },
        body: docFormData,
      });

      if (!docResponse.ok) {
        throw new Error('Failed to upload document to Onfido');
      }

      // Create check
      const checkResponse = await fetch('https://api.onfido.com/v3.6/checks', {
        method: 'POST',
        headers: {
          'Authorization': `Token token=${onfidoApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicant_id: applicant.id,
          report_names: ['document'],
        }),
      });

      if (!checkResponse.ok) {
        throw new Error('Failed to create Onfido check');
      }

      const check = await checkResponse.json();

      // Store check ID for webhook processing
      await supabaseAdmin.from('kyc_verifications').insert({
        user_id: user.id,
        provider: 'onfido',
        provider_check_id: check.id,
        status: 'processing',
        document_type: data.documentType,
      });

      verificationResult = { status: 'processing', provider: 'onfido' };
      // isValid will be set via webhook when check completes

    } else if (kycMode === 'stripe_identity') {
      // Stripe Identity Integration
      const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
      if (!stripeSecretKey) {
        throw new Error('STRIPE_SECRET_KEY not configured');
      }

      // Create verification session
      const sessionResponse = await fetch('https://api.stripe.com/v1/identity/verification_sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          type: 'document',
          'metadata[user_id]': user.id,
        }),
      });

      if (!sessionResponse.ok) {
        throw new Error('Failed to create Stripe Identity session');
      }

      const session = await sessionResponse.json();

      await supabaseAdmin.from('kyc_verifications').insert({
        user_id: user.id,
        provider: 'stripe_identity',
        provider_check_id: session.id,
        status: 'processing',
        document_type: data.documentType,
      });

      verificationResult = {
        status: 'processing',
        provider: 'stripe_identity',
        // Return client secret for frontend to complete verification
      };

    } else {
      // Default: Manual Review Mode
      // Basic validation then queue for human review

      // Validate document number format
      const docValidation = validateDocumentFormat(data.documentType, data.documentNumber);
      if (!docValidation.valid) {
        throw new Error(docValidation.error || 'Invalid document format');
      }

      // Store for manual review
      await supabaseAdmin.from('kyc_verifications').insert({
        user_id: user.id,
        provider: 'manual_review',
        status: 'pending_review',
        document_type: data.documentType,
        document_number_hash: await hashDocumentNumber(data.documentNumber),
        front_image_url: data.frontImage,
        back_image_url: data.backImage,
        submitted_at: new Date().toISOString(),
      });

      // Update user status to pending_review (not verified yet!)
      await supabaseAdmin
        .from('users')
        .update({
          kyc_status: 'pending_review',
        })
        .eq('id', user.id);

      verificationResult = { status: 'pending_review', reviewRequired: true };
    }

    // Only set verified if validation passed immediately (mock mode in dev)
    if (isValid && verificationResult.status === 'mock_approved') {
      const { error } = await supabaseAdmin
        .from('users')
        .update({
          kyc_status: 'verified',
          verified: true,
        })
        .eq('id', user.id);

      if (error) throw error;
    }

    // Return appropriate response based on verification result
    const responseMessage = verificationResult.status === 'mock_approved'
      ? 'KYC verification successful (development mode)'
      : verificationResult.status === 'pending_review'
        ? 'KYC documents submitted for review'
        : 'KYC verification in progress';

    return new Response(
      JSON.stringify({
        status: verificationResult.status,
        message: responseMessage,
        provider: verificationResult.provider,
        reviewRequired: verificationResult.reviewRequired,
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
