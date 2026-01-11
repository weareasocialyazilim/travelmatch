import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Revenue API Endpoint
 * Fetches all revenue-related data from Supabase
 */

export async function GET() {
  try {
    const supabase = await createClient();

    // Parallel data fetching
    const [
      paymentsResult,
      subscriptionsResult,
      transactionsResult,
    ] = await Promise.all([
      // All completed payments
      supabase
        .from('payments')
        .select('id, amount, currency, status, type, created_at, user_id')
        .eq('status', 'completed')
        .order('created_at', { ascending: false }),

      // Active subscriptions
      supabase
        .from('subscriptions')
        .select('id, plan, amount, status, started_at, expires_at, user_id')
        .eq('status', 'active'),

      // Recent transactions for chart
      supabase
        .from('payments')
        .select('amount, type, created_at')
        .eq('status', 'completed')
        .gte('created_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true }),
    ]);

    const payments = paymentsResult.data || [];
    const subscriptions = subscriptionsResult.data || [];
    const transactions = transactionsResult.data || [];

    // Calculate overview metrics
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const subscriptionRevenue = payments
      .filter(p => p.type === 'subscription')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const giftRevenue = payments
      .filter(p => p.type === 'gift')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const otherRevenue = totalRevenue - subscriptionRevenue - giftRevenue;

    // Calculate monthly revenue
    const monthlyRevenue = calculateMonthlyRevenue(transactions);

    // Calculate revenue by product type
    const revenueByProduct = [
      { name: 'Premium', value: subscriptionRevenue, color: '#8b5cf6' },
      { name: 'Hediyeler', value: giftRevenue, color: '#10b981' },
      { name: 'Diğer', value: otherRevenue, color: '#f59e0b' },
    ];

    // Active subscription stats
    const activeSubscriptions = subscriptions.length;
    const avgSubscriptionValue = activeSubscriptions > 0
      ? subscriptions.reduce((sum, s) => sum + (s.amount || 0), 0) / activeSubscriptions
      : 0;

    // MRR calculation
    const mrr = subscriptions.reduce((sum, s) => sum + (s.amount || 0), 0);
    const arr = mrr * 12;

    // Growth calculation (compare last 30 days vs previous 30 days)
    const last30Days = payments
      .filter(p => new Date(p.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const previous30Days = payments
      .filter(p => {
        const date = new Date(p.created_at);
        return date > new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) &&
               date <= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const growthRate = previous30Days > 0
      ? ((last30Days - previous30Days) / previous30Days) * 100
      : 0;

    return NextResponse.json({
      overview: {
        totalRevenue,
        mrr,
        arr,
        growthRate: Math.round(growthRate * 10) / 10,
        activeSubscriptions,
        avgSubscriptionValue: Math.round(avgSubscriptionValue),
      },
      monthlyRevenue,
      revenueByProduct,
      recentPayments: payments.slice(0, 20),
      meta: {
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Revenue API Error:', error);
    return NextResponse.json({
      overview: {
        totalRevenue: 0,
        mrr: 0,
        arr: 0,
        growthRate: 0,
        activeSubscriptions: 0,
        avgSubscriptionValue: 0,
      },
      monthlyRevenue: [],
      revenueByProduct: [],
      recentPayments: [],
      meta: {
        generatedAt: new Date().toISOString(),
        error: 'Failed to fetch revenue data',
      },
    }, { status: 500 });
  }
}

function calculateMonthlyRevenue(transactions: { amount: number; created_at: string }[]) {
  const months = 6;
  const result = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStr = date.toISOString().slice(0, 7);
    const monthLabel = date.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' });

    const total = transactions
      .filter(t => t.created_at.startsWith(monthStr))
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    result.push({
      month: monthLabel,
      revenue: total,
    });
  }

  return result;
}
