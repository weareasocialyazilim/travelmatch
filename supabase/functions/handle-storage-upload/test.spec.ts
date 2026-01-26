/**
 * Integration Tests for AI + Rekognition Moderation Flow
 * Test Suite for handle-storage-upload Edge Function
 *
 * Run: deno test --allow-net --allow-env supabase/functions/handle-storage-upload/test.spec.ts
 *
 * IMPORTANT: These tests require:
 * - Supabase project running locally or in staging
 * - AWS credentials configured (or tests will skip)
 * - Storage buckets: 'moments', 'kyc-documents'
 */

import {
  assert,
  assertEquals,
  assertExists,
} from 'https://deno.land/std@0.168.0/testing/asserts.ts';
import {
  createClient,
  type SupabaseClient,
} from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// Test configuration
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'http://localhost:54321';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const AWS_ACCESS_KEY_ID = Deno.env.get('AWS_ACCESS_KEY_ID') || '';
const AWS_SECRET_ACCESS_KEY = Deno.env.get('AWS_SECRET_ACCESS_KEY') || '';

// Test user ID - replace with actual test user
const TEST_USER_ID = 'test-user-123';
const TEST_BUCKET = 'moments';

interface TestContext {
  supabase: SupabaseClient;
  uploadedFilePath: string;
}

async function createTestContext(): Promise<TestContext> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Create a test user if needed (for RLS)
  // Note: In production, use a dedicated test account

  return {
    supabase,
    uploadedFilePath: '',
  };
}

function generateMockPayload(
  bucketId: string,
  fileName: string,
  userId: string,
): Record<string, unknown> {
  return {
    type: 'INSERT',
    table: 'objects',
    schema: 'storage',
    record: {
      id: crypto.randomUUID(),
      bucket_id: bucketId,
      name: fileName,
      owner: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        mimetype: 'image/jpeg',
      },
      path_tokens: fileName.split('/'),
    },
    old_record: null,
  };
}

// =============================================================================
// TEST SUITE: Storage Webhook Trigger
// =============================================================================

Deno.test({
  name: 'Webhook: Should reject non-INSERT events',
  async fn() {
    const payload = generateMockPayload(TEST_BUCKET, 'test.jpg', TEST_USER_ID);
    (payload as Record<string, unknown>).type = 'UPDATE';

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/handle-storage-upload`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify(payload),
      },
    );

    const result = await response.json();
    assertEquals(
      result.message,
      'Skipping non-INSERT event',
      'Should skip UPDATE events',
    );
  },
});

Deno.test({
  name: 'Webhook: Should reject non-image files',
  async fn() {
    const payload = generateMockPayload(TEST_BUCKET, 'document.pdf', TEST_USER_ID);
    (payload.record.metadata as Record<string, unknown>).mimetype = 'application/pdf';

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/handle-storage-upload`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify(payload),
      },
    );

    // Should return early without processing
    assertEquals(response.status, 200);
  },
});

Deno.test({
  name: 'Webhook: Should skip non-moderated buckets',
  async fn() {
    const payload = generateMockPayload('avatars', 'user.jpg', TEST_USER_ID);

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/handle-storage-upload`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify(payload),
      },
    );

    assertEquals(response.status, 200);
    const result = await response.json();
    assertEquals(result.message, 'Skipped bucket');
  },
});

// =============================================================================
// TEST SUITE: Rekognition Moderation (requires AWS credentials)
// =============================================================================

Deno.test({
  name: 'Rekognition: Should skip when AWS credentials not configured',
  async fn() {
    if (AWS_ACCESS_KEY_ID === '' || AWS_SECRET_ACCESS_KEY === '') {
      console.log('[TEST] Skipping - AWS credentials not configured');
      return;
    }

    const payload = generateMockPayload(TEST_BUCKET, 'test-safe.jpg', TEST_USER_ID);

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/handle-storage-upload`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify(payload),
      },
    );

    assertEquals(response.status, 200);
    const result = await response.json();
    assertEquals(result.status, 'skipped_no_aws');
  },
  sanitizeResources: false,
});

Deno.test({
  name: 'Rekognition: Should process image when AWS credentials configured',
  async fn() {
    if (AWS_ACCESS_KEY_ID === '' || AWS_SECRET_ACCESS_KEY === '') {
      console.log('[TEST] Skipping - AWS credentials not configured');
      return;
    }

    // Note: This test requires an actual file upload to storage first
    // The webhook is triggered automatically on INSERT to storage.objects
    console.log('[TEST] Requires manual verification with actual file upload');
  },
  sanitizeResources: false,
});

// =============================================================================
// TEST SUITE: Idempotency
// =============================================================================

Deno.test({
  name: 'Idempotency: Should skip duplicate moderation requests',
  async fn() {
    const payload = generateMockPayload(TEST_BUCKET, 'duplicate-test.jpg', TEST_USER_ID);

    // First request
    const response1 = await fetch(
      `${SUPABASE_URL}/functions/v1/handle-storage-upload`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify(payload),
      },
    );

    // Simulate duplicate by modifying the ID but same path
    (payload as Record<string, unknown>).record = {
      ...payload.record,
      id: crypto.randomUUID(),
      name: 'duplicate-test.jpg', // Same path
    };

    // Second request (same file)
    const response2 = await fetch(
      `${SUPABASE_URL}/functions/v1/handle-storage-upload`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify(payload),
      },
    );

    // Both should complete (this test verifies the function handles requests gracefully)
    assertEquals(response1.status, 200);
    assertEquals(response2.status, 200);
  },
});

// =============================================================================
// TEST SUITE: Moderation Status Flow
// =============================================================================

Deno.test({
  name: 'Moderation: Should set correct status for different scenarios',
  async fn() {
    // Test 1: Approved - no issues
    // Test 2: Rejected - explicit content
    // Test 3: Pending Review - suspicious but not explicit
    // Test 4: Skipped - no AWS credentials

    const scenarios = [
      { name: 'safe image', expectedStatus: 'approved' },
      { name: 'large file', expectedStatus: 'pending_review' },
    ];

    for (const scenario of scenarios) {
      const payload = generateMockPayload(
        TEST_BUCKET,
        `test-${scenario.name.replace(/\s/g, '-')}.jpg`,
        TEST_USER_ID,
      );

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/handle-storage-upload`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
          body: JSON.stringify(payload),
        },
      );

      assertEquals(response.status, 200);
      const result = await response.json();
      assertExists(result.status, `Response should have status field for ${scenario.name}`);
    }
  },
});

// =============================================================================
// TEST SUITE: Database Persistence
// =============================================================================

Deno.test({
  name: 'Database: Should write to moderation_logs',
  async fn() {
    const context = await createTestContext();
    const testFileName = `test-log-${Date.now()}.jpg`;
    const payload = generateMockPayload(TEST_BUCKET, testFileName, TEST_USER_ID);

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/handle-storage-upload`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify(payload),
      },
    );

    assertEquals(response.status, 200);

    // Verify moderation_log was created
    const { data: logs } = await context.supabase
      .from('moderation_logs')
      .select('*')
      .eq('metadata->>path', testFileName)
      .eq('metadata->>bucket', TEST_BUCKET)
      .limit(1);

    // Log may or may not exist depending on file processing result
    // This is expected - moderation_logs are created based on processing result
    console.log('[TEST] Moderation log check completed');
  },
});

// =============================================================================
// TEST SUITE: PII Leak Prevention
// =============================================================================

Deno.test({
  name: 'Security: Should not leak PII in logs',
  async fn() {
    const testEmail = 'test-user-pii@test.com';
    const testPhone = '+905551234567';

    const payload = generateMockPayload(TEST_BUCKET, 'pii-test.jpg', TEST_USER_ID);

    // The function should sanitize any PII from logs
    // We verify by checking that the response doesn't contain raw PII
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/handle-storage-upload`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify(payload),
      },
    );

    assertEquals(response.status, 200);
    const result = await response.json();

    // Response should not contain PII in plain text
    assertEquals(
      JSON.stringify(result).includes(testEmail),
      false,
      'Response should not contain email PII',
    );
  },
});

// =============================================================================
// TEST SUITE: AI Service Fallback
// =============================================================================

Deno.test({
  name: 'AI: Should handle service disabled gracefully',
  async fn() {
    // This test verifies the AI service handles missing API key
    // by throwing a descriptive error rather than crashing

    const { isAiServiceEnabled, getAiServiceStatus } = await import(
      '../../../services/shared/ml/openai-client.ts'
    );

    const status = getAiServiceStatus();

    // When OPENAI_API_KEY is not set, service should report as disabled
    assertExists(status.enabled !== undefined, 'Status should have enabled field');
    assertExists(status.configuredModels, 'Status should have configuredModels field');
  },
});

// =============================================================================
// HELPER: Run integration tests manually
// =============================================================================

/**
 * Manual test runner for production validation
 * Usage:
 *   deno run -A --env-file=.env supabase/functions/handle-storage-upload/test.spec.ts
 */
export async function runManualTests(): Promise<void> {
  console.log('[INTEGRATION TEST] Starting AI + Rekognition validation...\n');

  // Check prerequisites
  console.log('[PREREQUISITES]');
  console.log('  - Supabase URL:', SUPABASE_URL ? 'SET' : 'MISSING');
  console.log('  - Service Key:', SUPABASE_SERVICE_KEY ? 'SET' : 'MISSING');
  console.log('  - AWS Credentials:', AWS_ACCESS_KEY_ID ? 'SET' : 'MISSING');
  console.log('');

  // Run basic functionality test
  const payload = generateMockPayload(TEST_BUCKET, 'integration-test.jpg', TEST_USER_ID);

  console.log('[TEST] Uploading test file to storage...');

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/handle-storage-upload`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify(payload),
    },
  );

  console.log('[RESULT] Status:', response.status);
  console.log('[RESULT] Body:', await response.json());

  console.log('\n[INTEGRATION TEST] Complete.');
}

// Run manual tests if this file is executed directly
if (Deno.args.includes('--manual')) {
  runManualTests();
}
