import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getAdminSession } from '@/lib/auth';

/**
 * GET /api/alerts/active
 * Fetch all active (unresolved) alerts
 */
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Oturum bulunamadı' },
        { status: 401 }
      );
    }

    const supabase = createServiceClient();

    const { data: alerts, error } = await supabase
      .from('active_alerts')
      .select(`
        *,
        rule:alert_rules(
          id,
          name,
          category,
          severity,
          condition
        )
      `)
      .in('status', ['active', 'acknowledged'])
      .order('triggered_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch active alerts:', error);
      return NextResponse.json(
        { error: 'Aktif alertler alınamadı' },
        { status: 500 }
      );
    }

    // Transform to match expected format
    const transformedAlerts = (alerts || []).map(alert => ({
      id: alert.id,
      ruleId: alert.rule_id,
      title: alert.title,
      description: alert.description,
      severity: alert.rule?.severity || 'medium',
      category: alert.rule?.category || 'operations',
      triggeredAt: alert.triggered_at,
      acknowledgedBy: alert.acknowledged_by_name,
      status: alert.status,
      metric: {
        current: alert.current_value,
        threshold: alert.threshold_value,
        unit: alert.metric_unit || ''
      }
    }));

    return NextResponse.json({ alerts: transformedAlerts });
  } catch (error) {
    logger.error('Active alerts API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
