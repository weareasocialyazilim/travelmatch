import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30d';
    const type = searchParams.get('type');

    // Build query for transactions
    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    // Apply date filter based on period
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
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    query = query.gte('created_at', startDate.toISOString());

    const { data: transactions, error, count } = await query.limit(100);

    if (error) throw error;

    // Calculate summary stats
    type Transaction = { type?: string; amount?: number };
    const summary = {
      totalRevenue:
        transactions
          ?.filter(
            (t: Transaction) => t.type === 'subscription' || t.type === 'boost',
          )
          .reduce((sum: number, t: Transaction) => sum + (t.amount || 0), 0) ||
        0,
      totalRefunds:
        transactions
          ?.filter((t: Transaction) => t.type === 'refund')
          .reduce((sum: number, t: Transaction) => sum + (t.amount || 0), 0) ||
        0,
      subscriptionRevenue:
        transactions
          ?.filter((t: Transaction) => t.type === 'subscription')
          .reduce((sum: number, t: Transaction) => sum + (t.amount || 0), 0) ||
        0,
      boostRevenue:
        transactions
          ?.filter((t: Transaction) => t.type === 'boost')
          .reduce((sum: number, t: Transaction) => sum + (t.amount || 0), 0) ||
        0,
      transactionCount: count || 0,
    };

    return NextResponse.json({
      transactions,
      summary,
      total: count,
    });
  } catch (error) {
    logger.error('Finance API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch finance data' },
      { status: 500 },
    );
  }
}
