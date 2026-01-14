/**
 * Founder Decision Loop Configuration
 *
 * SAFE MODE: Default OFF
 * This feature is only visible to super_admin when enabled.
 *
 * To enable (no deploy needed):
 * 1. Set ENV variable: NEXT_PUBLIC_FOUNDER_DECISION_LOOP_ENABLED=true
 * 2. Restart the server
 *
 * To disable:
 * 1. Remove ENV variable or set to false
 * 2. Restart the server
 */

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE FLAGS (SAFE MODE - Default OFF)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Enable/disable the Founder Decision Loop UI
 * When false: No action buttons visible, no behavior change
 * When true: super_admin sees Reviewed/Defer/Focus buttons
 *
 * Reads from: NEXT_PUBLIC_FOUNDER_DECISION_LOOP_ENABLED
 * Default: false (SAFE MODE)
 */
export const FOUNDER_DECISION_LOOP_ENABLED =
  process.env.NEXT_PUBLIC_FOUNDER_DECISION_LOOP_ENABLED === 'true';

/**
 * Server-side only check (for API routes)
 * Falls back to the public env var for consistency
 */
export function isFounderDecisionLoopEnabled(): boolean {
  // Server can check both, prefer the non-public one if set
  const serverEnv = process.env.FOUNDER_DECISION_LOOP_ENABLED;
  const publicEnv = process.env.NEXT_PUBLIC_FOUNDER_DECISION_LOOP_ENABLED;

  return serverEnv === 'true' || publicEnv === 'true';
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
