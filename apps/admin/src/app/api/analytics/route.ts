import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
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
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: newUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    const { count: activeUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_active', startDate.toISOString());

    // Fetch booking/match metrics
    const { count: totalMatches } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Fetch message metrics
    const { count: totalMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Fetch revenue metrics
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: revenueData } = await (supabase as any)
      .from('transactions')
      .select('amount, type')
      .gte('created_at', startDate.toISOString())
      .in('type', ['subscription', 'boost']);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 },
    );
  }
}
