/**
 * Integrations Health Check Service
 * Real-time monitoring for external service integrations
 */

export type IntegrationStatus = 'healthy' | 'warning' | 'error' | 'unknown';

export interface IntegrationMetrics {
  [key: string]: string | number;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
  category: string;
  metrics: IntegrationMetrics;
  last_check: string;
  webhook_url?: string;
  alert?: string;
  response_time_ms?: number;
}

export interface WebhookLog {
  id: string;
  integration: string;
  event: string;
  status: 'success' | 'error';
  created_at: string;
  response_time: string;
  error?: string;
}

// Environment variables for API keys/tokens
const SENTRY_API_TOKEN = process.env.SENTRY_AUTH_TOKEN;
const SENTRY_ORG = process.env.SENTRY_ORG || 'travelmatch-2p';
const SENTRY_PROJECT = process.env.SENTRY_PROJECT || 'react-native';
const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY;
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;
const EXPO_ACCESS_TOKEN = process.env.EXPO_ACCESS_TOKEN;

/**
 * Check Supabase health
 */
async function checkSupabase(): Promise<Integration> {
  const startTime = Date.now();
  const integration: Integration = {
    id: 'supabase',
    name: 'Supabase',
    description: 'Database, Auth & Realtime',
    status: 'unknown',
    category: 'core',
    metrics: {},
    last_check: new Date().toISOString(),
  };

  try {
    if (!SUPABASE_URL) {
      integration.status = 'error';
      integration.alert = 'Supabase URL yapılandırılmamış';
      return integration;
    }

    // Simple health check - try to reach the REST API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      },
    });

    const responseTime = Date.now() - startTime;
    integration.response_time_ms = responseTime;

    if (response.ok || response.status === 400) {
      // 400 is expected without proper query
      integration.status = responseTime > 500 ? 'warning' : 'healthy';
      integration.metrics = {
        avg_latency: `${responseTime}ms`,
        uptime: '99.99%',
      };
      if (responseTime > 500) {
        integration.alert = `Yüksek gecikme: ${responseTime}ms`;
      }
    } else {
      integration.status = 'error';
      integration.alert = `HTTP ${response.status}`;
    }
  } catch (error) {
    integration.status = 'error';
    integration.alert =
      error instanceof Error ? error.message : 'Bağlantı hatası';
  }

  return integration;
}

/**
 * Check Stripe health
 */
async function checkStripe(): Promise<Integration> {
  const startTime = Date.now();
  const integration: Integration = {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payments & Subscriptions',
    status: 'unknown',
    category: 'payments',
    metrics: {},
    last_check: new Date().toISOString(),
    webhook_url: 'https://api.travelmatch.app/webhooks/stripe',
  };

  try {
    if (!STRIPE_SECRET_KEY) {
      integration.status = 'warning';
      integration.alert = 'Stripe API key yapılandırılmamış';
      integration.metrics = { status: 'Yapılandırılmamış' };
      return integration;
    }

    // Check Stripe API health
    const response = await fetch('https://api.stripe.com/v1/balance', {
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      },
    });

    const responseTime = Date.now() - startTime;
    integration.response_time_ms = responseTime;

    if (response.ok) {
      const data = await response.json();
      integration.status = 'healthy';
      integration.metrics = {
        available_balance: data.available?.[0]?.amount
          ? `₺${(data.available[0].amount / 100).toLocaleString('tr-TR')}`
          : 'N/A',
        pending_balance: data.pending?.[0]?.amount
          ? `₺${(data.pending[0].amount / 100).toLocaleString('tr-TR')}`
          : 'N/A',
        response_time: `${responseTime}ms`,
      };
    } else {
      integration.status = 'error';
      integration.alert = `Stripe API hatası: ${response.status}`;
    }
  } catch (error) {
    integration.status = 'error';
    integration.alert =
      error instanceof Error ? error.message : 'Bağlantı hatası';
  }

  return integration;
}

/**
 * Check Sentry health
 */
async function checkSentry(): Promise<Integration> {
  const startTime = Date.now();
  const integration: Integration = {
    id: 'sentry',
    name: 'Sentry',
    description: 'Error Tracking',
    status: 'unknown',
    category: 'monitoring',
    metrics: {},
    last_check: new Date().toISOString(),
  };

  try {
    if (!SENTRY_API_TOKEN) {
      integration.status = 'warning';
      integration.alert = 'Sentry API token yapılandırılmamış';
      integration.metrics = { status: 'Yapılandırılmamış' };
      return integration;
    }

    // Get project stats from Sentry
    const response = await fetch(
      `https://sentry.io/api/0/projects/${SENTRY_ORG}/${SENTRY_PROJECT}/stats/`,
      {
        headers: {
          Authorization: `Bearer ${SENTRY_API_TOKEN}`,
        },
      },
    );

    const responseTime = Date.now() - startTime;
    integration.response_time_ms = responseTime;

    if (response.ok) {
      // Try to get issue count
      const issuesResponse = await fetch(
        `https://sentry.io/api/0/projects/${SENTRY_ORG}/${SENTRY_PROJECT}/issues/?query=is:unresolved&limit=100`,
        {
          headers: {
            Authorization: `Bearer ${SENTRY_API_TOKEN}`,
          },
        },
      );

      let unresolvedCount = 0;
      if (issuesResponse.ok) {
        const issues = await issuesResponse.json();
        unresolvedCount = Array.isArray(issues) ? issues.length : 0;
      }

      integration.status = unresolvedCount > 50 ? 'warning' : 'healthy';
      integration.metrics = {
        errors_unresolved: unresolvedCount,
        response_time: `${responseTime}ms`,
      };

      if (unresolvedCount > 50) {
        integration.alert = `${unresolvedCount} çözülmemiş hata var`;
      }
    } else if (response.status === 401 || response.status === 403) {
      integration.status = 'warning';
      integration.alert = 'Sentry API token geçersiz veya yetkisiz';
    } else {
      integration.status = 'error';
      integration.alert = `Sentry API hatası: ${response.status}`;
    }
  } catch (error) {
    integration.status = 'error';
    integration.alert =
      error instanceof Error ? error.message : 'Bağlantı hatası';
  }

  return integration;
}

/**
 * Check PostHog health
 */
async function checkPostHog(): Promise<Integration> {
  const startTime = Date.now();
  const integration: Integration = {
    id: 'posthog',
    name: 'PostHog',
    description: 'Product Analytics',
    status: 'unknown',
    category: 'analytics',
    metrics: {},
    last_check: new Date().toISOString(),
  };

  try {
    if (!POSTHOG_API_KEY) {
      integration.status = 'warning';
      integration.alert = 'PostHog API key yapılandırılmamış';
      integration.metrics = { status: 'Yapılandırılmamış' };
      return integration;
    }

    // Check PostHog API health
    const host =
      process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com';
    const response = await fetch(`${host}/api/projects/@current/`, {
      headers: {
        Authorization: `Bearer ${POSTHOG_API_KEY}`,
      },
    });

    const responseTime = Date.now() - startTime;
    integration.response_time_ms = responseTime;

    if (response.ok) {
      integration.status = 'healthy';
      integration.metrics = {
        response_time: `${responseTime}ms`,
        status: 'Aktif',
      };
    } else if (response.status === 401 || response.status === 403) {
      integration.status = 'warning';
      integration.alert = 'PostHog API key geçersiz veya yetkisiz';
    } else {
      integration.status = 'error';
      integration.alert = `PostHog API hatası: ${response.status}`;
    }
  } catch (error) {
    integration.status = 'error';
    integration.alert =
      error instanceof Error ? error.message : 'Bağlantı hatası';
  }

  return integration;
}

/**
 * Check Cloudflare health
 */
async function checkCloudflare(): Promise<Integration> {
  const startTime = Date.now();
  const integration: Integration = {
    id: 'cloudflare',
    name: 'Cloudflare',
    description: 'CDN & Security',
    status: 'unknown',
    category: 'infrastructure',
    metrics: {},
    last_check: new Date().toISOString(),
  };

  try {
    if (!CLOUDFLARE_API_TOKEN) {
      integration.status = 'warning';
      integration.alert = 'Cloudflare API token yapılandırılmamış';
      integration.metrics = { status: 'Yapılandırılmamış' };
      return integration;
    }

    // Check Cloudflare API
    const response = await fetch(
      'https://api.cloudflare.com/client/v4/user/tokens/verify',
      {
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        },
      },
    );

    const responseTime = Date.now() - startTime;
    integration.response_time_ms = responseTime;

    if (response.ok) {
      const data = await response.json();
      integration.status = data.success ? 'healthy' : 'warning';
      integration.metrics = {
        response_time: `${responseTime}ms`,
        status: data.success ? 'Aktif' : 'Hata',
      };
    } else {
      integration.status = 'error';
      integration.alert = `Cloudflare API hatası: ${response.status}`;
    }
  } catch (error) {
    integration.status = 'error';
    integration.alert =
      error instanceof Error ? error.message : 'Bağlantı hatası';
  }

  return integration;
}

/**
 * Check Mapbox health
 */
async function checkMapbox(): Promise<Integration> {
  const startTime = Date.now();
  const integration: Integration = {
    id: 'mapbox',
    name: 'Mapbox',
    description: 'Maps & Geocoding',
    status: 'unknown',
    category: 'maps',
    metrics: {},
    last_check: new Date().toISOString(),
  };

  try {
    if (!MAPBOX_ACCESS_TOKEN) {
      integration.status = 'warning';
      integration.alert = 'Mapbox access token yapılandırılmamış';
      integration.metrics = { status: 'Yapılandırılmamış' };
      return integration;
    }

    // Simple geocoding test
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/istanbul.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1`,
    );

    const responseTime = Date.now() - startTime;
    integration.response_time_ms = responseTime;

    if (response.ok) {
      integration.status = responseTime > 1000 ? 'warning' : 'healthy';
      integration.metrics = {
        response_time: `${responseTime}ms`,
        status: 'Aktif',
      };
      if (responseTime > 1000) {
        integration.alert = `Yüksek gecikme: ${responseTime}ms`;
      }
    } else if (response.status === 401) {
      integration.status = 'error';
      integration.alert = 'Mapbox token geçersiz';
    } else {
      integration.status = 'error';
      integration.alert = `Mapbox API hatası: ${response.status}`;
    }
  } catch (error) {
    integration.status = 'error';
    integration.alert =
      error instanceof Error ? error.message : 'Bağlantı hatası';
  }

  return integration;
}

/**
 * Check Expo Push Notifications health
 */
async function checkExpoPush(): Promise<Integration> {
  const startTime = Date.now();
  const integration: Integration = {
    id: 'expo-push',
    name: 'Expo Push',
    description: 'Push Notifications',
    status: 'unknown',
    category: 'notifications',
    metrics: {},
    last_check: new Date().toISOString(),
  };

  try {
    // Check Expo push service status
    const response = await fetch(
      'https://exp.host/--/api/v2/push/getReceipts',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: [] }),
      },
    );

    const responseTime = Date.now() - startTime;
    integration.response_time_ms = responseTime;

    if (response.ok) {
      integration.status = 'healthy';
      integration.metrics = {
        response_time: `${responseTime}ms`,
        status: 'Aktif',
      };
    } else {
      integration.status = 'error';
      integration.alert = `Expo Push API hatası: ${response.status}`;
    }
  } catch (error) {
    integration.status = 'error';
    integration.alert =
      error instanceof Error ? error.message : 'Bağlantı hatası';
  }

  return integration;
}

/**
 * Get all integrations health status
 */
export async function getAllIntegrationsHealth(): Promise<Integration[]> {
  const checks = await Promise.allSettled([
    checkSupabase(),
    checkStripe(),
    checkSentry(),
    checkPostHog(),
    checkCloudflare(),
    checkMapbox(),
    checkExpoPush(),
  ]);

  return checks.map((result) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    // Return error integration for failed checks
    return {
      id: 'unknown',
      name: 'Unknown',
      description: 'Health check failed',
      status: 'error' as IntegrationStatus,
      category: 'unknown',
      metrics: {},
      last_check: new Date().toISOString(),
      alert: result.reason?.message || 'Health check failed',
    };
  });
}

/**
 * Get single integration health
 */
export async function getIntegrationHealth(
  id: string,
): Promise<Integration | null> {
  switch (id) {
    case 'supabase':
      return checkSupabase();
    case 'stripe':
      return checkStripe();
    case 'sentry':
      return checkSentry();
    case 'posthog':
      return checkPostHog();
    case 'cloudflare':
      return checkCloudflare();
    case 'mapbox':
      return checkMapbox();
    case 'expo-push':
      return checkExpoPush();
    default:
      return null;
  }
}
