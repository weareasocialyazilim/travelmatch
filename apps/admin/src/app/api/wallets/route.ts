import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase.server';
import { getAdminSession, hasPermission } from '@/lib/auth';

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
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

    const supabase = createServiceClient();

    // If specific user requested, get their wallet details
    if (userId) {
      const { data: wallet, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If no wallet exists, get user info and return zero balance
        const { data: user } = await supabase
          .from('users')
          .select('id, full_name, avatar_url, email')
          .eq('id', userId)
          .single();

        if (user) {
          return NextResponse.json({
            wallet: {
              user_id: userId,
              balance: 0,
              pending_balance: 0,
              currency: 'TRY',
              user,
            },
          });
        }
        return NextResponse.json(
          { error: 'Kullanıcı bulunamadı' },
          { status: 404 },
        );
      }

      // Get user info for the wallet
      const { data: user } = await supabase
        .from('users')
        .select('id, full_name, avatar_url, email')
        .eq('id', userId)
        .single();

      // Get recent transactions for this user
      const { data: transactions } = await supabase
        .from('transactions')
        .select('id, amount, type, status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      return NextResponse.json({
        wallet: { ...wallet, user },
        recentTransactions: transactions || [],
      });
    }

    // List all wallets with balances
    const query = supabase
      .from('wallets')
      .select('*', { count: 'exact' })
      .order('balance', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: wallets, count, error } = await query;

    if (error) {
      logger.error('Wallets query error:', error);
      return NextResponse.json(
        { error: 'Cüzdanlar yüklenemedi' },
        { status: 500 },
      );
    }

    // Calculate summary
    const summary = {
      totalWallets: count || 0,
      totalBalance:
        wallets?.reduce(
          (sum: number, w: { balance: number | null }) =>
            sum + (w.balance || 0),
          0,
        ) || 0,
      totalPendingBalance:
        wallets?.reduce(
          (sum: number, w: { pending_balance: number | null }) =>
            sum + (w.pending_balance || 0),
          0,
        ) || 0,
    };

    return NextResponse.json({
      wallets,
      summary,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('Wallets GET error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
