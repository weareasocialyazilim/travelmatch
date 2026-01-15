/**
 * Response Module Tests
 */

import { 
  assertEquals, 
  assertExists,
} from 'https://deno.land/std@0.208.0/testing/asserts.ts';

import {
  jsonResponse,
  createdResponse,
  noContentResponse,
  errorResponse,
  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  rateLimitedResponse,
  internalErrorResponse,
  corsPreflightResponse,
  parseJsonBody,
  getOrigin,
  getRequestId,
} from '../functions/_shared/responses.ts';

import { ERROR_CODES, HTTP_STATUS } from '../functions/_shared/types.ts';

// =============================================================================
// SUCCESS RESPONSE TESTS
// =============================================================================

Deno.test('[Response] jsonResponse - creates success response', async () => {
  const data = { id: '123', name: 'Test' };
  const response = jsonResponse(data);
  
  assertEquals(response.status, 200);
  assertEquals(response.headers.get('Content-Type'), 'application/json');
  
  const body = await response.json();
  assertEquals(body.success, true);
  assertEquals(body.data, data);
  assertExists(body.meta.timestamp);
});

Deno.test('[Response] jsonResponse - custom status', async () => {
  const response = jsonResponse({ ok: true }, { status: 202 });
  assertEquals(response.status, 202);
});

Deno.test('[Response] createdResponse - 201 status', async () => {
  const response = createdResponse({ id: 'new-id' });
  assertEquals(response.status, 201);
  
  const body = await response.json();
  assertEquals(body.success, true);
  assertEquals(body.data.id, 'new-id');
});

Deno.test('[Response] noContentResponse - 204 status', () => {
  const response = noContentResponse();
  assertEquals(response.status, 204);
});

// =============================================================================
// ERROR RESPONSE TESTS
// =============================================================================

Deno.test('[Response] errorResponse - with string', async () => {
  const response = errorResponse('Something went wrong');
  assertEquals(response.status, 400);
  
  const body = await response.json();
  assertEquals(body.success, false);
  assertEquals(body.error.message, 'Something went wrong');
});

Deno.test('[Response] errorResponse - with ApiError', async () => {
  const response = errorResponse({
    code: 'CUSTOM_ERROR',
    message: 'Custom error message',
    details: { field: 'email' },
  }, { status: 422 });
  
  assertEquals(response.status, 422);
  
  const body = await response.json();
  assertEquals(body.error.code, 'CUSTOM_ERROR');
  assertEquals(body.error.details.field, 'email');
});

Deno.test('[Response] badRequestResponse - 400 status', async () => {
  const response = badRequestResponse('Invalid input', { field: 'email' });
  assertEquals(response.status, 400);
  
  const body = await response.json();
  assertEquals(body.error.code, ERROR_CODES.VALIDATION_ERROR);
  assertEquals(body.error.details.field, 'email');
});

Deno.test('[Response] unauthorizedResponse - 401 status', async () => {
  const response = unauthorizedResponse();
  assertEquals(response.status, 401);
  
  const body = await response.json();
  assertEquals(body.error.code, ERROR_CODES.UNAUTHORIZED);
});

Deno.test('[Response] forbiddenResponse - 403 status', async () => {
  const response = forbiddenResponse('You do not have permission');
  assertEquals(response.status, 403);
  
  const body = await response.json();
  assertEquals(body.error.code, ERROR_CODES.FORBIDDEN);
  assertEquals(body.error.message, 'You do not have permission');
});

Deno.test('[Response] notFoundResponse - 404 status', async () => {
  const response = notFoundResponse('User');
  assertEquals(response.status, 404);
  
  const body = await response.json();
  assertEquals(body.error.code, ERROR_CODES.NOT_FOUND);
  assertEquals(body.error.message, 'User not found');
});

Deno.test('[Response] rateLimitedResponse - 429 status with header', async () => {
  const response = rateLimitedResponse(60);
  assertEquals(response.status, 429);
  assertEquals(response.headers.get('Retry-After'), '60');
  
  const body = await response.json();
  assertEquals(body.error.code, ERROR_CODES.RATE_LIMITED);
  assertEquals(body.meta.retryAfter, 60);
});

Deno.test('[Response] internalErrorResponse - 500 status', async () => {
  const response = internalErrorResponse();
  assertEquals(response.status, 500);
  
  const body = await response.json();
  assertEquals(body.error.code, ERROR_CODES.INTERNAL_ERROR);
});

// =============================================================================
// CORS TESTS
// =============================================================================

Deno.test('[Response] corsPreflightResponse - 204 with headers', () => {
  const response = corsPreflightResponse('https://lovendo.app');
  assertEquals(response.status, 204);
  assertExists(response.headers.get('Access-Control-Allow-Origin'));
  assertExists(response.headers.get('Access-Control-Allow-Methods'));
});

Deno.test('[Response] jsonResponse - includes CORS headers', () => {
  const response = jsonResponse({ ok: true }, { origin: 'https://lovendo.app' });
  assertEquals(response.headers.get('Access-Control-Allow-Origin'), 'https://lovendo.app');
});

// =============================================================================
// HELPER FUNCTION TESTS
// =============================================================================

Deno.test('[Response] parseJsonBody - parses valid JSON', async () => {
  const request = new Request('http://localhost', {
    method: 'POST',
    body: JSON.stringify({ name: 'test' }),
    headers: { 'Content-Type': 'application/json' },
  });
  
  const body = await parseJsonBody<{ name: string }>(request);
  assertEquals(body.name, 'test');
});

Deno.test('[Response] parseJsonBody - throws on invalid JSON', async () => {
  const request = new Request('http://localhost', {
    method: 'POST',
    body: 'not json',
    headers: { 'Content-Type': 'application/json' },
  });
  
  let threw = false;
  try {
    await parseJsonBody(request);
  } catch {
    threw = true;
  }
  assertEquals(threw, true);
});

Deno.test('[Response] getOrigin - extracts origin header', () => {
  const request = new Request('http://localhost', {
    headers: { 'Origin': 'https://example.com' },
  });
  
  assertEquals(getOrigin(request), 'https://example.com');
});

Deno.test('[Response] getRequestId - returns header or generates', () => {
  const requestWithId = new Request('http://localhost', {
    headers: { 'x-request-id': 'my-request-id' },
  });
  assertEquals(getRequestId(requestWithId), 'my-request-id');
  
  const requestWithoutId = new Request('http://localhost');
  const generatedId = getRequestId(requestWithoutId);
  assertEquals(generatedId.length, 36); // UUID length
});
