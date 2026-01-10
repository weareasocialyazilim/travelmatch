/**
 * Server-side Tracking Utilities
 *
 * Functions for tracking events from server components.
 * Integrates with Supabase for bot logging and PostHog for analytics.
 */

// Event types for tracking
export interface TrackingEvent {
  event: string;
  properties: Record<string, unknown>;
  timestamp: string;
  source: 'server' | 'middleware';
}

// Bot log entry structure
export interface BotLogEntry {
  url: string;
  bot_type: string;
  city?: string;
  intent?: string;
  lang?: string;
  timestamp: string;
  user_agent?: string;
}

/**
 * Track a server-side event
 * In production, this sends to your analytics service
 */
export async function trackServerEvent(
  event: string,
  properties: Record<string, unknown>
): Promise<void> {
  const timestamp = new Date().toISOString();

  const trackingEvent: TrackingEvent = {
    event,
    properties,
    timestamp,
    source: 'server',
  };

  // Log for Vercel/server logs
  console.log('[TRACKING]', JSON.stringify(trackingEvent));

  // In production, send to PostHog or your analytics service:
  // if (process.env.POSTHOG_API_KEY) {
  //   await fetch('https://app.posthog.com/capture/', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       api_key: process.env.POSTHOG_API_KEY,
  //       event,
  //       properties: {
  //         ...properties,
  //         $timestamp: timestamp,
  //       },
  //       distinct_id: 'server',
  //     }),
  //   }).catch(() => {});
  // }
}

/**
 * Log a bot visit to Supabase
 * Tracks which bots are crawling which pages
 */
export async function logBotVisit(entry: BotLogEntry): Promise<void> {
  // Log for debugging
  console.log('[BOT_LOG]', JSON.stringify(entry));

  // In production, send to Supabase:
  // const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  //
  // if (supabaseUrl && supabaseKey) {
  //   await fetch(`${supabaseUrl}/rest/v1/bot_logs`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'apikey': supabaseKey,
  //       'Authorization': `Bearer ${supabaseKey}`,
  //     },
  //     body: JSON.stringify(entry),
  //   }).catch(() => {});
  // }
}

/**
 * Track page view with city/intent context
 */
export async function trackPageView(
  city: string,
  intent: string,
  lang: string
): Promise<void> {
  await trackServerEvent('page_view', {
    city,
    intent,
    lang,
    page_type: 'dynamic_pseo',
  });
}

/**
 * Track conversion event (unlock button click)
 */
export async function trackConversion(
  city: string,
  intent: string,
  source: string
): Promise<void> {
  await trackServerEvent('conversion_click', {
    city,
    intent,
    source,
    action: 'unlock_button',
  });
}

/**
 * Get analytics summary (placeholder for dashboard)
 */
export function getAnalyticsSummary(): {
  totalPageViews: number;
  botVisits: number;
  topCities: string[];
  topIntents: string[];
} {
  // In production, fetch from your analytics database
  return {
    totalPageViews: 0,
    botVisits: 0,
    topCities: [],
    topIntents: [],
  };
}
