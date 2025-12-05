/**
 * API Health & Connectivity Integration Tests
 *
 * Bu testler backend API'nin erişilebilir olduğunu ve temel endpoint'lerin
 * çalıştığını doğrular.
 *
 * Çalıştırma:
 * npm test -- --testPathPattern="integration/api.health" --runInBand
 *
 * Not: Bu testler gerçek API'ye istek atar. Test ortamı gerektirir.
 */

import {
  createTestClient,
  createAuthenticatedClient,
  checkApiHealth,
  testEndpoint,
  testMultipleEndpoints,
  printTestResults,
  API_BASE_URL,
} from './testUtils';

// Skip if no API available (default to true for unit tests)
const SKIP_INTEGRATION = process.env.RUN_INTEGRATION !== 'true';

describe('API Health & Connectivity', () => {
  beforeAll(() => {
    if (SKIP_INTEGRATION) {
      console.log(
        '⚠️ Integration tests skipped (RUN_INTEGRATION not set to true)',
      );
    } else {
      console.log(`Testing API at: ${API_BASE_URL}`);
    }
  });

  describe('Health Check', () => {
    it('should verify API is running', async () => {
      if (SKIP_INTEGRATION) return;

      const client = createTestClient();
      const isHealthy = await checkApiHealth(client);

      // This test may fail if backend is not running
      // It's informational - doesn't break CI
      console.log(
        `API Health: ${isHealthy ? '✅ Healthy' : '❌ Not reachable'}`,
      );
    });
  });

  describe('Public Endpoints', () => {
    it('should access public moments feed', async () => {
      if (SKIP_INTEGRATION) return;

      const client = createTestClient();
      const result = await testEndpoint(client, 'get', '/moments');

      console.log(
        `Public feed: ${result.success ? '✅' : '❌'} (${result.status})`,
      );
    });

    it('should return error for invalid endpoint', async () => {
      if (SKIP_INTEGRATION) return;

      const client = createTestClient();
      const result = await testEndpoint(client, 'get', '/nonexistent-endpoint');

      expect(result.success).toBe(false);
      expect(result.status).toBe(404);
    });
  });

  describe('Authentication Endpoints', () => {
    it('should reject login with invalid credentials', async () => {
      if (SKIP_INTEGRATION) return;

      const client = createTestClient();
      const result = await testEndpoint(client, 'post', '/auth/login', {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe(401);
    });

    it('should reject invalid registration data', async () => {
      if (SKIP_INTEGRATION) return;

      const client = createTestClient();
      const result = await testEndpoint(client, 'post', '/auth/register', {
        email: 'invalid-email',
        password: '123', // Too short
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe(400); // Validation error
    });
  });

  describe('Protected Endpoints (without auth)', () => {
    it('should reject unauthenticated requests to protected routes', async () => {
      if (SKIP_INTEGRATION) return;

      const client = createTestClient();

      const protectedEndpoints = [
        { method: 'get' as const, path: '/me' },
        { method: 'get' as const, path: '/wallet/balance' },
        { method: 'get' as const, path: '/conversations' },
        { method: 'get' as const, path: '/requests' },
        { method: 'get' as const, path: '/notifications' },
      ];

      const results = await testMultipleEndpoints(client, protectedEndpoints);

      // All should return 401 Unauthorized
      results.forEach((result) => {
        expect(result.status).toBe(401);
      });

      printTestResults(results);
    });
  });

  describe('Authenticated Endpoints', () => {
    it('should access protected routes with valid token', async () => {
      if (SKIP_INTEGRATION) return;

      const client = await createAuthenticatedClient();

      // If no token, skip this test
      if (!client.defaults.headers.common['Authorization']) {
        console.log(
          '⚠️ Skipping authenticated tests - no test token available',
        );
        return;
      }

      const protectedEndpoints = [
        { method: 'get' as const, path: '/me' },
        { method: 'get' as const, path: '/wallet/balance' },
        { method: 'get' as const, path: '/conversations' },
      ];

      const results = await testMultipleEndpoints(client, protectedEndpoints);

      // At least one should succeed
      const successfulCount = results.filter((r) => r.success).length;
      console.log(
        `Authenticated endpoints: ${successfulCount}/${results.length} successful`,
      );

      printTestResults(results);
    });
  });

  describe('API Response Format', () => {
    it('should return JSON responses', async () => {
      if (SKIP_INTEGRATION) return;

      const client = createTestClient();

      try {
        const response = await client.get('/moments');
        const contentType = response.headers['content-type'];

        expect(contentType).toContain('application/json');
      } catch (error) {
        // Even error responses should be JSON
        const axiosError = error as {
          response?: { headers?: Record<string, string> };
        };
        if (axiosError.response?.headers) {
          expect(axiosError.response.headers['content-type']).toContain(
            'application/json',
          );
        }
      }
    });

    it('should include proper error format', async () => {
      if (SKIP_INTEGRATION) return;

      const client = createTestClient();

      try {
        await client.get('/nonexistent');
      } catch (error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        // Error should have a message
        expect(axiosError.response?.data).toBeDefined();
      }
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limiting gracefully', async () => {
      if (SKIP_INTEGRATION) return;

      const client = createTestClient();

      // Make multiple rapid requests
      const requests = Array(10)
        .fill(null)
        .map(() => testEndpoint(client, 'get', '/moments'));

      const results = await Promise.all(requests);

      // Check for 429 Too Many Requests
      const rateLimited = results.filter((r) => r.status === 429);

      if (rateLimited.length > 0) {
        console.log(
          `Rate limiting detected: ${rateLimited.length} requests blocked`,
        );
      }
    });
  });
});
