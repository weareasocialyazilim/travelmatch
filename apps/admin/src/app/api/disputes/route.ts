import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase.server';
import { getAdminSession, hasPermission, createAuditLog } from '@/lib/auth';
import type { Database } from '@/types/database';

type DisputeRow = Database['public']['Tables']['disputes']['Row'];

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'disputes', 'view')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = createServiceClient();

    let query = supabase
      .from('disputes')
      .select(
        `
        *,
        reporter:users!disputes_reporter_id_fkey(id, full_name, avatar_url),
        reported_user:users!disputes_reported_user_id_fkey(id, full_name, avatar_url)
      `,
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    } else {
      query = query.in('status', ['pending', 'under_review']);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data: disputes, count, error } = await query;

    if (error) {
      logger.error('Disputes query error:', error);
      return NextResponse.json(
        { error: 'Anlaşmazlıklar yüklenemedi' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      disputes,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('Disputes GET error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'disputes', 'create')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const body = await request.json();
    const {
      reporter_id,
      reported_user_id,
      transaction_id,
      reason,
      description,
      type = 'payment',
    } = body;

    if (!reporter_id || !reported_user_id || !transaction_id || !reason) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    const { data: dispute, error } = await supabase
      .from('disputes')
      .insert({
        reporter_id,
        reported_user_id,
        transaction_id,
        reason,
        description,
        type,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      logger.error('Dispute creation error:', error);
      return NextResponse.json(
        { error: 'Anlaşmazlık oluşturulamadı' },
        { status: 500 },
      );
    }

    // Create audit log
    await createAuditLog(
      session.admin.id,
      'create_dispute',
      'dispute',
      dispute.id,
      null,
      dispute,
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined,
    );

    return NextResponse.json({ dispute }, { status: 201 });
  } catch (error) {
    logger.error('Disputes POST error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
