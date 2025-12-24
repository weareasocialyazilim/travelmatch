/**
 * Twilio SMS Edge Function
 *
 * Handles phone verification via Twilio Verify
 *
 * Endpoints:
 * - POST /send-otp - Send verification code
 * - POST /verify-otp - Verify code
 * - POST /send-sms - Send direct SMS
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
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
 * Make authenticated request to Twilio API
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

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body?.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Twilio] API error:', data);
      return {
        success: false,
        error: data.message || `Twilio API error: ${response.status}`,
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[Twilio] Request error:', error);
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

  console.log('[Twilio] Sending OTP to:', formattedPhone.slice(-4));

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

  console.log('[Twilio] Verifying OTP for:', formattedPhone.slice(-4));

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

  console.log('[Twilio] Sending SMS to:', formattedPhone.slice(-4));

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
      case 'send-otp':
        if (!body.phone) {
          return new Response(
            JSON.stringify({ error: 'Phone number required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          );
        }
        result = await sendOtp(body.phone, body.channel);
        break;

      case 'verify-otp':
        if (!body.phone || !body.code) {
          return new Response(
            JSON.stringify({ error: 'Phone and code required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          );
        }
        result = await verifyOtp(body.phone, body.code);
        break;

      case 'send-sms':
        if (!body.to || !body.message) {
          return new Response(
            JSON.stringify({ error: 'Recipient and message required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          );
        }
        result = await sendSms(body.to, body.message);
        break;

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
    console.error('[Twilio Edge] Error:', error);
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
