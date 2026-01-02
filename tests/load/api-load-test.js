/**
 * TravelMatch API Load Testing
 * 
 * Comprehensive load test for all critical API endpoints
 * Target: 500 req/s sustained, p95 < 100ms, 0% error rate
 * 
 * Usage:
 *   k6 run --vus 1000 --duration 5m tests/load/api-load-test.js
 *   k6 run --vus 100 --duration 1m tests/load/api-load-test.js  # Quick test
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { randomItem, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// ==========================================
// Configuration
// ==========================================

const BASE_URL = __ENV.BASE_URL || 'https://your-project.supabase.co';
const ANON_KEY = __ENV.SUPABASE_ANON_KEY || 'your-anon-key';

// ==========================================
// Custom Metrics
// ==========================================

const errorRate = new Rate('errors');
const apiLatency = new Trend('api_latency');
const authLatency = new Trend('auth_latency');
const momentsLatency = new Trend('moments_latency');
const searchLatency = new Trend('search_latency');
const requestsCount = new Counter('total_requests');

// ==========================================
// Load Test Options
// ==========================================

export const options = {
  // Scenario: Ramp up to target load
  stages: [
    { duration: '30s', target: 100 },   // Ramp up to 100 users
    { duration: '1m', target: 500 },    // Ramp up to 500 users
    { duration: '2m', target: 1000 },   // Ramp up to 1000 users
    { duration: '5m', target: 1000 },   // Stay at 1000 users (peak)
    { duration: '1m', target: 500 },    // Ramp down to 500
    { duration: '30s', target: 0 },     // Cool down
  ],

  // Thresholds - Test fails if these are not met
  thresholds: {
    // Error rate must be below 1%
    'errors': ['rate<0.01'],

    // HTTP request duration thresholds (combined)
    // p95 < 100ms, p99 < 200ms, avg < 50ms
    'http_req_duration': ['p(95)<100', 'p(99)<200', 'avg<50'],

    // Request rate > 500/s
    'http_reqs': ['rate>500'],

    // Specific endpoint thresholds
    'api_latency': ['p(95)<100'],
    'moments_latency': ['p(95)<150'],
    'search_latency': ['p(95)<200'],
  },

  // Additional options
  noConnectionReuse: false,
  userAgent: 'k6-load-test/1.0',
};

// ==========================================
// Test Data
// ==========================================

const locations = ['Istanbul', 'Antalya', 'Izmir', 'Bodrum', 'Cappadocia'];
const categories = ['beach', 'hiking', 'food', 'culture', 'nightlife'];
const searchQueries = ['beach day', 'hiking trip', 'food tour', 'city explore'];

// ==========================================
// Helper Functions
// ==========================================

function getHeaders(token = null) {
  const headers = {
    'Content-Type': 'application/json',
    'apikey': ANON_KEY,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

function authenticateUser() {
  const email = `loadtest-${__VU}-${Date.now()}@test.com`;
  const password = 'LoadTest123!';
  
  // Sign up
  const signupRes = http.post(
    `${BASE_URL}/auth/v1/signup`,
    JSON.stringify({
      email,
      password,
    }),
    { headers: getHeaders() }
  );
  
  const success = check(signupRes, {
    'signup successful': (r) => r.status === 200 || r.status === 201,
  });
  
  if (!success) {
    console.error(`Signup failed: ${signupRes.status} ${signupRes.body}`);
    return null;
  }
  
  const body = JSON.parse(signupRes.body);
  return body.access_token || body.session?.access_token;
}

// ==========================================
// Test Scenarios
// ==========================================

export default function () {
  // Authenticate once per VU (virtual user)
  const token = authenticateUser();
  
  if (!token) {
    errorRate.add(1);
    return;
  }
  
  // Simulate user behavior: 60% read, 30% search, 10% write
  const action = Math.random();
  
  if (action < 0.6) {
    // Read operations (60%)
    testMomentsRead(token);
  } else if (action < 0.9) {
    // Search operations (30%)
    testSearch(token);
  } else {
    // Write operations (10%)
    testMomentsWrite(token);
  }
  
  // Think time: simulate user reading/processing
  sleep(randomIntBetween(1, 3));
}

// ==========================================
// Test Functions
// ==========================================

function testMomentsRead(token) {
  group('Moments - Read Operations', () => {
    const startTime = Date.now();
    
    // Get moments list
    const momentsRes = http.get(
      `${BASE_URL}/rest/v1/moments?select=*&order=created_at.desc&limit=20`,
      { headers: getHeaders(token) }
    );
    
    const latency = Date.now() - startTime;
    momentsLatency.add(latency);
    apiLatency.add(latency);
    requestsCount.add(1);
    
    const success = check(momentsRes, {
      'moments list loaded': (r) => r.status === 200,
      'response time < 100ms': () => latency < 100,
      'has data': (r) => JSON.parse(r.body).length > 0,
    });
    
    if (!success) {
      errorRate.add(1);
      console.error(`Moments read failed: ${momentsRes.status}`);
      return;
    }
    
    const moments = JSON.parse(momentsRes.body);
    
    // Get moment detail (50% chance)
    if (Math.random() < 0.5 && moments.length > 0) {
      const moment = randomItem(moments);
      const detailStartTime = Date.now();
      
      const detailRes = http.get(
        `${BASE_URL}/rest/v1/moments?id=eq.${moment.id}&select=*,user:users(*),requests(*)`,
        { headers: getHeaders(token) }
      );
      
      const detailLatency = Date.now() - detailStartTime;
      apiLatency.add(detailLatency);
      requestsCount.add(1);
      
      check(detailRes, {
        'moment detail loaded': (r) => r.status === 200,
        'detail response time < 150ms': () => detailLatency < 150,
      }) || errorRate.add(1);
    }
  });
}

function testSearch(token) {
  group('Search Operations', () => {
    const query = randomItem(searchQueries);
    const location = randomItem(locations);
    const category = randomItem(categories);
    
    const startTime = Date.now();
    
    // Search by location and category
    const searchRes = http.get(
      `${BASE_URL}/rest/v1/moments?location=ilike.*${location}*&category=eq.${category}&select=*&limit=20`,
      { headers: getHeaders(token) }
    );
    
    const latency = Date.now() - startTime;
    searchLatency.add(latency);
    apiLatency.add(latency);
    requestsCount.add(1);
    
    const success = check(searchRes, {
      'search completed': (r) => r.status === 200,
      'search response time < 200ms': () => latency < 200,
    });
    
    if (!success) {
      errorRate.add(1);
    }
  });
}

function testMomentsWrite(token) {
  group('Moments - Write Operations', () => {
    const startTime = Date.now();
    
    const momentData = {
      title: `Load Test Moment ${__VU}-${__ITER}`,
      description: 'This is a load test moment',
      location: randomItem(locations),
      category: randomItem(categories),
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      max_participants: randomIntBetween(2, 10),
      price: randomIntBetween(0, 500),
      status: 'active',
    };
    
    const createRes = http.post(
      `${BASE_URL}/rest/v1/moments`,
      JSON.stringify(momentData),
      { 
        headers: {
          ...getHeaders(token),
          'Prefer': 'return=representation',
        }
      }
    );
    
    const latency = Date.now() - startTime;
    apiLatency.add(latency);
    requestsCount.add(1);
    
    const success = check(createRes, {
      'moment created': (r) => r.status === 201,
      'create response time < 200ms': () => latency < 200,
    });
    
    if (!success) {
      errorRate.add(1);
      console.error(`Moment create failed: ${createRes.status} ${createRes.body}`);
    }
  });
}

// ==========================================
// Setup & Teardown
// ==========================================

export function setup() {
  console.log('🚀 Starting load test...');
  console.log(`Target: ${BASE_URL}`);
  console.log('Target metrics:');
  console.log('  - 500 req/s sustained');
  console.log('  - p95 latency < 100ms');
  console.log('  - Error rate < 1%');
  console.log('');
  
  // Verify API is accessible
  const healthRes = http.get(`${BASE_URL}/rest/v1/`);
  if (healthRes.status !== 200) {
    throw new Error(`API not accessible: ${healthRes.status}`);
  }
  
  return { startTime: Date.now() };
}

export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log('');
  console.log('✅ Load test completed');
  console.log(`Duration: ${duration.toFixed(2)}s`);
  console.log('');
  console.log('Check the results above for:');
  console.log('  - Error rate (should be < 1%)');
  console.log('  - p95 latency (should be < 100ms)');
  console.log('  - Request rate (should be > 500/s)');
}

// ==========================================
// Custom Summary
// ==========================================

export function handleSummary(data) {
  const duration = data.state.testRunDurationMs / 1000;
  const reqRate = data.metrics.http_reqs.values.rate;
  const p95 = data.metrics.http_req_duration.values['p(95)'];
  const errorRate = data.metrics.errors ? data.metrics.errors.values.rate * 100 : 0;
  
  console.log('');
  console.log('='.repeat(60));
  console.log('LOAD TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Duration:        ${duration.toFixed(2)}s`);
  console.log(`Total Requests:  ${data.metrics.http_reqs.values.count}`);
  console.log(`Request Rate:    ${reqRate.toFixed(2)} req/s`);
  console.log(`Error Rate:      ${errorRate.toFixed(2)}%`);
  console.log('');
  console.log('Response Times:');
  console.log(`  avg:  ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms`);
  console.log(`  p95:  ${p95.toFixed(2)}ms`);
  console.log(`  p99:  ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms`);
  console.log(`  max:  ${data.metrics.http_req_duration.values.max.toFixed(2)}ms`);
  console.log('');
  console.log('Target Validation:');
  console.log(`  ✓ Request rate > 500/s:    ${reqRate > 500 ? '✅ PASS' : '❌ FAIL'} (${reqRate.toFixed(2)}/s)`);
  console.log(`  ✓ p95 latency < 100ms:     ${p95 < 100 ? '✅ PASS' : '❌ FAIL'} (${p95.toFixed(2)}ms)`);
  console.log(`  ✓ Error rate < 1%:         ${errorRate < 1 ? '✅ PASS' : '❌ FAIL'} (${errorRate.toFixed(2)}%)`);
  console.log('='.repeat(60));
  
  return {
    'stdout': JSON.stringify(data, null, 2),
    'summary.json': JSON.stringify(data),
  };
}
