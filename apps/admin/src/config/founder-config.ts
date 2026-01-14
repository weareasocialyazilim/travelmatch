/**
 * Founder Decision Loop Configuration
 *
 * SAFE MODE: Default OFF
 * This feature is only visible to super_admin when enabled.
 *
 * To enable:
 * 1. Set FOUNDER_DECISION_LOOP_ENABLED = true below
 * 2. Or add to feature_flags table in database
 */

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE FLAGS (SAFE MODE - Default OFF)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Enable/disable the Founder Decision Loop UI
 * When false: No action buttons visible, no behavior change
 * When true: super_admin sees Reviewed/Defer/Focus buttons
 */
export const FOUNDER_DECISION_LOOP_ENABLED = false;

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
