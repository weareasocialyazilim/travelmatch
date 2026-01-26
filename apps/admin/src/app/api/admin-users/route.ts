import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase.server';
import { getAdminSession, hasPermission, createAuditLog } from '@/lib/auth';
import { escapeSupabaseFilter } from '@/lib/security';
import type { Database } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'admin_users', 'view')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const isActive = searchParams.get('is_active');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Cap at 100
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

    const supabase = createServiceClient();

    let query = supabase
      .from('admin_users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Sanitize search input to prevent injection
    if (search) {
      const safeSearch = escapeSupabaseFilter(search);
      if (safeSearch) {
        query = query.or(
          `name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%`,
        );
      }
    }

    if (role) {
      query = query.eq('role', role);
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data: admins, count, error } = await query;

    if (error) {
      logger.error('Admin users query error:', error);
      return NextResponse.json(
        { error: 'Admin kullanıcıları yüklenemedi' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      admins,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('Admin users GET error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'admin_users', 'create')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const body = await request.json();
    const { email, name, role, requires_2fa = true } = body;

    if (!email || !name || !role) {
      return NextResponse.json(
        { error: 'Email, isim ve rol gerekli' },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    // Check if email already exists
    const { data: existing } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanımda' },
        { status: 400 },
      );
    }

    const { data: admin, error } = await supabase
      .from('admin_users')
      .insert({
        email,
        name,
        role,
        requires_2fa,
        created_by: session.admin.id,
      } as Database['public']['Tables']['admin_users']['Insert'])
      .select()
      .single();

    if (error) {
      logger.error('Admin user creation error:', error);
      return NextResponse.json(
        { error: 'Admin kullanıcı oluşturulamadı' },
        { status: 500 },
      );
    }

    // Create audit log
    await createAuditLog(
      session.admin.id,
      'create_admin_user',
      'admin_user',
      admin.id,
      null,
      admin,
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined,
    );

    return NextResponse.json({ admin }, { status: 201 });
  } catch (error) {
    logger.error('Admin users POST error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
