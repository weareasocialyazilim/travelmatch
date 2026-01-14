/**
 * Mobile Health Inbox Configuration
 *
 * SAFE MODE Compliance:
 * - NO-NETWORK: Parser is 100% client-side
 * - NO-DATABASE: No writes, no reads
 * - READ-ONLY: Just parsing pasted text
 *
 * This allows founder to paste diagnostics summary from mobile
 * and get structured triage recommendations.
 */

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE FLAG (SAFE MODE - Default OFF)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * CLIENT FLAG: UI Visibility
 * When false: Mobile Health Inbox not visible
 * When true: super_admin sees inbox in Command Center
 */
export const MOBILE_HEALTH_INBOX_ENABLED =
  process.env.NEXT_PUBLIC_MOBILE_HEALTH_INBOX_ENABLED === 'true';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ParsedBuildInfo {
  version: string | null;
  buildNumber: string | null;
  platform: string | null;
  osVersion: string | null;
  device: string | null;
  environment: 'development' | 'staging' | 'production' | null;
}

export interface ParsedConfigSanity {
  supabaseUrl: 'ok' | 'missing' | 'invalid' | null;
  supabaseKey: 'ok' | 'missing' | null;
  serviceRoleLeak: boolean;
  authState: 'logged_in' | 'logged_out' | 'unknown' | null;
}

export interface ParsedSlowScreen {
  rank: number;
  screenName: string;
  avgTtiMs: number;
  count: number;
}

export interface TriagePriority {
  level: 'P0' | 'P1' | 'P2' | 'P3';
  reason: string;
}

export interface ParsedDiagnostics {
  raw: string;
  parsedAt: string;
  buildInfo: ParsedBuildInfo;
  configSanity: ParsedConfigSanity;
  errorCount: number;
  slowScreens: ParsedSlowScreen[];
  generatedAt: string | null;
  triage: TriagePriority[];
  isValid: boolean;
  parseErrors: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// PARSER (100% CLIENT-SIDE, NO-NETWORK)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Parse diagnostics summary text from mobile app
 * Expected format matches getDiagnosticsSummaryText() from mobile
 */
export function parseDiagnosticsSummary(text: string): ParsedDiagnostics {
  const errors: string[] = [];
  const triage: TriagePriority[] = [];

  // Initialize defaults
  const result: ParsedDiagnostics = {
    raw: text,
    parsedAt: new Date().toISOString(),
    buildInfo: {
      version: null,
      buildNumber: null,
      platform: null,
      osVersion: null,
      device: null,
      environment: null,
    },
    configSanity: {
      supabaseUrl: null,
      supabaseKey: null,
      serviceRoleLeak: false,
      authState: null,
    },
    errorCount: 0,
    slowScreens: [],
    generatedAt: null,
    triage: [],
    isValid: false,
    parseErrors: [],
  };

  // Check if text looks like diagnostics
  if (!text.includes('TravelMatch Diagnostics')) {
    errors.push('Not a valid diagnostics summary (missing header)');
    result.parseErrors = errors;
    return result;
  }

  // Parse Build Info
  const versionMatch = text.match(/Version:\s*([^\s(]+)\s*\(([^)]+)\)/);
  if (versionMatch) {
    result.buildInfo.version = versionMatch[1];
    result.buildInfo.buildNumber = versionMatch[2] !== 'N/A' ? versionMatch[2] : null;
  }

  const platformMatch = text.match(/Platform:\s*(\w+)\s+(.+)/);
  if (platformMatch) {
    result.buildInfo.platform = platformMatch[1];
    result.buildInfo.osVersion = platformMatch[2].trim();
  }

  const deviceMatch = text.match(/Device:\s*(.+)/);
  if (deviceMatch) {
    result.buildInfo.device = deviceMatch[1].trim();
    if (result.buildInfo.device === 'Unknown') {
      result.buildInfo.device = null;
    }
  }

  const envMatch = text.match(/Environment:\s*(\w+)/);
  if (envMatch) {
    const env = envMatch[1].toLowerCase();
    if (env === 'development' || env === 'staging' || env === 'production') {
      result.buildInfo.environment = env;
    }
  }

  // Parse Config Sanity
  const supabaseUrlMatch = text.match(/Supabase URL:\s*(✅|❌)\s*(\w+)/);
  if (supabaseUrlMatch) {
    result.configSanity.supabaseUrl = supabaseUrlMatch[2] as 'ok' | 'missing' | 'invalid';
  }

  const supabaseKeyMatch = text.match(/Supabase Key:\s*(✅|❌)\s*(\w+)/);
  if (supabaseKeyMatch) {
    result.configSanity.supabaseKey = supabaseKeyMatch[2] as 'ok' | 'missing';
  }

  const serviceRoleMatch = text.match(/Service Role Leak:\s*(🚨 DETECTED|✅ None)/);
  if (serviceRoleMatch) {
    result.configSanity.serviceRoleLeak = serviceRoleMatch[1].includes('DETECTED');
  }

  const authStateMatch = text.match(/Auth State:\s*(\w+)/);
  if (authStateMatch) {
    const state = authStateMatch[1].toLowerCase();
    if (state === 'logged_in' || state === 'logged_out' || state === 'unknown') {
      result.configSanity.authState = state;
    }
  }

  // Parse Error Count
  const errorMatch = text.match(/Errors:\s*(\d+)\s*logged/);
  if (errorMatch) {
    result.errorCount = parseInt(errorMatch[1], 10);
  }

  // Parse Slow Screens
  const slowScreenRegex = /(\d+)\.\s*([^:]+):\s*(\d+)ms\s*\((\d+)x\)/g;
  let slowMatch;
  while ((slowMatch = slowScreenRegex.exec(text)) !== null) {
    result.slowScreens.push({
      rank: parseInt(slowMatch[1], 10),
      screenName: slowMatch[2].trim(),
      avgTtiMs: parseInt(slowMatch[3], 10),
      count: parseInt(slowMatch[4], 10),
    });
  }

  // Parse Generated At
  const generatedMatch = text.match(/Generated:\s*(.+)/);
  if (generatedMatch) {
    result.generatedAt = generatedMatch[1].trim();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TRIAGE LOGIC (NO-NETWORK - all client-side)
  // ─────────────────────────────────────────────────────────────────────────

  // P0: Critical issues requiring immediate attention
  if (result.configSanity.serviceRoleLeak) {
    triage.push({
      level: 'P0',
      reason: 'CRITICAL: Service role key leak detected! Immediate security response required.',
    });
  }

  if (result.configSanity.supabaseUrl === 'missing' || result.configSanity.supabaseKey === 'missing') {
    triage.push({
      level: 'P0',
      reason: 'CRITICAL: Supabase configuration missing. App cannot function.',
    });
  }

  // P1: High priority issues
  if (result.errorCount >= 20) {
    triage.push({
      level: 'P1',
      reason: `HIGH: ${result.errorCount} errors logged. Investigate root cause.`,
    });
  }

  const verySlowScreens = result.slowScreens.filter((s) => s.avgTtiMs > 2000);
  if (verySlowScreens.length > 0) {
    triage.push({
      level: 'P1',
      reason: `HIGH: ${verySlowScreens.length} screen(s) with TTI > 2s: ${verySlowScreens.map((s) => s.screenName).join(', ')}`,
    });
  }

  // P2: Medium priority issues
  if (result.errorCount >= 5 && result.errorCount < 20) {
    triage.push({
      level: 'P2',
      reason: `MEDIUM: ${result.errorCount} errors logged. Review when possible.`,
    });
  }

  const slowScreens = result.slowScreens.filter((s) => s.avgTtiMs > 1000 && s.avgTtiMs <= 2000);
  if (slowScreens.length >= 2) {
    triage.push({
      level: 'P2',
      reason: `MEDIUM: ${slowScreens.length} screens with TTI > 1s need optimization.`,
    });
  }

  // P3: Low priority / informational
  if (result.buildInfo.environment === 'production' && !result.buildInfo.buildNumber) {
    triage.push({
      level: 'P3',
      reason: 'INFO: Build number missing in production. Consider adding for traceability.',
    });
  }

  if (triage.length === 0) {
    triage.push({
      level: 'P3',
      reason: 'All clear. No immediate issues detected.',
    });
  }

  result.triage = triage.sort((a, b) => {
    const order = { P0: 0, P1: 1, P2: 2, P3: 3 };
    return order[a.level] - order[b.level];
  });

  result.isValid = true;
  result.parseErrors = errors;

  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// TRIAGE PRIORITY COLORS
// ═══════════════════════════════════════════════════════════════════════════

export const TRIAGE_PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  P0: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' },
  P1: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50' },
  P2: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/50' },
  P3: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/50' },
};

export const TRIAGE_PRIORITY_LABELS: Record<string, string> = {
  P0: 'Critical',
  P1: 'High',
  P2: 'Medium',
  P3: 'Low',
};
