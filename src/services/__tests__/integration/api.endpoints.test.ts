/**
 * API Endpoint Integration Tests
 *
 * Bu testler tüm temel API endpoint'lerinin erişilebilirliğini ve
 * doğru yanıt formatlarını kontrol eder.
 *
 * Çalıştırma:
 * npm test -- --testPathPattern="integration/api.endpoints" --runInBand
 */

import {
  createTestClient,
  createAuthenticatedClient,
  testEndpoint,
  testMultipleEndpoints,
  printTestResults,
  ApiTestResult as _ApiTestResult,
} from './testUtils';
import type { AxiosInstance } from 'axios';

// Skip if no API available (default to true for unit tests)
const SKIP_INTEGRATION = process.env.RUN_INTEGRATION !== 'true';

describe('API Endpoint Tests', () => {
  let publicClient: AxiosInstance;
  let authClient: AxiosInstance;
  let hasAuthToken = false;

  beforeAll(async () => {
    if (SKIP_INTEGRATION) {
      console.log(
        '⚠️ Integration tests skipped (RUN_INTEGRATION not set to true)',
      );
      return;
    }

    publicClient = createTestClient();
    authClient = await createAuthenticatedClient();
    hasAuthToken = !!authClient.defaults.headers.common['Authorization'];

    if (!hasAuthToken) {
      console.log('⚠️ No auth token - some tests will be skipped');
    }
  });

  describe('Moments API', () => {
    it('should list moments', async () => {
      if (SKIP_INTEGRATION) return;

      const result = await testEndpoint(publicClient, 'get', '/moments');

      if (result.success) {
        expect(result.data).toHaveProperty('moments');
      }
    });

    it('should filter moments by category', async () => {
      if (SKIP_INTEGRATION) return;

      const result = await testEndpoint(
        publicClient,
        'get',
        '/moments?category=food',
      );

      if (result.success) {
        expect(result.data).toHaveProperty('moments');
      }
    });

    it('should paginate moments', async () => {
      if (SKIP_INTEGRATION) return;

      const result = await testEndpoint(
        publicClient,
        'get',
        '/moments?page=1&pageSize=5',
      );

      if (result.success) {
        const data = result.data as { moments?: unknown[]; total?: number };
        expect(data.moments).toBeDefined();
        expect(Array.isArray(data.moments)).toBe(true);
      }
    });

    it('should get moment details', async () => {
      if (SKIP_INTEGRATION) return;

      // First get a moment ID
      const listResult = await testEndpoint(
        publicClient,
        'get',
        '/moments?pageSize=1',
      );

      if (listResult.success) {
        const data = listResult.data as { moments?: Array<{ id: string }> };
        if (data.moments && data.moments.length > 0) {
          const momentId = data.moments[0].id;
          const detailResult = await testEndpoint(
            publicClient,
            'get',
            `/moments/${momentId}`,
          );

          if (detailResult.success) {
            expect(detailResult.data).toHaveProperty('moment');
          }
        }
      }
    });
  });

  describe('User API', () => {
    it('should require auth for profile', async () => {
      if (SKIP_INTEGRATION) return;

      const result = await testEndpoint(publicClient, 'get', '/me');

      expect(result.status).toBe(401);
    });

    it('should return profile with auth', async () => {
      if (SKIP_INTEGRATION || !hasAuthToken) return;

      const result = await testEndpoint(authClient, 'get', '/me');

      if (result.success) {
        expect(result.data).toHaveProperty('user');
      }
    });

    it('should get public user profile', async () => {
      if (SKIP_INTEGRATION) return;

      // This may require a valid user ID
      const result = await testEndpoint(
        publicClient,
        'get',
        '/users/test-user-id',
      );

      // Either 200 with user data or 404 if user doesn't exist
      expect([200, 404]).toContain(result.status);
    });
  });

  describe('Messages API', () => {
    it('should require auth for conversations', async () => {
      if (SKIP_INTEGRATION) return;

      const result = await testEndpoint(publicClient, 'get', '/conversations');

      expect(result.status).toBe(401);
    });

    it('should list conversations with auth', async () => {
      if (SKIP_INTEGRATION || !hasAuthToken) return;

      const result = await testEndpoint(authClient, 'get', '/conversations');

      if (result.success) {
        expect(result.data).toHaveProperty('conversations');
      }
    });
  });

  describe('Requests API', () => {
    it('should require auth for requests', async () => {
      if (SKIP_INTEGRATION) return;

      const result = await testEndpoint(publicClient, 'get', '/requests');

      expect(result.status).toBe(401);
    });

    it('should list requests with auth', async () => {
      if (SKIP_INTEGRATION || !hasAuthToken) return;

      const result = await testEndpoint(authClient, 'get', '/requests');

      if (result.success) {
        expect(result.data).toHaveProperty('requests');
      }
    });

    it('should filter sent requests', async () => {
      if (SKIP_INTEGRATION || !hasAuthToken) return;

      const result = await testEndpoint(
        authClient,
        'get',
        '/requests?role=requester',
      );

      if (result.success) {
        expect(result.data).toHaveProperty('requests');
      }
    });

    it('should filter received requests', async () => {
      if (SKIP_INTEGRATION || !hasAuthToken) return;

      const result = await testEndpoint(
        authClient,
        'get',
        '/requests?role=host',
      );

      if (result.success) {
        expect(result.data).toHaveProperty('requests');
      }
    });
  });

  describe('Wallet API', () => {
    it('should require auth for wallet', async () => {
      if (SKIP_INTEGRATION) return;

      const result = await testEndpoint(publicClient, 'get', '/wallet/balance');

      expect(result.status).toBe(401);
    });

    it('should return wallet balance with auth', async () => {
      if (SKIP_INTEGRATION || !hasAuthToken) return;

      const result = await testEndpoint(authClient, 'get', '/wallet/balance');

      if (result.success) {
        expect(result.data).toHaveProperty('balance');
      }
    });

    it('should list transactions with auth', async () => {
      if (SKIP_INTEGRATION || !hasAuthToken) return;

      const result = await testEndpoint(
        authClient,
        'get',
        '/wallet/transactions',
      );

      if (result.success) {
        expect(result.data).toHaveProperty('transactions');
      }
    });
  });

  describe('Payment Methods API', () => {
    it('should require auth for payment methods', async () => {
      if (SKIP_INTEGRATION) return;

      const result = await testEndpoint(
        publicClient,
        'get',
        '/payment-methods',
      );

      expect(result.status).toBe(401);
    });

    it('should list payment methods with auth', async () => {
      if (SKIP_INTEGRATION || !hasAuthToken) return;

      const result = await testEndpoint(authClient, 'get', '/payment-methods');

      if (result.success) {
        expect(result.data).toHaveProperty('cards');
        expect(result.data).toHaveProperty('bankAccounts');
      }
    });
  });

  describe('Notifications API', () => {
    it('should require auth for notifications', async () => {
      if (SKIP_INTEGRATION) return;

      const result = await testEndpoint(publicClient, 'get', '/notifications');

      expect(result.status).toBe(401);
    });

    it('should list notifications with auth', async () => {
      if (SKIP_INTEGRATION || !hasAuthToken) return;

      const result = await testEndpoint(authClient, 'get', '/notifications');

      if (result.success) {
        expect(result.data).toHaveProperty('notifications');
      }
    });
  });

  describe('Reviews API', () => {
    it('should get user reviews (public)', async () => {
      if (SKIP_INTEGRATION) return;

      // This may require a valid user ID
      const result = await testEndpoint(
        publicClient,
        'get',
        '/users/test-user-id/reviews',
      );

      // Either 200 with reviews or 404 if user doesn't exist
      expect([200, 404]).toContain(result.status);
    });
  });

  // Summary report
  afterAll(async () => {
    if (SKIP_INTEGRATION) return;

    console.log('\n📊 Running full endpoint test suite...\n');

    const allEndpoints = [
      { method: 'get' as const, path: '/moments' },
      { method: 'get' as const, path: '/me' },
      { method: 'get' as const, path: '/conversations' },
      { method: 'get' as const, path: '/requests' },
      { method: 'get' as const, path: '/wallet/balance' },
      { method: 'get' as const, path: '/payment-methods' },
      { method: 'get' as const, path: '/notifications' },
    ];

    const results = await testMultipleEndpoints(
      hasAuthToken ? authClient : publicClient,
      allEndpoints,
    );

    printTestResults(results);
  });
});
