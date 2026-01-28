import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase.server';
import { getAdminSession, hasPermission } from '@/lib/auth';
import { sanitizeUUID } from '@/lib/query-utils';

/**
 * Payout Approval/Rejection API
 * P0: Secure server-side mutation with permission check and audit logging
 */

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    // P0: Permission check - payout operations require payouts:update
    if (
      session.admin.role !== 'super_admin' &&
      !hasPermission(session, 'payouts', 'update')
    ) {
      return NextResponse.json(
        { error: 'Ödeme işlemleri için yetkiniz yok' },
        { status: 403 },
      );
    }

    const { id } = await params;
    const sanitizedId = sanitizeUUID(id);
    if (!sanitizedId) {
      return NextResponse.json({ error: 'Geçersiz ödeme ID' }, { status: 400 });
    }

    const body = await request.json();
    const { action, reason } = body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Geçersiz aksiyon' }, { status: 400 });
    }

    if (action === 'reject' && !reason?.trim()) {
      return NextResponse.json(
        { error: 'Reddetme sebebi zorunludur' },
        { status: 400 },
      );
    }

    const supabase = createServiceClient() as any;

    // Get current payout status
    const { data: currentPayout } = await supabase
      .from('payout_requests')
      .select('*')
      .eq('id', sanitizedId)
      .single();

    if (!currentPayout) {
      return NextResponse.json(
        { error: 'Ödeme talebi bulunamadı' },
        { status: 404 },
      );
    }

    if (currentPayout.status !== 'pending') {
      return NextResponse.json(
        { error: `Ödeme zaten ${currentPayout.status} durumunda` },
        { status: 400 },
      );
    }

    // Perform the action
    const updateData: any = {
      processed_by: session.admin.id,
      updated_at: new Date().toISOString(),
    };

    if (action === 'approve') {
      updateData.status = 'processing';
    } else {
      updateData.status = 'cancelled';
      updateData.processed_at = new Date().toISOString();
      updateData.failure_reason = reason || 'Admin tarafından reddedildi';
    }

    const { data: updatedPayout, error } = await supabase
      .from('payout_requests')
      .update(updateData)
      .eq('id', sanitizedId)
      .select()
      .single();

    if (error || !updatedPayout) {
      logger.error('Payout update error:', error);
      return NextResponse.json(
        { error: 'Ödeme güncellenemedi' },
        { status: 500 },
      );
    }

    // P0: Audit logging - all payout actions must be logged
    await supabase.from('admin_audit_logs').insert({
      admin_id: session.admin.id,
      action: `payout_${action}`,
      resource_type: 'payout_request',
      resource_id: sanitizedId,
      old_value: { status: 'pending' },
      new_value: { status: updateData.status, reason },
      reason: `Payout ${action} via admin panel`,
    });

    return NextResponse.json({
      payout: updatedPayout,
      message:
        action === 'approve'
          ? 'Ödeme onaylandı ve işleme alındı'
          : 'Ödeme talebi reddedildi',
    });
  } catch (error) {
    logger.error('Payout API error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
