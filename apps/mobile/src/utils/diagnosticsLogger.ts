/**
 * Diagnostics Logger
 *
 * Local ring buffer for error and performance logging.
 * NO-NETWORK: All data stored locally, never uploaded.
 * PII-SCRUBBED: All sensitive data masked before storage.
 *
 * SAFE MODE Compliance:
 * - Read-only from diagnostic screen perspective
 * - Writes only from error handlers / performance monitors
 * - No external API calls
 * - Auto-cleanup of old entries
 */

import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { storage } from './storage';
import {
  DIAGNOSTICS_STORAGE_KEYS,
  MAX_ERROR_LOG_SIZE,
  MAX_PERFORMANCE_LOG_SIZE,
  PII_PATTERNS,
  PII_MASK,
  type DiagnosticsErrorEntry,
  type DiagnosticsPerformanceEntry,
  type DiagnosticsBuildInfo,
  type DiagnosticsConfigSanity,
  type DiagnosticsSummary,
  type ErrorLogLevel,
  type ErrorSource,
} from '../config/diagnostics';

// ═══════════════════════════════════════════════════════════════════════════
// PII SCRUBBING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Remove PII from a string
 * Masks emails, phones, tokens, UUIDs, API keys
 */
export function scrubPII(text: string): string {
  if (!text) return '';

  let scrubbed = text;

  // Apply all PII patterns
  scrubbed = scrubbed.replace(PII_PATTERNS.email, PII_MASK);
  scrubbed = scrubbed.replace(PII_PATTERNS.phone, PII_MASK);
  scrubbed = scrubbed.replace(PII_PATTERNS.token, PII_MASK);
  scrubbed = scrubbed.replace(PII_PATTERNS.uuid, PII_MASK);
  scrubbed = scrubbed.replace(PII_PATTERNS.apiKey, PII_MASK);

  return scrubbed;
}

/**
 * Truncate string to max length
 */
function truncate(text: string, maxLength: number = 200): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// ═══════════════════════════════════════════════════════════════════════════
// RING BUFFER HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function addToRingBuffer<T>(buffer: T[], item: T, maxSize: number): T[] {
  const newBuffer = [...buffer, item];
  if (newBuffer.length > maxSize) {
    return newBuffer.slice(-maxSize);
  }
  return newBuffer;
}

// ═══════════════════════════════════════════════════════════════════════════
// ERROR LOGGING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get stored error log
 */
export function getErrorLog(): DiagnosticsErrorEntry[] {
  try {
    const stored = storage.getString(DIAGNOSTICS_STORAGE_KEYS.ERROR_LOG);
    if (!stored) return [];
    return JSON.parse(stored) as DiagnosticsErrorEntry[];
  } catch {
    return [];
  }
}

/**
 * Log an error to diagnostics ring buffer
 * Called from ErrorHandler / ErrorBoundary
 */
export function logDiagnosticsError(params: {
  level: ErrorLogLevel;
  source: ErrorSource;
  screenName?: string | null;
  message: string;
  code?: string | null;
}): void {
  try {
    const currentLog = getErrorLog();

    const entry: DiagnosticsErrorEntry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      level: params.level,
      source: params.source,
      screenName: params.screenName || null,
      message: truncate(scrubPII(params.message)),
      code: params.code || null,
    };

    const updatedLog = addToRingBuffer(currentLog, entry, MAX_ERROR_LOG_SIZE);
    storage.set(DIAGNOSTICS_STORAGE_KEYS.ERROR_LOG, JSON.stringify(updatedLog));
  } catch {
    // Silent fail - diagnostics should never crash the app
  }
}

/**
 * Clear error log
 */
export function clearErrorLog(): void {
  try {
    storage.delete(DIAGNOSTICS_STORAGE_KEYS.ERROR_LOG);
    storage.set(DIAGNOSTICS_STORAGE_KEYS.LAST_CLEAR, new Date().toISOString());
  } catch {
    // Silent fail
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PERFORMANCE LOGGING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get stored performance log
 */
export function getPerformanceLog(): DiagnosticsPerformanceEntry[] {
  try {
    const stored = storage.getString(DIAGNOSTICS_STORAGE_KEYS.PERFORMANCE_LOG);
    if (!stored) return [];
    return JSON.parse(stored) as DiagnosticsPerformanceEntry[];
  } catch {
    return [];
  }
}

/**
 * Log a screen TTI measurement
 */
export function logScreenTTI(screenName: string, ttiMs: number): void {
  try {
    const currentLog = getPerformanceLog();

    const entry: DiagnosticsPerformanceEntry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      screenName,
      ttiMs: Math.round(ttiMs),
    };

    const updatedLog = addToRingBuffer(
      currentLog,
      entry,
      MAX_PERFORMANCE_LOG_SIZE,
    );
    storage.set(
      DIAGNOSTICS_STORAGE_KEYS.PERFORMANCE_LOG,
      JSON.stringify(updatedLog),
    );
  } catch {
    // Silent fail
  }
}

/**
 * Clear performance log
 */
export function clearPerformanceLog(): void {
  try {
    storage.delete(DIAGNOSTICS_STORAGE_KEYS.PERFORMANCE_LOG);
    storage.set(DIAGNOSTICS_STORAGE_KEYS.LAST_CLEAR, new Date().toISOString());
  } catch {
    // Silent fail
  }
}

/**
 * Get top N slowest screens by average TTI
 */
export function getTopSlowScreens(limit: number = 5): Array<{
  screenName: string;
  avgTtiMs: number;
  count: number;
}> {
  const log = getPerformanceLog();

  // Group by screen name
  const screenStats = new Map<string, { total: number; count: number }>();

  for (const entry of log) {
    const existing = screenStats.get(entry.screenName) || {
      total: 0,
      count: 0,
    };
    screenStats.set(entry.screenName, {
      total: existing.total + entry.ttiMs,
      count: existing.count + 1,
    });
  }

  // Calculate averages and sort
  const result = Array.from(screenStats.entries())
    .map(([screenName, stats]) => ({
      screenName,
      avgTtiMs: Math.round(stats.total / stats.count),
      count: stats.count,
    }))
    .sort((a, b) => b.avgTtiMs - a.avgTtiMs)
    .slice(0, limit);

  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// BUILD INFO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get build and runtime information
 * NO-NETWORK: All info is local device/app info
 */
export function getBuildInfo(): DiagnosticsBuildInfo {
  const expoConfig = Constants.expoConfig;

  // Determine environment
  let envName: 'development' | 'staging' | 'production' = 'development';
  if (__DEV__) {
    envName = 'development';
  } else if (process.env.EXPO_PUBLIC_ENV_NAME === 'staging') {
    envName = 'staging';
  } else {
    envName = 'production';
  }

  return {
    appVersion:
      Application.nativeApplicationVersion || expoConfig?.version || '0.0.0',
    buildNumber: Application.nativeBuildVersion || null,
    commitHash: expoConfig?.extra?.commitHash || null,
    platform: Platform.OS as 'ios' | 'android' | 'web',
    osVersion: `${Platform.OS} ${Platform.Version}`,
    deviceModel: Device.modelName || null,
    envName,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIG SANITY CHECK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check Supabase configuration sanity
 * NO-NETWORK: Only checks if env vars are present, doesn't ping
 */
export function getConfigSanity(): DiagnosticsConfigSanity {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  // Check for service role key leak (CRITICAL security issue)
  const allEnvKeys = Object.keys(process.env);
  const hasServiceRoleKey = allEnvKeys.some(
    (key) =>
      key.toLowerCase().includes('service_role') ||
      (process.env[key]?.includes('service_role') ?? false),
  );

  // Determine auth state from storage (no network call)
  let authState: 'logged_in' | 'logged_out' | 'unknown' = 'unknown';
  try {
    const authSession = storage.getString('supabase.auth.token');
    if (authSession) {
      authState = 'logged_in';
    } else {
      authState = 'logged_out';
    }
  } catch {
    authState = 'unknown';
  }

  return {
    supabaseUrl: !supabaseUrl
      ? 'missing'
      : supabaseUrl.startsWith('https://')
        ? 'ok'
        : 'invalid',
    supabaseAnonKey: supabaseAnonKey ? 'ok' : 'missing',
    serviceRoleKeyLeak: hasServiceRoleKey,
    authState,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate full diagnostics summary
 * NO-NETWORK: All data is local
 * PII-SCRUBBED: Safe to copy/share
 */
export function getDiagnosticsSummary(): DiagnosticsSummary {
  const errorLog = getErrorLog();
  const lastError = errorLog.length > 0 ? errorLog[errorLog.length - 1] : null;

  return {
    buildInfo: getBuildInfo(),
    configSanity: getConfigSanity(),
    errorCount: errorLog.length,
    lastError,
    topSlowScreens: getTopSlowScreens(5),
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate copyable text summary
 * PII-SCRUBBED: Safe to share
 */
export function getDiagnosticsSummaryText(): string {
  const summary = getDiagnosticsSummary();
  const { buildInfo, configSanity, errorCount, topSlowScreens } = summary;

  const lines = [
    '═══ TravelMatch Diagnostics ═══',
    '',
    '📱 Build Info:',
    `  Version: ${buildInfo.appVersion} (${buildInfo.buildNumber || 'N/A'})`,
    `  Platform: ${buildInfo.platform} ${buildInfo.osVersion}`,
    `  Device: ${buildInfo.deviceModel || 'Unknown'}`,
    `  Environment: ${buildInfo.envName}`,
    '',
    '⚙️ Config Sanity:',
    `  Supabase URL: ${configSanity.supabaseUrl === 'ok' ? '✅' : '❌'} ${configSanity.supabaseUrl}`,
    `  Supabase Key: ${configSanity.supabaseAnonKey === 'ok' ? '✅' : '❌'} ${configSanity.supabaseAnonKey}`,
    `  Service Role Leak: ${configSanity.serviceRoleKeyLeak ? '🚨 DETECTED' : '✅ None'}`,
    `  Auth State: ${configSanity.authState}`,
    '',
    `🐛 Errors: ${errorCount} logged`,
    '',
    '🐢 Top 5 Slowest Screens:',
    ...topSlowScreens.map(
      (s, i) => `  ${i + 1}. ${s.screenName}: ${s.avgTtiMs}ms (${s.count}x)`,
    ),
    '',
    `Generated: ${summary.generatedAt}`,
  ];

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════
// CLEAR ALL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Clear all diagnostics data
 */
export function clearAllDiagnostics(): void {
  clearErrorLog();
  clearPerformanceLog();
}
