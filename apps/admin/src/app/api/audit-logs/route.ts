import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getAdminSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Only super_admin and manager can view audit logs
    if (!['super_admin', 'manager'].includes(session.admin.role)) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('admin_id');
    const action = searchParams.get('action');
    const resourceType = searchParams.get('resource_type');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = createServiceClient();

    let query = supabase
      .from('audit_logs')
      .select('*, admin:admin_users(id, name, email, avatar_url)', {
        count: 'exact',
      })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (adminId) {
      query = query.eq('admin_id', adminId);
    }

    if (action) {
      query = query.eq('action', action);
    }

    if (resourceType) {
      query = query.eq('resource_type', resourceType);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: logs, count, error } = await query;

    if (error) {
      logger.error('Audit logs query error:', error);
      return NextResponse.json(
        { error: 'Audit logları yüklenemedi' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      logs,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('Audit logs GET error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
