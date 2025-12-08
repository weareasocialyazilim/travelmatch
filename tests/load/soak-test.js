/**
 * Soak Test - Long duration stability test
 * 
 * Tests for memory leaks, resource exhaustion, degradation over time
 * 
 * Usage:
 *   k6 run tests/load/soak-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'https://your-project.supabase.co';
const ANON_KEY = __ENV.SUPABASE_ANON_KEY || 'your-anon-key';

const errorRate = new Rate('errors');
const latencyTrend = new Trend('latency_trend');

export const options = {
  stages: [
    { duration: '5m', target: 500 },     // Ramp up
    { duration: '2h', target: 500 },     // Stay at 500 for 2 hours
    { duration: '5m', target: 0 },       // Ramp down
  ],
  
  thresholds: {
    'errors': ['rate<0.01'],  // < 1% errors over 2 hours
    'http_req_duration': ['p(95)<100'],  // Maintain performance
    'latency_trend': ['p(95)<100'],  // No degradation
  },
};

let requestCount = 0;

export default function () {
  requestCount++;
  const startTime = Date.now();
  
  const res = http.get(
    `${BASE_URL}/rest/v1/moments?select=*&limit=20`,
    {
      headers: {
        'apikey': ANON_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
  
  const latency = Date.now() - startTime;
  latencyTrend.add(latency);
  
  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'no degradation': () => latency < 200,
  });
  
  if (!success) {
    errorRate.add(1);
  }
  
  // Log every 1000 requests to monitor trends
  if (requestCount % 1000 === 0) {
    console.log(`Requests: ${requestCount}, Last latency: ${latency}ms`);
  }
  
  sleep(1);
}

export function handleSummary(data) {
  const duration = data.state.testRunDurationMs / (1000 * 60 * 60); // hours
  const errorRateValue = data.metrics.errors ? data.metrics.errors.values.rate * 100 : 0;
  const avgLatency = data.metrics.http_req_duration.values.avg;
  const p95Latency = data.metrics.http_req_duration.values['p(95)'];
  
  console.log('');
  console.log('='.repeat(60));
  console.log('SOAK TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`Duration:        ${duration.toFixed(2)} hours`);
  console.log(`Total Requests:  ${data.metrics.http_reqs.values.count}`);
  console.log(`Error Rate:      ${errorRateValue.toFixed(2)}%`);
  console.log(`Avg Latency:     ${avgLatency.toFixed(2)}ms`);
  console.log(`p95 Latency:     ${p95Latency.toFixed(2)}ms`);
  console.log('');
  console.log('Stability Analysis:');
  if (errorRateValue > 1) {
    console.log('  ❌ High error rate - possible memory leak or resource exhaustion');
  } else if (p95Latency > 150) {
    console.log('  ⚠️  Performance degradation detected over time');
  } else {
    console.log('  ✅ System remained stable over extended period');
  }
  console.log('='.repeat(60));
  
  return {
    'soak-test-results.json': JSON.stringify(data),
  };
}
