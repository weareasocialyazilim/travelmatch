import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase.server';
import { getAdminSession, hasPermission } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/users/[id]/transactions
 * Fetch user transaction history
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    // Check permission for viewing transactions
    if (!hasPermission(session, 'transactions', 'view')) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 },
      );
    }

    const { id: userId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const type = searchParams.get('type'); // payment, refund, payout, gift

    const supabase = createServiceClient();

    // Build query
    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq('type', type);
    }

    const { data: transactions, error, count } = await query;

    if (error) {
      logger.error('Failed to fetch user transactions:', error);
      return NextResponse.json(
        { error: 'İşlemler alınamadı' },
        { status: 500 },
      );
    }

    // Get wallet balance
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance, pending_balance, currency')
      .eq('user_id', userId)
      .single();

    // Calculate totals
    const totals = {
      current_balance: wallet?.balance || 0,
      pending_balance: wallet?.pending_balance || 0,
      currency: wallet?.currency || 'TRY',
    };

    // Transform transactions for response
    const transformedTransactions = (transactions || []).map((txn) => ({
      id: txn.id,
      type: txn.type,
      amount: txn.amount,
      currency: txn.currency || 'TRY',
      status: txn.status,
      description: txn.description || getTransactionDescription(txn.type),
      metadata: txn.metadata,
      created_at: txn.created_at,
    }));

    return NextResponse.json({
      transactions: transformedTransactions,
      totals,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('User transactions API error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

function getTransactionDescription(type: string): string {
  const descriptions: Record<string, string> = {
    payment: 'Ödeme',
    refund: 'İade',
    payout: 'Çekim',
    gift: 'Hediye',
    platform_fee: 'Platform Komisyonu',
    subscription: 'Abonelik',
    boost: 'Profil Boost',
    super_like: 'Super Like',
  };
  return descriptions[type] || type;
}
