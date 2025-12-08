/**
 * 2FA Setup Edge Function
 * 
 * Generates TOTP secret and QR code for user to scan
 * 
 * Security Features:
 * - Authentication required
 * - TOTP secret generation (base32)
 * - QR code generation
 * - Rate limiting
 * - Audit logging
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createRateLimiter, RateLimitPresets } from '../_shared/rateLimit.ts';
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Rate limiter: 5 requests per 15 minutes (prevent abuse)
const setup2FALimiter = createRateLimiter(RateLimitPresets.auth);

/**
 * Generate random base32 secret for TOTP
 */
function generateTOTPSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  return Array.from(bytes)
    .map((byte) => chars[byte % 32])
    .join('');
}

/**
 * Generate TOTP QR code URL
 */
function generateQRCodeURL(secret: string, email: string): string {
  const issuer = 'TravelMatch';
  const label = `${issuer}:${email}`;
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: '6',
    period: '30',
  });
  
  const otpauthURL = `otpauth://totp/${encodeURIComponent(label)}?${params}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthURL)}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Check rate limit
    const rateLimitResult = await setup2FALimiter.check(req);
    if (!rateLimitResult.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Too many 2FA setup requests',
          retryAfter: rateLimitResult.retryAfter,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimitResult.retryAfter),
          },
        },
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
      },
    );

    // Verify authentication
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Generate TOTP secret
    const secret = generateTOTPSecret();
    const qrCodeURL = generateQRCodeURL(secret, user.email!);

    // Store secret in user metadata (encrypted by Supabase)
    const { error: updateError } = await supabaseClient.auth.updateUser({
      data: {
        totp_secret: secret,
        totp_enabled: false, // Will be enabled after verification
      },
    });

    if (updateError) {
      throw updateError;
    }

    // Log audit event
    console.log(`[2FA Setup] User ${user.id} generated TOTP secret`);

    return new Response(
      JSON.stringify({
        secret,
        qrCodeURL,
        message: 'Scan QR code with your authenticator app',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('[2FA Setup] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || '2FA setup failed' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
