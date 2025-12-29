import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getAdminSession, hasPermission } from '@/lib/auth';
import { escapeSupabaseFilter } from '@/lib/security';

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
    const minBalance = searchParams.get('min_balance');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

    const supabase = createServiceClient();

    // If specific user requested, get their wallet details
    if (userId) {
      const { data: wallet, error } = await supabase
        .from('wallets')
        .select(
          `
          *,
          user:profiles!wallets_user_id_fkey(id, display_name, avatar_url, email, kyc_status)
        `
        )
        .eq('user_id', userId)
        .single();

      if (error) {
        // If no wallet exists, get user info and return zero balance
        const { data: user } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, email, kyc_status')
          .eq('id', userId)
          .single();

        if (user) {
          return NextResponse.json({
            wallet: {
              user_id: userId,
              available_balance: 0,
              pending_balance: 0,
              currency: 'TRY',
              user,
            },
          });
        }
        return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
      }

      // Get recent transactions for this user
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(10);

      return NextResponse.json({
        wallet,
        recentTransactions: transactions || [],
      });
    }

    // List all wallets with balances
    let query = supabase
      .from('wallets')
      .select(
        `
        *,
        user:profiles!wallets_user_id_fkey(id, display_name, avatar_url, email, kyc_status)
      `,
        { count: 'exact' }
      )
      .order('available_balance', { ascending: false })
      .range(offset, offset + limit - 1);

    if (minBalance) {
      query = query.gte('available_balance', parseFloat(minBalance));
    }

    const { data: wallets, count, error } = await query;

    if (error) {
      console.error('Wallets query error:', error);
      return NextResponse.json({ error: 'Cüzdanlar yüklenemedi' }, { status: 500 });
    }

    // Filter by search if provided
    let filteredWallets = wallets;
    if (search && wallets) {
      const safeSearch = search.toLowerCase();
      filteredWallets = wallets.filter((w: any) =>
        w.user?.display_name?.toLowerCase().includes(safeSearch) ||
        w.user?.email?.toLowerCase().includes(safeSearch)
      );
    }

    // Calculate summary
    const summary = {
      totalWallets: count || 0,
      totalAvailableBalance: wallets?.reduce((sum, w: any) => sum + (w.available_balance || 0), 0) || 0,
      totalPendingBalance: wallets?.reduce((sum, w: any) => sum + (w.pending_balance || 0), 0) || 0,
      averageBalance: wallets && wallets.length > 0
        ? wallets.reduce((sum, w: any) => sum + (w.available_balance || 0), 0) / wallets.length
        : 0,
    };

    return NextResponse.json({
      wallets: filteredWallets,
      summary,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Wallets GET error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
