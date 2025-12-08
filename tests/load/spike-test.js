/**
 * Spike Test - Test system behavior under sudden traffic spikes
 * 
 * Simulates flash sales, viral moments, or sudden traffic bursts
 * 
 * Usage:
 *   k6 run tests/load/spike-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'https://your-project.supabase.co';
const ANON_KEY = __ENV.SUPABASE_ANON_KEY || 'your-anon-key';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 100 },    // Normal load
    { duration: '10s', target: 2000 },   // Spike to 2000 users!
    { duration: '1m', target: 2000 },    // Stay at spike
    { duration: '10s', target: 100 },    // Drop back to normal
    { duration: '30s', target: 100 },    // Recovery period
  ],
  
  thresholds: {
    'errors': ['rate<0.05'],  // Allow 5% errors during spike
    'http_req_duration': ['p(95)<500'],  // Relaxed threshold for spike
  },
};

export default function () {
  const res = http.get(
    `${BASE_URL}/rest/v1/moments?select=*&limit=10`,
    {
      headers: {
        'apikey': ANON_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
  
  check(res, {
    'status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  sleep(1);
}
