import { Logger } from '..//_shared/logger.ts';
const logger = new Logger();

/**
 * Twilio SMS Edge Function
 *
 * Handles phone verification via Twilio Verify
 *
 * SECURITY:
 * - OTP endpoints are public (for login/signup)
 * - send-sms requires authentication (prevents spam abuse)
 * - All endpoints are rate limited
 * - 30 second timeout on all API calls
 *
 * Endpoints:
 * - POST /send-otp - Send verification code (rate limited: 1/min, 5/hour per phone)
 * - POST /verify-otp - Verify code (rate limited: 5/min per phone)
 * - POST /send-sms - Send direct SMS (auth required, rate limited)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';
import { createUpstashRateLimiter, RateLimitPresets } from '../_shared/upstashRateLimit.ts';

const TWILIO_API_TIMEOUT = 30000; // 30 seconds

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');

/**
 * Rate limiters for OTP operations
 * OTP send: Very strict (1 per minute per phone, 5 per hour)
 * OTP verify: Moderate (5 attempts per minute to allow retries)
 * SMS: Standard rate limiting
 */
const otpSendLimiter = createUpstashRateLimiter({
  requests: 1,
  window: 60, // 1 per minute
  prefix: 'otp_send',
});

const otpHourlyLimiter = createUpstashRateLimiter({
  requests: 5,
  window: 3600, // 5 per hour
  prefix: 'otp_hourly',
});

const otpVerifyLimiter = createUpstashRateLimiter({
  requests: 5,
  window: 60, // 5 per minute
  prefix: 'otp_verify',
});

const smsLimiter = createUpstashRateLimiter(RateLimitPresets.STANDARD);
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_VERIFY_SERVICE_SID = Deno.env.get('TWILIO_VERIFY_SERVICE_SID');
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

const TWILIO_API_BASE = 'https://api.twilio.com/2010-04-01';
const TWILIO_VERIFY_BASE = 'https://verify.twilio.com/v2';

interface TwilioResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Make authenticated request to Twilio API with timeout
 */
async function twilioRequest(
  url: string,
  method: string,
  body?: URLSearchParams,
): Promise<TwilioResponse> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    return { success: false, error: 'Twilio credentials not configured' };
  }

  const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TWILIO_API_TIMEOUT);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body?.toString(),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json();

    if (!response.ok) {
      logger.error('[Twilio] API error:', data);
      return {
        success: false,
        error: data.message || `Twilio API error: ${response.status}`,
      };
    }

    return { success: true, data };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      logger.error('[Twilio] Request timed out');
      return { success: false, error: 'Request timed out. Please try again.' };
    }
    logger.error('[Twilio] Request error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Format phone number to E.164
 */
function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');

  // Handle Turkish numbers
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = '90' + cleaned.slice(1);
  } else if (cleaned.length === 10 && cleaned.startsWith('5')) {
    cleaned = '90' + cleaned;
  }

  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }

  return cleaned;
}

/**
 * Send OTP via Twilio Verify
 */
async function sendOtp(
  phoneNumber: string,
  channel: 'sms' | 'whatsapp' = 'sms',
): Promise<TwilioResponse> {
  if (!TWILIO_VERIFY_SERVICE_SID) {
    return { success: false, error: 'Verify service not configured' };
  }

  const formattedPhone = formatPhoneNumber(phoneNumber);
  const url = `${TWILIO_VERIFY_BASE}/Services/${TWILIO_VERIFY_SERVICE_SID}/Verifications`;

  const body = new URLSearchParams();
  body.append('To', formattedPhone);
  body.append('Channel', channel);

  logger.info('[Twilio] Sending OTP to:', formattedPhone.slice(-4));

  return twilioRequest(url, 'POST', body);
}

/**
 * Verify OTP code
 */
async function verifyOtp(
  phoneNumber: string,
  code: string,
): Promise<TwilioResponse> {
  if (!TWILIO_VERIFY_SERVICE_SID) {
    return { success: false, error: 'Verify service not configured' };
  }

  const formattedPhone = formatPhoneNumber(phoneNumber);
  const url = `${TWILIO_VERIFY_BASE}/Services/${TWILIO_VERIFY_SERVICE_SID}/VerificationCheck`;

  const body = new URLSearchParams();
  body.append('To', formattedPhone);
  body.append('Code', code);

  logger.info('[Twilio] Verifying OTP for:', formattedPhone.slice(-4));

  const result = await twilioRequest(url, 'POST', body);

  if (result.success && result.data) {
    const verification = result.data as { status: string };
    return {
      success: true,
      data: {
        valid: verification.status === 'approved',
        status: verification.status,
      },
    };
  }

  return result;
}

/**
 * Send direct SMS
 */
async function sendSms(to: string, body: string): Promise<TwilioResponse> {
  if (!TWILIO_PHONE_NUMBER) {
    return { success: false, error: 'Twilio phone number not configured' };
  }

  const formattedPhone = formatPhoneNumber(to);
  const url = `${TWILIO_API_BASE}/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

  const params = new URLSearchParams();
  params.append('To', formattedPhone);
  params.append('From', TWILIO_PHONE_NUMBER);
  params.append('Body', body);

  logger.info('[Twilio] Sending SMS to:', formattedPhone.slice(-4));

  return twilioRequest(url, 'POST', params);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split('/').pop();

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();

    let result: TwilioResponse;

    switch (path) {
      case 'send-otp': {
        if (!body.phone) {
          return new Response(
            JSON.stringify({ error: 'Phone number required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          );
        }

        // Rate limit by phone number (1 per minute)
        const phoneKey = formatPhoneNumber(body.phone);
        const minuteLimit = await otpSendLimiter.checkByKey(phoneKey);
        if (!minuteLimit.ok) {
          return new Response(
            JSON.stringify({
              error: 'Too many OTP requests. Please wait before requesting another code.',
              retryAfter: minuteLimit.retryAfter,
            }),
            {
              status: 429,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
                'Retry-After': String(minuteLimit.retryAfter || 60),
              },
            },
          );
        }

        // Hourly limit (5 per hour)
        const hourlyLimit = await otpHourlyLimiter.checkByKey(phoneKey);
        if (!hourlyLimit.ok) {
          return new Response(
            JSON.stringify({
              error: 'Daily OTP limit reached. Please try again later.',
              retryAfter: hourlyLimit.retryAfter,
            }),
            {
              status: 429,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
                'Retry-After': String(hourlyLimit.retryAfter || 3600),
              },
            },
          );
        }

        result = await sendOtp(body.phone, body.channel);
        break;
      }

      case 'verify-otp': {
        if (!body.phone || !body.code) {
          return new Response(
            JSON.stringify({ error: 'Phone and code required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          );
        }

        // Rate limit verification attempts (5 per minute)
        const phoneKey = formatPhoneNumber(body.phone);
        const verifyLimit = await otpVerifyLimiter.checkByKey(phoneKey);
        if (!verifyLimit.ok) {
          return new Response(
            JSON.stringify({
              error: 'Too many verification attempts. Please wait.',
              retryAfter: verifyLimit.retryAfter,
            }),
            {
              status: 429,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
                'Retry-After': String(verifyLimit.retryAfter || 60),
              },
            },
          );
        }

        result = await verifyOtp(body.phone, body.code);
        break;
      }

      case 'send-sms': {
        // SECURITY: send-sms requires authentication
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
          return new Response(
            JSON.stringify({ error: 'Authentication required' }),
            {
              status: 401,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          );
        }

        // Verify the token
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        if (!supabaseUrl || !supabaseServiceKey) {
          return new Response(
            JSON.stringify({ error: 'Server configuration error' }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          );
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
          return new Response(
            JSON.stringify({ error: 'Invalid or expired token' }),
            {
              status: 401,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          );
        }

        if (!body.to || !body.message) {
          return new Response(
            JSON.stringify({ error: 'Recipient and message required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          );
        }

        // Rate limit by user ID for authenticated requests
        const userSmsLimiter = createUpstashRateLimiter({
          requests: 20,
          window: 3600, // 20 SMS per hour per user
          prefix: 'sms_user',
        });
        const smsLimit = await userSmsLimiter.checkByKey(user.id);
        if (!smsLimit.ok) {
          return new Response(
            JSON.stringify({
              error: 'SMS limit exceeded. Maximum 20 per hour.',
              retryAfter: smsLimit.retryAfter,
            }),
            {
              status: 429,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
                'Retry-After': String(smsLimit.retryAfter || 60),
              },
            },
          );
        }

        logger.info(`[Twilio] Authenticated SMS request from user ${user.id}`);
        result = await sendSms(body.to, body.message);
        break;
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(result.data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    logger.error('[Twilio Edge] Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
