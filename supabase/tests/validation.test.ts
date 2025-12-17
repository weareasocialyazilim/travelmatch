/**
 * Validation Module Tests
 */

import { 
  assertEquals, 
  assertExists,
} from 'https://deno.land/std@0.208.0/testing/asserts.ts';

import {
  validate,
  validateOrThrow,
  formatValidationErrors,
  UUIDSchema,
  EmailSchema,
  PasswordSchema,
  PhoneSchema,
  UsernameSchema,
  CoordinatesSchema,
  CreateMomentSchema,
  PaginationSchema,
  sanitizeString,
  sanitizeHtml,
  escapeSqlLike,
  z,
} from '../_shared/validation.ts';

// =============================================================================
// UUID VALIDATION TESTS
// =============================================================================

Deno.test('[Validation] UUIDSchema - valid UUID', () => {
  const validUuid = '123e4567-e89b-12d3-a456-426614174000';
  const result = validate(UUIDSchema, validUuid);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.data, validUuid);
  }
});

Deno.test('[Validation] UUIDSchema - invalid UUID', () => {
  const result = validate(UUIDSchema, 'not-a-uuid');
  assertEquals(result.success, false);
});

// =============================================================================
// EMAIL VALIDATION TESTS
// =============================================================================

Deno.test('[Validation] EmailSchema - valid email', () => {
  const result = validate(EmailSchema, 'TEST@Example.com');
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.data, 'test@example.com'); // Should be lowercased
  }
});

Deno.test('[Validation] EmailSchema - invalid email', () => {
  const result = validate(EmailSchema, 'not-an-email');
  assertEquals(result.success, false);
});

// =============================================================================
// PASSWORD VALIDATION TESTS
// =============================================================================

Deno.test('[Validation] PasswordSchema - valid password', () => {
  const result = validate(PasswordSchema, 'SecurePass123');
  assertEquals(result.success, true);
});

Deno.test('[Validation] PasswordSchema - too short', () => {
  const result = validate(PasswordSchema, 'Abc1');
  assertEquals(result.success, false);
});

Deno.test('[Validation] PasswordSchema - no uppercase', () => {
  const result = validate(PasswordSchema, 'securepass123');
  assertEquals(result.success, false);
});

Deno.test('[Validation] PasswordSchema - no number', () => {
  const result = validate(PasswordSchema, 'SecurePassword');
  assertEquals(result.success, false);
});

// =============================================================================
// PHONE VALIDATION TESTS
// =============================================================================

Deno.test('[Validation] PhoneSchema - valid international phone', () => {
  const result = validate(PhoneSchema, '+905551234567');
  assertEquals(result.success, true);
});

Deno.test('[Validation] PhoneSchema - invalid phone', () => {
  const result = validate(PhoneSchema, '123');
  assertEquals(result.success, false);
});

// =============================================================================
// USERNAME VALIDATION TESTS
// =============================================================================

Deno.test('[Validation] UsernameSchema - valid username', () => {
  const result = validate(UsernameSchema, 'john_doe123');
  assertEquals(result.success, true);
});

Deno.test('[Validation] UsernameSchema - invalid characters', () => {
  const result = validate(UsernameSchema, 'john-doe');
  assertEquals(result.success, false);
});

Deno.test('[Validation] UsernameSchema - too short', () => {
  const result = validate(UsernameSchema, 'ab');
  assertEquals(result.success, false);
});

// =============================================================================
// COORDINATES VALIDATION TESTS
// =============================================================================

Deno.test('[Validation] CoordinatesSchema - valid coordinates', () => {
  const result = validate(CoordinatesSchema, { latitude: 41.0082, longitude: 28.9784 });
  assertEquals(result.success, true);
});

Deno.test('[Validation] CoordinatesSchema - invalid latitude', () => {
  const result = validate(CoordinatesSchema, { latitude: 100, longitude: 28.9784 });
  assertEquals(result.success, false);
});

Deno.test('[Validation] CoordinatesSchema - invalid longitude', () => {
  const result = validate(CoordinatesSchema, { latitude: 41.0082, longitude: 200 });
  assertEquals(result.success, false);
});

// =============================================================================
// PAGINATION VALIDATION TESTS
// =============================================================================

Deno.test('[Validation] PaginationSchema - default values', () => {
  const result = validate(PaginationSchema, {});
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.data.page, 1);
    assertEquals(result.data.limit, 20);
  }
});

Deno.test('[Validation] PaginationSchema - custom values', () => {
  const result = validate(PaginationSchema, { page: 5, limit: 50 });
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.data.page, 5);
    assertEquals(result.data.limit, 50);
  }
});

Deno.test('[Validation] PaginationSchema - limit exceeds max', () => {
  const result = validate(PaginationSchema, { page: 1, limit: 200 });
  assertEquals(result.success, false);
});

// =============================================================================
// CREATE MOMENT VALIDATION TESTS
// =============================================================================

Deno.test('[Validation] CreateMomentSchema - valid moment', () => {
  const momentData = {
    title: 'Coffee in Istanbul',
    description: 'Looking for someone to explore Kadıköy coffee scene',
    momentType: 'coffee',
    location: { latitude: 40.9926, longitude: 29.0230 },
    address: 'Kadıköy, Istanbul',
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    maxParticipants: 4,
  };
  
  const result = validate(CreateMomentSchema, momentData);
  assertEquals(result.success, true);
});

Deno.test('[Validation] CreateMomentSchema - invalid moment type', () => {
  const momentData = {
    title: 'Coffee in Istanbul',
    description: 'Looking for someone',
    momentType: 'invalid_type',
    location: { latitude: 40.9926, longitude: 29.0230 },
    address: 'Kadıköy, Istanbul',
    scheduledAt: new Date().toISOString(),
  };
  
  const result = validate(CreateMomentSchema, momentData);
  assertEquals(result.success, false);
});

// =============================================================================
// HELPER FUNCTION TESTS
// =============================================================================

Deno.test('[Validation] validateOrThrow - throws on invalid', () => {
  let threw = false;
  try {
    validateOrThrow(UUIDSchema, 'not-valid');
  } catch {
    threw = true;
  }
  assertEquals(threw, true);
});

Deno.test('[Validation] formatValidationErrors - formats correctly', () => {
  const schema = z.object({
    email: z.string().email(),
    age: z.number().min(18),
  });
  
  const result = schema.safeParse({ email: 'invalid', age: 10 });
  
  if (!result.success) {
    const formatted = formatValidationErrors(result.error.errors);
    assertExists(formatted.email);
    assertExists(formatted.age);
  }
});

// =============================================================================
// SANITIZATION TESTS
// =============================================================================

Deno.test('[Validation] sanitizeString - removes control characters', () => {
  const input = 'Hello\x00World\x1F!';
  const result = sanitizeString(input);
  assertEquals(result, 'HelloWorld!');
});

Deno.test('[Validation] sanitizeString - trims whitespace', () => {
  const result = sanitizeString('  hello  ');
  assertEquals(result, 'hello');
});

Deno.test('[Validation] sanitizeHtml - escapes HTML', () => {
  const input = '<script>alert("xss")</script>';
  const result = sanitizeHtml(input);
  assertEquals(result, '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
});

Deno.test('[Validation] escapeSqlLike - escapes wildcards', () => {
  const input = '100% match_test';
  const result = escapeSqlLike(input);
  assertEquals(result, '100\\% match\\_test');
});
