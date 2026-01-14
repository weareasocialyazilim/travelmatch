/**
 * Integration Health Logger
 *
 * SAFE MODE: Gercek ping YAPMAZ
 * Log-based yaklasim: Entegrasyon kullanildiginda event loglar
 * Admin UI sadece bu log'lari gosterir
 */

import { getClient } from './supabase';
import { logger } from './logger';

// =====================================================
// TYPES
// =====================================================

export type IntegrationName =
  | 'supabase'
  | 'stripe'
  | 'twilio'
  | 'sendgrid'
  | 'posthog'
  | 'sentry'
  | 'openai'
  | 'mapbox'
  | 'cloudflare'
  | 'vercel'
  | 'expo'
  | 'apple_push'
  | 'google_push'
  | 'custom';

export type IntegrationEventType =
  | 'health_check'
  | 'api_call'
  | 'webhook'
  | 'connection'
  | 'authentication';

export type IntegrationStatus = 'success' | 'failure' | 'timeout' | 'degraded';

export interface IntegrationHealthEvent {
  integrationName: IntegrationName;
  eventType: IntegrationEventType;
  status: IntegrationStatus;
  responseTimeMs?: number;
  statusCode?: number;
  errorCode?: string;
  errorMessage?: string;
  endpoint?: string;
  method?: string;
  metadata?: Record<string, unknown>;
}

export interface IntegrationHealthSummary {
  integrationName: IntegrationName;
  displayName: string;
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  lastCheck: string | null;
  successRate: number;
  avgResponseTime: number;
  totalEvents24h: number;
  failures24h: number;
}

// =====================================================
// CONSTANTS
// =====================================================

export const INTEGRATION_DISPLAY_NAMES: Record<IntegrationName, string> = {
  supabase: 'Supabase',
  stripe: 'Stripe',
  twilio: 'Twilio',
  sendgrid: 'SendGrid',
  posthog: 'PostHog',
  sentry: 'Sentry',
  openai: 'OpenAI',
  mapbox: 'Mapbox',
  cloudflare: 'Cloudflare',
  vercel: 'Vercel',
  expo: 'Expo Push',
  apple_push: 'Apple Push',
  google_push: 'Google Push',
  custom: 'Custom',
};

// =====================================================
// LOGGING FUNCTIONS (SAFE MODE - No real pings)
// =====================================================

/**
 * Log an integration health event
 * Bu fonksiyon entegrasyon kullanildigi yerde cagrilmalidir
 * Gercek ping YAPMAZ, sadece event log'lar
 */
export async function logIntegrationEvent(
  event: IntegrationHealthEvent,
): Promise<void> {
  // SAFE MODE: Sadece log, gercek DB insert yok
  // Gercek entegrasyon icin asagidaki kodu aktif edin

  logger.info('Integration health event logged (mock)', {
    integration: event.integrationName,
    status: event.status,
    responseTime: event.responseTimeMs,
  });

  // Gercek DB insert icin:
  // try {
  //   const supabase = getClient();
  //   await supabase.from('integration_health_events').insert({
  //     integration_name: event.integrationName,
  //     event_type: event.eventType,
  //     status: event.status,
  //     response_time_ms: event.responseTimeMs,
  //     status_code: event.statusCode,
  //     error_code: event.errorCode,
  //     error_message: event.errorMessage,
  //     endpoint: event.endpoint,
  //     method: event.method,
  //     metadata: event.metadata || {},
  //   });
  // } catch (error) {
  //   logger.error('Failed to log integration health event', error);
  // }
}

/**
 * Wrapper to measure and log integration calls
 * Kullanim: const result = await withIntegrationHealth('stripe', () => stripe.charges.create(...));
 */
export async function withIntegrationHealth<T>(
  integrationName: IntegrationName,
  endpoint: string,
  fn: () => Promise<T>,
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await fn();
    const responseTime = Date.now() - startTime;

    await logIntegrationEvent({
      integrationName,
      eventType: 'api_call',
      status: 'success',
      responseTimeMs: responseTime,
      endpoint,
    });

    return result;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    await logIntegrationEvent({
      integrationName,
      eventType: 'api_call',
      status: 'failure',
      responseTimeMs: responseTime,
      endpoint,
      errorMessage,
    });

    throw error;
  }
}

// =====================================================
// MOCK DATA GENERATION (For UI Display)
// =====================================================

/**
 * Generate mock health summary data for UI display
 * SAFE MODE: Gercek data yerine mock data
 */
export function generateMockHealthSummaries(): IntegrationHealthSummary[] {
  return [
    {
      integrationName: 'supabase',
      displayName: 'Supabase',
      status: 'healthy',
      lastCheck: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      successRate: 99.8,
      avgResponseTime: 45,
      totalEvents24h: 15420,
      failures24h: 3,
    },
    {
      integrationName: 'stripe',
      displayName: 'Stripe',
      status: 'healthy',
      lastCheck: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      successRate: 99.9,
      avgResponseTime: 320,
      totalEvents24h: 1250,
      failures24h: 1,
    },
    {
      integrationName: 'twilio',
      displayName: 'Twilio',
      status: 'healthy',
      lastCheck: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      successRate: 99.5,
      avgResponseTime: 180,
      totalEvents24h: 890,
      failures24h: 4,
    },
    {
      integrationName: 'sendgrid',
      displayName: 'SendGrid',
      status: 'healthy',
      lastCheck: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
      successRate: 99.7,
      avgResponseTime: 250,
      totalEvents24h: 2340,
      failures24h: 7,
    },
    {
      integrationName: 'posthog',
      displayName: 'PostHog',
      status: 'healthy',
      lastCheck: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
      successRate: 100,
      avgResponseTime: 85,
      totalEvents24h: 45000,
      failures24h: 0,
    },
    {
      integrationName: 'sentry',
      displayName: 'Sentry',
      status: 'healthy',
      lastCheck: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
      successRate: 99.9,
      avgResponseTime: 120,
      totalEvents24h: 3500,
      failures24h: 2,
    },
    {
      integrationName: 'openai',
      displayName: 'OpenAI',
      status: 'degraded',
      lastCheck: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      successRate: 97.5,
      avgResponseTime: 1250,
      totalEvents24h: 560,
      failures24h: 14,
    },
    {
      integrationName: 'mapbox',
      displayName: 'Mapbox',
      status: 'healthy',
      lastCheck: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
      successRate: 99.8,
      avgResponseTime: 95,
      totalEvents24h: 8900,
      failures24h: 2,
    },
  ];
}

/**
 * Get health status from success rate
 */
export function getHealthStatus(
  successRate: number,
): 'healthy' | 'degraded' | 'down' {
  if (successRate >= 99) return 'healthy';
  if (successRate >= 95) return 'degraded';
  return 'down';
}
