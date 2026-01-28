import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase.server';
import { getAdminSession, createAuditLog } from '@/lib/auth';
import { logger } from '@/lib/logger';
import type { Json } from '@/types/database';
import {
  isFounderDecisionLoopEnabled,
  type FounderDecision,
  type FounderDecisionStats,
} from '@/config/founder-config';

/**
 * Founder Decision Log API
 *
 * SAFE MODE Compliance:
 * - Feature flag check (default OFF)
 * - super_admin only (hard check)
 * - NO external network calls
 * - Generic audit log (no special naming)
 * - Append-only (no delete/update)
 */

// ═══════════════════════════════════════════════════════════════════════════
// GET - Fetch decision stats and current focus
// ═══════════════════════════════════════════════════════════════════════════

export async function GET() {
  try {
    // Feature flag check (server-side, reads from ENV)
    if (!isFounderDecisionLoopEnabled()) {
      return NextResponse.json(
        { error: 'Feature not enabled', code: 'FEATURE_DISABLED' },
        { status: 403 },
      );
    }

    // Auth check - super_admin only
    const session = await getAdminSession();
    if (!session || session.admin.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }

    const supabase = createServiceClient();
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).toISOString();
    const weekStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay(),
    ).toISOString();

    // Get today's reviewed count
    const { count: reviewedToday } = await supabase
      .from('founder_decision_log')
      .select('*', { count: 'exact', head: true })
      .eq('action', 'reviewed')
      .gte('created_at', todayStart);

    // Get today's deferred count
    const { count: deferredToday } = await supabase
      .from('founder_decision_log')
      .select('*', { count: 'exact', head: true })
      .eq('action', 'deferred')
      .gte('created_at', todayStart);

    // Get current week's focus (most recent 'focused' action this week)
    const { data: focusData } = await supabase
      .from('founder_decision_log')
      .select('item_key, created_at')
      .eq('action', 'focused')
      .gte('created_at', weekStart)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get recent deferred items (top 5, newest first)
    const { data: deferredItems } = await supabase
      .from('founder_decision_log')
      .select('id, item_key, item_type, note, created_at')
      .eq('action', 'deferred')
      .order('created_at', { ascending: false })
      .limit(5);

    const stats: FounderDecisionStats = {
      reviewedToday: reviewedToday || 0,
      deferredToday: deferredToday || 0,
      currentFocus: focusData?.item_key || null,
      focusSetAt: focusData?.created_at || null,
    };

    return NextResponse.json({
      stats,
      deferredBacklog: deferredItems || [],
    });
  } catch (error) {
    logger.error('Founder decision GET error:', error);
    return NextResponse.json(
      { error: 'Internal error', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// POST - Log a new decision
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(request: Request) {
  try {
    // Feature flag check (server-side, reads from ENV)
    if (!isFounderDecisionLoopEnabled()) {
      return NextResponse.json(
        { error: 'Feature not enabled', code: 'FEATURE_DISABLED' },
        { status: 403 },
      );
    }

    // Auth check - super_admin only (HARD CHECK)
    const session = await getAdminSession();
    if (!session || session.admin.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Validate required fields
    const { context_page, item_type, item_key, action, note, metadata } =
      body as Partial<FounderDecision>;

    if (!context_page || !item_type || !item_key || !action) {
      return NextResponse.json(
        { error: 'Missing required fields', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    // Validate enum values
    const validPages = ['ceo-briefing', 'command-center'];
    const validTypes = ['fire', 'focus', 'hygiene', 'strategic'];
    const validActions = ['reviewed', 'deferred', 'focused'];

    if (!validPages.includes(context_page)) {
      return NextResponse.json(
        { error: 'Invalid context_page', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    if (!validTypes.includes(item_type)) {
      return NextResponse.json(
        { error: 'Invalid item_type', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    // Idempotency check - prevent duplicate submissions within 5 seconds
    const supabase = createServiceClient();
    const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();

    const { data: recentDuplicate } = await supabase
      .from('founder_decision_log')
      .select('id')
      .eq('actor_admin_id', session.admin.id)
      .eq('item_key', item_key)
      .eq('action', action)
      .gte('created_at', fiveSecondsAgo)
      .limit(1)
      .single();

    if (recentDuplicate) {
      // Return success for idempotency (already logged)
      return NextResponse.json({
        success: true,
        id: recentDuplicate.id,
        message: 'Already logged (idempotent)',
      });
    }

    // Insert decision log
    const { data: insertedLog, error: insertError } = await supabase
      .from('founder_decision_log')
      .insert({
        actor_admin_id: session.admin.id,
        context_page,
        item_type,
        item_key,
        action,
        note: note || null,
        metadata: (metadata || {}) as Json,
      })
      .select('id, created_at')
      .single();

    if (insertError) {
      logger.error('Founder decision insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to log decision', code: 'DB_ERROR' },
        { status: 500 },
      );
    }

    // Generic audit log (no special naming)
    await createAuditLog(
      session.admin.id,
      'FOUNDER_DECISION', // Generic action name
      'decision_log',
      insertedLog.id,
      null,
      { item_key, action, item_type }, // Minimal info
    );

    return NextResponse.json({
      success: true,
      id: insertedLog.id,
      created_at: insertedLog.created_at,
    });
  } catch (error) {
    logger.error('Founder decision POST error:', error);
    return NextResponse.json(
      { error: 'Internal error', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
