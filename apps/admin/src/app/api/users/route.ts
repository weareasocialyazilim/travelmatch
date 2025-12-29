import { logger } from '@/lib/logger';
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

    if (!hasPermission(session, 'users', 'view')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const verified = searchParams.get('verified');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Cap at 100
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    // Validate sortBy to prevent arbitrary column access
    const allowedSortColumns = ['created_at', 'updated_at', 'display_name', 'email'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';

    const supabase = createServiceClient();

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order(safeSortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    // Search by name or email - sanitize input to prevent injection
    if (search) {
      const safeSearch = escapeSupabaseFilter(search);
      if (safeSearch) {
        query = query.or(`display_name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%`);
      }
    }

    // Filter by status
    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'suspended') {
      query = query.eq('is_suspended', true);
    } else if (status === 'banned') {
      query = query.eq('is_banned', true);
    }

    // Filter by verification
    if (verified === 'true') {
      query = query.eq('is_verified', true);
    } else if (verified === 'false') {
      query = query.eq('is_verified', false);
    }

    const { data: users, count, error } = await query;

    if (error) {
      logger.error('Users query error:', error);
      return NextResponse.json({ error: 'Kullanıcılar yüklenemedi' }, { status: 500 });
    }

    return NextResponse.json({
      users,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('Users GET error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
