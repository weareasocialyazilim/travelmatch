import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getAdminSession, hasPermission, createAuditLog } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // P0 FIX: Add authentication check - Finance API was publicly accessible
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    // Check permission for finance viewing
    if (!hasPermission(session, 'transactions', 'view')) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 },
      );
    }

    const supabase = createServiceClient();
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30d';
    const type = searchParams.get('type');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const cursor = searchParams.get('cursor');

    // Build query for transactions (view-backed, cursor pagination)
    let query = supabase
      .from('view_admin_finance_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit);

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

    if (type) {
      query = query.eq('type', type);
    }

    if (cursor) {
      const [cursorDate, cursorId] = cursor.split('|');
      if (cursorDate && cursorId) {
        query = query.or(
          `created_at.lt.${cursorDate},and(created_at.eq.${cursorDate},id.lt.${cursorId})`,
        );
      } else if (cursorDate) {
        query = query.lt('created_at', cursorDate);
      }
    }

    const { data: transactions, error } = await query;

    if (error) throw error;

    const { data: summaryData, error: summaryError } = await supabase
      .rpc('admin_finance_summary', {
        p_start: startDate.toISOString(),
        p_type: type ?? null,
      })
      .single();

    if (summaryError) {
      throw summaryError;
    }

    const summary = {
      totalRevenue: summaryData?.total_revenue ?? 0,
      totalRefunds: summaryData?.total_refunds ?? 0,
      subscriptionRevenue: summaryData?.subscription_revenue ?? 0,
      boostRevenue: summaryData?.boost_revenue ?? 0,
      transactionCount: summaryData?.transaction_count ?? 0,
    };

    const nextCursor =
      transactions && transactions.length === limit
        ? `${transactions[transactions.length - 1].created_at}|${
            transactions[transactions.length - 1].id
          }`
        : null;

    // Log the finance data access for audit trail
    const clientIp =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');
    await createAuditLog(
      session.admin.id,
      'finance_data_view',
      'finance',
      'summary',
      null,
      { period, type, transactionCount: summary.transactionCount },
      clientIp || undefined,
      userAgent || undefined,
    );

    return NextResponse.json({
      transactions,
      summary,
      total: summary.transactionCount,
      limit,
      nextCursor,
    });
  } catch (error) {
    logger.error('Finance API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch finance data' },
      { status: 500 },
    );
  }
}
