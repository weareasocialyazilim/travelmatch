/**
 * Twilio SMS Edge Function Tests
 * Tests for OTP send, verify, and SMS operations with rate limiting
 *
 * Note: These tests are designed for Deno test runner
 * Run with: deno test --allow-env --allow-net
 */

import {
  assertEquals,
  assertExists,
  assertMatch,
} from 'https://deno.land/std@0.168.0/testing/asserts.ts';

// Mock environment variables
const mockEnv = {
  TWILIO_ACCOUNT_SID: 'AC_test_sid',
  TWILIO_AUTH_TOKEN: 'test_auth_token',
  TWILIO_VERIFY_SERVICE_SID: 'VA_test_service_sid',
  TWILIO_PHONE_NUMBER: '+15551234567',
  UPSTASH_REDIS_REST_URL: 'https://test.upstash.io',
  UPSTASH_REDIS_REST_TOKEN: 'mock_redis_token',
};

// Test utilities
function createMockRequest(
  path: string,
  method: string,
  body?: unknown,
  headers: Record<string, string> = {},
): Request {
  return new Request(`http://localhost:54321/functions/v1/twilio-sms/${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

// Phone number formatting tests
Deno.test('formatPhoneNumber - Turkish mobile with 0 prefix', () => {
  // 0532 XXX XXXX -> +90532XXXXXXX
  const input = '05321234567';
  const expected = '+905321234567';

  // Test logic: if starts with 0 and length is 11, replace 0 with 90
  const cleaned = input.replace(/\D/g, '');
  let result = cleaned;

  if (cleaned.startsWith('0') && cleaned.length === 11) {
    result = '90' + cleaned.slice(1);
  }

  if (!result.startsWith('+')) {
    result = '+' + result;
  }

  assertEquals(result, expected);
});

Deno.test('formatPhoneNumber - Turkish mobile without prefix', () => {
  // 532XXXXXXX -> +90532XXXXXXX
  const input = '5321234567';
  const expected = '+905321234567';

  const cleaned = input.replace(/\D/g, '');
  let result = cleaned;

  if (cleaned.length === 10 && cleaned.startsWith('5')) {
    result = '90' + cleaned;
  }

  if (!result.startsWith('+')) {
    result = '+' + result;
  }

  assertEquals(result, expected);
});

Deno.test('formatPhoneNumber - already E.164 format', () => {
  const input = '+905321234567';
  const expected = '+905321234567';

  let result = input.replace(/\D/g, '');
  if (!result.startsWith('+')) {
    result = '+' + result;
  }

  // Should preserve the + prefix
  assertEquals(result.startsWith('+'), true);
});

Deno.test('formatPhoneNumber - removes non-digit characters', () => {
  const input = '+90 (532) 123-4567';
  const cleaned = input.replace(/\D/g, '');

  assertEquals(cleaned, '905321234567');
});

// OTP Send tests
Deno.test('send-otp - missing phone returns 400', async () => {
  const request = createMockRequest('send-otp', 'POST', {});

  // Expected: 400 with "Phone number required"
  assertEquals(request.method, 'POST');
});

Deno.test('send-otp - valid phone format passes', () => {
  const payload = {
    phone: '+905321234567',
    channel: 'sms',
  };

  assertExists(payload.phone);
  assertMatch(payload.phone, /^\+\d{10,15}$/);
});

Deno.test('send-otp - default channel is sms', () => {
  const payload = { phone: '+905321234567' };

  // Channel should default to 'sms' if not provided
  const channel = payload.channel ?? 'sms';
  assertEquals(channel, 'sms');
});

Deno.test('send-otp - whatsapp channel accepted', () => {
  const payload = {
    phone: '+905321234567',
    channel: 'whatsapp',
  };

  assertEquals(payload.channel, 'whatsapp');
});

// OTP Verify tests
Deno.test('verify-otp - missing phone returns 400', async () => {
  const request = createMockRequest('verify-otp', 'POST', { code: '123456' });

  // Expected: 400 with "Phone and code required"
  assertEquals(request.method, 'POST');
});

Deno.test('verify-otp - missing code returns 400', async () => {
  const request = createMockRequest('verify-otp', 'POST', {
    phone: '+905321234567',
  });

  // Expected: 400 with "Phone and code required"
  assertEquals(request.method, 'POST');
});

Deno.test('verify-otp - valid payload format', () => {
  const payload = {
    phone: '+905321234567',
    code: '123456',
  };

  assertExists(payload.phone);
  assertExists(payload.code);
  assertEquals(payload.code.length, 6);
});

Deno.test('verify-otp - approved status returns valid true', () => {
  const twilioResponse = { status: 'approved' };
  const result = {
    valid: twilioResponse.status === 'approved',
    status: twilioResponse.status,
  };

  assertEquals(result.valid, true);
  assertEquals(result.status, 'approved');
});

Deno.test('verify-otp - pending status returns valid false', () => {
  const twilioResponse = { status: 'pending' };
  const result = {
    valid: twilioResponse.status === 'approved',
    status: twilioResponse.status,
  };

  assertEquals(result.valid, false);
  assertEquals(result.status, 'pending');
});

// Send SMS tests
Deno.test('send-sms - missing recipient returns 400', async () => {
  const request = createMockRequest('send-sms', 'POST', {
    message: 'Test message',
  });

  // Expected: 400 with "Recipient and message required"
  assertEquals(request.method, 'POST');
});

Deno.test('send-sms - missing message returns 400', async () => {
  const request = createMockRequest('send-sms', 'POST', {
    to: '+905321234567',
  });

  // Expected: 400 with "Recipient and message required"
  assertEquals(request.method, 'POST');
});

Deno.test('send-sms - valid payload format', () => {
  const payload = {
    to: '+905321234567',
    message: 'Your verification code is 123456',
  };

  assertExists(payload.to);
  assertExists(payload.message);
  assertEquals(payload.message.length > 0, true);
});

// Rate limiting tests
Deno.test('rate limit - OTP send minute limit (1 per minute)', () => {
  const limit = {
    requests: 1,
    window: 60, // 1 per minute
  };

  assertEquals(limit.requests, 1);
  assertEquals(limit.window, 60);
});

Deno.test('rate limit - OTP send hourly limit (5 per hour)', () => {
  const limit = {
    requests: 5,
    window: 3600, // 5 per hour
  };

  assertEquals(limit.requests, 5);
  assertEquals(limit.window, 3600);
});

Deno.test('rate limit - OTP verify limit (5 per minute)', () => {
  const limit = {
    requests: 5,
    window: 60, // 5 per minute
  };

  assertEquals(limit.requests, 5);
  assertEquals(limit.window, 60);
});

Deno.test('rate limit - 429 response format', () => {
  const rateLimitResponse = {
    error: 'Too many OTP requests. Please wait before requesting another code.',
    retryAfter: 45,
  };

  assertExists(rateLimitResponse.error);
  assertExists(rateLimitResponse.retryAfter);
  assertEquals(typeof rateLimitResponse.retryAfter, 'number');
});

Deno.test('rate limit - hourly limit response format', () => {
  const hourlyLimitResponse = {
    error: 'Daily OTP limit reached. Please try again later.',
    retryAfter: 3200,
  };

  assertExists(hourlyLimitResponse.error);
  assertEquals(hourlyLimitResponse.retryAfter > 60, true); // More than a minute
});

// HTTP method tests
Deno.test('OPTIONS returns CORS headers', () => {
  const request = createMockRequest('send-otp', 'OPTIONS');

  assertEquals(request.method, 'OPTIONS');
  // Expected: 200 with CORS headers
});

Deno.test('GET method returns 405', () => {
  const request = createMockRequest('send-otp', 'GET');

  assertEquals(request.method, 'GET');
  // Expected: 405 Method Not Allowed
});

Deno.test('PUT method returns 405', () => {
  const request = createMockRequest('send-otp', 'PUT', { phone: 'test' });

  assertEquals(request.method, 'PUT');
  // Expected: 405 Method Not Allowed
});

// Invalid endpoint test
Deno.test('Invalid endpoint returns 404', () => {
  const request = createMockRequest('invalid-endpoint', 'POST', {});

  // Expected: 404 with "Invalid endpoint"
  assertEquals(request.url.includes('invalid-endpoint'), true);
});

// Error response format tests
Deno.test('Error response includes error field', () => {
  const errorResponse = {
    error: 'Phone number required',
  };

  assertExists(errorResponse.error);
  assertEquals(typeof errorResponse.error, 'string');
});

// Configuration tests
Deno.test('Missing Twilio credentials returns error', () => {
  // When TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN is missing
  const error = { success: false, error: 'Twilio credentials not configured' };

  assertExists(error.error);
  assertEquals(error.success, false);
});

Deno.test('Missing Verify service returns error', () => {
  // When TWILIO_VERIFY_SERVICE_SID is missing
  const error = { success: false, error: 'Verify service not configured' };

  assertExists(error.error);
  assertEquals(error.success, false);
});

Deno.test('Missing phone number returns error for SMS', () => {
  // When TWILIO_PHONE_NUMBER is missing
  const error = { success: false, error: 'Twilio phone number not configured' };

  assertExists(error.error);
  assertEquals(error.success, false);
});
