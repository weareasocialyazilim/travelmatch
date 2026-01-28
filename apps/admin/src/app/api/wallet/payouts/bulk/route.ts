import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase.server';
import { getAdminSession, hasPermission } from '@/lib/auth';
import { sanitizeUUID } from '@/lib/query-utils';

/**
 * Bulk Payout Approval/Rejection API
 * P0: Secure server-side bulk mutation with permission check and audit logging
 */

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    // P0: Permission check - bulk payout operations require payouts:update
    if (
      session.admin.role !== 'super_admin' &&
      !hasPermission(session, 'payouts', 'update')
    ) {
      return NextResponse.json(
        { error: 'Toplu ödeme işlemleri için yetkiniz yok' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { payoutIds, action } = body;

    if (!payoutIds || !Array.isArray(payoutIds) || payoutIds.length === 0) {
      return NextResponse.json(
        { error: 'Ödeme ID listesi zorunludur' },
        { status: 400 },
      );
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Geçersiz aksiyon' }, { status: 400 });
    }

    // Limit bulk operations to prevent accidental mass approvals
    const MAX_BULK_SIZE = 50;
    if (payoutIds.length > MAX_BULK_SIZE) {
      return NextResponse.json(
        { error: `Toplu işlem maksimum ${MAX_BULK_SIZE} ödeme ile sınırlıdır` },
        { status: 400 },
      );
    }

    const supabase = createServiceClient() as any;

    // Sanitize all IDs
    const sanitizedIds = payoutIds
      .map((id: string) => sanitizeUUID(id))
      .filter((id: string | null): id is string => id !== null);

    if (sanitizedIds.length === 0) {
      return NextResponse.json(
        { error: 'Geçersiz ödeme IDleri' },
        { status: 400 },
      );
    }

    // Only process pending payouts
    const { data: pendingPayouts } = await supabase
      .from('payout_requests')
      .select('id')
      .in('id', sanitizedIds)
      .eq('status', 'pending');

    if (!pendingPayouts || pendingPayouts.length === 0) {
      return NextResponse.json(
        { error: 'Bekleyen ödeme bulunamadı' },
        { status: 404 },
      );
    }

    const pendingIds = pendingPayouts.map((p: any) => p.id);

    // Perform bulk action
    const updateData: any = {
      processed_by: session.admin.id,
      updated_at: new Date().toISOString(),
    };

    if (action === 'approve') {
      updateData.status = 'processing';
    } else {
      updateData.status = 'cancelled';
      updateData.processed_at = new Date().toISOString();
      updateData.failure_reason = 'Toplu işlemde reddedildi';
    }

    const { data: updatedPayouts, error } = await supabase
      .from('payout_requests')
      .update(updateData)
      .in('id', pendingIds)
      .select('id, user_id, amount, status');

    if (error) {
      logger.error('Bulk payout update error:', error);
      return NextResponse.json(
        { error: 'Toplu ödeme güncellenemedi' },
        { status: 500 },
      );
    }

    // P0: Audit logging - bulk operations must be logged
    await supabase.from('admin_audit_logs').insert({
      admin_id: session.admin.id,
      action: `payout_bulk_${action}`,
      resource_type: 'payout_request',
      resource_id: pendingIds.join(','),
      old_value: { status: 'pending', count: pendingIds.length },
      new_value: { status: updateData.status, count: pendingIds.length },
      reason: `Bulk payout ${action} via admin panel`,
    });

    return NextResponse.json({
      processed: updatedPayouts?.length || 0,
      message: `${updatedPayouts?.length || 0} ödeme ${
        action === 'approve' ? 'onaylandı' : 'reddedildi'
      }`,
    });
  } catch (error) {
    logger.error('Bulk payout API error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
