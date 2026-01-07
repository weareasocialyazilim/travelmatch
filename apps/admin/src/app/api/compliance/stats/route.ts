import { logger } from '@/lib/logger';
/**
 * Compliance Stats API
 *
 * Returns compliance dashboard statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getAdminSession, hasPermission } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'compliance', 'view')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const supabase = createServiceClient();

    // Get SAR counts by status
    const { data: sarCounts } = await supabase
      .from('suspicious_activity_reports')
      .select('status')
      .then(({ data }) => {
        const counts = {
          pending: 0,
          investigating: 0,
          escalated: 0,
          reported: 0,
          cleared: 0,
          confirmed: 0,
        };
        data?.forEach((item) => {
          counts[item.status as keyof typeof counts]++;
        });
        return { data: counts };
      });

    // Get risk profile counts by level
    const { data: riskCounts } = await supabase
      .from('user_risk_profiles')
      .select('risk_level, is_blocked')
      .then(({ data }) => {
        const counts = {
          low: 0,
          medium: 0,
          high: 0,
          critical: 0,
          blocked: 0,
        };
        data?.forEach((item) => {
          if (item.is_blocked) {
            counts.blocked++;
          } else {
            counts[item.risk_level as keyof typeof counts]++;
          }
        });
        return { data: counts };
      });

    // Get recent high-risk transactions (last 24h)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: recentAlerts, count: alertCount } = await supabase
      .from('suspicious_activity_reports')
      .select('*', { count: 'exact' })
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    // Get blocked users
    const { count: blockedCount } = await supabase
      .from('user_risk_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_blocked', true);

    // Get AML thresholds summary
    const { data: amlThresholds } = await supabase
      .from('aml_thresholds')
      .select('currency, threshold_type, amount, action')
      .eq('is_active', true)
      .in('action', ['report_masak', 'report_fiu', 'block']);

    // Get fraud rules summary
    const { data: fraudRules, count: activeRulesCount } = await supabase
      .from('fraud_rules')
      .select('rule_type, action', { count: 'exact' })
      .eq('is_active', true);

    // Calculate fraud rule type counts
    const ruleTypeCounts: Record<string, number> = {};
    fraudRules?.forEach((rule) => {
      ruleTypeCounts[rule.rule_type] =
        (ruleTypeCounts[rule.rule_type] || 0) + 1;
    });

    return NextResponse.json({
      sar: {
        total:
          (sarCounts?.pending || 0) +
          (sarCounts?.investigating || 0) +
          (sarCounts?.escalated || 0) +
          (sarCounts?.reported || 0) +
          (sarCounts?.cleared || 0) +
          (sarCounts?.confirmed || 0),
        pending: sarCounts?.pending || 0,
        investigating: sarCounts?.investigating || 0,
        escalated: sarCounts?.escalated || 0,
        reported: sarCounts?.reported || 0,
        resolved: (sarCounts?.cleared || 0) + (sarCounts?.confirmed || 0),
      },
      risk: {
        low: riskCounts?.low || 0,
        medium: riskCounts?.medium || 0,
        high: riskCounts?.high || 0,
        critical: riskCounts?.critical || 0,
        blocked: blockedCount || 0,
      },
      recent: {
        alerts24h: alertCount || 0,
        latestAlerts: recentAlerts || [],
      },
      thresholds: {
        masak:
          amlThresholds?.filter((t) => t.action === 'report_masak').length || 0,
        fiu:
          amlThresholds?.filter((t) => t.action === 'report_fiu').length || 0,
        block: amlThresholds?.filter((t) => t.action === 'block').length || 0,
      },
      fraudRules: {
        total: activeRulesCount || 0,
        byType: ruleTypeCounts,
      },
    });
  } catch (error) {
    logger.error('Compliance stats error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
