/**
 * Founder Decision Loop Configuration
 *
 * SAFE MODE: Default OFF
 * This feature is only visible to super_admin when enabled.
 *
 * TWO-LAYER FLAG MODEL:
 * ─────────────────────
 * 1. Client flag: NEXT_PUBLIC_FOUNDER_DECISION_LOOP_ENABLED
 *    → Controls UI visibility (buttons, stats display)
 *    → Public: Anyone can see this exists
 *
 * 2. Server flag: FOUNDER_DECISION_LOOP_ENABLED
 *    → Controls API data access
 *    → Private: Server-only, actual data protection
 *
 * Scenarios:
 * ┌─────────┬────────┬─────────────────────────────────────┐
 * │ Client  │ Server │ Result                              │
 * ├─────────┼────────┼─────────────────────────────────────┤
 * │ OFF     │ OFF    │ Feature invisible                   │
 * │ ON      │ OFF    │ UI visible, API returns 403         │
 * │ OFF     │ ON     │ UI hidden (useless but safe)        │
 * │ ON      │ ON     │ Full functionality                  │
 * └─────────┴────────┴─────────────────────────────────────┘
 *
 * Operational safety: Even if client flag leaks or is accidentally
 * left on, server flag controls actual data access.
 */

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE FLAGS (SAFE MODE - Default OFF)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * CLIENT FLAG: UI Visibility
 * When false: No action buttons visible, no stats display
 * When true: super_admin sees Reviewed/Defer/Focus buttons
 *
 * Reads from: NEXT_PUBLIC_FOUNDER_DECISION_LOOP_ENABLED
 * Default: false (SAFE MODE)
 */
export const FOUNDER_DECISION_LOOP_ENABLED =
  process.env.NEXT_PUBLIC_FOUNDER_DECISION_LOOP_ENABLED === 'true';

/**
 * SERVER FLAG: API Data Access
 * When false: API returns 403, no data exposure
 * When true: API returns data (still requires super_admin auth)
 *
 * Reads from: FOUNDER_DECISION_LOOP_ENABLED (private, server-only)
 * Default: false (SAFE MODE)
 *
 * SECURITY NOTE: This does NOT fall back to NEXT_PUBLIC_*
 * Server flag must be explicitly set for API to work.
 */
export function isFounderDecisionLoopEnabled(): boolean {
  // ONLY check server-side env var - no fallback to public
  return process.env.FOUNDER_DECISION_LOOP_ENABLED === 'true';
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type DecisionContextPage = 'ceo-briefing' | 'command-center';

export type DecisionItemType = 'fire' | 'focus' | 'hygiene' | 'strategic';

export type DecisionAction = 'reviewed' | 'deferred' | 'focused';

export interface FounderDecision {
  id?: string;
  created_at?: string;
  actor_admin_id: string;
  context_page: DecisionContextPage;
  item_type: DecisionItemType;
  item_key: string;
  action: DecisionAction;
  note?: string;
  metadata?: Record<string, unknown>;
}

export interface FounderDecisionStats {
  reviewedToday: number;
  deferredToday: number;
  currentFocus: string | null;
  focusSetAt: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

export const DECISION_ITEM_TYPES: Record<DecisionItemType, string> = {
  fire: '🔥 Yangın',
  focus: '🎯 Odak',
  hygiene: '🧹 Hijyen',
  strategic: '📋 Stratejik',
};

export const DECISION_ACTIONS: Record<DecisionAction, string> = {
  reviewed: 'İncelendi',
  deferred: 'Ertelendi',
  focused: 'Odak Seçildi',
};
