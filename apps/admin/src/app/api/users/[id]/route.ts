import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getAdminSession, hasPermission, createAuditLog } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'users', 'view')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const { id } = await params;
    const supabase = createServiceClient();

    // Get user profile with related data
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Get user stats
    const [
      { count: momentCount },
      { count: matchCount },
      { count: reportCount },
      { data: recentTransactions },
    ] = await Promise.all([
      supabase.from('moments').select('*', { count: 'exact', head: true }).eq('user_id', id),
      supabase.from('matches').select('*', { count: 'exact', head: true }).or(`user1_id.eq.${id},user2_id.eq.${id}`),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('reported_user_id', id),
      supabase.from('transactions').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(10),
    ]);

    return NextResponse.json({
      user,
      stats: {
        moments: momentCount || 0,
        matches: matchCount || 0,
        reports: reportCount || 0,
      },
      recent_transactions: recentTransactions || [],
    });
  } catch (error) {
    console.error('User GET error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    if (!hasPermission(session, 'users', 'update')) {
      return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const supabase = createServiceClient();

    // Get current user data
    const { data: currentUser, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentUser) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Allowed update fields
    const allowedFields = [
      'is_verified',
      'is_suspended',
      'is_banned',
      'suspension_reason',
      'ban_reason',
      'verification_level',
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Handle suspension/ban timestamps
    if (body.is_suspended === true && !currentUser.is_suspended) {
      updateData.suspended_at = new Date().toISOString();
    }
    if (body.is_banned === true && !currentUser.is_banned) {
      updateData.banned_at = new Date().toISOString();
    }

    const { data: user, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('User update error:', error);
      return NextResponse.json({ error: 'Kullanıcı güncellenemedi' }, { status: 500 });
    }

    // Create audit log
    await createAuditLog(
      session.admin.id,
      'update_user',
      'user',
      id,
      currentUser,
      user,
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({ user });
  } catch (error) {
    console.error('User PATCH error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}
