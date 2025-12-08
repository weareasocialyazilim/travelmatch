/**
 * Stress Test - Find system breaking point
 * 
 * Gradually increases load until system starts failing
 * 
 * Usage:
 *   k6 run tests/load/stress-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'https://your-project.supabase.co';
const ANON_KEY = __ENV.SUPABASE_ANON_KEY || 'your-anon-key';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '1m', target: 500 },     // Ramp to 500
    { duration: '2m', target: 1000 },    // Ramp to 1000
    { duration: '2m', target: 2000 },    // Ramp to 2000
    { duration: '2m', target: 3000 },    // Ramp to 3000
    { duration: '2m', target: 4000 },    // Ramp to 4000 (likely breaking point)
    { duration: '1m', target: 0 },       // Cool down
  ],
  
  thresholds: {
    'http_req_duration': ['p(95)<1000'],  // Allow degraded performance
  },
};

export default function () {
  const res = http.get(
    `${BASE_URL}/rest/v1/moments?select=*&limit=20`,
    {
      headers: {
        'apikey': ANON_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
  
  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 1s': (r) => r.timings.duration < 1000,
  });
  
  if (!success) {
    errorRate.add(1);
  }
  
  sleep(1);
}

export function handleSummary(data) {
  const errorRateValue = data.metrics.errors ? data.metrics.errors.values.rate * 100 : 0;
  const p95 = data.metrics.http_req_duration.values['p(95)'];
  
  console.log('');
  console.log('='.repeat(60));
  console.log('STRESS TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`Error Rate:      ${errorRateValue.toFixed(2)}%`);
  console.log(`p95 Latency:     ${p95.toFixed(2)}ms`);
  console.log(`Max VUs:         ${data.state.maxVUs}`);
  console.log('');
  console.log('Breaking Point Analysis:');
  if (errorRateValue > 10) {
    console.log('  ⚠️  System started failing at high load');
  } else if (p95 > 1000) {
    console.log('  ⚠️  System became too slow at high load');
  } else {
    console.log('  ✅ System handled stress test well');
  }
  console.log('='.repeat(60));
  
  return {
    'stress-test-results.json': JSON.stringify(data),
  };
}
