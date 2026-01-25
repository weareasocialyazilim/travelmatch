import { logger } from '@/lib/logger';
/**
 * Individual VIP User API
 *
 * DELETE - Remove VIP status from user
 * PATCH - Update VIP settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase.server';
import { getAdminSession, hasPermission } from '@/lib/auth';

// =============================================================================
// DELETE - Remove VIP Status
// =============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'users', 'edit')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'Kullanıcı ID gerekli' },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    // Remove VIP status using admin function

    const { data, error } = await (supabase as any).rpc(
      'admin_remove_user_vip',
      {
        p_user_id: userId,
        p_removed_by: session.admin.id,
      },
    );

    if (error) {
      logger.error('Remove VIP error:', error);
      return NextResponse.json(
        { error: 'VIP statüsü kaldırılamadı: ' + error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('VIP DELETE error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

// =============================================================================
// PATCH - Update VIP Settings
// =============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'users', 'edit')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const { userId } = await params;
    const body = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Kullanıcı ID gerekli' },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    // Build update object
    const updateData: Record<string, unknown> = {};

    if (body.tier !== undefined) {
      if (!['vip', 'influencer', 'partner'].includes(body.tier)) {
        return NextResponse.json({ error: 'Geçersiz statü' }, { status: 400 });
      }
      updateData.tier = body.tier;
    }

    if (body.commissionOverride !== undefined) {
      const commission = parseFloat(body.commissionOverride);
      if (commission < 0 || commission > 15) {
        return NextResponse.json(
          { error: 'Komisyon oranı 0-15 arasında olmalı' },
          { status: 400 },
        );
      }
      updateData.commission_override = commission;
    }

    if (body.giverPaysCommission !== undefined) {
      updateData.giver_pays_commission = body.giverPaysCommission;
    }

    if (body.validUntil !== undefined) {
      updateData.valid_until = body.validUntil;
    }

    if (body.reason !== undefined) {
      updateData.reason = body.reason;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Güncellenecek alan bulunamadı' },
        { status: 400 },
      );
    }

    const { data, error } = await (
      supabase.from('user_commission_settings') as any
    )
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Update VIP error:', error);
      return NextResponse.json(
        { error: 'VIP ayarları güncellenemedi: ' + error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    logger.error('VIP PATCH error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
