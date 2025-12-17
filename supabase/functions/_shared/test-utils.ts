/**
 * Test Utilities for Edge Functions
 * 
 * Helper functions for testing Edge Functions locally and in CI.
 */

import { assertEquals, assertExists, assertMatch } from 'https://deno.land/std@0.208.0/testing/asserts.ts';

// =============================================================================
// MOCK REQUEST BUILDER
// =============================================================================

export class MockRequestBuilder {
  private url: string;
  private method: string = 'GET';
  private headers: Headers = new Headers();
  private body: unknown = null;

  constructor(path: string = '/') {
    this.url = `http://localhost:54321/functions/v1${path}`;
  }

  static create(path: string = '/'): MockRequestBuilder {
    return new MockRequestBuilder(path);
  }

  setMethod(method: string): this {
    this.method = method;
    return this;
  }

  setHeader(key: string, value: string): this {
    this.headers.set(key, value);
    return this;
  }

  setAuth(token: string): this {
    this.headers.set('Authorization', `Bearer ${token}`);
    return this;
  }

  setApiKey(apiKey: string): this {
    this.headers.set('apikey', apiKey);
    return this;
  }

  setContentType(type: string = 'application/json'): this {
    this.headers.set('Content-Type', type);
    return this;
  }

  setOrigin(origin: string): this {
    this.headers.set('Origin', origin);
    return this;
  }

  setBody(body: unknown): this {
    this.body = body;
    return this;
  }

  setJsonBody(data: Record<string, unknown>): this {
    this.setContentType('application/json');
    this.body = JSON.stringify(data);
    return this;
  }

  build(): Request {
    const init: RequestInit = {
      method: this.method,
      headers: this.headers,
    };

    if (this.body !== null && this.method !== 'GET' && this.method !== 'HEAD') {
      init.body = typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
    }

    return new Request(this.url, init);
  }
}

// =============================================================================
// RESPONSE ASSERTIONS
// =============================================================================

export async function assertJsonResponse(
  response: Response,
  expectedStatus: number = 200
): Promise<Record<string, unknown>> {
  assertEquals(response.status, expectedStatus, `Expected status ${expectedStatus}, got ${response.status}`);
  assertEquals(
    response.headers.get('Content-Type')?.includes('application/json'),
    true,
    'Expected JSON content type'
  );

  const body = await response.json();
  assertExists(body, 'Response body should exist');
  return body;
}

export async function assertSuccessResponse<T = unknown>(
  response: Response,
  expectedStatus: number = 200
): Promise<T> {
  const body = await assertJsonResponse(response, expectedStatus);
  assertEquals(body.success, true, 'Expected success: true');
  assertExists(body.data, 'Response should have data');
  return body.data as T;
}

export async function assertErrorResponse(
  response: Response,
  expectedStatus: number,
  expectedCode?: string
): Promise<{ code: string; message: string }> {
  const body = await assertJsonResponse(response, expectedStatus);
  assertEquals(body.success, false, 'Expected success: false');
  assertExists(body.error, 'Response should have error');

  const error = body.error as { code: string; message: string };
  if (expectedCode) {
    assertEquals(error.code, expectedCode, `Expected error code ${expectedCode}`);
  }

  return error;
}

export function assertCorsHeaders(response: Response, origin?: string): void {
  const allowOrigin = response.headers.get('Access-Control-Allow-Origin');
  assertExists(allowOrigin, 'Should have CORS Allow-Origin header');

  if (origin) {
    assertEquals(allowOrigin, origin, `Expected origin ${origin}`);
  }

  assertExists(
    response.headers.get('Access-Control-Allow-Methods'),
    'Should have CORS Allow-Methods header'
  );
  assertExists(
    response.headers.get('Access-Control-Allow-Headers'),
    'Should have CORS Allow-Headers header'
  );
}

// =============================================================================
// TEST DATA GENERATORS
// =============================================================================

export function generateUUID(): string {
  return crypto.randomUUID();
}

export function generateEmail(): string {
  const random = Math.random().toString(36).substring(2, 10);
  return `test-${random}@example.com`;
}

export function generatePhone(): string {
  const random = Math.floor(Math.random() * 9000000000) + 1000000000;
  return `+1${random}`;
}

export function generateUsername(): string {
  const random = Math.random().toString(36).substring(2, 10);
  return `user_${random}`;
}

export function generateCoordinates(): { lat: number; lng: number } {
  return {
    lat: 40 + Math.random() * 5, // Around Turkey
    lng: 28 + Math.random() * 10,
  };
}

export function generateMomentData(): Record<string, unknown> {
  const coords = generateCoordinates();
  return {
    title: `Test Moment ${Date.now()}`,
    description: 'This is a test moment for unit testing',
    momentType: 'coffee',
    location: {
      latitude: coords.lat,
      longitude: coords.lng,
    },
    address: 'Test Address, Istanbul',
    scheduledAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    maxParticipants: 4,
  };
}

export function generateUserData(): Record<string, unknown> {
  return {
    email: generateEmail(),
    fullName: `Test User ${Date.now()}`,
    username: generateUsername(),
    age: 25,
    bio: 'Test user bio',
    location: 'Istanbul, Turkey',
    interests: ['travel', 'coffee', 'tech'],
    languages: ['en', 'tr'],
  };
}

// =============================================================================
// MOCK SUPABASE CLIENT
// =============================================================================

export function createMockSupabaseClient(options: {
  user?: { id: string; email: string } | null;
  data?: Record<string, unknown>;
  error?: { message: string; code: string } | null;
} = {}) {
  const { user = null, data = null, error = null } = options;

  return {
    auth: {
      getUser: () => Promise.resolve({
        data: user ? { user } : null,
        error: user ? null : { message: 'Not authenticated' },
      }),
    },
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: () => ({ single: () => Promise.resolve({ data, error }) }),
        in: () => Promise.resolve({ data: data ? [data] : [], error }),
        single: () => Promise.resolve({ data, error }),
      }),
      insert: (values: unknown) => ({
        select: () => ({
          single: () => Promise.resolve({ data: data || values, error }),
        }),
      }),
      update: (values: unknown) => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: data || values, error }),
          }),
        }),
      }),
      delete: () => ({
        eq: () => Promise.resolve({ error }),
      }),
    }),
    rpc: (fn: string, params?: unknown) => Promise.resolve({ data, error }),
  };
}

// =============================================================================
// TEST ENVIRONMENT SETUP
// =============================================================================

export function setupTestEnv(): void {
  Deno.env.set('SUPABASE_URL', 'http://localhost:54321');
  Deno.env.set('SUPABASE_ANON_KEY', 'test-anon-key');
  Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key');
  Deno.env.set('DENO_ENV', 'test');
}

export function cleanupTestEnv(): void {
  Deno.env.delete('SUPABASE_URL');
  Deno.env.delete('SUPABASE_ANON_KEY');
  Deno.env.delete('SUPABASE_SERVICE_ROLE_KEY');
  Deno.env.delete('DENO_ENV');
}

// =============================================================================
// TEST RUNNER HELPERS
// =============================================================================

export interface TestCase {
  name: string;
  fn: () => Promise<void> | void;
  only?: boolean;
  skip?: boolean;
}

export function describeFunction(
  functionName: string,
  tests: TestCase[]
): void {
  for (const test of tests) {
    const testName = `[${functionName}] ${test.name}`;
    
    if (test.skip) {
      Deno.test({ name: testName, ignore: true, fn: test.fn });
    } else if (test.only) {
      Deno.test({ name: testName, only: true, fn: test.fn });
    } else {
      Deno.test(testName, test.fn);
    }
  }
}

// Re-export assertions for convenience
export { assertEquals, assertExists, assertMatch };
