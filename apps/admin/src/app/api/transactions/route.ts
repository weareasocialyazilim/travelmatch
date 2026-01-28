import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase.server';
import { getAdminSession, hasPermission } from '@/lib/auth';
import { escapeSupabaseFilter } from '@/lib/security';

interface Transaction {
  amount: number | null;
  status: string | null;
  type: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'transactions', 'view')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const period = searchParams.get('period') || '30d';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

    const supabase = createServiceClient();

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

    let query = supabase
      .from('transactions')
      .select(
        `
        *,
        sender:users!transactions_sender_id_fkey(id, full_name, avatar_url, email),
        recipient:users!transactions_recipient_id_fkey(id, full_name, avatar_url, email),
        moment:moments(id, title)
      `,
        { count: 'exact' },
      )
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (userId) {
      const safeUserId = escapeSupabaseFilter(userId);
      if (safeUserId) {
        query = query.or(
          `sender_id.eq.${safeUserId},receiver_id.eq.${safeUserId},user_id.eq.${safeUserId}`,
        );
      }
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: transactions, count, error } = await query;

    if (error) {
      logger.error('Transactions query error:', error);
      return NextResponse.json(
        { error: 'İşlemler yüklenemedi' },
        { status: 500 },
      );
    }

    // Calculate summary stats
    type Transaction = {
      amount: number | null;
      status: string | null;
      type: string | null;
    };
    const summary = {
      total: count || 0,
      totalAmount:
        transactions?.reduce(
          (sum: number, t: Transaction) => sum + (t.amount || 0),
          0,
        ) || 0,
      completedAmount:
        transactions
          ?.filter((t: Transaction) => t.status === 'completed')
          .reduce((sum: number, t: Transaction) => sum + (t.amount || 0), 0) ||
        0,
      pendingAmount:
        transactions
          ?.filter((t: Transaction) => t.status === 'pending')
          .reduce((sum: number, t: Transaction) => sum + (t.amount || 0), 0) ||
        0,
      failedAmount:
        transactions
          ?.filter((t: Transaction) => t.status === 'failed')
          .reduce((sum: number, t: Transaction) => sum + (t.amount || 0), 0) ||
        0,
      byType: {
        gift:
          transactions?.filter((t: Transaction) => t.type === 'gift').length ||
          0,
        withdrawal:
          transactions?.filter((t: Transaction) => t.type === 'withdrawal')
            .length || 0,
        refund:
          transactions?.filter((t: Transaction) => t.type === 'refund')
            .length || 0,
        deposit:
          transactions?.filter((t: Transaction) => t.type === 'deposit')
            .length || 0,
      },
    };

    return NextResponse.json({
      transactions,
      summary,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('Transactions GET error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
