import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase.server';
import { getAdminSession, hasPermission } from '@/lib/auth';
import { sanitizeUUID } from '@/lib/query-utils';
import crypto from 'crypto';

/**
 * GDPR/KVKK Data Access Request Management
 */

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    if (
      session.admin.role !== 'super_admin' &&
      !hasPermission(session, 'compliance', 'view')
    ) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const supabase = createServiceClient() as any;
    let query: any = supabase
      .from('gdpr_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (type) query = query.eq('request_type', type);

    const { data: requests, error } = await query;

    if (error) {
      logger.error('GDPR requests fetch error:', error);
      return NextResponse.json(
        { error: 'Talep listesi alınamadı' },
        { status: 500 },
      );
    }

    return NextResponse.json({ requests: requests || [] });
  } catch (error) {
    logger.error('GDPR GET error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    if (
      session.admin.role !== 'super_admin' &&
      !hasPermission(session, 'compliance', 'create')
    ) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { user_id, request_type, justification, data_categories } = body;

    if (!user_id || !request_type) {
      return NextResponse.json(
        { error: 'Kullanıcı ID ve talep tipi zorunludur' },
        { status: 400 },
      );
    }

    const validTypes = [
      'data_access',
      'data_rectification',
      'data_deletion',
      'data_portability',
      'objection',
    ];
    if (!validTypes.includes(request_type)) {
      return NextResponse.json(
        { error: 'Geçersiz talep tipi' },
        { status: 400 },
      );
    }

    const sensitiveTypes = ['data_deletion', 'data_rectification'];
    if (sensitiveTypes.includes(request_type) && !justification?.trim()) {
      return NextResponse.json(
        { error: `${request_type} için gerekçe zorunludur` },
        { status: 400 },
      );
    }

    const supabase = createServiceClient() as any;

    const { data: user } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('id', user_id)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 },
      );
    }

    const { data: gdprRequest, error } = await supabase
      .from('gdpr_requests')
      .insert({
        user_id,
        request_type,
        status: 'pending',
        justification: justification || null,
        data_categories: data_categories || ['all'],
        requested_by: session.admin.id,
        reference_id: crypto.randomUUID(),
      })
      .select()
      .single();

    if (error || !gdprRequest) {
      logger.error('GDPR request creation error:', error);
      return NextResponse.json(
        { error: 'Talep oluşturulamadı' },
        { status: 500 },
      );
    }

    await supabase.from('admin_audit_logs').insert({
      admin_id: session.admin.id,
      action: 'gdpr_request_created',
      resource_type: 'gdpr_request',
      resource_id: gdprRequest.id,
      new_value: {
        user_id,
        request_type,
        data_categories: data_categories || ['all'],
      },
      reason: justification || 'GDPR request initiated',
    });

    return NextResponse.json({
      request: gdprRequest,
      message: 'GDPR talebi oluşturuldu',
    });
  } catch (error) {
    logger.error('GDPR POST error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    if (
      session.admin.role !== 'super_admin' &&
      !hasPermission(session, 'compliance', 'update')
    ) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 },
      );
    }

    const { id } = await params;
    const sanitizedId = sanitizeUUID(id);
    if (!sanitizedId) {
      return NextResponse.json({ error: 'Geçersiz talep ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status, resolution_notes, completed_data } = body;

    const validStatuses = ['pending', 'in_review', 'completed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Geçersiz durum' }, { status: 400 });
    }

    const supabase = createServiceClient() as any;

    const { data: currentRequest } = await supabase
      .from('gdpr_requests')
      .select('*')
      .eq('id', sanitizedId)
      .single();

    if (!currentRequest) {
      return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 });
    }

    if (currentRequest.status === 'completed') {
      return NextResponse.json(
        { error: 'Tamamlanmış talepler güncellenemez' },
        { status: 400 },
      );
    }

    const updateData: any = {
      status,
      updated_by: session.admin.id,
      updated_at: new Date().toISOString(),
    };

    if (resolution_notes) updateData.resolution_notes = resolution_notes;
    if (completed_data) updateData.completed_data = completed_data;
    if (status === 'completed')
      updateData.completed_at = new Date().toISOString();

    const { data: updatedRequest, error } = await supabase
      .from('gdpr_requests')
      .update(updateData)
      .eq('id', sanitizedId)
      .select()
      .single();

    if (error || !updatedRequest) {
      logger.error('GDPR request update error:', error);
      return NextResponse.json(
        { error: 'Talep güncellenemedi' },
        { status: 500 },
      );
    }

    await supabase.from('admin_audit_logs').insert({
      admin_id: session.admin.id,
      action: `gdpr_request_${status}`,
      resource_type: 'gdpr_request',
      resource_id: sanitizedId,
      old_value: { status: currentRequest.status },
      new_value: { status, resolution_notes },
      reason: `GDPR request status changed to ${status}`,
    });

    return NextResponse.json({
      request: updatedRequest,
      message: `Talep ${status === 'completed' ? 'tamamlandı' : status}`,
    });
  } catch (error) {
    logger.error('GDPR PATCH error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
