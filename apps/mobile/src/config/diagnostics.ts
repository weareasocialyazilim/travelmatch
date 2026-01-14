/**
 * Mobile Diagnostics Configuration
 *
 * SAFE MODE: Default OFF
 * This feature provides read-only diagnostic information for debugging.
 *
 * NO-NETWORK COMPLIANCE:
 * ─────────────────────
 * - No external API calls
 * - No Sentry/PostHog uploads from diagnostics
 * - Only local storage reads
 * - Only device info queries
 *
 * PII COMPLIANCE:
 * ─────────────────
 * - No email/phone/token in logs
 * - All sensitive data masked
 * - No user content captured
 *
 * ACCESS:
 * ─────────────────
 * - Hidden screen (not in navigation menu)
 * - Requires gesture to access (7 taps on version)
 * - Only available when flag is ON
 */

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE FLAG (SAFE MODE - Default OFF)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Enable/disable Mobile Diagnostics screen
 *
 * When false: Gesture does nothing, screen inaccessible
 * When true: 7-tap gesture on version opens diagnostics
 *
 * Reads from: EXPO_PUBLIC_MOBILE_DIAGNOSTICS_ENABLED
 * Default: false (SAFE MODE)
 *
 * To enable:
 * - Set EXPO_PUBLIC_MOBILE_DIAGNOSTICS_ENABLED=true in .env
 * - Or enable in dev mode with __DEV__
 */
export const MOBILE_DIAGNOSTICS_ENABLED =
  process.env.EXPO_PUBLIC_MOBILE_DIAGNOSTICS_ENABLED === 'true' || __DEV__;

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/** Number of taps required to open diagnostics */
export const DIAGNOSTICS_TAP_COUNT = 7;

/** Time window for tap sequence (ms) */
export const DIAGNOSTICS_TAP_WINDOW = 3000;

/** Maximum errors to keep in ring buffer */
export const MAX_ERROR_LOG_SIZE = 50;

/** Maximum performance snapshots to keep */
export const MAX_PERFORMANCE_LOG_SIZE = 50;

/** Storage keys for diagnostics data */
export const DIAGNOSTICS_STORAGE_KEYS = {
  ERROR_LOG: '@diagnostics/error_log',
  PERFORMANCE_LOG: '@diagnostics/performance_log',
  LAST_CLEAR: '@diagnostics/last_clear',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type ErrorLogLevel = 'info' | 'warning' | 'error' | 'critical';

export type ErrorSource =
  | 'network'
  | 'timeout'
  | 'auth'
  | 'validation'
  | 'exception'
  | 'boundary'
  | 'unknown';

export interface DiagnosticsErrorEntry {
  id: string;
  timestamp: string;
  level: ErrorLogLevel;
  source: ErrorSource;
  screenName: string | null;
  message: string; // Truncated, PII-scrubbed
  code: string | null;
}

export interface DiagnosticsPerformanceEntry {
  id: string;
  timestamp: string;
  screenName: string;
  ttiMs: number; // Time to Interactive in milliseconds
}

export interface DiagnosticsConfigSanity {
  supabaseUrl: 'ok' | 'missing' | 'invalid';
  supabaseAnonKey: 'ok' | 'missing';
  serviceRoleKeyLeak: boolean; // CRITICAL if true
  authState: 'logged_in' | 'logged_out' | 'unknown';
}

export interface DiagnosticsBuildInfo {
  appVersion: string;
  buildNumber: string | null;
  commitHash: string | null;
  platform: 'ios' | 'android' | 'web';
  osVersion: string;
  deviceModel: string | null;
  envName: 'development' | 'staging' | 'production';
}

export interface DiagnosticsSummary {
  buildInfo: DiagnosticsBuildInfo;
  configSanity: DiagnosticsConfigSanity;
  errorCount: number;
  lastError: DiagnosticsErrorEntry | null;
  topSlowScreens: Array<{
    screenName: string;
    avgTtiMs: number;
    count: number;
  }>;
  generatedAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// PII PATTERNS (for scrubbing)
// ═══════════════════════════════════════════════════════════════════════════

export const PII_PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  phone:
    /(\+?[0-9]{1,4}[-.\s]?)?(\([0-9]{1,4}\)[-.\s]?)?[0-9]{1,4}[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,9}/g,
  token: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g, // JWT
  uuid: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
  apiKey:
    /(key|token|secret|password|api_key|apikey)[=:]\s*['"]?[a-zA-Z0-9_-]{16,}['"]?/gi,
};

export const PII_MASK = '[REDACTED]';
