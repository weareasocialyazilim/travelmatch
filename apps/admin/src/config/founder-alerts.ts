/**
 * Founder Alert Routing Configuration
 *
 * SAFE MODE: Default OFF
 * This feature is only visible to super_admin when enabled.
 *
 * TWO-LAYER FLAG MODEL:
 * ─────────────────────
 * 1. Client flag: NEXT_PUBLIC_FOUNDER_ALERTS_ENABLED
 *    → Controls UI visibility (alert card display)
 *    → Public: Anyone can see this exists
 *
 * 2. Server flag: FOUNDER_ALERTS_ENABLED
 *    → Controls API data access
 *    → Private: Server-only, actual data protection
 *
 * NO-NETWORK COMPLIANCE:
 * ─────────────────────
 * - No external API calls (Sentry, PostHog, etc.)
 * - Only internal database queries
 * - All data from existing tables
 *
 * AUTOMATION: NONE
 * ─────────────────
 * - This is purely visibility/awareness
 * - No automated actions, no notifications
 * - Founder decides what to do with alerts
 */

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE FLAGS (SAFE MODE - Default OFF)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * CLIENT FLAG: UI Visibility
 * When false: Alert card not visible
 * When true: super_admin sees alert routing card
 *
 * Reads from: NEXT_PUBLIC_FOUNDER_ALERTS_ENABLED
 * Default: false (SAFE MODE)
 */
export const FOUNDER_ALERTS_ENABLED =
  process.env.NEXT_PUBLIC_FOUNDER_ALERTS_ENABLED === 'true';

/**
 * SERVER FLAG: API Data Access
 * When false: API returns 403, no data exposure
 * When true: API returns alert data (still requires super_admin auth)
 *
 * Reads from: FOUNDER_ALERTS_ENABLED (private, server-only)
 * Default: false (SAFE MODE)
 *
 * SECURITY NOTE: This does NOT fall back to NEXT_PUBLIC_*
 * Server flag must be explicitly set for API to work.
 */
export function isFounderAlertsEnabled(): boolean {
  // ONLY check server-side env var - no fallback to public
  return process.env.FOUNDER_ALERTS_ENABLED === 'true';
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type AlertLevel = 'error' | 'warn' | 'info';

export type AlertSource =
  | 'integration_health_events'
  | 'internal_error_log'
  | 'triage_items'
  | 'security_logs'
  | 'moderation_logs';

export interface AlertDefinition {
  key: string;
  level: AlertLevel;
  title: string;
  description: string;
  source: AlertSource;
  query: AlertQuery;
  threshold: number;
  lookbackHours: number;
  cooldownMinutes: number; // Dedup window - alert won't appear "fresh" within this window
  actionUrl: string | null; // Link to relevant page for immediate action
  enabled: boolean;
}

export interface AlertQuery {
  table: string;
  countCondition: Record<string, unknown>;
  orderBy?: string;
}

export interface AlertItem {
  key: string;
  level: AlertLevel;
  title: string;
  shortDetail: string; // max 120 chars
  count: number;
  lastSeenAt: string | null;
  actionUrl: string | null; // Link to relevant page
  isFresh: boolean; // True if outside cooldown window (attention-worthy)
}

// ═══════════════════════════════════════════════════════════════════════════
// ALERT DEFINITIONS
// Uses only internal tables - NO external API calls
// ═══════════════════════════════════════════════════════════════════════════

export const ALERT_DEFINITIONS: AlertDefinition[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // ERROR LEVEL (Kritik - Hemen bakılmalı)
  // ─────────────────────────────────────────────────────────────────────────
  {
    key: 'integration_failures',
    level: 'error',
    title: 'Integration Failures',
    description: 'Entegrasyon hataları (failure/timeout)',
    source: 'integration_health_events',
    query: {
      table: 'integration_health_events',
      countCondition: {
        status: ['failure', 'timeout'],
      },
    },
    threshold: 5,
    lookbackHours: 24,
    cooldownMinutes: 60,
    actionUrl: '/integration-health',
    enabled: true,
  },
  {
    key: 'critical_errors',
    level: 'error',
    title: 'Critical Errors',
    description: 'Kritik seviye hatalar (internal_error_log)',
    source: 'internal_error_log',
    query: {
      table: 'internal_error_log',
      countCondition: {
        severity: ['critical'],
      },
    },
    threshold: 1,
    lookbackHours: 24,
    cooldownMinutes: 30, // Critical errors need faster refresh
    actionUrl: '/ops-dashboard',
    enabled: true,
  },
  {
    key: 'critical_triage',
    level: 'error',
    title: 'Critical Triage Queue',
    description: 'Kritik öncelikli bekleyen triage item\'ları',
    source: 'triage_items',
    query: {
      table: 'triage_items',
      countCondition: {
        status: ['pending', 'in_review'],
        priority: ['critical'],
      },
    },
    threshold: 1,
    lookbackHours: 24,
    cooldownMinutes: 30,
    actionUrl: '/triage?priority=critical&status=pending',
    enabled: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // WARN LEVEL (Uyarı - Yakın zamanda bakılmalı)
  // ─────────────────────────────────────────────────────────────────────────
  {
    key: 'high_risk_security',
    level: 'warn',
    title: 'High Risk Security Events',
    description: 'Yüksek risk skoru olan güvenlik olayları',
    source: 'security_logs',
    query: {
      table: 'security_logs',
      countCondition: {
        risk_score_gte: 70,
        event_status: ['failure', 'blocked'],
      },
    },
    threshold: 3,
    lookbackHours: 24,
    cooldownMinutes: 60,
    actionUrl: '/audit-logs?type=security',
    enabled: true,
  },
  {
    key: 'content_violations',
    level: 'warn',
    title: 'Content Violations',
    description: 'Yüksek seviye içerik ihlalleri',
    source: 'moderation_logs',
    query: {
      table: 'moderation_logs',
      countCondition: {
        severity: ['high', 'critical'],
        action_taken: ['blocked', 'flagged'],
      },
    },
    threshold: 5,
    lookbackHours: 24,
    cooldownMinutes: 60,
    actionUrl: '/triage?type=content_flag',
    enabled: true,
  },
  {
    key: 'triage_backlog',
    level: 'warn',
    title: 'Triage Backlog',
    description: 'Bekleyen triage item sayısı yüksek',
    source: 'triage_items',
    query: {
      table: 'triage_items',
      countCondition: {
        status: ['pending'],
      },
    },
    threshold: 20,
    lookbackHours: 168, // Weekly window
    cooldownMinutes: 120, // Backlog doesn't change fast
    actionUrl: '/triage?status=pending',
    enabled: true,
  },
  {
    key: 'error_spike',
    level: 'warn',
    title: 'Error Spike',
    description: 'Hata sayısında artış',
    source: 'internal_error_log',
    query: {
      table: 'internal_error_log',
      countCondition: {
        severity: ['error'],
      },
    },
    threshold: 20,
    lookbackHours: 24,
    cooldownMinutes: 60,
    actionUrl: '/ops-dashboard',
    enabled: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // INFO LEVEL (Bilgi - Farkındalık için)
  // ─────────────────────────────────────────────────────────────────────────
  {
    key: 'degraded_integrations',
    level: 'info',
    title: 'Degraded Integrations',
    description: 'Performansı düşük entegrasyonlar',
    source: 'integration_health_events',
    query: {
      table: 'integration_health_events',
      countCondition: {
        status: ['degraded'],
      },
    },
    threshold: 10,
    lookbackHours: 24,
    cooldownMinutes: 120,
    actionUrl: '/integration-health',
    enabled: true,
  },
  {
    key: 'login_failures',
    level: 'info',
    title: 'Login Failures',
    description: 'Başarısız giriş denemeleri',
    source: 'security_logs',
    query: {
      table: 'security_logs',
      countCondition: {
        event_type: ['login'],
        event_status: ['failure'],
      },
    },
    threshold: 50,
    lookbackHours: 24,
    cooldownMinutes: 120,
    actionUrl: '/audit-logs?type=security&event=login',
    enabled: true,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

export const ALERT_LEVEL_PRIORITY: Record<AlertLevel, number> = {
  error: 3,
  warn: 2,
  info: 1,
};

export const ALERT_LEVEL_LABELS: Record<AlertLevel, string> = {
  error: 'ERROR',
  warn: 'WARN',
  info: 'INFO',
};

export const ALERT_LEVEL_COLORS: Record<AlertLevel, string> = {
  error: 'text-red-400',
  warn: 'text-amber-400',
  info: 'text-blue-400',
};

// ═══════════════════════════════════════════════════════════════════════════
// ALERT BUDGET (Noise Control)
// Prevents alert fatigue by limiting alerts per level
// ═══════════════════════════════════════════════════════════════════════════

export const ALERT_LEVEL_BUDGET: Record<AlertLevel, number> = {
  error: 2, // Max 2 ERROR alerts in default view
  warn: 2,  // Max 2 WARN alerts in default view
  info: 1,  // Max 1 INFO alert in default view
};

export const MAX_ALERTS_DISPLAYED = 5; // Total max (sum of budgets = 5)
export const MAX_ALERTS_FETCHED = 10;  // Fetch more for "+N more" indicator
