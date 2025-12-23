import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getAdminSession, hasPermission } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const supabase = createServiceClient();

    // Get various stats in parallel
    const [
      usersResult,
      activeUsersResult,
      momentsResult,
      matchesResult,
      disputesResult,
      pendingTasksResult,
      transactionsResult,
    ] = await Promise.all([
      // Total users
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      // Active users (last 24h)
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_active_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      // Total moments
      supabase.from('moments').select('*', { count: 'exact', head: true }),
      // Total matches
      supabase.from('matches').select('*', { count: 'exact', head: true }),
      // Pending disputes
      supabase
        .from('disputes')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'under_review']),
      // Pending tasks
      supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'in_progress']),
      // Today's revenue
      supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'completed')
        .gte('created_at', new Date().toISOString().split('T')[0]),
    ]);

    // Calculate today's revenue
    const todayRevenue = transactionsResult.data?.reduce(
      (sum, t) => sum + (t.amount || 0),
      0
    ) || 0;

    const stats = {
      total_users: usersResult.count || 0,
      active_users_24h: activeUsersResult.count || 0,
      total_moments: momentsResult.count || 0,
      total_matches: matchesResult.count || 0,
      pending_disputes: disputesResult.count || 0,
      pending_tasks: pendingTasksResult.count || 0,
      today_revenue: todayRevenue,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Stats GET error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
