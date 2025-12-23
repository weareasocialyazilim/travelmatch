/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

/**
 * 2FA Verify Edge Function
 * 
 * Verifies TOTP code and enables 2FA for user
 * 
 * Security Features:
 * - Authentication required
 * - TOTP code verification (6 digits)
 * - Time-based validation (30 second window)
 * - Rate limiting (prevent brute force)
 * - Audit logging
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.21.4/mod.ts';
import { createUpstashRateLimiter, RateLimitPresets } from '../_shared/upstashRateLimit.ts';
import { getCorsHeaders } from '../_shared/security-middleware.ts';
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';
import {
  ErrorCode,
  createErrorResponse,
  createSuccessResponse,
  createValidationError,
  toHttpResponse,
  toHttpSuccessResponse,
  handleUnexpectedError,
} from '../_shared/errorHandler.ts';

const VerifyCodeSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d{6}$/, 'Code must be numeric'),
});

// Rate limiter: 5 attempts per 15 minutes (prevent brute force)
const verify2FALimiter = createUpstashRateLimiter(RateLimitPresets.AUTH);

/**
 * Generate TOTP code for given secret and time
 */
function generateTOTP(secret: string, time?: number): string {
  const epoch = Math.floor((time || Date.now()) / 1000);
  const counter = Math.floor(epoch / 30);
  
  // Convert base32 secret to bytes
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const secretBytes: number[] = [];
  const secretUpper = secret.toUpperCase().replace(/\s/g, '');
  
  for (let i = 0; i < secretUpper.length; i += 8) {
    let bits = 0;
    for (let j = 0; j < 8 && i + j < secretUpper.length; j++) {
      const val = chars.indexOf(secretUpper[i + j]);
      if (val === -1) throw new Error('Invalid base32 secret');
      bits = (bits << 5) + val;
    }
    for (let shift = 32; shift >= 0; shift -= 8) {
      if (shift < 40) {
        secretBytes.push((bits >> shift) & 0xff);
      }
    }
  }

  // Create counter buffer (8 bytes, big-endian)
  const counterBuffer = new ArrayBuffer(8);
  const counterView = new DataView(counterBuffer);
  counterView.setUint32(4, counter, false); // Big-endian

  // HMAC-SHA1
  const hmac = createHmac('sha1', new Uint8Array(secretBytes));
  hmac.update(new Uint8Array(counterBuffer));
  const hash = hmac.digest();

  // Dynamic truncation
  const offset = hash[hash.length - 1] & 0xf;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  const code = (binary % 1000000).toString().padStart(6, '0');
  return code;
}

/**
 * Used TOTP codes cache (in-memory for edge function)
 * In production, use Redis/Upstash for distributed cache
 */
const usedCodesCache = new Map<string, number>();

// Clean expired codes periodically (codes older than 60 seconds)
function cleanExpiredCodes() {
  const now = Date.now();
  const expiryTime = 60000; // 60 seconds
  for (const [key, timestamp] of usedCodesCache.entries()) {
    if (now - timestamp > expiryTime) {
      usedCodesCache.delete(key);
    }
  }
}

/**
 * Verify TOTP code with time window tolerance and replay protection
 */
async function verifyTOTP(
  secret: string,
  code: string,
  userId: string,
  window = 1
): Promise<{ valid: boolean; error?: string }> {
  const now = Date.now();

  // Clean expired codes first
  cleanExpiredCodes();

  // Check if code was already used (replay attack prevention)
  const codeKey = `${userId}:${code}`;
  if (usedCodesCache.has(codeKey)) {
    console.warn(`[2FA] Replay attack detected for user ${userId}`);
    return { valid: false, error: 'Code already used. Please wait for a new code.' };
  }

  // Check current time and ±window intervals (30 seconds each)
  for (let i = -window; i <= window; i++) {
    const time = now + i * 30000;
    const expectedCode = generateTOTP(secret, time);
    if (expectedCode === code) {
      // Mark code as used to prevent replay attacks
      usedCodesCache.set(codeKey, now);

      // Also try to persist to database for distributed replay protection
      try {
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        );

        await supabaseAdmin.from('used_2fa_codes').insert({
          user_id: userId,
          code_hash: await hashCode(code),
          used_at: new Date().toISOString(),
          expires_at: new Date(now + 60000).toISOString(),
        });
      } catch {
        // Ignore database errors - in-memory cache is primary protection
        console.warn('[2FA] Failed to persist used code to database');
      }

      return { valid: true };
    }
  }

  return { valid: false, error: 'Invalid verification code' };
}

/**
 * Hash code for secure storage
 */
async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code + Deno.env.get('SUPABASE_JWT_SECRET'));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Check rate limit
    const rateLimitResult = await verify2FALimiter.check(req);
    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
      return new Response(
        JSON.stringify({
          error: 'Too many verification attempts',
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Limit': String(rateLimitResult.limit),
          },
        },
      );
    }

    // Create Supabase client
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
      const error = createErrorResponse(
        'Authentication required',
        ErrorCode.UNAUTHORIZED,
      );
      return toHttpResponse(error, corsHeaders);
    }

    // Parse and validate request
    const body = await req.json();
    const { code } = VerifyCodeSchema.parse(body);

    // Get user's TOTP secret
    const totpSecret = user.user_metadata?.totp_secret;
    if (!totpSecret) {
      const error = createErrorResponse(
        '2FA not set up. Please set up 2FA first.',
        ErrorCode.BAD_REQUEST,
      );
      return toHttpResponse(error, corsHeaders);
    }

    // Verify TOTP code with replay protection
    const verifyResult = await verifyTOTP(totpSecret, code, user.id);

    if (!verifyResult.valid) {
      console.log(`[2FA Verify] Invalid code for user ${user.id}: ${verifyResult.error}`);
      const error = createErrorResponse(
        verifyResult.error || 'Invalid verification code',
        ErrorCode.INVALID_INPUT,
      );
      return toHttpResponse(error, corsHeaders);
    }

    // Enable 2FA for user
    const { error: updateError } = await supabaseClient.auth.updateUser({
      data: {
        totp_enabled: true,
      },
    });

    if (updateError) {
      throw updateError;
    }

    // Log audit event
    console.log(`[2FA Verify] User ${user.id} enabled 2FA successfully`);

    const success = createSuccessResponse(
      { user_id: user.id, totp_enabled: true },
      '2FA enabled successfully',
    );
    return toHttpSuccessResponse(success, corsHeaders);
  } catch (error) {
    console.error('[2FA Verify] Error:', error);
    
    if (error instanceof z.ZodError) {
      const validationError = createValidationError({
        fields: Object.fromEntries(
          error.errors.map(err => [err.path.join('.'), [err.message]])
        ),
      });
      return toHttpResponse(validationError, corsHeaders);
    }

    return toHttpResponse(handleUnexpectedError(error), corsHeaders);
  }
});
