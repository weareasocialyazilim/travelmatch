import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase.server';
import { getAdminSession, hasPermission } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Auth check - P0 Security Fix
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'analytics', 'view')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const supabase = createServiceClient();
    const supabaseAny = supabase as any;
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30d';
    const metric = searchParams.get('metric');

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '365d':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Fetch user metrics
    const { count: totalUsers } = await supabaseAny
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: newUsers } = await supabaseAny
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    const { count: activeUsers } = await supabaseAny
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_active', startDate.toISOString());

    // Note: 'matches' table doesn't exist - skipping match metrics
    const totalMatches = 0;

    // Fetch message metrics
    const { count: totalMessages } = await supabaseAny
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Fetch revenue metrics

    const { data: revenueData } = await supabaseAny
      .from('transactions')
      .select('amount, type')
      .gte('created_at', startDate.toISOString())
      .in('type', ['subscription', 'boost']);

    const totalRevenue =
      revenueData?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) ||
      0;

    return NextResponse.json({
      period,
      metrics: {
        totalUsers: totalUsers || 0,
        newUsers: newUsers || 0,
        activeUsers: activeUsers || 0,
        totalMatches: totalMatches || 0,
        totalMessages: totalMessages || 0,
        totalRevenue,
        avgRevenuePerUser: totalUsers
          ? (totalRevenue / totalUsers).toFixed(2)
          : 0,
        conversionRate: totalUsers
          ? (((newUsers || 0) / totalUsers) * 100).toFixed(2)
          : 0,
      },
    });
  } catch (error) {
    logger.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 },
    );
  }
}
