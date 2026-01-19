import http from 'k6/http';
import { check, sleep } from 'k6';

// Run with: k6 run script.js
// Install k6: brew install k6

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Hackers/Curious folks (Warm up)
    { duration: '1m', target: 50 }, // Normal load
    { duration: '30s', target: 0 }, // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
  },
};

const BASE_URL = 'https://YOUR_PROJECT_REF.supabase.co/functions/v1';
const ANON_KEY = 'YOUR_ANON_KEY';

export default function () {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ANON_KEY}`,
    },
  };

  // 1. Health Check (Basic connectivity)
  const res1 = http.get(`${BASE_URL}/system-health`, params);
  check(res1, {
    'health status is 200': (r) => r.status === 200,
  });

  // 2. Discovery Feed (Heavy read)
  // Simulate fetching nearby users (mock endpoint call if protected)
  // const res2 = http.get(`${BASE_URL}/discovery?lat=41.0&lng=29.0`, params);

  sleep(1);
}
