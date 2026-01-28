import { logger } from '@/lib/logger';
/**
 * VIP Users API
 *
 * Manages VIP, Influencer, and Partner commission settings.
 * GET - List all VIP users
 * POST - Add new VIP user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase.server';
import { getAdminSession, hasPermission } from '@/lib/auth';
import { escapeSupabaseFilter } from '@/lib/security';
import type { Database } from '@/types/database';

type UserCommissionRow =
  Database['public']['Tables']['user_commission_settings']['Row'];

interface VIPUserWithDetails {
  user?: {
    display_name?: string;
    full_name?: string;
    email?: string;
  };
}

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
          full_name,
          email,
          avatar_url
        ),
        granted_by_user:granted_by (
          full_name
        )
      `,
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by tier (using account_type column)
    if (tier && ['vip', 'influencer', 'partner'].includes(tier)) {
      query = query.eq(
        'account_type',
        tier as 'vip' | 'influencer' | 'partner',
      );
    }

    const { data: users, count, error } = await query;

    if (error) {
      logger.error('VIP users query error:', error);
      // Fallback: Return empty list if table doesn't exist
      return NextResponse.json({
        users: [],
        total: 0,
        limit,
        offset,
        message: 'VIP tablosu henüz oluşturulmamış',
      });
    }

    // If search provided, filter in memory (since we need to search in joined table)
    let filteredUsers = users || [];
    if (search) {
      const safeSearch = escapeSupabaseFilter(search)?.toLowerCase();
      if (safeSearch) {
        filteredUsers = filteredUsers.filter(
          (u: VIPUserWithDetails) =>
            u.user?.full_name?.toLowerCase().includes(safeSearch) ||
            u.user?.email?.toLowerCase().includes(safeSearch),
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
        { status: 400 },
      );
    }

    // Validate tier
    if (!['vip', 'influencer', 'partner'].includes(tier)) {
      return NextResponse.json(
        { error: 'Geçersiz statü: vip, influencer veya partner olmalı' },
        { status: 400 },
      );
    }

    // Validate commission override
    const commission = parseFloat(commissionOverride) || 0;
    if (commission < 0 || commission > 15) {
      return NextResponse.json(
        { error: 'Komisyon oranı 0-15 arasında olmalı' },
        { status: 400 },
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
        { status: 404 },
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
        { status: 409 },
      );
    }

    // Add VIP status using the admin function
    const { data, error } = await supabase.rpc('admin_set_user_vip', {
      p_user_id: userId,
      p_account_type: tier as 'vip' | 'influencer' | 'partner',
      p_admin_id: session.admin.id,
      p_expires_at: validUntil || undefined,
      p_reason: reason || '',
      p_social_handle: body.social_handle || undefined,
      p_social_platform: body.social_platform || undefined,
      p_follower_count: body.follower_count || undefined,
    });

    if (error) {
      logger.error('Add VIP error:', error);
      return NextResponse.json(
        { error: 'VIP statüsü eklenemedi: ' + error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    logger.error('VIP users POST error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
