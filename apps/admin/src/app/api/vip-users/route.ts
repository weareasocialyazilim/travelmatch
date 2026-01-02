import { logger } from '@/lib/logger';
/**
 * VIP Users API
 *
 * Manages VIP, Influencer, and Partner commission settings.
 * GET - List all VIP users
 * POST - Add new VIP user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getAdminSession, hasPermission } from '@/lib/auth';
import { escapeSupabaseFilter } from '@/lib/security';

// =============================================================================
// GET - List VIP Users
// =============================================================================

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
    const tier = searchParams.get('tier');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

    const supabase = createServiceClient();

    let query = supabase
      .from('user_commission_settings')
      .select(
        `
        *,
        user:user_id (
          display_name,
          full_name,
          email,
          avatar_url
        ),
        granted_by_user:granted_by (
          display_name
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by tier
    if (tier && ['vip', 'influencer', 'partner'].includes(tier)) {
      query = query.eq('tier', tier);
    }

    const { data: users, count, error } = await query;

    if (error) {
      logger.error('VIP users query error:', error);
      return NextResponse.json(
        { error: 'VIP kullanıcıları yüklenemedi' },
        { status: 500 }
      );
    }

    // If search provided, filter in memory (since we need to search in joined table)
    let filteredUsers = users || [];
    if (search) {
      const safeSearch = escapeSupabaseFilter(search)?.toLowerCase();
      if (safeSearch) {
        filteredUsers = filteredUsers.filter(
          (u) =>
            u.user?.display_name?.toLowerCase().includes(safeSearch) ||
            u.user?.full_name?.toLowerCase().includes(safeSearch) ||
            u.user?.email?.toLowerCase().includes(safeSearch)
        );
      }
    }

    return NextResponse.json({
      users: filteredUsers,
      total: search ? filteredUsers.length : count || 0,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('VIP users GET error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

// =============================================================================
// POST - Add VIP User
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'users', 'edit')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const body = await request.json();
    const {
      userId,
      tier,
      commissionOverride,
      giverPaysCommission,
      validUntil,
      reason,
    } = body;

    // Validate required fields
    if (!userId || !tier) {
      return NextResponse.json(
        { error: 'Kullanıcı ID ve statü gerekli' },
        { status: 400 }
      );
    }

    // Validate tier
    if (!['vip', 'influencer', 'partner'].includes(tier)) {
      return NextResponse.json(
        { error: 'Geçersiz statü: vip, influencer veya partner olmalı' },
        { status: 400 }
      );
    }

    // Validate commission override
    const commission = parseFloat(commissionOverride) || 0;
    if (commission < 0 || commission > 15) {
      return NextResponse.json(
        { error: 'Komisyon oranı 0-15 arasında olmalı' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Check if already VIP
    const { data: existingVIP } = await supabase
      .from('user_commission_settings')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingVIP) {
      return NextResponse.json(
        { error: 'Bu kullanıcı zaten VIP statüsüne sahip' },
        { status: 409 }
      );
    }

    // Add VIP status using the admin function
    const { data, error } = await supabase.rpc('admin_set_user_vip', {
      p_user_id: userId,
      p_tier: tier,
      p_commission_override: commission,
      p_giver_pays_commission: giverPaysCommission || false,
      p_valid_until: validUntil || null,
      p_reason: reason || null,
      p_granted_by: session.user.id,
    });

    if (error) {
      logger.error('Add VIP error:', error);
      return NextResponse.json(
        { error: 'VIP statüsü eklenemedi: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    logger.error('VIP users POST error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
