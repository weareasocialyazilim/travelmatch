import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getAdminSession } from '@/lib/auth';

export async function GET(_request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const supabase = createServiceClient();

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(
      now.getTime() - 30 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const sixtyDaysAgo = new Date(
      now.getTime() - 60 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const sevenDaysAgo = new Date(
      now.getTime() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const fourteenDaysAgo = new Date(
      now.getTime() - 14 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const twentyFourHoursAgo = new Date(
      now.getTime() - 24 * 60 * 60 * 1000,
    ).toISOString();

    // Get various stats in parallel
    const [
      // Current totals
      totalUsersResult,
      activeUsersResult,
      totalMomentsResult,

      // Previous period totals for growth calculation
      prevPeriodUsersResult,
      prevPeriodActiveResult,
      prevPeriodMomentsResult,

      // Today's stats
      todayRegistrationsResult,
      todayMomentsResult,

      // Revenue
      currentMonthRevenueResult,
      prevMonthRevenueResult,
      todayRevenueResult,

      // Tasks
      pendingTasksResult,
    ] = await Promise.all([
      // Total users
      supabase.from('users').select('*', { count: 'exact', head: true }),

      // Active users (last 7 days - more realistic than 24h)
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('last_active_at', sevenDaysAgo),

      // Total moments
      supabase.from('moments').select('*', { count: 'exact', head: true }),

      // Users 30-60 days ago for growth calculation
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .lte('created_at', thirtyDaysAgo),

      // Active users 7-14 days ago
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('last_active_at', fourteenDaysAgo)
        .lte('last_active_at', sevenDaysAgo),

      // Moments 30 days ago
      supabase
        .from('moments')
        .select('*', { count: 'exact', head: true })
        .lte('created_at', thirtyDaysAgo),

      // Today's registrations
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today),

      // Today's moments
      supabase
        .from('moments')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today),

      // Current month revenue
      supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'completed')
        .gte('created_at', thirtyDaysAgo),

      // Previous month revenue
      supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'completed')
        .gte('created_at', sixtyDaysAgo)
        .lte('created_at', thirtyDaysAgo),

      // Today's revenue
      supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'completed')
        .gte('created_at', today),

      // Pending tasks
      supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'in_progress']),
    ]);

    // Calculate totals
    const totalUsers = totalUsersResult.count || 0;
    const activeUsers = activeUsersResult.count || 0;
    const totalMoments = totalMomentsResult.count || 0;

    // Calculate previous period totals
    const prevPeriodUsers = prevPeriodUsersResult.count || 0;
    const prevPeriodActive = prevPeriodActiveResult.count || 0;
    const prevPeriodMoments = prevPeriodMomentsResult.count || 0;

    // Calculate growth percentages
    const newUsersThisMonth = totalUsers - prevPeriodUsers;
    const userGrowth =
      prevPeriodUsers > 0 ? (newUsersThisMonth / prevPeriodUsers) * 100 : 0;

    const activeGrowth =
      prevPeriodActive > 0
        ? ((activeUsers - prevPeriodActive) / prevPeriodActive) * 100
        : 0;

    const newMomentsThisMonth = totalMoments - prevPeriodMoments;
    const momentGrowth =
      prevPeriodMoments > 0
        ? (newMomentsThisMonth / prevPeriodMoments) * 100
        : 0;

    // Calculate revenue
    type TransactionAmount = { amount?: number };
    const currentMonthRevenue =
      currentMonthRevenueResult.data?.reduce(
        (sum: number, t: TransactionAmount) => sum + (t.amount || 0),
        0,
      ) || 0;

    const prevMonthRevenue =
      prevMonthRevenueResult.data?.reduce(
        (sum: number, t: TransactionAmount) => sum + (t.amount || 0),
        0,
      ) || 0;

    const revenueGrowth =
      prevMonthRevenue > 0
        ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
        : 0;

    const todayRevenue =
      todayRevenueResult.data?.reduce(
        (sum: number, t: TransactionAmount) => sum + (t.amount || 0),
        0,
      ) || 0;

    // Get active sessions (users active in last 15 minutes as approximation)
    const fifteenMinutesAgo = new Date(
      now.getTime() - 15 * 60 * 1000,
    ).toISOString();
    const activeSessionsResult = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_active_at', fifteenMinutesAgo);

    const stats = {
      // Main KPIs
      totalUsers,
      userGrowth: Math.round(userGrowth * 10) / 10,
      activeUsers,
      activeGrowth: Math.round(activeGrowth * 10) / 10,
      totalRevenue: currentMonthRevenue,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      totalMoments,
      momentGrowth: Math.round(momentGrowth * 10) / 10,

      // Today's summary
      todayRegistrations: todayRegistrationsResult.count || 0,
      activeSessions: activeSessionsResult.count || 0,
      todayRevenue,
      todayMoments: todayMomentsResult.count || 0,

      // Legacy fields for backward compatibility
      total_users: totalUsers,
      active_users_24h: activeUsers,
      total_moments: totalMoments,
      pending_tasks: pendingTasksResult.count || 0,
      today_revenue: todayRevenue,
    };

    return NextResponse.json(stats);
  } catch (error) {
    logger.error('Stats GET error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
