/**
 * iDenfy Webhook Handler
 * Receives verification results from iDenfy and updates user profiles
 * SECURITY: HMAC-SHA256 signature verification prevents spoofing
 */
import { serve } from 'std/http/server.ts';
import { createClient } from '@supabase/supabase-js';
import { Logger } from '../_shared/logger.ts';

const logger = new Logger('idenfy-webhook');

const IDENFY_API_SECRET = Deno.env.get('IDENFY_API_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-idenfy-signature',
};

/**
 * Verify HMAC-SHA256 signature from iDenfy
 */
async function verifySignature(
  body: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );

    const signed = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
    const expectedSignature = Array.from(new Uint8Array(signed))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return signature === expectedSignature;
  } catch (error) {
    logger.error('Signature verification error', error as Error);
    return false;
  }
}

interface IdenfyPayload {
  final?: {
    status?: string;
    clientId?: string;
    scanRef?: string;
    idenfyRef?: string;
  };
  status?: string;
  clientId?: string;
  scanRef?: string;
  idenfyRef?: string;
  externalId?: string;
  denyReason?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!IDENFY_API_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Env missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const signature = req.headers.get('x-idenfy-signature');
    const body = await req.text();

    // 1. Verify HMAC-SHA256 signature
    if (
      !signature ||
      !(await verifySignature(body, signature, IDENFY_API_SECRET))
    ) {
      logger.warn('SECURITY ALERT: Invalid signature detected');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid signature' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // 2. Parse payload
    const payload = JSON.parse(body) as IdenfyPayload;
    const {
      status, // 'APPROVED', 'DENIED', 'SUSPECTED', 'REVIEWING'
      clientId, // Our user_id (externalId)
      scanRef, // iDenfy scan reference for logging
      idenfyRef,
    } = payload.final || payload;

    const userId = clientId || payload.externalId;

    logger.info('Received webhook', {
      status,
      userId,
      scanRef,
    });

    // 3. Initialize Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 4. Update user profile based on verification status
    const normalizedStatus = (status || '').toUpperCase();
    const providerId = scanRef || idenfyRef;

    const mapStatus = (value: string) => {
      if (value === 'APPROVED') return 'verified';
      if (value === 'REVIEWING') return 'in_review';
      if (value === 'DENIED' || value === 'SUSPECTED') return 'rejected';
      return 'pending';
    };

    const upsertVerification = async (
      newStatus: string,
      extra?: Record<string, unknown>,
    ) => {
      if (!providerId) return 'skipped';

      const { data: existing } = await supabase
        .from('kyc_verifications')
        .select('id, status')
        .eq('provider', 'idenfy')
        .eq('provider_id', providerId)
        .maybeSingle();

      if (existing?.status === newStatus) {
        logger.info('Duplicate webhook ignored', { providerId, status });
        return 'duplicate';
      }

      if (existing?.id) {
        await supabase
          .from('kyc_verifications')
          .update({
            status: newStatus,
            metadata: { status: normalizedStatus },
            ...(extra || {}),
          })
          .eq('id', existing.id);
        return 'updated';
      }

      await supabase.from('kyc_verifications').insert({
        user_id: userId,
        provider: 'idenfy',
        provider_id: providerId,
        status: newStatus,
        metadata: { status: normalizedStatus },
        ...(extra || {}),
      });
      return 'inserted';
    };

    if (normalizedStatus === 'APPROVED') {
      const dedupe = await upsertVerification(mapStatus(normalizedStatus));
      if (dedupe === 'duplicate') {
        return new Response(
          JSON.stringify({ received: true, status, duplicate: true }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      }
      const { error } = await supabase
        .from('users')
        .update({
          verified: true,
          trust_score: 100, // Initial boost for KYC
          kyc_status: 'verified',
          idenfy_status: 'APPROVED',
          idenfy_scan_ref: scanRef || idenfyRef,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        logger.error('Profile update error', error as Error);
        throw error;
      }

      // Log verification success
      await supabase.from('moderation_logs').insert({
        user_id: userId,
        action: 'KYC_APPROVED',
        details: { scanRef, provider: 'iDenfy' },
        severity: 'info',
      });

      logger.info('User verified successfully', { userId });
    } else if (
      normalizedStatus === 'DENIED' ||
      normalizedStatus === 'SUSPECTED'
    ) {
      const dedupe = await upsertVerification(mapStatus(normalizedStatus), {
        rejection_reasons: payload.denyReason ? [payload.denyReason] : null,
      });
      if (dedupe === 'duplicate') {
        return new Response(
          JSON.stringify({ received: true, status, duplicate: true }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      }
      const { error } = await supabase
        .from('users')
        .update({
          verified: false,
          kyc_status: 'rejected',
          idenfy_status: normalizedStatus,
          idenfy_scan_ref: scanRef || idenfyRef,
        })
        .eq('id', userId);

      if (error) {
        logger.error('Profile update error', error as Error);
        throw error;
      }

      // Log verification failure
      await supabase.from('moderation_logs').insert({
        user_id: userId,
        action: normalizedStatus === 'DENIED' ? 'KYC_DENIED' : 'KYC_SUSPECTED',
        details: {
          scanRef,
          provider: 'iDenfy',
          reason: payload.denyReason || 'N/A',
        },
        severity: normalizedStatus === 'DENIED' ? 'warning' : 'high',
      });

      logger.info('User verification rejected', { userId, status });
    } else if (normalizedStatus === 'REVIEWING') {
      const dedupe = await upsertVerification(mapStatus(normalizedStatus));
      if (dedupe === 'duplicate') {
        return new Response(
          JSON.stringify({ received: true, status, duplicate: true }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      }
      await supabase
        .from('users')
        .update({
          kyc_status: 'in_review',
          idenfy_status: normalizedStatus,
          idenfy_scan_ref: scanRef || idenfyRef,
        })
        .eq('id', userId);
    }

    return new Response(JSON.stringify({ received: true, status }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    logger.error('Webhook processing error', error as Error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
