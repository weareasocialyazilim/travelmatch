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

    if (!hasPermission(session, 'moments', 'view')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const status = searchParams.get('status');
    const isReported = searchParams.get('is_reported');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = createServiceClient();

    let query = supabase
      .from('moments')
      .select('*, user:users!moments_user_id_fkey(id, full_name, avatar_url)', {
        count: 'exact',
      })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (isReported === 'true') {
      query = query.gt('report_count', 0);
    }

    const { data: moments, count, error } = await query;

    if (error) {
      logger.error('Moments query error:', error);
      return NextResponse.json(
        { error: 'Momentler yüklenemedi' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      moments,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('Moments GET error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
