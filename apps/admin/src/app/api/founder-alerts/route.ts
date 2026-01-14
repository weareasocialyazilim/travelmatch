import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getAdminSession } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  isFounderAlertsEnabled,
  ALERT_DEFINITIONS,
  ALERT_LEVEL_PRIORITY,
  ALERT_LEVEL_BUDGET,
  MAX_ALERTS_FETCHED,
  type AlertItem,
  type AlertLevel,
} from '@/config/founder-alerts';

/**
 * Founder Alert Routing API
 *
 * SAFE MODE Compliance:
 * - Feature flag check (default OFF)
 * - super_admin only (hard check)
 * - NO external network calls (Sentry, PostHog, etc.)
 * - Only internal database queries
 * - Read-only (no mutations)
 *
 * Data Sources (all internal):
 * - integration_health_events
 * - internal_error_log
 * - triage_items
 * - security_logs
 * - moderation_logs
 */

// ═══════════════════════════════════════════════════════════════════════════
// GET - Fetch active alerts from internal sources
// ═══════════════════════════════════════════════════════════════════════════

export async function GET() {
  try {
    // ─────────────────────────────────────────────────────────────────────────
    // GATE 1: Server-side feature flag (NO fallback to public)
    // ─────────────────────────────────────────────────────────────────────────
    if (!isFounderAlertsEnabled()) {
      return NextResponse.json(
        { error: 'Feature not enabled', code: 'FEATURE_DISABLED' },
        { status: 403 },
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GATE 2: super_admin only (HARD CHECK)
    // ─────────────────────────────────────────────────────────────────────────
    const session = await getAdminSession();
    if (!session || session.admin.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Query internal tables for alerts (NO NETWORK CALLS)
    // ─────────────────────────────────────────────────────────────────────────
    const supabase = createServiceClient();
    const now = new Date();
    const alerts: AlertItem[] = [];

    // Process each enabled alert definition
    for (const definition of ALERT_DEFINITIONS) {
      if (!definition.enabled) continue;

      try {
        const lookbackTime = new Date(
          now.getTime() - definition.lookbackHours * 60 * 60 * 1000,
        ).toISOString();

        let count = 0;
        let lastSeenAt: string | null = null;

        // Build query based on source table
        switch (definition.source) {
          case 'integration_health_events': {
            const conditions = definition.query.countCondition;
            let query = supabase
              .from('integration_health_events')
              .select('id, created_at', { count: 'exact', head: false })
              .gte('created_at', lookbackTime)
              .order('created_at', { ascending: false })
              .limit(1);

            if (conditions.status) {
              query = query.in('status', conditions.status as string[]);
            }

            const { count: resultCount, data } = await query;
            count = resultCount || 0;
            lastSeenAt = data?.[0]?.created_at || null;
            break;
          }

          case 'internal_error_log': {
            const conditions = definition.query.countCondition;
            let query = supabase
              .from('internal_error_log')
              .select('id, created_at', { count: 'exact', head: false })
              .gte('created_at', lookbackTime)
              .order('created_at', { ascending: false })
              .limit(1);

            if (conditions.severity) {
              query = query.in('severity', conditions.severity as string[]);
            }

            const { count: resultCount, data } = await query;
            count = resultCount || 0;
            lastSeenAt = data?.[0]?.created_at || null;
            break;
          }

          case 'triage_items': {
            const conditions = definition.query.countCondition;
            let query = supabase
              .from('triage_items')
              .select('id, created_at', { count: 'exact', head: false })
              .order('created_at', { ascending: false })
              .limit(1);

            // Triage items use different time logic for backlog
            if (definition.lookbackHours < 168) {
              query = query.gte('created_at', lookbackTime);
            }

            if (conditions.status) {
              query = query.in('status', conditions.status as string[]);
            }
            if (conditions.priority) {
              query = query.in('priority', conditions.priority as string[]);
            }

            const { count: resultCount, data } = await query;
            count = resultCount || 0;
            lastSeenAt = data?.[0]?.created_at || null;
            break;
          }

          case 'security_logs': {
            const conditions = definition.query.countCondition;
            let query = supabase
              .from('security_logs')
              .select('id, created_at', { count: 'exact', head: false })
              .gte('created_at', lookbackTime)
              .order('created_at', { ascending: false })
              .limit(1);

            if (conditions.event_type) {
              query = query.in('event_type', conditions.event_type as string[]);
            }
            if (conditions.event_status) {
              query = query.in(
                'event_status',
                conditions.event_status as string[],
              );
            }
            if (conditions.risk_score_gte) {
              query = query.gte(
                'risk_score',
                conditions.risk_score_gte as number,
              );
            }

            const { count: resultCount, data } = await query;
            count = resultCount || 0;
            lastSeenAt = data?.[0]?.created_at || null;
            break;
          }

          case 'moderation_logs': {
            const conditions = definition.query.countCondition;
            let query = supabase
              .from('moderation_logs')
              .select('id, created_at', { count: 'exact', head: false })
              .gte('created_at', lookbackTime)
              .order('created_at', { ascending: false })
              .limit(1);

            if (conditions.severity) {
              query = query.in('severity', conditions.severity as string[]);
            }
            if (conditions.action_taken) {
              query = query.in(
                'action_taken',
                conditions.action_taken as string[],
              );
            }

            const { count: resultCount, data } = await query;
            count = resultCount || 0;
            lastSeenAt = data?.[0]?.created_at || null;
            break;
          }
        }

        // Only add if count exceeds threshold
        if (count >= definition.threshold) {
          const shortDetail = generateShortDetail(
            definition.key,
            count,
            definition.lookbackHours,
          );

          // Calculate if alert is "fresh" (outside cooldown window)
          const cooldownMs = definition.cooldownMinutes * 60 * 1000;
          const cooldownThreshold = new Date(now.getTime() - cooldownMs);
          const isFresh = lastSeenAt
            ? new Date(lastSeenAt) > cooldownThreshold
            : true; // New alert = fresh

          alerts.push({
            key: definition.key,
            level: definition.level,
            title: definition.title,
            shortDetail,
            count,
            lastSeenAt,
            actionUrl: definition.actionUrl,
            isFresh,
          });
        }
      } catch (queryError) {
        // Log error but continue with other alerts
        logger.warn(`Alert query failed for ${definition.key}:`, queryError);
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Sort by priority (ERROR > WARN > INFO)
    // Fresh alerts first within each level
    // ─────────────────────────────────────────────────────────────────────────
    const sortedAlerts = alerts.sort((a, b) => {
      const priorityDiff =
        ALERT_LEVEL_PRIORITY[b.level] - ALERT_LEVEL_PRIORITY[a.level];
      if (priorityDiff !== 0) return priorityDiff;
      // Fresh alerts first
      if (a.isFresh !== b.isFresh) return a.isFresh ? -1 : 1;
      // Secondary sort by count (higher first)
      return b.count - a.count;
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Apply budget per level (noise control)
    // ERROR: 2, WARN: 2, INFO: 1 = Total 5
    // ─────────────────────────────────────────────────────────────────────────
    const budgetedAlerts: AlertItem[] = [];
    const levelCounts: Record<AlertLevel, number> = {
      error: 0,
      warn: 0,
      info: 0,
    };

    for (const alert of sortedAlerts) {
      if (levelCounts[alert.level] < ALERT_LEVEL_BUDGET[alert.level]) {
        budgetedAlerts.push(alert);
        levelCounts[alert.level]++;
      }
      // Stop if we've reached max
      if (budgetedAlerts.length >= MAX_ALERTS_FETCHED) break;
    }

    // Calculate overflow (alerts beyond budget)
    const overflowCount = alerts.length - budgetedAlerts.length;

    return NextResponse.json({
      alerts: budgetedAlerts,
      totalCount: alerts.length,
      overflowCount,
      fetchedAt: now.toISOString(),
    });
  } catch (error) {
    logger.error('Founder alerts GET error:', error);
    return NextResponse.json(
      { error: 'Internal error', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function generateShortDetail(
  key: string,
  count: number,
  lookbackHours: number,
): string {
  const timeLabel = lookbackHours >= 168 ? 'toplam' : `son ${lookbackHours}s`;

  switch (key) {
    case 'integration_failures':
      return `${count} entegrasyon hatası (${timeLabel})`;
    case 'critical_errors':
      return `${count} kritik hata (${timeLabel})`;
    case 'critical_triage':
      return `${count} kritik öncelikli item bekliyor`;
    case 'high_risk_security':
      return `${count} yüksek riskli güvenlik olayı (${timeLabel})`;
    case 'content_violations':
      return `${count} içerik ihlali (${timeLabel})`;
    case 'triage_backlog':
      return `${count} triage item'ı bekliyor`;
    case 'error_spike':
      return `${count} hata kaydedildi (${timeLabel})`;
    case 'degraded_integrations':
      return `${count} düşük performans olayı (${timeLabel})`;
    case 'login_failures':
      return `${count} başarısız giriş (${timeLabel})`;
    default:
      return `${count} olay tespit edildi (${timeLabel})`;
  }
}
