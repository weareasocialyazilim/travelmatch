import { createServiceClient } from '@/lib/supabase.server';
import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { getAdminSession, hasPermission } from '@/lib/auth';

/**
 * Revenue API Endpoint
 * Fetches all revenue-related data from Supabase
 */

export async function GET() {
  try {
    // Auth check - P0 Security Fix
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'revenue', 'view')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const supabase = createServiceClient();

    // Parallel data fetching
    const [paymentsResult, transactionsResult] = await Promise.all([
      // All completed payments
      supabase
        .from('payment_transactions')
        .select(
          'id, amount, currency, status, payment_method, created_at, user_id',
        )
        .eq('status', 'completed')
        .order('created_at', { ascending: false }),

      // Recent transactions for chart (last 6 months)
      supabase
        .from('payment_transactions')
        .select('amount, payment_method, created_at')
        .eq('status', 'completed')
        .gte(
          'created_at',
          new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        )
        .order('created_at', { ascending: true }),
    ]);

    const payments: Array<{
      id: string;
      amount: number;
      payment_method: string | null;
      created_at: string | null;
    }> = paymentsResult.data || [];
    const transactions: Array<{ amount: number; created_at: string | null }> =
      transactionsResult.data || [];

    // Calculate overview metrics
    const totalRevenue = payments.reduce(
      (sum: number, p) => sum + (p.amount || 0),
      0,
    );
    const cardPayments = payments
      .filter(
        (p) =>
          p.payment_method === 'card' || p.payment_method === 'credit_card',
      )
      .reduce((sum: number, p) => sum + (p.amount || 0), 0);
    const otherPayments = totalRevenue - cardPayments;

    // Calculate monthly revenue
    const monthlyRevenue = calculateMonthlyRevenue(transactions);

    // Calculate revenue by payment method
    const revenueByProduct = [
      { name: 'Kart', value: cardPayments, color: '#8b5cf6' },
      { name: 'Diğer', value: otherPayments, color: '#10b981' },
    ];

    // Growth calculation (compare last 30 days vs previous 30 days)
    const last30Days = payments
      .filter(
        (p) =>
          p.created_at &&
          new Date(p.created_at) >
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      )
      .reduce((sum: number, p) => sum + (p.amount || 0), 0);

    const previous30Days = payments
      .filter((p) => {
        if (!p.created_at) return false;
        const date = new Date(p.created_at);
        return (
          date > new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) &&
          date <= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );
      })
      .reduce((sum: number, p) => sum + (p.amount || 0), 0);

    const growthRate =
      previous30Days > 0
        ? ((last30Days - previous30Days) / previous30Days) * 100
        : 0;

    return NextResponse.json({
      overview: {
        totalRevenue,
        mrr: 0,
        arr: 0,
        growthRate: Math.round(growthRate * 10) / 10,
        activeSubscriptions: 0,
        avgSubscriptionValue: 0,
      },
      monthlyRevenue,
      revenueByProduct,
      recentPayments: payments.slice(0, 20),
      meta: {
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Revenue API Error:', error);
    return NextResponse.json(
      {
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
      },
      { status: 500 },
    );
  }
}

function calculateMonthlyRevenue(
  transactions: { amount: number; created_at: string | null }[],
) {
  const months = 6;
  const result = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStr = date.toISOString().slice(0, 7);
    const monthLabel = date.toLocaleDateString('tr-TR', {
      month: 'short',
      year: '2-digit',
    });

    const total = transactions
      .filter((t) => t.created_at?.startsWith(monthStr))
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    result.push({
      month: monthLabel,
      revenue: total,
    });
  }

  return result;
}
