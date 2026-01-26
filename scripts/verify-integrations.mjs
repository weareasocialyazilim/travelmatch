#!/usr/bin/env node
/**
 * Integration Verification Script
 * Validates connectivity to all external services
 * Usage: pnpm verify:integrations
 */

import https from 'https';

const CHECKS = [
  {
    name: 'Supabase URL',
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    required: true,
  },
  {
    name: 'Mapbox API',
    url: 'https://api.mapbox.com',
    required: !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  },
  {
    name: 'Sentry Init',
    check: () => {
      const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.VITE_SENTRY_DSN;
      return { ok: !!sentryDsn, message: sentryDsn ? 'DSN configured' : 'DSN not set (optional)' };
    },
    required: false,
  },
  {
    name: 'PostHog Init',
    check: () => {
      const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY || process.env.VITE_POSTHOG_KEY;
      return { ok: !!posthogKey, message: posthogKey ? 'Key configured' : 'Key not set (optional)' };
    },
    required: false,
  },
];

function ping(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: 5000 }, (res) => {
      resolve({ ok: res.statusCode >= 200 && res.statusCode < 400 });
    });
    req.on('error', () => resolve({ ok: false }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false });
    });
  });
}

async function runChecks() {
  console.log('🔍 Running integration verification...\n');

  let allPassed = true;
  const results = [];

  for (const check of CHECKS) {
    let result;

    if (check.check) {
      result = check.check();
    } else if (check.url) {
      const ok = await ping(check.url);
      result = { ok, message: ok ? 'Reachable' : 'Unreachable' };
    }

    const status = result.ok ? '✅' : check.required ? '❌' : '⚠️';
    console.log(`${status} ${check.name}: ${result.message}`);

    if (!result.ok && check.required) {
      allPassed = false;
    }
  }

  console.log('\n' + '='.repeat(50));

  if (allPassed) {
    console.log('✅ All critical integrations verified');
    process.exit(0);
  } else {
    console.log('❌ Some integrations failed. Check required services.');
    process.exit(1);
  }
}

runChecks().catch((err) => {
  console.error('Verification error:', err.message);
  process.exit(1);
});
