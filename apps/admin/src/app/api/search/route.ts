import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase.server';
import { getAdminSession } from '@/lib/auth';
import { escapeSupabaseFilter } from '@/lib/security';

interface SearchResult {
  type: 'user' | 'transaction' | 'moment';
  id: string;
  title: string;
  subtitle?: string;
  avatar?: string;
  href: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 30);

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const safeQuery = escapeSupabaseFilter(query);
    if (!safeQuery) {
      return NextResponse.json({ results: [] });
    }

    const supabase = createServiceClient();
    const results: SearchResult[] = [];

    // Search users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, display_name, email, avatar_url')
      .or(`display_name.ilike.%${safeQuery}%,email.ilike.%${safeQuery}%`)
      .limit(Math.ceil(limit / 3));

    if (usersError) {
      logger.error('Search users error:', usersError);
    } else if (users) {
      users.forEach((user) => {
        results.push({
          type: 'user',
          id: user.id,
          title: user.display_name || 'İsimsiz Kullanıcı',
          subtitle: user.email || undefined,
          avatar: user.avatar_url || undefined,
          href: `/users/${user.id}`,
        });
      });
    }

    // Search transactions by ID
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('id, type, amount, status, created_at')
      .or(`id.ilike.%${safeQuery}%`)
      .limit(Math.ceil(limit / 3));

    if (txError) {
      logger.error('Search transactions error:', txError);
    } else if (transactions) {
      transactions.forEach((tx) => {
        const typeLabels: Record<string, string> = {
          gift: 'Hediye',
          withdrawal: 'Çekim',
          deposit: 'Yatırım',
          refund: 'İade',
        };
        results.push({
          type: 'transaction',
          id: tx.id,
          title: `${typeLabels[tx.type] || tx.type} - ₺${tx.amount?.toFixed(2) || '0.00'}`,
          subtitle: `${tx.status} • ${new Date(tx.created_at).toLocaleDateString('tr-TR')}`,
          href: `/transactions?id=${tx.id}`,
        });
      });
    }

    // Search moments by title
    const { data: moments, error: momentsError } = await supabase
      .from('moments')
      .select('id, title, status, user:users!moments_user_id_fkey(display_name)')
      .ilike('title', `%${safeQuery}%`)
      .limit(Math.ceil(limit / 3));

    if (momentsError) {
      logger.error('Search moments error:', momentsError);
    } else if (moments) {
      moments.forEach((moment) => {
        const userName = (moment.user as { display_name?: string })?.display_name;
        results.push({
          type: 'moment',
          id: moment.id,
          title: moment.title || 'İsimsiz Moment',
          subtitle: userName ? `@${userName}` : undefined,
          href: `/moments/${moment.id}`,
        });
      });
    }

    return NextResponse.json({
      results: results.slice(0, limit),
      query,
    });
  } catch (error) {
    logger.error('Search GET error:', error);
    return NextResponse.json({ error: 'Arama başarısız' }, { status: 500 });
  }
}
