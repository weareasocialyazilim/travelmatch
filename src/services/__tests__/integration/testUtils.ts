/**
 * API Integration Test Utilities
 *
 * Bu dosya backend API bağlantısını test etmek için yardımcı araçlar sağlar.
 * Testler gerçek API endpoint'lerine istek atar ve yanıtları doğrular.
 *
 * Kullanım:
 * 1. API_BASE_URL'i gerçek backend URL'inize ayarlayın
 * 2. TEST_CREDENTIALS ile test kullanıcı bilgilerini ayarlayın
 * 3. Test komutlarını çalıştırın: npm test -- --testPathPattern="integration"
 */

import type { AxiosInstance, AxiosError } from 'axios';
import axios from 'axios';

// Test Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const TEST_TIMEOUT = 10000; // 10 seconds

/**
 * Test user credentials
 * SECURITY: These should ALWAYS be set via environment variables in CI/CD
 * Never commit real credentials to version control
 */
const TEST_CREDENTIALS = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'TestPass123!',
};

// Validate test environment
if (process.env.NODE_ENV === 'production') {
  throw new Error(
    'Integration tests should not run in production environment!',
  );
}

if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD) {
  console.warn(
    '⚠️  WARNING: Using default test credentials. Set TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables for CI/CD.',
  );
}

// Create axios instance for testing
export const createTestClient = (): AxiosInstance => {
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: TEST_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Auth helper for getting test token
export async function getTestToken(client: AxiosInstance): Promise<string> {
  try {
    const response = await client.post('/auth/login', TEST_CREDENTIALS);
    return response.data.accessToken || response.data.token;
  } catch (error) {
    console.warn('Could not get test token:', (error as AxiosError).message);
    return '';
  }
}

// Create authenticated test client
export async function createAuthenticatedClient(): Promise<AxiosInstance> {
  const client = createTestClient();
  const token = await getTestToken(client);

  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  return client;
}

// API Response checker
export interface ApiTestResult {
  endpoint: string;
  method: string;
  success: boolean;
  status?: number;
  responseTime?: number;
  error?: string;
  data?: unknown;
}

export async function testEndpoint(
  client: AxiosInstance,
  method: 'get' | 'post' | 'put' | 'delete',
  endpoint: string,
  data?: unknown,
): Promise<ApiTestResult> {
  const startTime = Date.now();

  try {
    const response = await client[method](endpoint, data);

    return {
      endpoint,
      method: method.toUpperCase(),
      success: true,
      status: response.status,
      responseTime: Date.now() - startTime,
      data: response.data,
    };
  } catch (error) {
    const axiosError = error as AxiosError;

    return {
      endpoint,
      method: method.toUpperCase(),
      success: false,
      status: axiosError.response?.status,
      responseTime: Date.now() - startTime,
      error: axiosError.message,
    };
  }
}

// Health check for API
export async function checkApiHealth(client: AxiosInstance): Promise<boolean> {
  try {
    const response = await client.get('/health');
    return response.status === 200;
  } catch {
    // Try alternate health endpoints
    try {
      const response = await client.get('/');
      return response.status >= 200 && response.status < 400;
    } catch {
      return false;
    }
  }
}

// Batch endpoint tester
export async function testMultipleEndpoints(
  client: AxiosInstance,
  endpoints: Array<{
    method: 'get' | 'post' | 'put' | 'delete';
    path: string;
    data?: unknown;
  }>,
): Promise<ApiTestResult[]> {
  const results: ApiTestResult[] = [];

  for (const ep of endpoints) {
    const result = await testEndpoint(client, ep.method, ep.path, ep.data);
    results.push(result);
  }

  return results;
}

// Pretty print test results
export function printTestResults(results: ApiTestResult[]): void {
  console.log('\n=== API Test Results ===\n');

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  results.forEach((result) => {
    const status = result.success ? '✅' : '❌';
    const time = result.responseTime ? `${result.responseTime}ms` : 'N/A';
    console.log(
      `${status} ${result.method} ${result.endpoint} - ${
        result.status || 'ERROR'
      } (${time})`,
    );
    if (!result.success && result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log(
    `\nTotal: ${results.length} | Passed: ${passed} | Failed: ${failed}`,
  );
}

// Export for use in tests
export default {
  createTestClient,
  createAuthenticatedClient,
  getTestToken,
  testEndpoint,
  checkApiHealth,
  testMultipleEndpoints,
  printTestResults,
  API_BASE_URL,
  TEST_TIMEOUT,
};
